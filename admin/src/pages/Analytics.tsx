/**
 * Analytics Dashboard
 * Comprehensive analytics with charts and statistics
 * With comprehensive tooltips for user guidance
 */

import { useEffect, useState } from 'react';
import { analyticsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiUsers, FiEye, FiClock, FiTrendingUp, FiMonitor, FiSmartphone, FiTablet, FiRefreshCw, FiHelpCircle } from 'react-icons/fi';
import Tooltip from '../components/Tooltip';

// Tooltip content for analytics page
const ANALYTICS_TOOLTIPS = {
  pageViews: { title: 'Page Views', content: 'Total number of pages viewed by all visitors.' },
  uniqueVisitors: { title: 'Unique Visitors', content: 'Number of distinct visitors to your site.' },
  sessions: { title: 'Sessions', content: 'Total number of browsing sessions.' },
  avgDuration: { title: 'Avg. Duration', content: 'Average time visitors spend on your site.' },
  bounceRate: { title: 'Bounce Rate', content: 'Percentage of visitors who leave after viewing only one page.' },
  topPages: { title: 'Top Pages', content: 'Most visited pages on your site.' },
  devices: { title: 'Devices', content: 'Breakdown of visitors by device type.' },
  realtime: { title: 'Real-time', content: 'Currently active visitors on your site.' },
  refresh: { title: 'Refresh Data', content: 'Reload analytics data from the server.' },
  period: { title: 'Time Period', content: 'Select the date range for analytics data.' },
};

interface DashboardStats {
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  avgDuration: number;
  bounceRate: number;
}

interface PageViewData {
  date: string;
  views: number;
}

interface TopPage {
  path: string;
  views: number;
  avgDuration: number;
}

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pageViews, setPageViews] = useState<PageViewData[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [realtime, setRealtime] = useState<{ activeVisitors: number; recentPages: any[] } | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [dashRes, viewsRes, pagesRes, devicesRes, realtimeRes] = await Promise.all([
        analyticsApi.getDashboard(period),
        analyticsApi.getPageViews(period),
        analyticsApi.getTopPages(period, 10),
        analyticsApi.getDevices(period),
        analyticsApi.getRealtime(),
      ]);
      setStats(dashRes.data || {});
      setPageViews(viewsRes.data || []);
      setTopPages(pagesRes.data || []);
      setDevices(devicesRes.data || []);
      setRealtime(realtimeRes.data || { activeVisitors: 0, recentPages: [] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load analytics data');
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [period]);

  // Auto-refresh realtime every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await analyticsApi.getRealtime();
        setRealtime(res.data);
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile': return <FiSmartphone className="text-blue-400" />;
      case 'tablet': return <FiTablet className="text-emerald-400" />;
      default: return <FiMonitor className="text-slate-400" />;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Analytics Dashboard</h1>
          <Tooltip title="About Analytics" content="Track your site's performance with detailed visitor statistics, page views, and device breakdowns." position="right" variant="help">
            <button className="p-1 text-slate-400 hover:text-blue-400">
              <FiHelpCircle size={18} />
            </button>
          </Tooltip>
        </div>
        <div className="flex items-center gap-4">
          <Tooltip title={ANALYTICS_TOOLTIPS.period.title} content={ANALYTICS_TOOLTIPS.period.content} position="bottom">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </Tooltip>
          <Tooltip title={ANALYTICS_TOOLTIPS.refresh.title} content={ANALYTICS_TOOLTIPS.refresh.content} position="left">
            <button onClick={fetchAnalytics} className="p-2 border border-slate-700/50 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all">
              <FiRefreshCw size={20} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Real-time indicator */}
      {realtime && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-emerald-400 font-medium">
            {realtime.activeVisitors} active visitor{realtime.activeVisitors !== 1 ? 's' : ''} right now
          </span>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<FiEye />} label="Page Views" value={stats.pageViews.toLocaleString()} color="blue" />
          <StatCard icon={<FiUsers />} label="Unique Visitors" value={stats.uniqueVisitors.toLocaleString()} color="green" />
          <StatCard icon={<FiTrendingUp />} label="Sessions" value={stats.sessions.toLocaleString()} color="purple" />
          <StatCard icon={<FiClock />} label="Avg. Duration" value={formatDuration(stats.avgDuration)} color="orange" />
          <StatCard icon={<FiTrendingUp />} label="Bounce Rate" value={`${stats.bounceRate}%`} color="red" />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Page Views Chart */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Page Views Over Time</h3>
          <div className="h-48 flex items-end gap-1">
            {pageViews.length === 0 ? (
              <p className="text-slate-400 text-center w-full">No data available</p>
            ) : (
              pageViews.map((pv, i) => {
                const maxViews = Math.max(...pageViews.map(p => p.views), 1);
                const height = (pv.views / maxViews) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 rounded-t transition-colors cursor-pointer"
                         style={{ height: `${height}%`, minHeight: '4px' }} />
                    <div className="hidden group-hover:block absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-700/50">
                      {pv.date}: {pv.views} views
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {pageViews.length > 0 && (
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>{pageViews[0]?.date}</span>
              <span>{pageViews[pageViews.length - 1]?.date}</span>
            </div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Devices</h3>
          {devices.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {devices.map((d) => (
                <div key={d.device} className="flex items-center gap-3">
                  <div className="text-2xl">{getDeviceIcon(d.device)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-white capitalize">{d.device}</span>
                      <span className="text-slate-400">{d.count} ({d.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${d.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-white">Top Pages</h3>
        </div>
        {topPages.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No data available</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Page</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Avg. Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {topPages.map((page, i) => (
                <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-white">{page.path}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400">{page.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-400">{formatDuration(page.avgDuration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Activity */}
      {realtime && realtime.recentPages.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <h3 className="text-lg font-semibold text-white">Live Activity</h3>
          </div>
          <div className="divide-y divide-slate-700/50">
            {realtime.recentPages.map((page, i) => (
              <div key={i} className="px-6 py-3 flex justify-between items-center hover:bg-slate-700/30 transition-colors">
                <span className="text-white">{page.path}</span>
                <span className="text-sm text-slate-400">
                  {new Date(page.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-emerald-500/20 text-emerald-400',
    purple: 'bg-purple-500/20 text-purple-400',
    orange: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
  };
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

