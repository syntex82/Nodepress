/**
 * LMS Certificate Page
 * Displays and allows downloading course completion certificate
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lmsApi, Certificate as CertificateType } from '../../services/api';
import { FiDownload, FiShare2, FiCheck, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Certificate() {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState<CertificateType | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadOrGenerateCertificate();
  }, [courseId]);

  const loadOrGenerateCertificate = async () => {
    if (!courseId) return;
    
    try {
      setGenerating(true);
      // Request certificate (will create if not exists)
      const { data } = await lmsApi.requestCertificate(courseId);
      setCertificate(data);
    } catch (error: any) {
      console.error('Failed to get certificate:', error);
      const message = error.response?.data?.message || 'Failed to generate certificate';
      toast.error(message);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleShare = () => {
    if (!certificate) return;
    const verifyUrl = `${window.location.origin}/lms/verify/${certificate.verificationHash}`;
    navigator.clipboard.writeText(verifyUrl);
    toast.success('Verification link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">{generating ? 'Generating your certificate...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-xl md:text-2xl font-bold text-white mb-4">Certificate Not Available</h1>
        <p className="text-slate-400 mb-6">
          You need to complete the course to receive a certificate.
        </p>
        <Link to={`/lms/learn/${courseId}`} className="text-blue-400 hover:text-blue-300 transition-colors">
          ← Back to Course
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Link to={`/lms/learn/${courseId}`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 mb-6 transition-colors text-sm md:text-base">
        <FiArrowLeft /> Back to Course
      </Link>

      {/* Certificate Display */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-4 md:border-8 border-double border-yellow-500/50 rounded-xl md:rounded-2xl p-4 md:p-8 shadow-2xl mb-6">
        <div className="text-center">
          <div className="text-yellow-400 text-4xl md:text-5xl mb-4">🏆</div>
          <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-2">
            Certificate of Completion
          </h1>
          <p className="text-slate-400 mb-4 md:mb-6 text-sm md:text-base">This certifies that</p>

          <p className="text-lg md:text-2xl font-bold text-blue-400 mb-4 md:mb-6 break-words">
            {certificate.user?.name || 'Student'}
          </p>

          <p className="text-slate-400 mb-2 text-sm md:text-base">has successfully completed</p>

          <p className="text-base md:text-xl font-semibold text-white mb-4 md:mb-6 break-words">
            {certificate.course?.title || 'Course'}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-8 text-sm text-slate-400 mb-4">
            <div>
              <p className="font-semibold text-slate-300">Date Issued</p>
              <p>{new Date(certificate.issuedAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-300">Certificate ID</p>
              <p className="font-mono">{certificate.certificateNumber}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-green-400">
            <FiCheck /> Verified
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
        {certificate.pdfUrl && (
          <a
            href={certificate.pdfUrl}
            download
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-colors shadow-lg shadow-blue-500/20 text-sm md:text-base"
          >
            <FiDownload /> Download PDF
          </a>
        )}

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-slate-800/50 border border-slate-700/50 text-slate-300 px-4 md:px-6 py-2.5 md:py-3 rounded-xl hover:bg-slate-700/50 transition-colors text-sm md:text-base"
        >
          <FiShare2 /> Share Verification Link
        </button>
      </div>

      <p className="text-center text-xs md:text-sm text-slate-500 mt-6 break-all px-2">
        Verify this certificate at: {window.location.origin}/lms/verify/{certificate.verificationHash}
      </p>
    </div>
  );
}

