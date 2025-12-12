/**
 * Settings Page
 * Manage site settings, themes, and plugins
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { settingsApi, themesApi, pluginsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import ThemeRequirements from '../components/ThemeRequirements';
import ThemeShop from '../components/ThemeShop';
import toast from 'react-hot-toast';
import { FiCheck, FiRefreshCw, FiUpload, FiTrash2, FiInfo, FiShoppingBag, FiTool, FiPenTool } from 'react-icons/fi';

export default function Settings() {
  const navigate = useNavigate();
  const [themes, setThemes] = useState<any[]>([]);
  const [plugins, setPlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'themes' | 'plugins'>('general');
  const [showRequirements, setShowRequirements] = useState(false);
  const [showThemeShop, setShowThemeShop] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; themeId: string | null; themeName: string | null }>({
    isOpen: false,
    themeId: null,
    themeName: null,
  });
  const [deletePluginConfirm, setDeletePluginConfirm] = useState<{ isOpen: boolean; pluginId: string | null; pluginName: string | null }>({
    isOpen: false,
    pluginId: null,
    pluginName: null,
  });
  const [siteSettings, setSiteSettings] = useState({
    siteName: '',
    siteDescription: '',
  });
  const [showPluginDetails, setShowPluginDetails] = useState<string | null>(null);
  const [pluginUploading, setPluginUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pluginFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [themesRes, pluginsRes, settingsRes] = await Promise.all([
        themesApi.getAll(),
        pluginsApi.getAll(),
        settingsApi.getAll(),
      ]);
      setThemes(themesRes.data);
      setPlugins(pluginsRes.data);

      // Parse settings
      const settings = settingsRes.data;
      const siteName = settings.find((s: any) => s.key === 'site_name');
      const siteDesc = settings.find((s: any) => s.key === 'site_description');
      setSiteSettings({
        siteName: siteName?.value || '',
        siteDescription: siteDesc?.value || '',
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await Promise.all([
        settingsApi.set('site_name', siteSettings.siteName, 'string', 'general'),
        settingsApi.set('site_description', siteSettings.siteDescription, 'string', 'general'),
      ]);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleActivateTheme = async (id: string) => {
    try {
      await themesApi.activate(id);
      toast.success('Theme activated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to activate theme');
    }
  };

  const handleScanThemes = async () => {
    try {
      await themesApi.scan();
      toast.success('Themes scanned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to scan themes');
    }
  };

  const handleUploadTheme = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast.error('Please upload a ZIP file');
      return;
    }

    setUploading(true);
    try {
      await themesApi.upload(file);
      toast.success('Theme uploaded and installed successfully');
      fetchData();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload theme');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTheme = async () => {
    if (!deleteConfirm.themeId) return;

    try {
      await themesApi.delete(deleteConfirm.themeId);
      toast.success('Theme deleted successfully');
      setDeleteConfirm({ isOpen: false, themeId: null, themeName: null });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete theme');
    }
  };

  const handleTogglePlugin = async (plugin: any) => {
    try {
      if (plugin.isActive) {
        await pluginsApi.deactivate(plugin.id);
        toast.success(`${plugin.name} deactivated`);
      } else {
        await pluginsApi.activate(plugin.id);
        toast.success(`${plugin.name} activated`);
      }
      fetchData();
    } catch (error) {
      toast.error('Failed to toggle plugin');
    }
  };

  const handleScanPlugins = async () => {
    try {
      await pluginsApi.scan();
      toast.success('Plugins scanned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to scan plugins');
    }
  };

  const handlePluginFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      toast.error('Please select a ZIP file');
      return;
    }

    setPluginUploading(true);
    try {
      const result = await pluginsApi.upload(file);
      toast.success(`Plugin "${result.data.name}" installed successfully!`);
      if (result.data.warnings?.length > 0) {
        result.data.warnings.forEach((w: string) => toast(w, { icon: '⚠️' }));
      }
      fetchData();
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        errorData.errors.forEach((e: string) => toast.error(e));
      } else {
        toast.error(errorData?.message || 'Failed to upload plugin');
      }
    } finally {
      setPluginUploading(false);
      if (pluginFileInputRef.current) {
        pluginFileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePlugin = async () => {
    if (!deletePluginConfirm.pluginId) return;

    try {
      await pluginsApi.delete(deletePluginConfirm.pluginId);
      toast.success('Plugin deleted successfully');
      setDeletePluginConfirm({ isOpen: false, pluginId: null, pluginName: null });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete plugin');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General' },
            { id: 'themes', label: 'Themes' },
            { id: 'plugins', label: 'Plugins' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">General Settings</h2>
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="My WordPress Node Site"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                value={siteSettings.siteDescription}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="A brief description of your site"
              />
            </div>
            <button
              onClick={handleSaveSettings}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FiCheck className="mr-2" size={18} />
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Themes Tab */}
      {activeTab === 'themes' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Themes</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setShowThemeShop(!showThemeShop)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FiShoppingBag className="mr-2" size={18} />
                {showThemeShop ? 'Hide' : 'Browse'} Theme Shop
              </button>
              <button
                onClick={() => setShowRequirements(!showRequirements)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FiInfo className="mr-2" size={18} />
                {showRequirements ? 'Hide' : 'Show'} Requirements
              </button>
              <button
                onClick={handleScanThemes}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FiRefreshCw className="mr-2" size={18} />
                Scan Themes
              </button>
              <button
                onClick={() => navigate('/theme-designer')}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <FiPenTool className="mr-2" size={18} />
                Design Theme
              </button>
              <button
                onClick={() => navigate('/theme-builder')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <FiTool className="mr-2" size={18} />
                Upload Theme
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FiUpload className="mr-2" size={18} />
                {uploading ? 'Uploading...' : 'Quick Upload'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleUploadTheme}
                className="hidden"
              />
            </div>
          </div>

          {/* Theme Shop */}
          {showThemeShop && (
            <div className="mb-6">
              <ThemeShop onThemeInstalled={fetchData} />
            </div>
          )}

          {/* Theme Requirements */}
          {showRequirements && (
            <div className="mb-6">
              <ThemeRequirements />
            </div>
          )}

          <h3 className="text-lg font-semibold mb-4">Installed Themes ({themes.length})</h3>

          {themes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">No themes found. Click "Scan Themes" to detect installed themes.</p>
              <button
                onClick={handleScanThemes}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FiRefreshCw className="mr-2" size={18} />
                Scan for Themes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {themes.map((theme) => (
              <div key={theme.id} className="bg-white rounded-lg shadow overflow-hidden">
                {theme.thumbnail ? (
                  <img src={theme.thumbnail} alt={theme.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">{theme.name.charAt(0)}</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-1">{theme.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">by {theme.author}</p>
                  <p className="text-sm text-gray-600 mb-4">{theme.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-500">v{theme.version}</span>
                    {theme.isActive ? (
                      <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        <FiCheck className="mr-1" size={14} />
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateTheme(theme.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                  {!theme.isActive && (
                    <button
                      onClick={() => setDeleteConfirm({ isOpen: true, themeId: theme.id, themeName: theme.name })}
                      className="w-full flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 text-sm rounded hover:bg-red-50"
                    >
                      <FiTrash2 className="mr-2" size={14} />
                      Delete Theme
                    </button>
                  )}
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Plugins Tab */}
      {activeTab === 'plugins' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Plugins</h2>
            <div className="flex gap-3">
              <input
                type="file"
                ref={pluginFileInputRef}
                onChange={handlePluginFileSelect}
                accept=".zip"
                className="hidden"
              />
              <button
                onClick={() => pluginFileInputRef.current?.click()}
                disabled={pluginUploading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FiUpload className="mr-2" size={18} />
                {pluginUploading ? 'Uploading...' : 'Upload Plugin'}
              </button>
              <button
                onClick={handleScanPlugins}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FiRefreshCw className="mr-2" size={18} />
                Scan for Plugins
              </button>
            </div>
          </div>

          {/* Plugin Requirements Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
              <FiInfo className="mr-2" /> Plugin Requirements
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              Plugins must be ZIP files containing a <code className="bg-blue-100 px-1 rounded">plugin.json</code> file with:
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li><strong>name</strong> (required): Display name of the plugin</li>
              <li><strong>version</strong> (required): Version string (e.g., "1.0.0")</li>
              <li><strong>author</strong>: Author name</li>
              <li><strong>description</strong>: Brief description</li>
              <li><strong>entry</strong>: Entry file (defaults to "index.js")</li>
              <li><strong>hooks</strong>: Array of lifecycle hooks (e.g., ["onActivate", "beforeSave", "registerRoutes"])</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {plugins.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No plugins found</p>
                <button
                  onClick={() => pluginFileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <FiUpload className="mr-2" size={18} />
                  Upload Your First Plugin
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {plugins.map((plugin) => (
                  <div key={plugin.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{plugin.name}</h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">v{plugin.version}</span>
                          {plugin.isActive && (
                            <span className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                              <FiCheck className="mr-1" size={12} /> Active
                            </span>
                          )}
                        </div>
                        {plugin.author && (
                          <p className="text-sm text-gray-500 mt-1">by {plugin.author}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">{plugin.description}</p>

                        {/* Plugin Details Toggle */}
                        <button
                          onClick={() => setShowPluginDetails(showPluginDetails === plugin.id ? null : plugin.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 mt-2 flex items-center"
                        >
                          <FiInfo className="mr-1" size={14} />
                          {showPluginDetails === plugin.id ? 'Hide Details' : 'Show Details'}
                        </button>

                        {showPluginDetails === plugin.id && plugin.config && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-gray-700">Entry File:</span>
                                <span className="ml-2 text-gray-600">{plugin.config.entry || 'index.js'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Path:</span>
                                <span className="ml-2 text-gray-600">{plugin.path}</span>
                              </div>
                            </div>
                            {plugin.config.hooks && plugin.config.hooks.length > 0 && (
                              <div className="mt-2">
                                <span className="font-medium text-gray-700">Hooks:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {plugin.config.hooks.map((hook: string) => (
                                    <span key={hook} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                      {hook}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {plugin.config.dependencies && Object.keys(plugin.config.dependencies).length > 0 && (
                              <div className="mt-2">
                                <span className="font-medium text-gray-700">Dependencies:</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {Object.entries(plugin.config.dependencies).map(([dep, ver]) => (
                                    <span key={dep} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                      {dep}@{ver as string}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleTogglePlugin(plugin)}
                          className={`px-4 py-2 text-sm font-medium rounded ${
                            plugin.isActive
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {plugin.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        {!plugin.isActive && (
                          <button
                            onClick={() => setDeletePluginConfirm({ isOpen: true, pluginId: plugin.id, pluginName: plugin.name })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete Plugin"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Theme Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Theme"
        message={`Are you sure you want to delete "${deleteConfirm.themeName}"? This action cannot be undone and will permanently remove all theme files.`}
        onConfirm={handleDeleteTheme}
        onCancel={() => setDeleteConfirm({ isOpen: false, themeId: null, themeName: null })}
      />

      {/* Delete Plugin Confirmation */}
      <ConfirmDialog
        isOpen={deletePluginConfirm.isOpen}
        title="Delete Plugin"
        message={`Are you sure you want to delete "${deletePluginConfirm.pluginName}"? This action cannot be undone and will permanently remove all plugin files.`}
        onConfirm={handleDeletePlugin}
        onCancel={() => setDeletePluginConfirm({ isOpen: false, pluginId: null, pluginName: null })}
      />
    </div>
  );
}


