/**
 * Rate Limiting Management Page
 * Configure rate limits and view violations
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { securityApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

export default function RateLimiting() {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<{
    endpoint: string;
    windowMs: number;
    maxRequests: number;
    enabled: boolean;
    blockDuration?: number;
  }>({
    endpoint: '',
    windowMs: 60000,
    maxRequests: 100,
    enabled: true,
    blockDuration: 15,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [configsRes, violationsRes] = await Promise.all([
        securityApi.getRateLimits(),
        securityApi.getRateLimitViolations(),
      ]);
      setConfigs(configsRes.data);
      setViolations(violationsRes.data);
    } catch (error) {
      toast.error('Failed to load rate limiting data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await securityApi.upsertRateLimit(formData);
      toast.success('Rate limit configuration saved');
      setShowAddModal(false);
      setFormData({
        endpoint: '',
        windowMs: 60000,
        maxRequests: 100,
        enabled: true,
        blockDuration: 15,
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to save rate limit configuration');
    }
  };

  const handleDelete = async (endpoint: string) => {
    if (!confirm(`Delete rate limit for ${endpoint}?`)) return;
    
    try {
      await securityApi.deleteRateLimit(encodeURIComponent(endpoint));
      toast.success('Rate limit configuration deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete rate limit configuration');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Link to=".." relative="path" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
          <FiArrowLeft /> Back to Security
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Rate Limiting</h1>
            <p className="text-slate-400 mt-2">Configure API rate limits and view violations</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
          >
            <FiPlus /> Add Rate Limit
          </button>
        </div>
      </div>

      {/* Rate Limit Configurations */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 mb-8">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">Rate Limit Configurations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Window</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Max Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Block Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {configs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No rate limit configurations found
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr key={config.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-sm font-medium text-white">{config.endpoint}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{config.windowMs / 1000}s</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{config.maxRequests}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {config.blockDuration ? `${config.blockDuration}m` : 'None'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        config.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600/50 text-slate-400'
                      }`}>
                        {config.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(config.endpoint)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Violations */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiAlertTriangle className="text-orange-400" />
            Recent Violations
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Requests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Limit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No violations recorded
                  </td>
                </tr>
              ) : (
                violations.map((violation) => (
                  <tr key={violation.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4 text-sm font-mono text-white">{violation.ip}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{violation.endpoint}</td>
                    <td className="px-6 py-4 text-sm text-red-400 font-semibold">{violation.requests}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{violation.limit}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(violation.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Add Rate Limit Configuration</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Endpoint
                  </label>
                  <input
                    type="text"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    placeholder="e.g., /api/auth/login or global"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Time Window (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.windowMs / 1000}
                    onChange={(e) => setFormData({ ...formData, windowMs: parseInt(e.target.value) * 1000 })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Max Requests
                  </label>
                  <input
                    type="number"
                    value={formData.maxRequests}
                    onChange={(e) => setFormData({ ...formData, maxRequests: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Block Duration (minutes, optional)
                  </label>
                  <input
                    type="number"
                    value={formData.blockDuration || ''}
                    onChange={(e) => setFormData({ ...formData, blockDuration: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Leave empty for no blocking"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="mr-2 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500/50"
                  />
                  <label htmlFor="enabled" className="text-sm text-slate-300">
                    Enabled
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-blue-400"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-700 text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


