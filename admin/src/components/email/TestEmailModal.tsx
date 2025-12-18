/**
 * Test Email Modal Component
 * Send test emails with sample data
 */

import { useState } from 'react';
import { FiX, FiMail, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { emailApi } from '../../services/api';

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  templateName?: string;
}

export default function TestEmailModal({
  isOpen,
  onClose,
  templateId,
  templateName,
}: TestEmailModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      await emailApi.sendTestEmail({
        templateId,
        to: email,
        variables: {
          user: { name: 'Test User', firstName: 'Test', email },
          site: { name: 'My Website', url: 'https://example.com' },
          year: new Date().getFullYear(),
        },
      });
      toast.success(`Test email sent to ${email}`);
      setEmail('');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <FiMail size={24} />
            <div>
              <h2 className="text-xl font-bold">Send Test Email</h2>
              <p className="text-sm text-indigo-100">{templateName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSendTest} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 We'll send a test email with sample data to this address
            </p>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Note:</strong> Test emails are marked with [TEST] in the subject line
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiSend size={18} />
              {loading ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

