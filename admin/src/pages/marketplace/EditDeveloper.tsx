/**
 * Edit Developer Page
 * Admin page for editing developer profiles
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiSave, FiUser, FiCode, FiDollarSign, FiLink,
  FiGithub, FiLinkedin, FiGlobe, FiClock, FiStar, FiBriefcase
} from 'react-icons/fi';
import { developerMarketplaceApi } from '../../services/api';
import toast from 'react-hot-toast';

const categories = [
  { value: 'FRONTEND', label: 'Frontend Developer' },
  { value: 'BACKEND', label: 'Backend Developer' },
  { value: 'FULLSTACK', label: 'Full-Stack Developer' },
  { value: 'CMS', label: 'CMS Developer' },
  { value: 'MOBILE', label: 'Mobile Developer' },
  { value: 'DEVOPS', label: 'DevOps Engineer' },
  { value: 'DESIGN', label: 'UI/UX Designer' },
  { value: 'DATABASE', label: 'Database Expert' },
  { value: 'SECURITY', label: 'Security Specialist' },
  { value: 'OTHER', label: 'Other' },
];

const statusOptions = ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'INACTIVE'];

export default function EditDeveloper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [developer, setDeveloper] = useState<any>(null);
  const [form, setForm] = useState({
    displayName: '',
    headline: '',
    bio: '',
    category: 'FULLSTACK',
    skills: '',
    languages: '',
    frameworks: '',
    hourlyRate: 50,
    minimumBudget: 500,
    yearsOfExperience: 1,
    availability: 'available',
    availableHours: 40,
    timezone: '',
    websiteUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    status: 'ACTIVE',
    isVerified: false,
    isFeatured: false,
    rating: 0,
    reviewCount: 0,
  });

  useEffect(() => {
    if (id) fetchDeveloper();
  }, [id]);

  const fetchDeveloper = async () => {
    try {
      const { data } = await developerMarketplaceApi.adminGetDeveloper(id!);
      setDeveloper(data);
      setForm({
        displayName: data.displayName || '',
        headline: data.headline || '',
        bio: data.bio || '',
        category: data.category || 'FULLSTACK',
        skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
        languages: Array.isArray(data.languages) ? data.languages.join(', ') : '',
        frameworks: Array.isArray(data.frameworks) ? data.frameworks.join(', ') : '',
        hourlyRate: data.hourlyRate || 50,
        minimumBudget: data.minimumBudget || 500,
        yearsOfExperience: data.yearsOfExperience || 1,
        availability: data.availability || 'available',
        availableHours: data.availableHours || 40,
        timezone: data.timezone || '',
        websiteUrl: data.websiteUrl || '',
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        status: data.status || 'ACTIVE',
        isVerified: data.isVerified || false,
        isFeatured: data.isFeatured || false,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
      });
    } catch (err) {
      toast.error('Failed to load developer');
      navigate('/dev-marketplace/developers');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await developerMarketplaceApi.adminUpdate(id!, {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        frameworks: form.frameworks.split(',').map(s => s.trim()).filter(Boolean),
      } as any);
      toast.success('Developer profile updated!');
      navigate('/dev-marketplace/developers');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update developer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dev-marketplace/developers"
            className="p-2 rounded-lg bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 transition"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Developer</h1>
            <p className="text-slate-400 text-sm">Editing: {developer?.displayName || developer?.user?.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiUser className="text-blue-400" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Display Name *</label>
              <input type="text" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Headline</label>
              <input type="text" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Bio / About</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white">
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white">
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiCode className="text-blue-400" /> Skills & Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Skills (comma separated)</label>
              <input type="text" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Languages</label>
              <input type="text" value={form.languages} onChange={e => setForm({ ...form, languages: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Frameworks</label>
              <input type="text" value={form.frameworks} onChange={e => setForm({ ...form, frameworks: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Years of Experience</label>
              <input type="number" min="0" value={form.yearsOfExperience} onChange={e => setForm({ ...form, yearsOfExperience: parseInt(e.target.value) })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
          </div>
        </div>

        {/* Rates */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiDollarSign className="text-blue-400" /> Rates & Availability
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Hourly Rate ($)</label>
              <input type="number" min="0" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: parseInt(e.target.value) })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Minimum Budget ($)</label>
              <input type="number" min="0" value={form.minimumBudget} onChange={e => setForm({ ...form, minimumBudget: parseInt(e.target.value) })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Available Hours/Week</label>
              <input type="number" min="0" max="168" value={form.availableHours} onChange={e => setForm({ ...form, availableHours: parseInt(e.target.value) })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Timezone</label>
              <input type="text" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiLink className="text-blue-400" /> Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1"><FiGlobe /> Website</label>
              <input type="url" value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1"><FiGithub /> GitHub</label>
              <input type="url" value={form.githubUrl} onChange={e => setForm({ ...form, githubUrl: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-1"><FiLinkedin /> LinkedIn</label>
              <input type="url" value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
          </div>
        </div>

        {/* Verification & Rating */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiStar className="text-blue-400" /> Verification & Rating
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isVerified" checked={form.isVerified} onChange={e => setForm({ ...form, isVerified: e.target.checked })}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500" />
              <label htmlFor="isVerified" className="text-slate-300">Verified</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isFeatured" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-amber-500" />
              <label htmlFor="isFeatured" className="text-slate-300">Featured</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Rating (0-5)</label>
              <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Review Count</label>
              <input type="number" min="0" value={form.reviewCount} onChange={e => setForm({ ...form, reviewCount: parseInt(e.target.value) })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link to="/dev-marketplace/developers" className="px-6 py-2.5 border border-slate-600 text-slate-300 rounded-xl hover:bg-slate-700/50 transition">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition">
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

