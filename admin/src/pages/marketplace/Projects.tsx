/**
 * Projects Management Page
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUser, FiCode, FiDollarSign, FiLock,
  FiChevronLeft, FiChevronRight, FiEye, FiFolder
} from 'react-icons/fi';
import api from '../../services/api';
import Tooltip from '../../components/Tooltip';
import { MARKETPLACE_TOOLTIPS } from '../../config/tooltips';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  budgetType: string;
  totalBudget: number;
  amountPaid: number;
  amountInEscrow: number;
  status: string;
  progress: number;
  createdAt: string;
  client: { id: string; name: string; avatar?: string };
  developer: { id: string; displayName: string; user: { name: string; avatar?: string } };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-500/20 text-slate-400',
  ACTIVE: 'bg-blue-500/20 text-blue-400',
  ON_HOLD: 'bg-amber-500/20 text-amber-400',
  COMPLETED: 'bg-emerald-500/20 text-emerald-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const progressColors: Record<string, string> = {
  low: 'from-red-500 to-orange-500',
  medium: 'from-amber-500 to-yellow-500',
  high: 'from-emerald-500 to-green-500',
};

const getProgressColor = (progress: number) => {
  if (progress < 33) return progressColors.low;
  if (progress < 66) return progressColors.medium;
  return progressColors.high;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', role: 'client' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchProjects();
  }, [filter, pagination.page]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const endpoint = filter.role === 'client'
        ? `/marketplace/projects/my/client?${params}`
        : `/marketplace/projects/my/developer?${params}`;

      const { data } = await api.get(endpoint);
      setProjects(data.projects || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            My Projects
          </h1>
          <p className="text-slate-400 mt-1">Track and manage your active projects</p>
        </div>
      </div>

      {/* Role Toggle */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-2 inline-flex gap-2">
        <Tooltip title={MARKETPLACE_TOOLTIPS.roleToggle.title} content="View projects where you're the client" position="bottom">
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
        <Tooltip title={MARKETPLACE_TOOLTIPS.roleToggle.title} content="View projects where you're the developer" position="bottom">
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
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading projects...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-12 text-center">
          <FiFolder className="mx-auto text-slate-600 mb-4" size={56} />
          <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
          <p className="text-slate-400">
            {filter.role === 'client'
              ? "You haven't started any projects yet."
              : "You don't have any projects as a developer yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start gap-3 mb-4">
                  <h3 className="font-semibold text-lg text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <span className={`shrink-0 px-2 py-1 rounded-lg text-xs font-medium ${statusColors[project.status]}`}>
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">{project.description}</p>

                {/* Progress Bar */}
                <Tooltip title={MARKETPLACE_TOOLTIPS.projectProgress.title} content={MARKETPLACE_TOOLTIPS.projectProgress.content} position="top">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${getProgressColor(project.progress)} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </Tooltip>

                {/* Budget Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                      <FiDollarSign size={12} />
                      Budget
                    </div>
                    <p className="text-white font-semibold">${Number(project.totalBudget).toLocaleString()}</p>
                  </div>
                  <Tooltip title={MARKETPLACE_TOOLTIPS.escrowAmount.title} content={MARKETPLACE_TOOLTIPS.escrowAmount.content} position="top">
                    <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                        <FiLock size={12} />
                        In Escrow
                      </div>
                      <p className="text-emerald-400 font-semibold">${Number(project.amountInEscrow).toLocaleString()}</p>
                    </div>
                  </Tooltip>
                </div>

                {/* Participants */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <img
                      src={project.client?.avatar || '/images/default-avatar.png'}
                      alt=""
                      className="w-6 h-6 rounded-full border border-slate-600"
                    />
                    <span className="text-slate-400 truncate max-w-[80px]">{project.client?.name || 'Client'}</span>
                  </div>
                  <span className="text-slate-600">→</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={project.developer?.user?.avatar || '/images/default-avatar.png'}
                      alt=""
                      className="w-6 h-6 rounded-full border border-slate-600"
                    />
                    <span className="text-slate-400 truncate max-w-[80px]">{project.developer?.displayName || 'Developer'}</span>
                  </div>
                </div>

                {/* View Button */}
                <Link
                  to={`/dev-marketplace/projects/${project.id}`}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  <FiEye size={16} />
                  View Project
                </Link>
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
            disabled={projects.length < pagination.limit}
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

