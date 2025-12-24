/**
 * Marketplace Dashboard
 * Overview and statistics for the developer marketplace
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiBriefcase, FiDollarSign, FiTrendingUp,
  FiUserCheck, FiClock, FiCheckCircle, FiAlertCircle,
  FiHelpCircle, FiStar, FiGrid, FiBarChart2, FiSettings, FiSave
} from 'react-icons/fi';
import api from '../../services/api';
import Tooltip from '../../components/Tooltip';
import { MARKETPLACE_TOOLTIPS } from '../../config/tooltips';
import toast from 'react-hot-toast';

interface MarketplaceConfig {
  platformFeePercent: number;
  minPayoutAmount: number;
  maxEscrowDays: number;
  autoReleaseDays: number;
  enabled: boolean;
}

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
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<MarketplaceConfig>({
    platformFeePercent: 10,
    minPayoutAmount: 10,
    maxEscrowDays: 90,
    autoReleaseDays: 14,
    enabled: true,
  });
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchStatistics();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/system-config/marketplace');
      setConfig(response.data);
    } catch (err) {
      console.error('Error fetching marketplace config:', err);
    }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      await api.put('/system-config/marketplace', config);
      toast.success('Marketplace settings saved successfully');
      setShowSettings(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingConfig(false);
    }
  };

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
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-0">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent truncate">
            Marketplace Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base truncate">Monitor your developer marketplace performance</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Tooltip title="Settings" content="Configure marketplace settings like platform fees" position="bottom">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
                showSettings
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 text-slate-400 hover:text-blue-400'
              }`}
              aria-label="Settings"
            >
              <FiSettings size={20} className="sm:w-[22px] sm:h-[22px]" />
            </button>
          </Tooltip>
          <Tooltip title="Help" content="View marketplace statistics, manage developers, and monitor projects" position="left" variant="help">
            <button className="p-2.5 sm:p-3 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-all text-slate-400 hover:text-blue-400 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Help">
              <FiHelpCircle size={20} className="sm:w-[22px] sm:h-[22px]" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Settings Panel - Fully Responsive */}
      {showSettings && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl sm:rounded-2xl border border-blue-500/30 p-4 sm:p-6 shadow-xl shadow-blue-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                <FiSettings className="text-blue-400" size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-white truncate">Marketplace Settings</h2>
                <p className="text-xs sm:text-sm text-slate-400 truncate">Configure fees and payout rules</p>
              </div>
            </div>
            <button
              onClick={saveConfig}
              disabled={savingConfig}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] text-sm sm:text-base active:scale-95 w-full sm:w-auto"
            >
              <FiSave size={16} />
              {savingConfig ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Platform Fee */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Platform Fee (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={config.platformFeePercent}
                onChange={(e) => setConfig({ ...config, platformFeePercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 sm:px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg sm:rounded-xl text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
              />
              <p className="text-xs text-slate-500">Fee charged on each project (0-50%)</p>
            </div>

            {/* Minimum Payout */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Minimum Payout ($)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={config.minPayoutAmount}
                onChange={(e) => setConfig({ ...config, minPayoutAmount: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 sm:px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg sm:rounded-xl text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
              />
              <p className="text-xs text-slate-500">Minimum amount for withdrawals</p>
            </div>

            {/* Max Escrow Days */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Max Escrow Days
              </label>
              <input
                type="number"
                min="7"
                max="365"
                step="1"
                value={config.maxEscrowDays}
                onChange={(e) => setConfig({ ...config, maxEscrowDays: parseInt(e.target.value) || 90 })}
                className="w-full px-3 sm:px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg sm:rounded-xl text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
              />
              <p className="text-xs text-slate-500">Maximum days funds held in escrow</p>
            </div>

            {/* Auto Release Days */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Auto-Release Days
              </label>
              <input
                type="number"
                min="1"
                max="60"
                step="1"
                value={config.autoReleaseDays}
                onChange={(e) => setConfig({ ...config, autoReleaseDays: parseInt(e.target.value) || 14 })}
                className="w-full px-3 sm:px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg sm:rounded-xl text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
              />
              <p className="text-xs text-slate-500">Days before auto-release after completion</p>
            </div>
          </div>

          {/* Marketplace Toggle */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm sm:text-base">Marketplace Status</p>
                <p className="text-xs sm:text-sm text-slate-400">Enable or disable the developer marketplace</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                className={`relative inline-flex h-7 w-12 sm:h-6 sm:w-11 items-center rounded-full transition-colors touch-manipulation flex-shrink-0 ${
                  config.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
                aria-label={config.enabled ? 'Disable marketplace' : 'Enable marketplace'}
              >
                <span
                  className={`inline-block h-5 w-5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    config.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Tooltip key={stat.name} title={stat.tooltip.title} content={stat.tooltip.content} position="top" variant="info">
              <Link
                to={stat.link}
                className={`group bg-slate-800/50 backdrop-blur rounded-xl sm:rounded-2xl border border-slate-700/50 p-5 sm:p-6 hover:border-slate-600/50 transition-all hover:-translate-y-1 shadow-xl ${stat.bgGlow} touch-manipulation active:scale-95`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">{stat.name}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 sm:mt-2 tabular-nums truncate">{stat.value}</p>
                    <p className={`text-xs sm:text-sm mt-1.5 sm:mt-2 flex items-center gap-1 ${stat.subtextColor} truncate`}>
                      <FiTrendingUp size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
                      <span className="truncate">{stat.subtext}</span>
                    </p>
                  </div>
                  <div className={`flex-shrink-0 bg-gradient-to-br ${stat.color} text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="sm:w-[28px] sm:h-[28px]" />
                  </div>
                </div>
              </Link>
            </Tooltip>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 bg-indigo-500/20 rounded-lg flex-shrink-0">
            <FiGrid className="text-indigo-400" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white truncate">Quick Actions</h2>
            <p className="text-xs sm:text-sm text-slate-400 truncate">Manage your marketplace</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.name} content={action.desc} position="bottom">
                <Link
                  to={action.link}
                  className={`relative flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl ${action.color} transition-all hover:scale-105 active:scale-95 touch-manipulation min-h-[80px] sm:min-h-[96px]`}
                >
                  {action.badge && (
                    <span className={`absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 ${action.badge.color} text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full min-w-[20px] text-center`}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Rated Developers */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-amber-500/20 rounded-lg flex-shrink-0">
              <FiStar className="text-amber-400" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">Top Rated Developers</h2>
              <p className="text-xs sm:text-sm text-slate-400 truncate">Highest rated on the marketplace</p>
            </div>
          </div>
          {/* Responsive grid: 2 on mobile, 3 on sm, 5 on md+ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {stats?.developers.topRated && stats.developers.topRated.length > 0 ? (
              stats.developers.topRated.slice(0, 5).map((dev: any) => (
                <div key={dev.id} className="text-center group touch-manipulation">
                  <div className="relative mx-auto w-12 h-12 sm:w-14 sm:h-14 mb-2">
                    <img
                      src={dev.user?.avatar || '/images/default-avatar.png'}
                      alt={dev.displayName}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-slate-600 group-hover:border-amber-400 transition-colors object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <FiStar size={8} className="sm:w-[10px] sm:h-[10px]" />
                      {Number(dev.rating).toFixed(1)}
                    </div>
                  </div>
                  <p className="font-medium text-white text-xs sm:text-sm truncate px-1">{dev.displayName}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">{dev.reviewCount} reviews</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 sm:col-span-3 md:col-span-5 text-center py-6 sm:py-8 text-slate-500 text-sm">
                No rated developers yet
              </div>
            )}
          </div>
        </div>

        {/* Developers by Category */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl sm:rounded-2xl border border-slate-700/50 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
              <FiGrid className="text-purple-400" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">By Category</h2>
              <p className="text-xs sm:text-sm text-slate-400 truncate">Developer distribution</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {stats?.developers.byCategory && stats.developers.byCategory.length > 0 ? (
              stats.developers.byCategory.map((cat: any) => (
                <div key={cat.category} className="bg-slate-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center hover:bg-slate-700/50 transition-colors border border-slate-600/30 touch-manipulation">
                  <p className="text-xl sm:text-2xl font-bold text-white tabular-nums">{cat._count}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1 capitalize truncate">{cat.category.toLowerCase().replace('_', ' ')}</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 sm:col-span-3 text-center py-6 sm:py-8 text-slate-500 text-sm">
                No categories yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pro Tip - Responsive layout */}
      <div className="bg-slate-800/50 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border border-slate-700/50">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg flex-shrink-0">
            <FiCheckCircle className="text-emerald-400" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm sm:text-base">Marketplace Active</p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Your developer marketplace is live and accepting applications.</p>
          </div>
        </div>
        <Link
          to="/marketplace/developers"
          className="px-4 py-2.5 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 transition-colors text-sm font-medium text-center sm:text-left touch-manipulation min-h-[44px] flex items-center justify-center sm:w-auto w-full active:scale-95"
        >
          View Developers
        </Link>
      </div>
    </div>
  );
}

