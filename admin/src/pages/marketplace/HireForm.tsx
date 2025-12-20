/**
 * Hire Developer Form
 * Form for clients to send hiring requests
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

interface Developer {
  id: string;
  displayName: string;
  headline: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  user: { avatar?: string };
}

export default function HireForm() {
  const { developerId } = useParams();
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    budgetType: 'fixed',
    budgetAmount: 500,
    estimatedHours: 10,
    deadline: '',
  });

  useEffect(() => {
    if (developerId) {
      fetchDeveloper();
    }
  }, [developerId]);

  const fetchDeveloper = async () => {
    try {
      const { data } = await api.get(`/api/marketplace/developers/${developerId}`);
      setDeveloper(data);
    } catch (err) {
      setError('Developer not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/api/marketplace/hiring-requests', {
        developerId,
        ...form,
      });
      navigate('/admin/marketplace/requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!developer) return <div className="p-8 text-center text-red-500">{error || 'Developer not found'}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Hire {developer.displayName}</h1>

      {/* Developer Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center gap-4">
        <img src={developer.user.avatar || '/images/default-avatar.png'} alt="" 
          className="w-16 h-16 rounded-full" />
        <div>
          <h2 className="font-semibold text-lg">{developer.displayName}</h2>
          <p className="text-gray-500">{developer.headline}</p>
          <div className="flex items-center gap-4 text-sm mt-1">
            <span>⭐ {developer.rating} ({developer.reviewCount} reviews)</span>
            <span className="text-green-600 font-medium">${developer.hourlyRate}/hr</span>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Project Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
            <input type="text" required value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border-gray-300" placeholder="e.g., Build a React Dashboard" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea rows={4} required value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border-gray-300" 
              placeholder="Describe your project in detail..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea rows={3} value={form.requirements}
              onChange={e => setForm({ ...form, requirements: e.target.value })}
              className="w-full rounded-md border-gray-300" 
              placeholder="List specific requirements or deliverables..." />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Budget & Timeline</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Type</label>
              <select value={form.budgetType} onChange={e => setForm({ ...form, budgetType: e.target.value })}
                className="w-full rounded-md border-gray-300">
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.budgetType === 'fixed' ? 'Total Budget ($)' : 'Hourly Rate ($)'} *
              </label>
              <input type="number" min={1} required value={form.budgetAmount}
                onChange={e => setForm({ ...form, budgetAmount: parseInt(e.target.value) })}
                className="w-full rounded-md border-gray-300" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
              <input type="number" min={1} value={form.estimatedHours}
                onChange={e => setForm({ ...form, estimatedHours: parseInt(e.target.value) })}
                className="w-full rounded-md border-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-md border-gray-300" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Sending...' : 'Send Hiring Request'}
        </button>
      </form>
    </div>
  );
}

