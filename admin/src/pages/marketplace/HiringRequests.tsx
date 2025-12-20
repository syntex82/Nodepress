/**
 * Hiring Requests Management Page
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUser, FiCode, FiDollarSign, FiCalendar,
  FiChevronLeft, FiChevronRight, FiEye, FiInbox
} from 'react-icons/fi';
import api from '../../services/api';
import Tooltip from '../../components/Tooltip';
import { MARKETPLACE_TOOLTIPS } from '../../config/tooltips';
import toast from 'react-hot-toast';

interface HiringRequest {
  id: string;
  title: string;
  description: string;
  budgetType: string;
  budgetAmount: number;
  status: string;
  createdAt: string;
  client: { id: string; name: string; avatar?: string };
  developer: { id: string; displayName: string; user: { name: string; avatar?: string } };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  ACCEPTED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  CANCELLED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  DISPUTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DISPUTED: 'Disputed',
};

export default function HiringRequests() {
  const [requests, setRequests] = useState<HiringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', role: 'client' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchRequests();
  }, [filter, pagination.page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const endpoint = filter.role === 'client'
        ? `/api/marketplace/hiring-requests/my/client?${params}`
        : `/api/marketplace/hiring-requests/my/developer?${params}`;

      const { data } = await api.get(endpoint);
      setRequests(data.requests || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast.error(error.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Hiring Requests
          </h1>
          <p className="text-slate-400 mt-1">Manage your hiring requests and project proposals</p>
        </div>
      </div>

      {/* Role Toggle */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-2 inline-flex gap-2">
        <Tooltip title={MARKETPLACE_TOOLTIPS.roleToggle.title} content="View requests you've sent to developers" position="bottom">
          <button
            onClick={() => setFilter({ ...filter, role: 'client' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              filter.role === 'client'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FiUser size={16} />
            As Client
          </button>
        </Tooltip>
        <Tooltip title={MARKETPLACE_TOOLTIPS.roleToggle.title} content="View requests you've received from clients" position="bottom">
          <button
            onClick={() => setFilter({ ...filter, role: 'developer' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              filter.role === 'developer'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <FiCode size={16} />
            As Developer
          </button>
        </Tooltip>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center gap-4">
          <Tooltip title={MARKETPLACE_TOOLTIPS.statusFilter.title} content={MARKETPLACE_TOOLTIPS.statusFilter.content} position="bottom">
            <select
              value={filter.status}
              onChange={e => setFilter({ ...filter, status: e.target.value })}
              className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </Tooltip>
          {filter.status && (
            <button
              onClick={() => setFilter({ ...filter, status: '' })}
              className="text-slate-400 hover:text-white text-sm"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading requests...</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-12 text-center">
          <FiInbox className="mx-auto text-slate-600 mb-4" size={56} />
          <h3 className="text-xl font-semibold text-white mb-2">No Hiring Requests</h3>
          <p className="text-slate-400">
            {filter.role === 'client'
              ? "You haven't sent any hiring requests yet."
              : "You haven't received any hiring requests yet."}
          </p>
          {filter.role === 'client' && (
            <Link
              to="/marketplace/developers"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Browse Developers
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div
              key={req.id}
              className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{req.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mt-1">{req.description}</p>
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[req.status]}`}>
                  {statusLabels[req.status] || req.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <FiDollarSign size={16} className="text-emerald-400" />
                  <span>
                    <span className="text-white font-semibold">${req.budgetAmount}</span>
                    <span className="text-slate-500 ml-1">({req.budgetType})</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <FiUser size={16} className="text-blue-400" />
                  <span>Client: <span className="text-white">{req.client?.name || 'Unknown'}</span></span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <FiCode size={16} className="text-purple-400" />
                  <span>Developer: <span className="text-white">{req.developer?.displayName || 'Unknown'}</span></span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <FiCalendar size={16} />
                  <span>{formatDate(req.createdAt)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-end">
                <Tooltip title={MARKETPLACE_TOOLTIPS.viewDetails.title} content={MARKETPLACE_TOOLTIPS.viewDetails.content} position="left">
                  <Link
                    to={`/marketplace/requests/${req.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                  >
                    <FiEye size={16} />
                    View Details
                  </Link>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page === 1}
            className="flex items-center gap-2 px-3 py-2 border border-slate-600/50 rounded-xl text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronLeft size={16} />
            Previous
          </button>
          <span className="text-slate-400">
            Page <span className="text-white font-medium">{pagination.page}</span>
          </span>
          <button
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            disabled={requests.length < pagination.limit}
            className="flex items-center gap-2 px-3 py-2 border border-slate-600/50 rounded-xl text-slate-300 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

