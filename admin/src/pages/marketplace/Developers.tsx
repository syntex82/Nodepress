/**
 * Developers Management Page
 * Admin page for managing developer profiles
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Developer {
  id: string;
  displayName: string;
  slug: string;
  headline: string;
  category: string;
  status: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  projectsCompleted: number;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
  user: { name: string; email: string; avatar?: string };
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function Developers() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    fetchDevelopers();
  }, [filter, pagination.page]);

  const fetchDevelopers = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.category) params.append('category', filter.category);
      if (filter.search) params.append('search', filter.search);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const { data } = await api.get(`/api/marketplace/developers/admin/all?${params}`);
      setDevelopers(data.developers || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string, reason?: string) => {
    try {
      await api.patch(`/api/marketplace/developers/${id}/${action}`, { reason });
      fetchDevelopers();
    } catch (error) {
      console.error(`Error ${action} developer:`, error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Developer Management</h1>
        <Link to="/admin/marketplace/statistics" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          View Statistics
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
            className="rounded-md border-gray-300">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}
            className="rounded-md border-gray-300">
            <option value="">All Categories</option>
            <option value="FRONTEND">Frontend</option>
            <option value="BACKEND">Backend</option>
            <option value="FULLSTACK">Full-Stack</option>
            <option value="MOBILE">Mobile</option>
            <option value="DEVOPS">DevOps</option>
          </select>
          <input type="text" placeholder="Search..." value={filter.search}
            onChange={e => setFilter({ ...filter, search: e.target.value })}
            className="rounded-md border-gray-300" />
          <button onClick={() => setFilter({ status: '', category: '', search: '' })}
            className="text-gray-600 hover:text-gray-800">Clear Filters</button>
        </div>
      </div>

      {/* Developers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Developer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {developers.map(dev => (
              <tr key={dev.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={dev.user.avatar || '/images/default-avatar.png'} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium">{dev.displayName}</p>
                      <p className="text-sm text-gray-500">{dev.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">{dev.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[dev.status]}`}>{dev.status}</span>
                </td>
                <td className="px-6 py-4 text-sm">⭐ {dev.rating} ({dev.reviewCount})</td>
                <td className="px-6 py-4 text-sm font-medium">${dev.hourlyRate}/hr</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {dev.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleAction(dev.id, 'approve')} className="text-green-600 hover:underline text-sm">Approve</button>
                        <button onClick={() => handleAction(dev.id, 'reject', 'Does not meet requirements')} className="text-red-600 hover:underline text-sm">Reject</button>
                      </>
                    )}
                    {dev.status === 'ACTIVE' && (
                      <button onClick={() => handleAction(dev.id, 'suspend', 'Policy violation')} className="text-red-600 hover:underline text-sm">Suspend</button>
                    )}
                    {dev.status === 'SUSPENDED' && (
                      <button onClick={() => handleAction(dev.id, 'reactivate')} className="text-green-600 hover:underline text-sm">Reactivate</button>
                    )}
                    <Link to={`/admin/marketplace/developers/${dev.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

