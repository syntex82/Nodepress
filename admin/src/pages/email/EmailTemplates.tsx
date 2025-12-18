/**
 * Email Templates Page
 * Beautiful email template management with live preview and test functionality
 */

import { useEffect, useState } from 'react';
import { emailApi } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmailTemplateEditor from '../../components/email/EmailTemplateEditor';
import EmailTemplatePreview from '../../components/email/EmailTemplatePreview';
import TemplateVariablesPanel from '../../components/email/TemplateVariablesPanel';
import TestEmailModal from '../../components/email/TestEmailModal';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMail, FiX, FiSend, FiCheck, FiClock } from 'react-icons/fi';

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: { name: string; description?: string; example?: string }[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  _count?: { emailLogs: number };
}

const TEMPLATE_TYPES = [
  { value: 'WELCOME', label: 'Welcome' },
  { value: 'PASSWORD_RESET', label: 'Password Reset' },
  { value: 'ORDER_CONFIRMATION', label: 'Order Confirmation' },
  { value: 'COURSE_ENROLLMENT', label: 'Course Enrollment' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'PROMOTIONAL', label: 'Promotional' },
  { value: 'CUSTOM', label: 'Custom' },
];

export default function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTestEmail, setShowTestEmail] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [testEmailTemplateId, setTestEmailTemplateId] = useState<string>('');
  const [testEmailTemplateName, setTestEmailTemplateName] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'CUSTOM',
    subject: '',
    htmlContent: '',
    textContent: '',
    isActive: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await emailApi.getTemplates({ limit: 100 });
      setTemplates(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        slug: template.slug,
        type: template.type,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent || '',
        isActive: template.isActive,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        slug: '',
        type: 'CUSTOM',
        subject: '',
        htmlContent: getDefaultTemplate(),
        textContent: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await emailApi.updateTemplate(editingTemplate.id, formData);
        toast.success('Template updated successfully');
      } else {
        await emailApi.createTemplate(formData);
        toast.success('Template created successfully');
      }
      handleCloseModal();
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save template');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await emailApi.deleteTemplate(deleteConfirm.id);
      toast.success('Template deleted successfully');
      setDeleteConfirm({ isOpen: false, id: null });
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete template');
    }
  };

  const handlePreview = async (template: EmailTemplate) => {
    try {
      const response = await emailApi.previewTemplate(template.id, {
        user: { name: 'John Doe', firstName: 'John', email: 'john@example.com' },
        site: { name: 'My Website', url: 'https://example.com' },
        year: new Date().getFullYear(),
      });
      setPreviewHtml(response.data.html);
      setShowPreview(true);
    } catch (error) {
      toast.error('Failed to preview template');
    }
  };

  const handleOpenTestEmail = (template: EmailTemplate) => {
    setTestEmailTemplateId(template.id);
    setTestEmailTemplateName(template.name);
    setShowTestEmail(true);
  };

  const filteredTemplates = filterType === 'ALL'
    ? templates
    : templates.filter(t => t.type === filterType);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-indigo-500"></div></div>;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
              Email Templates
            </h1>
            <p className="text-slate-400 text-lg">Create and manage beautiful email templates</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
          >
            <FiPlus size={20} />
            New Template
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border-l-4 border-indigo-500 border border-slate-700/50">
            <p className="text-slate-400 text-sm font-medium">Total Templates</p>
            <p className="text-3xl font-bold text-white">{templates.length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border-l-4 border-green-500 border border-slate-700/50">
            <p className="text-slate-400 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-white">{templates.filter(t => t.isActive).length}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border-l-4 border-purple-500 border border-slate-700/50">
            <p className="text-slate-400 text-sm font-medium">System Templates</p>
            <p className="text-3xl font-bold text-white">{templates.filter(t => t.isSystem).length}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            filterType === 'ALL'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-indigo-500/50'
          }`}
        >
          All
        </button>
        {TEMPLATE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilterType(type.value)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterType === type.value
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-indigo-500/50'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all overflow-hidden group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 border-b border-slate-700/50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{template.name}</h3>
                    <p className="text-sm text-slate-400 truncate">{template.subject}</p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                      template.isSystem
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {template.isSystem ? '🔒 System' : '✏️ Custom'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Type Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full">
                    {template.type.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      template.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {template.isActive ? '🟢 Active' : '🔴 Inactive'}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-slate-400 pt-2 border-t border-slate-700/50">
                  <div className="flex items-center gap-1">
                    <FiMail size={16} className="text-indigo-400" />
                    <span>{template._count?.emailLogs || 0} sent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock size={16} className="text-slate-500" />
                    <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer - Actions */}
              <div className="bg-slate-700/30 p-4 border-t border-slate-700/50 flex gap-2">
                <button
                  onClick={() => handlePreview(template)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-300 transition-all font-medium text-sm"
                  title="Preview"
                >
                  <FiEye size={16} />
                  Preview
                </button>
                <button
                  onClick={() => handleOpenModal(template)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-300 transition-all font-medium text-sm"
                  title="Edit"
                >
                  <FiEdit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleOpenTestEmail(template)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-green-500/20 hover:border-green-500/50 hover:text-green-300 transition-all font-medium text-sm"
                  title="Send Test"
                >
                  <FiSend size={16} />
                  Test
                </button>
                {!template.isSystem && (
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, id: template.id })}
                    className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-red-400 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 transition-all font-medium text-sm"
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-800/50 backdrop-blur rounded-xl border-2 border-dashed border-slate-700">
          <FiMail className="mx-auto text-6xl text-slate-600 mb-4" />
          <p className="text-white text-lg font-medium mb-2">No email templates found</p>
          <p className="text-slate-400 mb-6">
            {filterType !== 'ALL' ? 'Try changing the filter' : 'Create your first template to get started'}
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg shadow-indigo-500/20 transition-all"
          >
            <FiPlus size={20} />
            Create Template
          </button>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-slate-700/50">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingTemplate ? '✏️ Edit Template' : '📧 New Template'}
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {editingTemplate ? `Editing: ${editingTemplate.name}` : 'Create a new email template'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-800">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Settings */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/50">
                    <h3 className="font-semibold text-white mb-4">Template Settings</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          Template Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              name: e.target.value,
                              slug: editingTemplate ? formData.slug : generateSlug(e.target.value),
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          Slug
                        </label>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all disabled:opacity-50"
                          required
                          disabled={editingTemplate?.isSystem}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          Type
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all disabled:opacity-50"
                          disabled={editingTemplate?.isSystem}
                        >
                          {TEMPLATE_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl border border-slate-600/50 cursor-pointer hover:border-indigo-500/50 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium text-slate-300">Active</span>
                      </label>
                    </div>
                  </div>

                  {/* Variables Panel */}
                  <TemplateVariablesPanel />
                </div>

                {/* Right Column - Editor */}
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Email Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                      required
                      placeholder="e.g., Welcome to {{site.name}}!"
                    />
                  </div>

                  {/* Editor */}
                  <EmailTemplateEditor
                    htmlContent={formData.htmlContent}
                    onChange={(content) => setFormData({ ...formData, htmlContent: content })}
                    previewHtml={previewHtml}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-semibold rounded-xl hover:bg-slate-600/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                  <FiCheck size={18} />
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <EmailTemplatePreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        htmlContent={previewHtml}
        subject={editingTemplate?.subject}
        templateName={editingTemplate?.name}
      />

      {/* Test Email Modal */}
      <TestEmailModal
        isOpen={showTestEmail}
        onClose={() => setShowTestEmail(false)}
        templateId={testEmailTemplateId}
        templateName={testEmailTemplateName}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  );
}

function getDefaultTemplate(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h1>Hello {{user.name}}</h1>
  <p>Your content here...</p>
</body></html>`;
}

