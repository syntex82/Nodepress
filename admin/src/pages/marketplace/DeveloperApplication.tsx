/**
 * Developer Application Page
 * Form for users to apply as developers
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const categories = [
  { value: 'FRONTEND', label: 'Frontend Developer' },
  { value: 'BACKEND', label: 'Backend Developer' },
  { value: 'FULLSTACK', label: 'Full-Stack Developer' },
  { value: 'WORDPRESS', label: 'WordPress Developer' },
  { value: 'MOBILE', label: 'Mobile Developer' },
  { value: 'DEVOPS', label: 'DevOps Engineer' },
  { value: 'DESIGN', label: 'UI/UX Designer' },
  { value: 'DATABASE', label: 'Database Expert' },
  { value: 'SECURITY', label: 'Security Specialist' },
  { value: 'OTHER', label: 'Other' },
];

export default function DeveloperApplication() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    websiteUrl: '',
    githubUrl: '',
    linkedinUrl: '',
    applicationNote: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/api/marketplace/developers', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
        frameworks: form.frameworks.split(',').map(s => s.trim()).filter(Boolean),
      });
      navigate('/admin/marketplace/my-profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Apply as Developer</h1>
      <p className="text-gray-600 mb-6">Join our marketplace and start earning by helping clients with their projects.</p>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
            <input type="text" required value={form.displayName}
              onChange={e => setForm({ ...form, displayName: e.target.value })}
              className="w-full rounded-md border-gray-300" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headline *</label>
            <input type="text" required value={form.headline}
              onChange={e => setForm({ ...form, headline: e.target.value })}
              className="w-full rounded-md border-gray-300" placeholder="Senior Full-Stack Developer" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea rows={4} value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              className="w-full rounded-md border-gray-300" placeholder="Tell clients about yourself..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-md border-gray-300">
              {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Skills & Experience</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            <input type="text" value={form.skills}
              onChange={e => setForm({ ...form, skills: e.target.value })}
              className="w-full rounded-md border-gray-300" placeholder="React, Node.js, TypeScript" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programming Languages</label>
            <input type="text" value={form.languages}
              onChange={e => setForm({ ...form, languages: e.target.value })}
              className="w-full rounded-md border-gray-300" placeholder="JavaScript, Python, Go" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frameworks</label>
            <input type="text" value={form.frameworks}
              onChange={e => setForm({ ...form, frameworks: e.target.value })}
              className="w-full rounded-md border-gray-300" placeholder="React, NestJS, Django" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input type="number" min={0} max={50} value={form.yearsOfExperience}
              onChange={e => setForm({ ...form, yearsOfExperience: parseInt(e.target.value) })}
              className="w-full rounded-md border-gray-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Pricing</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($) *</label>
              <input type="number" min={1} required value={form.hourlyRate}
                onChange={e => setForm({ ...form, hourlyRate: parseInt(e.target.value) })}
                className="w-full rounded-md border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Budget ($)</label>
              <input type="number" min={0} value={form.minimumBudget}
                onChange={e => setForm({ ...form, minimumBudget: parseInt(e.target.value) })}
                className="w-full rounded-md border-gray-300" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Links & Application Note</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <input type="url" value={form.websiteUrl} placeholder="Website URL"
              onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
              className="rounded-md border-gray-300" />
            <input type="url" value={form.githubUrl} placeholder="GitHub URL"
              onChange={e => setForm({ ...form, githubUrl: e.target.value })}
              className="rounded-md border-gray-300" />
            <input type="url" value={form.linkedinUrl} placeholder="LinkedIn URL"
              onChange={e => setForm({ ...form, linkedinUrl: e.target.value })}
              className="rounded-md border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join?</label>
            <textarea rows={3} value={form.applicationNote}
              onChange={e => setForm({ ...form, applicationNote: e.target.value })}
              className="w-full rounded-md border-gray-300" placeholder="Tell us why you'd be a great addition..." />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

