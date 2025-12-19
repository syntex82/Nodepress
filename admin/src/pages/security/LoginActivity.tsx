/**
 * Login Activity Page
 * Monitor all login attempts and authentication events
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { securityApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiAlertTriangle, FiFilter } from 'react-icons/fi';

export default function LoginActivity() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.type = filter;
      }
      const response = await securityApi.getEvents(params);
      setEvents(response.data.events || []);
    } catch (error) {
      toast.error('Failed to load login activity');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    if (type === 'SUCCESS_LOGIN') return <FiCheckCircle className="text-emerald-400" size={20} />;
    if (type === 'FAILED_LOGIN') return <FiXCircle className="text-red-400" size={20} />;
    if (type === 'LOCKOUT_TRIGGERED') return <FiAlertTriangle className="text-orange-400" size={20} />;
    return <FiAlertTriangle className="text-amber-400" size={20} />;
  };

  const getEventColor = (type: string) => {
    if (type === 'SUCCESS_LOGIN') return 'bg-emerald-500/10 border-emerald-500/30';
    if (type === 'FAILED_LOGIN') return 'bg-red-500/10 border-red-500/30';
    if (type === 'LOCKOUT_TRIGGERED') return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-amber-500/10 border-amber-500/30';
  };

  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <Link to=".." relative="path" className="flex items-center text-blue-400 hover:text-blue-300 mb-4">
          <FiArrowLeft className="mr-2" size={18} />
          Back to Security Center
        </Link>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Login Activity</h1>
        <p className="text-slate-400 mt-1">Monitor all authentication events and login attempts</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-4 mb-6">
        <div className="flex items-center">
          <FiFilter className="text-slate-400 mr-3" size={20} />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('SUCCESS_LOGIN')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'SUCCESS_LOGIN' ? 'bg-emerald-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
            >
              Successful
            </button>
            <button
              onClick={() => setFilter('FAILED_LOGIN')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'FAILED_LOGIN' ? 'bg-red-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
            >
              Failed
            </button>
            <button
              onClick={() => setFilter('LOCKOUT_TRIGGERED')}
              className={`px-4 py-2 rounded-lg transition-colors ${filter === 'LOCKOUT_TRIGGERED' ? 'bg-orange-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
            >
              Lockouts
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">Recent Activity ({events.length})</h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {events.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No login activity found
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className={`p-6 border-l-4 ${getEventColor(event.type)}`}>
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">{formatEventType(event.type)}</h3>
                      <span className="text-sm text-slate-400">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-400 space-y-1">
                      {event.user && (
                        <p><span className="font-medium text-slate-300">User:</span> {event.user.email}</p>
                      )}
                      {event.ip && (
                        <p><span className="font-medium text-slate-300">IP Address:</span> {event.ip}</p>
                      )}
                      {event.userAgent && (
                        <p><span className="font-medium text-slate-300">User Agent:</span> {event.userAgent}</p>
                      )}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <p><span className="font-medium text-slate-300">Details:</span> {JSON.stringify(event.metadata)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


