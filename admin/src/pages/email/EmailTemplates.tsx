/**
 * Email Templates Page
 * Manage email templates with visual editor
 */

import { useEffect, useState } from 'react';
import { emailApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMail, FiX, FiCode, FiType } from 'react-icons/fi';

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
  const [previewHtml, setPreviewHtml] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('html');
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

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Manage your email templates</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <FiPlus /> New Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  template.isSystem ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {template.type.replace('_', ' ')}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                template.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 truncate">{template.subject}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span><FiMail className="inline mr-1" />{template._count?.emailLogs || 0} sent</span>
              <div className="flex gap-2">
                <button onClick={() => handlePreview(template)} className="p-1 hover:text-indigo-600" title="Preview">
                  <FiEye />
                </button>
                <button onClick={() => handleOpenModal(template)} className="p-1 hover:text-indigo-600" title="Edit">
                  <FiEdit2 />
                </button>
                {!template.isSystem && (
                  <button onClick={() => setDeleteConfirm({ isOpen: true, id: template.id })} className="p-1 hover:text-red-600" title="Delete">
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <FiMail className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-600">No email templates yet</p>
          <button onClick={() => handleOpenModal()} className="mt-4 text-indigo-600 hover:underline">
            Create your first template
          </button>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value, slug: editingTemplate ? formData.slug : generateSlug(e.target.value) });
                  }} className="input w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input w-full" required disabled={editingTemplate?.isSystem} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input w-full" disabled={editingTemplate?.isSystem}>
                    {TEMPLATE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="input w-full" required placeholder="e.g., Welcome to {{site.name}}!" />
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">HTML Content</label>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setEditorMode('html')} className={`px-2 py-1 text-xs rounded ${editorMode === 'html' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}><FiCode className="inline mr-1" />HTML</button>
                    <button type="button" onClick={() => setEditorMode('visual')} className={`px-2 py-1 text-xs rounded ${editorMode === 'visual' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}><FiType className="inline mr-1" />Preview</button>
                  </div>
                </div>
                {editorMode === 'html' ? (
                  <textarea value={formData.htmlContent} onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })} className="input w-full font-mono text-sm" rows={12} required />
                ) : (
                  <div className="border rounded-lg p-4 bg-gray-50 h-64 overflow-auto" dangerouslySetInnerHTML={{ __html: formData.htmlContent }} />
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      <ConfirmDialog isOpen={deleteConfirm.isOpen} title="Delete Template" message="Are you sure you want to delete this template? This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteConfirm({ isOpen: false, id: null })} />
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

