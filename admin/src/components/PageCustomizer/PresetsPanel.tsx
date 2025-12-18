import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiTrash2 } from 'react-icons/fi';
import { customizationPresetsApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Preset {
  id: string;
  name: string;
  description: string;
  category: 'page' | 'post' | 'both';
  settings: any;
}

interface PresetsPanelProps {
  category: 'page' | 'post';
  onSelectPreset: (preset: Preset) => void;
  onClose: () => void;
}

export const PresetsPanel: React.FC<PresetsPanelProps> = ({ category, onSelectPreset, onClose }) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPresets();
  }, [category]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      const response = await customizationPresetsApi.getPresetsByCategory(category);
      setPresets(response.data);
    } catch (error: any) {
      toast.error('Failed to load presets');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: Preset) => {
    onSelectPreset(preset);
    toast.success(`Applied preset: ${preset.name}`);
    onClose();
  };

  const handleDeletePreset = async (id: string) => {
    if (!id.startsWith('custom-')) {
      toast.error('Cannot delete built-in presets');
      return;
    }

    try {
      await customizationPresetsApi.removePreset(id);
      setPresets(presets.filter((p) => p.id !== id));
      toast.success('Preset deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete preset');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between sticky top-0">
          <h2 className="text-xl font-bold text-white">Customization Presets</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-1 rounded transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading presets...</p>
            </div>
          ) : presets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No presets available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                      <p className="text-sm text-gray-600">{preset.description}</p>
                    </div>
                    {preset.id.startsWith('custom-') && (
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Preset Settings Preview */}
                  <div className="bg-gray-50 rounded p-3 mb-3 text-sm">
                    <div className="space-y-1">
                      {preset.settings.layout && (
                        <p className="text-gray-700">
                          <span className="font-medium">Layout:</span> {preset.settings.layout}
                        </p>
                      )}
                      {preset.settings.backgroundColor && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Background:</span>
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: preset.settings.backgroundColor }}
                          />
                          <span className="text-gray-600">{preset.settings.backgroundColor}</span>
                        </div>
                      )}
                      {preset.settings.showSidebar !== undefined && (
                        <p className="text-gray-700">
                          <span className="font-medium">Sidebar:</span>{' '}
                          {preset.settings.showSidebar ? 'Visible' : 'Hidden'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
                  >
                    <FiCheck size={18} />
                    Apply Preset
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

