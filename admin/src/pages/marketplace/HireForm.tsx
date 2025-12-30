/**
 * Hire Developer Form
 * Form for clients to send hiring requests
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiBriefcase, FiDollarSign, FiClock, FiCalendar, FiSend,
  FiAlertCircle, FiStar, FiCheckCircle, FiFileText
} from 'react-icons/fi';
import api from '../../services/api';
import Tooltip from '../../components/Tooltip';
import { MARKETPLACE_TOOLTIPS } from '../../config/tooltips';
import toast from 'react-hot-toast';

interface Developer {
  id: string;
  displayName: string;
  headline: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
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
      const { data } = await api.get(`/marketplace/developers/${developerId}`);
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
      await api.post('/marketplace/hiring-requests', {
        developerId,
        ...form,
      });
      toast.success('Hiring request sent successfully!');
      navigate('/dev-marketplace/requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send request');
      toast.error('Failed to send hiring request');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading developer...</p>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiAlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <p className="text-red-400 mb-2">{error || 'Developer not found'}</p>
          <button
            onClick={() => navigate('/dev-marketplace/browse')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Browse Developers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Hire {developer.displayName}
        </h1>
        <p className="text-slate-400 mt-1">Send a hiring request to start working together</p>
      </div>

      {/* Developer Card */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={developer.user.avatar || '/images/default-avatar.png'}
              alt={developer.displayName}
              className="w-16 h-16 rounded-full border-2 border-slate-600 object-cover"
            />
            {developer.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                <FiCheckCircle size={12} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg text-white flex items-center gap-2">
              {developer.displayName}
              {developer.isVerified && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Verified</span>
              )}
            </h2>
            <p className="text-slate-400">{developer.headline}</p>
            <div className="flex items-center gap-4 text-sm mt-2">
              <span className="flex items-center gap-1 text-amber-400">
                <FiStar size={14} />
                {Number(developer.rating).toFixed(1)}
                <span className="text-slate-500">({developer.reviewCount} reviews)</span>
              </span>
              <span className="text-emerald-400 font-medium">${developer.hourlyRate}/hr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Details */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FiBriefcase className="text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Project Details</h2>
              <p className="text-sm text-slate-400">Describe your project</p>
            </div>
          </div>

          <div className="space-y-4">
            <Tooltip title={MARKETPLACE_TOOLTIPS.projectTitle.title} content={MARKETPLACE_TOOLTIPS.projectTitle.content} position="top">
              <div>
                <label className={labelClass}>Project Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Build a React Dashboard"
                />
              </div>
            </Tooltip>

            <Tooltip title={MARKETPLACE_TOOLTIPS.projectDescription.title} content={MARKETPLACE_TOOLTIPS.projectDescription.content} position="top">
              <div>
                <label className={labelClass}>Description <span className="text-red-400">*</span></label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                  placeholder="Describe your project in detail, including goals, features, and any specific requirements..."
                />
              </div>
            </Tooltip>

            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-2">
                  <FiFileText size={14} />
                  Requirements
                </span>
              </label>
              <textarea
                rows={3}
                value={form.requirements}
                onChange={e => setForm({ ...form, requirements: e.target.value })}
                className={inputClass}
                placeholder="List specific requirements, deliverables, or milestones..."
              />
            </div>
          </div>
        </div>

        {/* Budget & Timeline */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FiDollarSign className="text-emerald-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Budget & Timeline</h2>
              <p className="text-sm text-slate-400">Set your budget and deadline</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Tooltip title={MARKETPLACE_TOOLTIPS.budgetType.title} content={MARKETPLACE_TOOLTIPS.budgetType.content} position="top">
                <div>
                  <label className={labelClass}>Budget Type</label>
                  <select
                    value={form.budgetType}
                    onChange={e => setForm({ ...form, budgetType: e.target.value })}
                    className={inputClass}
                  >
                    <option value="fixed" className="bg-slate-800">Fixed Price</option>
                    <option value="hourly" className="bg-slate-800">Hourly Rate</option>
                  </select>
                </div>
              </Tooltip>
              <Tooltip title={MARKETPLACE_TOOLTIPS.budgetAmount.title} content={MARKETPLACE_TOOLTIPS.budgetAmount.content} position="top">
                <div>
                  <label className={labelClass}>
                    {form.budgetType === 'fixed' ? 'Total Budget ($)' : 'Hourly Rate ($)'} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      min={1}
                      required
                      value={form.budgetAmount}
                      onChange={e => setForm({ ...form, budgetAmount: parseInt(e.target.value) || 0 })}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </Tooltip>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Tooltip title={MARKETPLACE_TOOLTIPS.estimatedHours.title} content={MARKETPLACE_TOOLTIPS.estimatedHours.content} position="top">
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-2">
                      <FiClock size={14} />
                      Estimated Hours
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.estimatedHours}
                    onChange={e => setForm({ ...form, estimatedHours: parseInt(e.target.value) || 0 })}
                    className={inputClass}
                  />
                </div>
              </Tooltip>
              <Tooltip title={MARKETPLACE_TOOLTIPS.deadline.title} content={MARKETPLACE_TOOLTIPS.deadline.content} position="top">
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-2">
                      <FiCalendar size={14} />
                      Deadline
                    </span>
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Estimated Cost Summary */}
        {form.budgetType === 'hourly' && form.estimatedHours > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Estimated Total Cost:</span>
              <span className="text-2xl font-bold text-emerald-400">
                ${(form.budgetAmount * form.estimatedHours).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Based on ${form.budgetAmount}/hr × {form.estimatedHours} hours
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Sending...
            </>
          ) : (
            <>
              <FiSend size={18} />
              Send Hiring Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}

