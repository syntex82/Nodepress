/**
 * Marketplace Dashboard
 * Overview and statistics for the developer marketplace
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

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

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [devStats, projectStats, financialStats] = await Promise.all([
        api.get('/api/marketplace/developers/admin/statistics'),
        api.get('/api/marketplace/projects/admin/statistics'),
        api.get('/api/marketplace/payments/admin/statistics'),
      ]);
      setStats({
        developers: devStats.data,
        projects: projectStats.data,
        financial: financialStats.data,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Error loading statistics</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Marketplace Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm mb-1">Total Developers</h3>
          <p className="text-3xl font-bold">{stats.developers.total}</p>
          <p className="text-sm text-yellow-600 mt-1">{stats.developers.pending} pending approval</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm mb-1">Active Projects</h3>
          <p className="text-3xl font-bold">{stats.projects.active}</p>
          <p className="text-sm text-green-600 mt-1">{stats.projects.completed} completed</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm mb-1">Total Escrow</h3>
          <p className="text-3xl font-bold text-green-600">${Number(stats.financial.totalEscrow).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Held in escrow</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-gray-500 text-sm mb-1">Platform Fees</h3>
          <p className="text-3xl font-bold text-blue-600">${Number(stats.financial.totalFees).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Total earned</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/admin/marketplace/developers" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
          <h3 className="font-semibold text-lg mb-2">Manage Developers</h3>
          <p className="text-gray-500 text-sm">Review applications, manage profiles</p>
          {stats.developers.pending > 0 && (
            <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              {stats.developers.pending} pending
            </span>
          )}
        </Link>
        <Link to="/admin/marketplace/projects" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
          <h3 className="font-semibold text-lg mb-2">View Projects</h3>
          <p className="text-gray-500 text-sm">Monitor active projects and disputes</p>
        </Link>
        <Link to="/admin/marketplace/transactions" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
          <h3 className="font-semibold text-lg mb-2">Transactions</h3>
          <p className="text-gray-500 text-sm">View payments and process payouts</p>
          {stats.financial.pendingPayouts.count > 0 && (
            <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {stats.financial.pendingPayouts.count} pending payouts
            </span>
          )}
        </Link>
      </div>

      {/* Top Rated Developers */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Top Rated Developers</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.developers.topRated.map((dev: any) => (
            <div key={dev.id} className="text-center">
              <img src={dev.user?.avatar || '/images/default-avatar.png'} alt="" 
                className="w-16 h-16 rounded-full mx-auto mb-2" />
              <p className="font-medium text-sm">{dev.displayName}</p>
              <p className="text-yellow-500 text-sm">⭐ {dev.rating}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Developers by Category */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">Developers by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.developers.byCategory.map((cat: any) => (
            <div key={cat.category} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{cat._count}</p>
              <p className="text-sm text-gray-500">{cat.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

