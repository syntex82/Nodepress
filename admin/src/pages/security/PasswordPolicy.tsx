/**
 * Password Policy Page
 * Configure password strength requirements and policies
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { securityApi } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiShield } from 'react-icons/fi';

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays: number | null;
  preventReuse: number;
  checkBreachedPasswords: boolean;
  enabled: boolean;
}

export default function PasswordPolicy() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState<PasswordPolicy>({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expirationDays: null,
    preventReuse: 5,
    checkBreachedPasswords: false,
    enabled: true,
  });

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const response = await securityApi.getPasswordPolicy();
      if (response.data) {
        setPolicy(response.data);
      }
    } catch (error) {
      toast.error('Failed to load password policy');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await securityApi.updatePasswordPolicy(policy);
      toast.success('Password policy updated successfully');
    } catch (error) {
      toast.error('Failed to update password policy');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to=".." relative="path" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
          <FiArrowLeft /> Back to Security
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Password Policy</h1>
            <p className="text-slate-400 mt-2">Configure password strength requirements and security policies</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-xl hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Policy'}
          </button>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6 space-y-6">
        {/* Enable/Disable Policy */}
        <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
          <div>
            <h3 className="font-semibold text-white">Enable Password Policy</h3>
            <p className="text-sm text-slate-400">Enforce password requirements for all users</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={policy.enabled}
              onChange={(e) => setPolicy({ ...policy, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Minimum Length */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Minimum Password Length
          </label>
          <input
            type="number"
            min="4"
            max="128"
            value={policy.minLength}
            onChange={(e) => setPolicy({ ...policy, minLength: parseInt(e.target.value) || 8 })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          />
          <p className="text-sm text-slate-500 mt-1">Recommended: 8 or more characters</p>
        </div>

        {/* Character Requirements */}
        <div>
          <h3 className="font-semibold text-white mb-3">Character Requirements</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.requireUppercase}
                onChange={(e) => setPolicy({ ...policy, requireUppercase: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500/50"
              />
              <span className="ml-2 text-slate-300">Require at least one uppercase letter (A-Z)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.requireLowercase}
                onChange={(e) => setPolicy({ ...policy, requireLowercase: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500/50"
              />
              <span className="ml-2 text-slate-300">Require at least one lowercase letter (a-z)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.requireNumbers}
                onChange={(e) => setPolicy({ ...policy, requireNumbers: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500/50"
              />
              <span className="ml-2 text-slate-300">Require at least one number (0-9)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={policy.requireSpecialChars}
                onChange={(e) => setPolicy({ ...policy, requireSpecialChars: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500/50"
              />
              <span className="ml-2 text-slate-300">Require at least one special character (!@#$%^&*)</span>
            </label>
          </div>
        </div>

        {/* Password Expiration */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Password Expiration (days)
          </label>
          <input
            type="number"
            min="0"
            value={policy.expirationDays || ''}
            onChange={(e) => setPolicy({ ...policy, expirationDays: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Never expires"
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          />
          <p className="text-sm text-slate-500 mt-1">Leave empty for no expiration. Recommended: 90 days</p>
        </div>

        {/* Password Reuse Prevention */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Prevent Password Reuse
          </label>
          <input
            type="number"
            min="0"
            max="24"
            value={policy.preventReuse}
            onChange={(e) => setPolicy({ ...policy, preventReuse: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          />
          <p className="text-sm text-slate-500 mt-1">
            Number of previous passwords to check. Set to 0 to disable. Recommended: 5
          </p>
        </div>

        {/* Breached Password Check */}
        <div className="flex items-start p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
          <input
            type="checkbox"
            checked={policy.checkBreachedPasswords}
            onChange={(e) => setPolicy({ ...policy, checkBreachedPasswords: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500/50 mt-1"
          />
          <div className="ml-3">
            <h3 className="font-semibold text-amber-400">Check Against Breached Passwords</h3>
            <p className="text-sm text-slate-400 mt-1">
              Verify passwords against the Have I Been Pwned database to prevent use of compromised passwords.
              This feature makes an external API call.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start">
            <FiShield className="text-blue-400 mt-1 mr-3" size={20} />
            <div>
              <h3 className="font-semibold text-blue-400">Password Policy Best Practices</h3>
              <ul className="text-sm text-slate-400 mt-2 space-y-1 list-disc list-inside">
                <li>Minimum 8 characters (12+ recommended for high security)</li>
                <li>Require a mix of uppercase, lowercase, numbers, and special characters</li>
                <li>Expire passwords every 90 days for sensitive systems</li>
                <li>Prevent reuse of last 5-10 passwords</li>
                <li>Enable breached password checking for maximum security</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


