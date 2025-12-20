/**
 * Hiring Requests Management Page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

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
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  DISPUTED: 'bg-red-100 text-red-800',
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
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hiring Requests</h1>
      </div>

      {/* Role Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setFilter({ ...filter, role: 'client' })}
          className={`px-4 py-2 rounded-lg ${filter.role === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          As Client
        </button>
        <button onClick={() => setFilter({ ...filter, role: 'developer' })}
          className={`px-4 py-2 rounded-lg ${filter.role === 'developer' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
          As Developer
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
          className="rounded-md border-gray-300">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            No hiring requests found.
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{req.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{req.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[req.status]}`}>
                  {req.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Budget: <strong>${req.budgetAmount}</strong> ({req.budgetType})</span>
                  <span>Client: {req.client.name}</span>
                  <span>Developer: {req.developer.displayName}</span>
                </div>
                <Link to={`/admin/marketplace/requests/${req.id}`} 
                  className="text-blue-600 hover:underline">View Details</Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1} className="px-4 py-2 bg-white border rounded-md disabled:opacity-50">
            Previous
          </button>
          <span className="px-4 py-2">Page {pagination.page}</span>
          <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            disabled={requests.length < pagination.limit} className="px-4 py-2 bg-white border rounded-md disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

