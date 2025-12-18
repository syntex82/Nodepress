/**
 * Security Dashboard - Overview Page
 * Main security center with metrics and quick actions
 * With comprehensive tooltips for user guidance
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { securityApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiLock,
  FiFileText,
  FiRefreshCw,
  FiEye,
  FiKey,
  FiClock,
  FiMonitor,
  FiHelpCircle,
} from 'react-icons/fi';
import Tooltip from '../../components/Tooltip';

// Tooltip content for security dashboard
const SECURITY_TOOLTIPS = {
  runCheck: { title: 'Run Security Check', content: 'Scan your site for security vulnerabilities and configuration issues.' },
  loginActivity: { title: 'Login Activity', content: 'View recent login attempts and detect suspicious activity.' },
  blockedIPs: { title: 'Blocked IPs', content: 'Manage IP addresses that are blocked from accessing your site.' },
  rateLimiting: { title: 'Rate Limiting', content: 'Configure limits on API requests to prevent abuse.' },
  sessions: { title: 'Session Management', content: 'View and manage active user sessions.' },
  passwordPolicy: { title: 'Password Policy', content: 'Set requirements for user passwords.' },
  fileIntegrity: { title: 'File Integrity', content: 'Monitor core files for unauthorized changes.' },
  auditLog: { title: 'Audit Log', content: 'View a log of all security-related events.' },
  twoFactor: { title: 'Two-Factor Auth', content: 'Configure two-factor authentication for enhanced security.' },
};

export default function SecurityDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [runningCheck, setRunningCheck] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await securityApi.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      toast.error('Failed to load security dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRunSecurityCheck = async () => {
    setRunningCheck(true);
    try {
      const response = await securityApi.runSecurityCheck();
      setDashboard({ ...dashboard, securityStatus: response.data });
      toast.success('Security check completed');
    } catch (error) {
      toast.error('Failed to run security check');
    } finally {
      setRunningCheck(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-400 bg-emerald-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/20';
      case 'high': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <FiCheckCircle className="text-emerald-400" size={20} />;
      case 'warning': return <FiAlertTriangle className="text-amber-400" size={20} />;
      case 'fail': return <FiXCircle className="text-red-400" size={20} />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Security Center</h1>
            <p className="text-slate-400 mt-1">Monitor and manage your site's security</p>
          </div>
          <Tooltip title="About Security Center" content="Your central hub for monitoring security threats, managing access controls, and protecting your site from attacks." position="right" variant="help">
            <button className="p-1 text-slate-400 hover:text-blue-400">
              <FiHelpCircle size={18} />
            </button>
          </Tooltip>
        </div>
        <Tooltip title={SECURITY_TOOLTIPS.runCheck.title} content={SECURITY_TOOLTIPS.runCheck.content} position="left">
          <button
            onClick={handleRunSecurityCheck}
            disabled={runningCheck}
            className="flex items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={`mr-2 ${runningCheck ? 'animate-spin' : ''}`} size={18} />
            Run Security Check
          </button>
        </Tooltip>
      </div>

      {/* Risk Level Badge */}
      {dashboard?.securityStatus && (
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-xl font-semibold ${getRiskColor(dashboard.securityStatus.riskLevel)}`}>
            <FiShield className="mr-2" size={20} />
            Risk Level: {dashboard.securityStatus.riskLevel.toUpperCase()}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Failed Logins (24h)</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboard?.failedLogins24h || 0}</p>
            </div>
            <div className="bg-red-500/20 text-red-400 p-3 rounded-lg">
              <FiXCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Locked Accounts</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboard?.lockedAccounts || 0}</p>
            </div>
            <div className="bg-amber-500/20 text-amber-400 p-3 rounded-lg">
              <FiLock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Blocked IPs</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboard?.blockedIps || 0}</p>
            </div>
            <div className="bg-purple-500/20 text-purple-400 p-3 rounded-lg">
              <FiShield size={24} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Failed Logins (7d)</p>
              <p className="text-3xl font-bold text-white mt-2">{dashboard?.failedLogins7d || 0}</p>
            </div>
            <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg">
              <FiActivity size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Security Checks */}
      {dashboard?.securityStatus?.checks && (
        <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 mb-8">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white">Security Checks</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboard.securityStatus.checks.map((check: any, index: number) => (
                <div key={index} className="flex items-start p-4 border border-slate-700/50 rounded-xl bg-slate-900/30">
                  <div className="mr-4 mt-1">
                    {getStatusIcon(check.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{check.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{check.message}</p>
                    {check.details && (
                      <p className="text-xs text-slate-500 mt-2">{check.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="activity" className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 hover:shadow-xl transition-all group">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <FiActivity size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Login Activity</h3>
          </div>
          <p className="text-sm text-slate-400">Monitor all login attempts and authentication events</p>
        </Link>

        <Link to="blocked-ips" className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 hover:shadow-xl transition-all group">
          <div className="flex items-center mb-4">
            <div className="bg-purple-500/20 text-purple-400 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <FiShield size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">IP Blocking</h3>
          </div>
          <p className="text-sm text-slate-400">Block malicious IPs and manage access control</p>
        </Link>

        <Link to="rate-limiting" className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 hover:shadow-xl transition-all group">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <FiClock size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Rate Limiting</h3>
          </div>
          <p className="text-sm text-slate-400">Configure API rate limits and DDoS protection</p>
        </Link>

        <Link to="sessions" className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 hover:shadow-xl transition-all group">
          <div className="flex items-center mb-4">
            <div className="bg-teal-500/20 text-teal-400 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <FiMonitor size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Session Management</h3>
          </div>
          <p className="text-sm text-slate-400">View and manage active user sessions</p>
        </Link>

        <Link to="password-policy" className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 hover:shadow-xl transition-all group">
          <div className="flex items-center mb-4">
            <div className="bg-purple-500/20 text-purple-400 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <FiKey size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Password Policy</h3>
          </div>
          <p className="text-sm text-slate-400">Configure password strength requirements</p>
        </Link>

        <Link to="integrity" className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 hover:shadow-xl transition-all group">
          <div className="flex items-center mb-4">
            <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <FiFileText size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">File Integrity</h3>
          </div>
          <p className="text-sm text-slate-400">Detect unauthorized file modifications</p>
        </Link>

        <Link to="audit-log" className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 hover:shadow-xl transition-all group">
          <div className="flex items-center mb-4">
            <div className="bg-amber-500/20 text-amber-400 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <FiEye size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Audit Log</h3>
          </div>
          <p className="text-sm text-slate-400">Complete security event history and forensics</p>
        </Link>

        <Link to="2fa" className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 hover:shadow-xl transition-all group">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-500/20 text-indigo-400 p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform">
              <FiKey size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white">Two-Factor Auth</h3>
          </div>
          <p className="text-sm text-slate-400">Enable 2FA for enhanced account security</p>
        </Link>

        <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-xl p-6 border-2 border-dashed border-slate-700/50">
          <div className="flex items-center mb-4">
            <div className="bg-slate-700/50 text-slate-500 p-3 rounded-lg mr-4">
              <FiShield size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-500">More Tools</h3>
          </div>
          <p className="text-sm text-slate-500">Additional security features coming soon</p>
        </div>
      </div>
    </div>
  );
}

