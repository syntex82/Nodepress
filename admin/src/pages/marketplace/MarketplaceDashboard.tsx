/**
 * Marketplace Dashboard
 * Overview and statistics for the developer marketplace
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiBriefcase, FiDollarSign, FiTrendingUp,
  FiUserCheck, FiClock, FiCheckCircle, FiAlertCircle,
  FiHelpCircle, FiStar, FiGrid, FiBarChart2
} from 'react-icons/fi';
import api from '../../services/api';
import Tooltip from '../../components/Tooltip';
import { MARKETPLACE_TOOLTIPS } from '../../config/tooltips';
import toast from 'react-hot-toast';

interface Statistics {
  developers: {
    total: number;
    pending: number;
    active: number;
    suspended: number;
    byCategory: { category: string; _count: number }[];
    topRated: any[];
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    totalValue: number;
    avgValue: number;
  };
  financial: {
    totalTransactions: number;
    totalEscrow: number;
    totalPaid: number;
    totalFees: number;
    pendingPayouts: { count: number; amount: number };
  };
}

export default function MarketplaceDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [devStats, projectStats, financialStats] = await Promise.all([
        api.get('/marketplace/developers/admin/statistics'),
        api.get('/marketplace/projects/admin/statistics'),
        api.get('/marketplace/payments/admin/statistics'),
      ]);
      setStats({
        developers: devStats.data,
        projects: projectStats.data,
        financial: financialStats.data,
      });
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
      toast.error('Failed to load marketplace statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Developers',
      value: stats?.developers.total || 0,
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-400',
      bgGlow: 'shadow-blue-500/20',
      link: '/marketplace/developers',
      subtext: `${stats?.developers.pending || 0} pending approval`,
      subtextColor: 'text-amber-400',
      tooltip: MARKETPLACE_TOOLTIPS.totalDevelopers
    },
    {
      name: 'Active Projects',
      value: stats?.projects.active || 0,
      icon: FiBriefcase,
      color: 'from-emerald-500 to-green-400',
      bgGlow: 'shadow-emerald-500/20',
      link: '/marketplace/projects',
      subtext: `${stats?.projects.completed || 0} completed`,
      subtextColor: 'text-emerald-400',
      tooltip: MARKETPLACE_TOOLTIPS.activeProjects
    },
    {
      name: 'Total Escrow',
      value: `$${Number(stats?.financial.totalEscrow || 0).toLocaleString()}`,
      icon: FiDollarSign,
      color: 'from-purple-500 to-pink-400',
      bgGlow: 'shadow-purple-500/20',
      link: '/marketplace/projects',
      subtext: 'Held in escrow',
      subtextColor: 'text-slate-400',
      tooltip: MARKETPLACE_TOOLTIPS.totalEscrow
    },
    {
      name: 'Platform Fees',
      value: `$${Number(stats?.financial.totalFees || 0).toLocaleString()}`,
      icon: FiTrendingUp,
      color: 'from-amber-500 to-orange-400',
      bgGlow: 'shadow-amber-500/20',
      link: '/marketplace/developers',
      subtext: 'Total earned',
      subtextColor: 'text-slate-400',
      tooltip: MARKETPLACE_TOOLTIPS.platformFees
    },
  ];

  const quickActions = [
    {
      name: 'Manage Developers',
      icon: FiUserCheck,
      link: '/marketplace/developers',
      color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20',
      desc: 'Review applications & profiles',
      badge: stats?.developers.pending ? { count: stats.developers.pending, color: 'bg-amber-500' } : null
    },
    {
      name: 'View Projects',
      icon: FiBriefcase,
      link: '/marketplace/projects',
      color: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20',
      desc: 'Monitor active projects'
    },
    {
      name: 'Hiring Requests',
      icon: FiClock,
      link: '/marketplace/requests',
      color: 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20',
      desc: 'Pending hiring requests'
    },
    {
      name: 'Analytics',
      icon: FiBarChart2,
      link: '/marketplace/developers',
      color: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20',
      desc: 'Marketplace performance'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading marketplace data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FiAlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchStatistics}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Marketplace Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Monitor your developer marketplace performance</p>
        </div>
        <Tooltip title="Help" content="View marketplace statistics, manage developers, and monitor projects" position="left" variant="help">
          <button className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-all text-slate-400 hover:text-blue-400">
            <FiHelpCircle size={22} />
          </button>
        </Tooltip>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Tooltip key={stat.name} title={stat.tooltip.title} content={stat.tooltip.content} position="top" variant="info">
              <Link
                to={stat.link}
                className={`group bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all hover:-translate-y-1 shadow-xl ${stat.bgGlow}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    <p className={`text-sm mt-2 flex items-center gap-1 ${stat.subtextColor}`}>
                      <FiTrendingUp size={14} />
                      <span>{stat.subtext}</span>
                    </p>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.color} text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                </div>
              </Link>
            </Tooltip>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <FiGrid className="text-indigo-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Quick Actions</h2>
            <p className="text-sm text-slate-400">Manage your marketplace</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.name} content={action.desc} position="bottom">
                <Link
                  to={action.link}
                  className={`relative flex flex-col items-center gap-3 p-4 rounded-xl ${action.color} transition-all hover:scale-105`}
                >
                  {action.badge && (
                    <span className={`absolute -top-2 -right-2 ${action.badge.color} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                      {action.badge.count}
                    </span>
                  )}
                  <Icon size={24} />
                  <span className="text-sm font-medium text-center">{action.name}</span>
                </Link>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Top Rated Developers & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Developers */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <FiStar className="text-amber-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Top Rated Developers</h2>
              <p className="text-sm text-slate-400">Highest rated on the marketplace</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {stats?.developers.topRated && stats.developers.topRated.length > 0 ? (
              stats.developers.topRated.slice(0, 5).map((dev: any) => (
                <div key={dev.id} className="text-center group">
                  <div className="relative mx-auto w-14 h-14 mb-2">
                    <img
                      src={dev.user?.avatar || '/images/default-avatar.png'}
                      alt={dev.displayName}
                      className="w-14 h-14 rounded-full border-2 border-slate-600 group-hover:border-amber-400 transition-colors object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <FiStar size={10} />
                      {Number(dev.rating).toFixed(1)}
                    </div>
                  </div>
                  <p className="font-medium text-white text-sm truncate">{dev.displayName}</p>
                  <p className="text-xs text-slate-500">{dev.reviewCount} reviews</p>
                </div>
              ))
            ) : (
              <div className="col-span-5 text-center py-8 text-slate-500">
                No rated developers yet
              </div>
            )}
          </div>
        </div>

        {/* Developers by Category */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FiGrid className="text-purple-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">By Category</h2>
              <p className="text-sm text-slate-400">Developer distribution</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats?.developers.byCategory && stats.developers.byCategory.length > 0 ? (
              stats.developers.byCategory.map((cat: any) => (
                <div key={cat.category} className="bg-slate-700/30 rounded-xl p-4 text-center hover:bg-slate-700/50 transition-colors border border-slate-600/30">
                  <p className="text-2xl font-bold text-white">{cat._count}</p>
                  <p className="text-xs text-slate-400 mt-1 capitalize">{cat.category.toLowerCase().replace('_', ' ')}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-slate-500">
                No categories yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 flex items-center justify-between border border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <FiCheckCircle className="text-emerald-400" size={18} />
          </div>
          <div>
            <p className="font-medium text-white">Marketplace Active</p>
            <p className="text-sm text-slate-400">Your developer marketplace is live and accepting applications.</p>
          </div>
        </div>
        <Link
          to="/marketplace/developers"
          className="px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 transition-colors text-sm font-medium"
        >
          View Developers
        </Link>
      </div>
    </div>
  );
}

