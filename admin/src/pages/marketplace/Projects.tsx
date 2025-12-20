/**
 * Projects Management Page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

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
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-blue-100 text-blue-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
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
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const endpoint = filter.role === 'client' 
        ? `/api/marketplace/projects/my/client?${params}`
        : `/api/marketplace/projects/my/developer?${params}`;
      
      const { data } = await api.get(endpoint);
      setProjects(data.projects || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Projects</h1>
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
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg p-8 text-center text-gray-500">
            No projects found.
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{project.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>

                {/* Budget Info */}
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Budget:</span>
                    <span className="font-medium ml-1">${project.totalBudget}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">In Escrow:</span>
                    <span className="font-medium ml-1 text-green-600">${project.amountInEscrow}</span>
                  </div>
                </div>

                <Link to={`/admin/marketplace/projects/${project.id}`} 
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  View Project
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

