import React, { useState } from 'react';
import { FiDownload, FiUpload, FiX } from 'react-icons/fi';
import { customizationExportApi } from '../../services/api';
import toast from 'react-hot-toast';

interface ExportImportPanelProps {
  onClose: () => void;
}

export const ExportImportPanel: React.FC<ExportImportPanelProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExportPages = async () => {
    try {
      setLoading(true);
      const response = await customizationExportApi.exportPages();
      downloadJSON(response.data, 'page-customizations.json');
      toast.success('Page customizations exported successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export page customizations');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPosts = async () => {
    try {
      setLoading(true);
      const response = await customizationExportApi.exportPosts();
      downloadJSON(response.data, 'post-customizations.json');
      toast.success('Post customizations exported successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export post customizations');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setLoading(true);
      const response = await customizationExportApi.exportAll();
      downloadJSON(response.data, 'all-customizations.json');
      toast.success('All customizations exported successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to export customizations');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      const text = await importFile.text();
      const data = JSON.parse(text);
      const response = await customizationExportApi.import(data);
      toast.success(`Successfully imported ${response.data.imported} customizations`);
      setImportFile(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to import customizations');
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = (data: any, filename: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Export & Import</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-1 rounded transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Export Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Customizations</h3>
            <div className="space-y-2">
              <button
                onClick={handleExportPages}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded transition disabled:opacity-50"
              >
                <FiDownload size={18} />
                Export Pages
              </button>
              <button
                onClick={handleExportPosts}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2 px-4 rounded transition disabled:opacity-50"
              >
                <FiDownload size={18} />
                Export Posts
              </button>
              <button
                onClick={handleExportAll}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded transition disabled:opacity-50"
              >
                <FiDownload size={18} />
                Export All
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Import Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Import Customizations</h3>
            <div className="space-y-2">
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </label>
              {importFile && (
                <p className="text-sm text-gray-600">Selected: {importFile.name}</p>
              )}
              <button
                onClick={handleImport}
                disabled={loading || !importFile}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50"
              >
                <FiUpload size={18} />
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

