/**
 * Email Composer Page
 * Send emails to users with template selection
 */

import { useEffect, useState } from 'react';
import { emailApi, usersApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiSend, FiUsers, FiMail, FiEye, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  type: string;
  subject: string;
  variables?: { name: string; description?: string }[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function EmailComposer() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [smtpStatus, setSmtpStatus] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    templateId: '',
    recipientType: 'specific' as 'all' | 'role' | 'specific',
    role: 'VIEWER',
    selectedUsers: [] as string[],
    subject: '',
    testEmail: '',
  });

  useEffect(() => {
    fetchData();
    checkSmtpConnection();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesRes, usersRes] = await Promise.all([
        emailApi.getTemplates({ limit: 100 }),
        usersApi.getAll(),
      ]);
      setTemplates(templatesRes.data.data || []);
      setUsers(usersRes.data.users || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const checkSmtpConnection = async () => {
    try {
      const response = await emailApi.verifyConnection();
      setSmtpStatus(response.data.connected);
    } catch {
      setSmtpStatus(false);
    }
  };

  const handlePreview = async () => {
    if (!formData.templateId) {
      toast.error('Please select a template');
      return;
    }
    try {
      const response = await emailApi.previewTemplate(formData.templateId, {
        user: { name: 'John Doe', firstName: 'John', email: 'john@example.com' },
        site: { name: 'My Website', url: window.location.origin },
        year: new Date().getFullYear(),
      });
      setPreviewHtml(response.data.html);
      setShowPreview(true);
    } catch (error) {
      toast.error('Failed to preview template');
    }
  };

  const handleSendTest = async () => {
    if (!formData.templateId || !formData.testEmail) {
      toast.error('Please select a template and enter a test email');
      return;
    }
    setSending(true);
    try {
      await emailApi.sendTestEmail({
        templateId: formData.templateId,
        to: formData.testEmail,
        variables: {
          site: { name: 'My Website', url: window.location.origin },
          year: new Date().getFullYear(),
        },
      });
      toast.success('Test email sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  const handleSendBulk = async () => {
    if (!formData.templateId) {
      toast.error('Please select a template');
      return;
    }
    if (formData.recipientType === 'specific' && formData.selectedUsers.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    setSending(true);
    try {
      const result = await emailApi.sendBulkEmail({
        templateId: formData.templateId,
        subject: formData.subject || undefined,
        recipientType: formData.recipientType,
        role: formData.recipientType === 'role' ? formData.role : undefined,
        userIds: formData.recipientType === 'specific' ? formData.selectedUsers : undefined,
        variables: {
          site: { name: 'My Website', url: window.location.origin },
          year: new Date().getFullYear(),
        },
      });
      toast.success(`Sent ${result.data.successful}/${result.data.totalRecipients} emails`);
      if (result.data.failed > 0) {
        toast.error(`${result.data.failed} emails failed`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const getRecipientCount = () => {
    if (formData.recipientType === 'all') return users.length;
    if (formData.recipientType === 'role') return users.filter(u => u.role === formData.role).length;
    return formData.selectedUsers.length;
  };

  const selectedTemplate = templates.find(t => t.id === formData.templateId);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Composer</h1>
          <p className="text-gray-600">Send emails to your users</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
          smtpStatus === true ? 'bg-green-100 text-green-700' : smtpStatus === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {smtpStatus === true ? <FiCheck /> : smtpStatus === false ? <FiAlertCircle /> : null}
          {smtpStatus === true ? 'SMTP Connected' : smtpStatus === false ? 'SMTP Not Connected' : 'Checking...'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><FiMail /> Select Template</h3>
            <select value={formData.templateId} onChange={(e) => setFormData({ ...formData, templateId: e.target.value })} className="input w-full">
              <option value="">Choose a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.type.replace('_', ' ')})</option>
              ))}
            </select>
            {selectedTemplate && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600"><strong>Subject:</strong> {selectedTemplate.subject}</p>
                <button onClick={handlePreview} className="mt-2 text-sm text-indigo-600 hover:underline flex items-center gap-1">
                  <FiEye /> Preview Template
                </button>
              </div>
            )}
          </div>

          {/* Recipients */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><FiUsers /> Recipients</h3>
            <div className="flex gap-4 mb-4">
              {(['all', 'role', 'specific'] as const).map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input type="radio" name="recipientType" checked={formData.recipientType === type} onChange={() => setFormData({ ...formData, recipientType: type, selectedUsers: [] })} />
                  <span className="capitalize">{type === 'all' ? 'All Users' : type === 'role' ? 'By Role' : 'Select Users'}</span>
                </label>
              ))}
            </div>
            {formData.recipientType === 'role' && (
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input w-full mb-4">
                <option value="ADMIN">Admin</option>
                <option value="EDITOR">Editor</option>
                <option value="AUTHOR">Author</option>
                <option value="VIEWER">Viewer</option>
              </select>
            )}
            {formData.recipientType === 'specific' && (
              <div className="max-h-48 overflow-y-auto border rounded p-2">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" checked={formData.selectedUsers.includes(user.id)} onChange={(e) => {
                      setFormData({
                        ...formData,
                        selectedUsers: e.target.checked
                          ? [...formData.selectedUsers, user.id]
                          : formData.selectedUsers.filter(id => id !== user.id),
                      });
                    }} />
                    <span>{user.name}</span>
                    <span className="text-gray-500 text-sm">({user.email})</span>
                  </label>
                ))}
              </div>
            )}
            <p className="mt-3 text-sm text-gray-600">
              <strong>{getRecipientCount()}</strong> recipient(s) selected
            </p>
          </div>

          {/* Subject Override */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <label className="block text-sm font-medium mb-2">Subject Override (optional)</label>
            <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="input w-full" placeholder="Leave empty to use template subject" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-4">Send Test Email</h3>
            <input type="email" value={formData.testEmail} onChange={(e) => setFormData({ ...formData, testEmail: e.target.value })} className="input w-full mb-3" placeholder="test@example.com" />
            <button onClick={handleSendTest} disabled={sending || !formData.templateId} className="btn-secondary w-full flex items-center justify-center gap-2">
              <FiSend /> Send Test
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-4">Send to Recipients</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will send emails to <strong>{getRecipientCount()}</strong> user(s).
            </p>
            <button onClick={handleSendBulk} disabled={sending || !formData.templateId || getRecipientCount() === 0} className="btn-primary w-full flex items-center justify-center gap-2">
              {sending ? 'Sending...' : <><FiSend /> Send Emails</>}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Email Preview</h2>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded"><FiX /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <div className="bg-white rounded shadow max-w-xl mx-auto" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

