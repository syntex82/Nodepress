/**
 * Email Logs Page
 * View email history and delivery status
 */

import { useEffect, useState } from 'react';
import { emailApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiMail, FiCheck, FiX, FiClock, FiAlertCircle, FiEye, FiRefreshCw, FiFilter } from 'react-icons/fi';

interface EmailLog {
  id: string;
  toEmail: string;
  toName?: string;
  subject: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED';
  createdAt: string;
  sentAt?: string;
  failedAt?: string;
  errorMessage?: string;
  template?: { name: string; type: string };
  recipient?: { name: string; email: string };
}

interface Stats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  successRate: string;
}

export default function EmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', toEmail: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      const response = await emailApi.getLogs({
        page,
        limit: 20,
        status: filters.status || undefined,
        toEmail: filters.toEmail || undefined,
      });
      setLogs(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load email logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await emailApi.getLogStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return <FiCheck className="text-green-500" />;
      case 'FAILED':
      case 'BOUNCED':
        return <FiX className="text-red-500" />;
      case 'PENDING':
        return <FiClock className="text-yellow-500" />;
      default:
        return <FiAlertCircle className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SENT: 'bg-green-100 text-green-700',
      DELIVERED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      BOUNCED: 'bg-red-100 text-red-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Logs</h1>
          <p className="text-gray-600">Track sent emails and delivery status</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
            <FiFilter /> Filters
          </button>
          <button onClick={() => { fetchLogs(); fetchStats(); }} className="btn-secondary flex items-center gap-2">
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Sent" value={stats.total} color="indigo" />
          <StatCard label="Delivered" value={stats.sent + stats.delivered} color="green" />
          <StatCard label="Failed" value={stats.failed} color="red" />
          <StatCard label="Pending" value={stats.pending} color="yellow" />
          <StatCard label="Success Rate" value={`${stats.successRate}%`} color="blue" />
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }} className="input w-full">
                <option value="">All</option>
                <option value="SENT">Sent</option>
                <option value="DELIVERED">Delivered</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Recipient Email</label>
              <input type="text" value={filters.toEmail} onChange={(e) => { setFilters({ ...filters, toEmail: e.target.value }); setPage(1); }} className="input w-full" placeholder="Search by email..." />
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-600">Status</th>
              <th className="text-left p-4 font-medium text-gray-600">Recipient</th>
              <th className="text-left p-4 font-medium text-gray-600">Subject</th>
              <th className="text-left p-4 font-medium text-gray-600">Template</th>
              <th className="text-left p-4 font-medium text-gray-600">Date</th>
              <th className="text-left p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadge(log.status)}`}>
                    {getStatusIcon(log.status)} {log.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium">{log.toName || log.toEmail}</div>
                  {log.toName && <div className="text-xs text-gray-500">{log.toEmail}</div>}
                </td>
                <td className="p-4 text-sm max-w-xs truncate">{log.subject}</td>
                <td className="p-4 text-sm text-gray-600">{log.template?.name || '-'}</td>
                <td className="p-4 text-sm text-gray-600">{formatDate(log.createdAt)}</td>
                <td className="p-4">
                  <button onClick={() => setSelectedLog(log)} className="p-1 hover:text-indigo-600" title="View Details">
                    <FiEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <FiMail className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600">No email logs found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">Previous</button>
          <span className="px-4 py-2 text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary">Next</button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Email Details</h2>
              <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-gray-100 rounded"><FiX /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(selectedLog.status)}`}>
                  {selectedLog.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">To</span>
                <span>{selectedLog.toEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subject</span>
                <span className="text-right max-w-xs truncate">{selectedLog.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Template</span>
                <span>{selectedLog.template?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span>{formatDate(selectedLog.createdAt)}</span>
              </div>
              {selectedLog.sentAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sent</span>
                  <span>{formatDate(selectedLog.sentAt)}</span>
                </div>
              )}
              {selectedLog.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-700"><strong>Error:</strong> {selectedLog.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[color]}`}>
      <p className="text-sm opacity-75">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

