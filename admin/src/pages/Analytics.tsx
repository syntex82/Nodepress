/**
 * Analytics Dashboard
 * Comprehensive analytics with charts and statistics
 */

import { useEffect, useState } from 'react';
import { analyticsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiUsers, FiEye, FiClock, FiTrendingUp, FiMonitor, FiSmartphone, FiTablet, FiRefreshCw } from 'react-icons/fi';

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
      case 'mobile': return <FiSmartphone className="text-blue-500" />;
      case 'tablet': return <FiTablet className="text-green-500" />;
      default: return <FiMonitor className="text-gray-500" />;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button onClick={fetchAnalytics} className="p-2 border rounded-md hover:bg-gray-50">
            <FiRefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Real-time indicator */}
      {realtime && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-700 font-medium">
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Page Views Over Time</h3>
          <div className="h-48 flex items-end gap-1">
            {pageViews.length === 0 ? (
              <p className="text-gray-500 text-center w-full">No data available</p>
            ) : (
              pageViews.map((pv, i) => {
                const maxViews = Math.max(...pageViews.map(p => p.views), 1);
                const height = (pv.views / maxViews) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-colors cursor-pointer"
                         style={{ height: `${height}%`, minHeight: '4px' }} />
                    <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {pv.date}: {pv.views} views
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {pageViews.length > 0 && (
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{pageViews[0]?.date}</span>
              <span>{pageViews[pageViews.length - 1]?.date}</span>
            </div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Devices</h3>
          {devices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {devices.map((d) => (
                <div key={d.device} className="flex items-center gap-3">
                  <div className="text-2xl">{getDeviceIcon(d.device)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium capitalize">{d.device}</span>
                      <span className="text-gray-500">{d.count} ({d.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${d.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Top Pages</h3>
        </div>
        {topPages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg. Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topPages.map((page, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{page.path}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">{page.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{formatDuration(page.avgDuration)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Activity */}
      {realtime && realtime.recentPages.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="text-lg font-semibold">Live Activity</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {realtime.recentPages.map((page, i) => (
              <div key={i} className="px-6 py-3 flex justify-between items-center">
                <span className="text-gray-900">{page.path}</span>
                <span className="text-sm text-gray-500">
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
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

