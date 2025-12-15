/**
 * Theme Customizer Page
 * WordPress-like live theme customization with sidebar and preview
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSave, FiRefreshCw, FiMonitor, FiTablet, FiSmartphone, FiChevronLeft, FiChevronRight, FiEye, FiSettings, FiType, FiLayout, FiGrid, FiHome as FiHomeIcon, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { customThemesApi, CustomTheme, CustomThemeSettings } from '../services/api';
import { useAuthStore } from '../stores/authStore';

// Get the backend URL - in production it's same origin, in development it's port 3000
const getBackendUrl = () => {
  // In production, admin is served from the backend
  if (window.location.port !== '5173') {
    return window.location.origin;
  }
  // In development (Vite dev server on 5173), backend is on port 3000
  return 'http://localhost:3000';
};
import ColorPanel from '../components/ThemeCustomizer/ColorPanel';
import TypographyPanel from '../components/ThemeCustomizer/TypographyPanel';
import HeaderPanel from '../components/ThemeCustomizer/HeaderPanel';
import FooterPanel from '../components/ThemeCustomizer/FooterPanel';
import LayoutPanel from '../components/ThemeCustomizer/LayoutPanel';
import HomepagePanel from '../components/ThemeCustomizer/HomepagePanel';

type DevicePreview = 'desktop' | 'tablet' | 'mobile';
type PanelType = 'colors' | 'typography' | 'header' | 'footer' | 'layout' | 'homepage' | null;

// Default theme settings
const defaultSettings: CustomThemeSettings = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#1F2937',
    textMuted: '#6B7280',
    heading: '#111827',
    link: '#3B82F6',
    linkHover: '#2563EB',
    border: '#E5E7EB',
    accent: '#F59E0B',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseFontSize: 16,
    lineHeight: 1.6,
    headingWeight: 700,
  },
  layout: {
    sidebarPosition: 'right',
    contentWidth: 1200,
    headerStyle: 'default',
    footerStyle: 'default',
  },
  spacing: {
    sectionPadding: 48,
    elementSpacing: 24,
    containerPadding: 24,
  },
  borders: {
    radius: 8,
    width: 1,
  },
};

export default function ThemeCustomizer() {
  const navigate = useNavigate();
  useAuthStore(); // Ensure user is authenticated
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const backendUrl = getBackendUrl();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTheme, setActiveTheme] = useState<CustomTheme | null>(null);
  const [settings, setSettings] = useState<CustomThemeSettings>(defaultSettings);
  const [draftSettings, setDraftSettings] = useState<CustomThemeSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [devicePreview, setDevicePreview] = useState<DevicePreview>('desktop');
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const tokenRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get the preview URL with secure token
  const getPreviewUrl = useCallback(() => {
    if (!previewToken) return null;
    return `${backendUrl}?_preview_token=${encodeURIComponent(previewToken)}`;
  }, [backendUrl, previewToken]);

  // Fetch preview token on mount and refresh before expiry
  const fetchPreviewToken = useCallback(async () => {
    try {
      const response = await customThemesApi.getPreviewToken();
      setPreviewToken(response.data.token);

      // Refresh token 1 minute before expiry
      const refreshIn = (response.data.expiresIn - 60) * 1000;
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
      tokenRefreshTimer.current = setTimeout(fetchPreviewToken, Math.max(refreshIn, 60000));
    } catch (error) {
      console.error('Failed to get preview token:', error);
      setPreviewError(true);
    }
  }, []);

  // Load active theme and preview token on mount
  useEffect(() => {
    loadActiveTheme();
    fetchPreviewToken();

    return () => {
      if (tokenRefreshTimer.current) {
        clearTimeout(tokenRefreshTimer.current);
      }
    };
  }, [fetchPreviewToken]);

  // Track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(settings) !== JSON.stringify(draftSettings));
  }, [settings, draftSettings]);

  // Apply live preview styles to iframe
  useEffect(() => {
    applyPreviewStyles();
  }, [draftSettings]);

  const loadActiveTheme = async () => {
    try {
      setLoading(true);
      const response = await customThemesApi.getActive();
      if (response.data) {
        setActiveTheme(response.data);
        setSettings(response.data.settings);
        setDraftSettings(response.data.settings);
      } else {
        // No active theme - try to get all themes and activate one, or create a default
        const allThemesResponse = await customThemesApi.getAll();
        if (allThemesResponse.data && allThemesResponse.data.length > 0) {
          // Activate the first available theme
          const firstTheme = allThemesResponse.data[0];
          await customThemesApi.activate(firstTheme.id);
          setActiveTheme(firstTheme);
          setSettings(firstTheme.settings);
          setDraftSettings(firstTheme.settings);
          toast.success(`Activated theme: ${firstTheme.name}`);
        } else {
          // No themes exist - create a default theme
          const newTheme = await customThemesApi.create({
            name: 'Default Theme',
            description: 'Auto-generated default theme',
            settings: defaultSettings,
            isDefault: true,
          });
          await customThemesApi.activate(newTheme.data.id);
          setActiveTheme(newTheme.data);
          setSettings(newTheme.data.settings);
          setDraftSettings(newTheme.data.settings);
          toast.success('Created and activated Default Theme');
        }
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      toast.error('Failed to load or create theme');
    } finally {
      setLoading(false);
    }
  };

  const applyPreviewStyles = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      const iframeDoc = iframeRef.current.contentDocument;
      if (!iframeDoc) return;

      // Generate CSS from settings
      const css = generatePreviewCSS(draftSettings);

      // Find or create style element
      let styleEl = iframeDoc.getElementById('customizer-preview-styles');
      if (!styleEl) {
        styleEl = iframeDoc.createElement('style');
        styleEl.id = 'customizer-preview-styles';
        iframeDoc.head.appendChild(styleEl);
      }
      styleEl.textContent = css;
    } catch (e) {
      // Cross-origin restrictions may prevent this
      console.warn('Could not apply preview styles:', e);
    }
  }, [draftSettings]);

  const generatePreviewCSS = (s: CustomThemeSettings): string => {
    return `
      :root {
        --color-primary: ${s.colors.primary} !important;
        --color-secondary: ${s.colors.secondary} !important;
        --color-background: ${s.colors.background} !important;
        --color-surface: ${s.colors.surface} !important;
        --color-text: ${s.colors.text} !important;
        --color-text-muted: ${s.colors.textMuted} !important;
        --color-heading: ${s.colors.heading} !important;
        --color-link: ${s.colors.link} !important;
        --color-link-hover: ${s.colors.linkHover} !important;
        --color-border: ${s.colors.border} !important;
        --color-accent: ${s.colors.accent} !important;
        --font-heading: ${s.typography.headingFont}, system-ui, sans-serif !important;
        --font-body: ${s.typography.bodyFont}, system-ui, sans-serif !important;
        --font-size-base: ${s.typography.baseFontSize}px !important;
        --line-height: ${s.typography.lineHeight} !important;
        --heading-weight: ${s.typography.headingWeight} !important;
        --content-width: ${s.layout.contentWidth}px !important;
        --section-padding: ${s.spacing.sectionPadding}px !important;
        --element-spacing: ${s.spacing.elementSpacing}px !important;
        --container-padding: ${s.spacing.containerPadding}px !important;
        --border-radius: ${s.borders.radius}px !important;
        --border-width: ${s.borders.width}px !important;
      }
      body { 
        background-color: ${s.colors.background} !important; 
        color: ${s.colors.text} !important;
        font-family: ${s.typography.bodyFont}, system-ui, sans-serif !important;
        font-size: ${s.typography.baseFontSize}px !important;
        line-height: ${s.typography.lineHeight} !important;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: ${s.typography.headingFont}, system-ui, sans-serif !important;
        font-weight: ${s.typography.headingWeight} !important;
        color: ${s.colors.heading} !important;
      }
      a { color: ${s.colors.link} !important; }
      a:hover { color: ${s.colors.linkHover} !important; }
    `;
  };

  const updateSettings = (path: string, value: any) => {
    setDraftSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSaveDraft = async () => {
    if (!activeTheme) {
      toast.error('No active theme to save');
      return;
    }
    try {
      setSaving(true);
      await customThemesApi.update(activeTheme.id, { settings: draftSettings });
      setSettings(draftSettings);
      setHasChanges(false);
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!activeTheme) {
      toast.error('No active theme to publish');
      return;
    }
    try {
      setSaving(true);
      await customThemesApi.update(activeTheme.id, { settings: draftSettings });
      await customThemesApi.activate(activeTheme.id);
      setSettings(draftSettings);
      setHasChanges(false);
      toast.success('Theme published successfully!');
      // Refresh iframe to show published changes
      if (iframeRef.current && previewToken) {
        setPreviewLoading(true);
        iframeRef.current.src = getPreviewUrl() || '';
      }
    } catch (error) {
      toast.error('Failed to publish theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDraftSettings(settings);
    toast.success('Changes reverted');
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const getPreviewWidth = () => {
    switch (devicePreview) {
      case 'tablet': return '768px';
      case 'mobile': return '375px';
      default: return '100%';
    }
  };

  const panels = [
    { id: 'colors' as PanelType, name: 'Colors', icon: FiEye },
    { id: 'typography' as PanelType, name: 'Typography', icon: FiType },
    { id: 'header' as PanelType, name: 'Header', icon: FiLayout },
    { id: 'footer' as PanelType, name: 'Footer', icon: FiGrid },
    { id: 'layout' as PanelType, name: 'Layout', icon: FiSettings },
    { id: 'homepage' as PanelType, name: 'Homepage', icon: FiHomeIcon },
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Theme Customizer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-gray-800 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-white font-semibold">Customize</h1>
              <p className="text-xs text-gray-400">{activeTheme?.name || 'Theme'}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
            >
              {sidebarCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
            </button>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Panel Navigation */}
        {!sidebarCollapsed && !activePanel && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {panels.map(panel => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <panel.icon size={20} />
                  <span>{panel.name}</span>
                  <FiChevronRight size={16} className="ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Panel Content */}
        {!sidebarCollapsed && activePanel && (
          <div className="flex-1 overflow-y-auto">
            <button
              onClick={() => setActivePanel(null)}
              className="flex items-center gap-2 p-4 text-gray-400 hover:text-white border-b border-gray-700 w-full"
            >
              <FiChevronLeft size={16} />
              <span>Back</span>
            </button>
            <div className="p-4">
              {activePanel === 'colors' && (
                <ColorPanel settings={draftSettings} onChange={updateSettings} />
              )}
              {activePanel === 'typography' && (
                <TypographyPanel settings={draftSettings} onChange={updateSettings} />
              )}
              {activePanel === 'header' && (
                <HeaderPanel settings={draftSettings} onChange={updateSettings} />
              )}
              {activePanel === 'footer' && (
                <FooterPanel settings={draftSettings} onChange={updateSettings} />
              )}
              {activePanel === 'layout' && (
                <LayoutPanel settings={draftSettings} onChange={updateSettings} />
              )}
              {activePanel === 'homepage' && (
                <HomepagePanel settings={draftSettings} onChange={updateSettings} />
              )}
            </div>
          </div>
        )}

        {/* Collapsed sidebar icons */}
        {sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-2 px-2">
              {panels.map(panel => (
                <button
                  key={panel.id}
                  onClick={() => { setSidebarCollapsed(false); setActivePanel(panel.id); }}
                  className="w-full p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center"
                  title={panel.name}
                >
                  <panel.icon size={20} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          {!sidebarCollapsed && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDraft}
                  disabled={!hasChanges || saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSave size={16} />
                  Save Draft
                </button>
                <button
                  onClick={handleReset}
                  disabled={!hasChanges}
                  className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                  title="Reset changes"
                >
                  <FiRefreshCw size={16} />
                </button>
              </div>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
              {hasChanges && (
                <p className="text-xs text-yellow-400 text-center">You have unsaved changes</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Preview Toolbar */}
        <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Preview</span>
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setDevicePreview('desktop')}
                className={`p-2 rounded ${devicePreview === 'desktop' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Desktop"
              >
                <FiMonitor size={16} />
              </button>
              <button
                onClick={() => setDevicePreview('tablet')}
                className={`p-2 rounded ${devicePreview === 'tablet' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Tablet"
              >
                <FiTablet size={16} />
              </button>
              <button
                onClick={() => setDevicePreview('mobile')}
                className={`p-2 rounded ${devicePreview === 'mobile' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Mobile"
              >
                <FiSmartphone size={16} />
              </button>
            </div>
          </div>
          <a
            href={backendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Open in new tab →
          </a>
        </div>

        {/* Preview iframe */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 relative"
            style={{ width: getPreviewWidth(), height: devicePreview === 'desktop' ? '100%' : '90%' }}
          >
            {/* Loading state */}
            {(previewLoading || !previewToken) && !previewError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading preview...</p>
                <p className="text-xs text-gray-400 mt-1">
                  {!previewToken ? 'Authenticating...' : `Connecting to ${backendUrl}`}
                </p>
              </div>
            )}

            {/* Error state */}
            {previewError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10 p-8">
                <FiAlertCircle className="text-orange-500 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Cannot Connect to Server</h3>
                <p className="text-gray-500 text-center mb-4 max-w-md">
                  The backend server at <code className="bg-gray-200 px-2 py-1 rounded">{backendUrl}</code> is not responding.
                </p>
                <div className="bg-gray-800 text-gray-200 rounded-lg p-4 mb-4 font-mono text-sm max-w-md">
                  <p className="text-gray-400 mb-2"># Start the backend server:</p>
                  <p>npm run start:dev</p>
                </div>
                <button
                  onClick={async () => {
                    setPreviewError(false);
                    setPreviewLoading(true);
                    await fetchPreviewToken();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <FiRefreshCw size={16} /> Retry Connection
                </button>
              </div>
            )}

            {/* Only render iframe when we have a valid preview token */}
            {previewToken && (
              <iframe
                ref={iframeRef}
                src={getPreviewUrl() || ''}
                className="w-full h-full border-0"
                title="Theme Preview"
                onLoad={() => {
                  setPreviewLoading(false);
                  setPreviewError(false);
                  applyPreviewStyles();
                }}
                onError={() => {
                  setPreviewLoading(false);
                  setPreviewError(true);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

