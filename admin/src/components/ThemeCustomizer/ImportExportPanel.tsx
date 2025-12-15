/**
 * Import/Export Settings Component
 * Save and load customization presets as JSON
 */

import { useRef, useState } from 'react';
import { FiDownload, FiUpload, FiCopy, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { CustomThemeSettings } from '../../services/api';
import toast from 'react-hot-toast';

interface ImportExportPanelProps {
  settings: CustomThemeSettings;
  customCSS: string;
  themeName: string;
  onImport: (settings: CustomThemeSettings, customCSS?: string) => void;
}

interface ExportData {
  version: string;
  exportedAt: string;
  themeName: string;
  settings: CustomThemeSettings;
  customCSS?: string;
}

export default function ImportExportPanel({ settings, customCSS, themeName, onImport }: ImportExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const exportSettings = (): ExportData => {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      themeName: themeName || 'Custom Theme',
      settings,
      customCSS: customCSS || undefined,
    };
  };

  const handleExportJSON = () => {
    const data = exportSettings();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const handleCopyJSON = () => {
    const data = exportSettings();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Settings copied to clipboard');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ExportData;
        
        // Validate the imported data
        if (!data.settings || !data.settings.colors || !data.settings.typography) {
          throw new Error('Invalid theme settings file');
        }

        onImport(data.settings, data.customCSS);
        toast.success(`Imported settings from "${data.themeName}"`);
      } catch (error: any) {
        setImportError(error.message || 'Failed to parse settings file');
        toast.error('Failed to import settings');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasteImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text) as ExportData;
      
      if (!data.settings || !data.settings.colors || !data.settings.typography) {
        throw new Error('Invalid theme settings in clipboard');
      }

      onImport(data.settings, data.customCSS);
      toast.success(`Imported settings from clipboard`);
    } catch (error: any) {
      setImportError(error.message || 'Failed to parse clipboard content');
      toast.error('Failed to import from clipboard');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Import / Export Settings</h3>

      {/* Export Section */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400">Export your current theme settings to reuse later or share with others.</p>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FiDownload size={16} />
            Download JSON
          </button>
          <button
            onClick={handleCopyJSON}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <FiCheck size={16} className="text-green-400" /> : <FiCopy size={16} />}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="space-y-2 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">Import theme settings from a JSON file or clipboard.</p>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FiUpload size={16} />
            Import File
          </button>
          <button
            onClick={handlePasteImport}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            title="Paste from clipboard"
          >
            <FiUpload size={16} />
          </button>
        </div>
        {importError && (
          <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
            <FiAlertCircle className="text-red-400" size={14} />
            <span className="text-xs text-red-400">{importError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

