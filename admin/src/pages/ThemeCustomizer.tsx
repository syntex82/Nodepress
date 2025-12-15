/**
 * Theme Customizer Page
 * WordPress-like live theme customization with sidebar and preview
 * Features: Real-time preview via postMessage, Undo/Redo, Import/Export, Element Inspector
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiSave, FiRefreshCw, FiChevronLeft, FiChevronRight, FiEye, FiSettings, FiType, FiLayout, FiGrid, FiHome as FiHomeIcon, FiAlertCircle, FiCode, FiTarget, FiRotateCcw, FiRotateCw, FiDownload, FiDroplet, FiBox } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { customThemesApi, CustomTheme, CustomThemeSettings } from '../services/api';
import { useAuthStore } from '../stores/authStore';

// Components
import ColorPanel from '../components/ThemeCustomizer/ColorPanel';
import TypographyPanel from '../components/ThemeCustomizer/TypographyPanel';
import HeaderPanel from '../components/ThemeCustomizer/HeaderPanel';
import FooterPanel from '../components/ThemeCustomizer/FooterPanel';
import LayoutPanel from '../components/ThemeCustomizer/LayoutPanel';
import HomepagePanel from '../components/ThemeCustomizer/HomepagePanel';
import CustomCSSEditor from '../components/ThemeCustomizer/CustomCSSEditor';
import ColorPaletteManager from '../components/ThemeCustomizer/ColorPaletteManager';
import AdvancedTypographyPanel from '../components/ThemeCustomizer/AdvancedTypographyPanel';
import SpacingLayoutPanel from '../components/ThemeCustomizer/SpacingLayoutPanel';
import ElementInspector from '../components/ThemeCustomizer/ElementInspector';
import ImportExportPanel from '../components/ThemeCustomizer/ImportExportPanel';
import ResponsivePreview, { ViewportSize, getViewportWidth } from '../components/ThemeCustomizer/ResponsivePreview';
import { useUndoRedo } from '../components/ThemeCustomizer/useUndoRedo';

// Get the backend URL - in production it's same origin, in development it's port 3000
const getBackendUrl = () => {
  if (window.location.port !== '5173') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

type PanelType = 'colors' | 'typography' | 'header' | 'footer' | 'layout' | 'homepage' | 'css' | 'palette' | 'advTypography' | 'spacing' | 'inspector' | 'importExport' | null;

interface ElementInfo {
  tagName: string;
  id: string;
  className: string;
  text: string;
  styles: {
    color: string;
    backgroundColor: string;
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
    margin: string;
    padding: string;
    borderRadius: string;
  };
}

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
  useAuthStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const backendUrl = getBackendUrl();

  // Core state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTheme, setActiveTheme] = useState<CustomTheme | null>(null);
  const [savedSettings, setSavedSettings] = useState<CustomThemeSettings>(defaultSettings);

  // Undo/Redo for draft settings
  const {
    state: draftSettings,
    setState: setDraftSettings,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useUndoRedo<CustomThemeSettings>(defaultSettings);

  // Custom CSS (separate from theme settings)
  const [customCSS, setCustomCSS] = useState('');

  // UI state
  const [viewport, setViewport] = useState<ViewportSize>('full');
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Preview state
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewReady, setPreviewReady] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);
  const tokenRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Element Inspector state
  const [inspectorEnabled, setInspectorEnabled] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);

  // Computed
  const hasChanges = JSON.stringify(savedSettings) !== JSON.stringify(draftSettings);

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

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      switch (data.type) {
        case 'CUSTOMIZER_READY':
          setPreviewReady(true);
          // Send initial styles
          applyPreviewStyles();
          break;
        case 'CUSTOMIZER_PONG':
          setPreviewReady(true);
          break;
        case 'ELEMENT_SELECTED':
          setSelectedElement(data.element);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Apply live preview styles to iframe via postMessage
  useEffect(() => {
    if (previewReady) {
      applyPreviewStyles();
    }
  }, [draftSettings, customCSS, previewReady]);

  const loadActiveTheme = async () => {
    try {
      setLoading(true);
      const response = await customThemesApi.getActive();
      if (response.data) {
        setActiveTheme(response.data);
        setSavedSettings(response.data.settings);
        resetHistory(response.data.settings);
        setCustomCSS(response.data.customCSS || '');
      } else {
        const allThemesResponse = await customThemesApi.getAll();
        if (allThemesResponse.data && allThemesResponse.data.length > 0) {
          const firstTheme = allThemesResponse.data[0];
          await customThemesApi.activate(firstTheme.id);
          setActiveTheme(firstTheme);
          setSavedSettings(firstTheme.settings);
          resetHistory(firstTheme.settings);
          setCustomCSS(firstTheme.customCSS || '');
          toast.success(`Activated theme: ${firstTheme.name}`);
        } else {
          const newTheme = await customThemesApi.create({
            name: 'Default Theme',
            description: 'Auto-generated default theme',
            settings: defaultSettings,
            isDefault: true,
          });
          await customThemesApi.activate(newTheme.data.id);
          setActiveTheme(newTheme.data);
          setSavedSettings(newTheme.data.settings);
          resetHistory(newTheme.data.settings);
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

  // Send styles to iframe via postMessage (cross-origin safe)
  const applyPreviewStyles = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;

    const css = generatePreviewCSS(draftSettings);

    // Send CSS via postMessage
    iframeRef.current.contentWindow.postMessage({
      type: 'CUSTOMIZER_UPDATE_STYLES',
      css: css,
    }, '*');

    // Send custom CSS separately
    iframeRef.current.contentWindow.postMessage({
      type: 'CUSTOMIZER_UPDATE_CUSTOM_CSS',
      customCSS: customCSS,
    }, '*');
  }, [draftSettings, customCSS]);

  // Toggle element inspector in iframe
  const toggleInspector = useCallback((enabled: boolean) => {
    setInspectorEnabled(enabled);
    if (!enabled) {
      setSelectedElement(null);
    }
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'CUSTOMIZER_TOGGLE_INSPECTOR',
        enabled,
      }, '*');
    }
  }, []);

  // Load a Google Font in the iframe
  const loadFontInPreview = useCallback((font: string) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'CUSTOMIZER_LOAD_FONT',
        font,
      }, '*');
    }
  }, []);

  const generatePreviewCSS = (s: CustomThemeSettings): string => {
    const letterSpacing = s.typography.letterSpacing || 0;
    const bodyWeight = s.typography.bodyWeight || 400;

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
        --font-heading: "${s.typography.headingFont}", system-ui, sans-serif !important;
        --font-body: "${s.typography.bodyFont}", system-ui, sans-serif !important;
        --font-size-base: ${s.typography.baseFontSize}px !important;
        --line-height: ${s.typography.lineHeight} !important;
        --heading-weight: ${s.typography.headingWeight} !important;
        --body-weight: ${bodyWeight} !important;
        --letter-spacing: ${letterSpacing}em !important;
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
        font-family: "${s.typography.bodyFont}", system-ui, sans-serif !important;
        font-size: ${s.typography.baseFontSize}px !important;
        font-weight: ${bodyWeight} !important;
        line-height: ${s.typography.lineHeight} !important;
        letter-spacing: ${letterSpacing}em !important;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: "${s.typography.headingFont}", system-ui, sans-serif !important;
        font-weight: ${s.typography.headingWeight} !important;
        color: ${s.colors.heading} !important;
        letter-spacing: ${letterSpacing}em !important;
      }
      ${s.typography.h1Size ? `h1 { font-size: ${s.typography.h1Size}px !important; }` : ''}
      ${s.typography.h2Size ? `h2 { font-size: ${s.typography.h2Size}px !important; }` : ''}
      ${s.typography.h3Size ? `h3 { font-size: ${s.typography.h3Size}px !important; }` : ''}
      ${s.typography.h4Size ? `h4 { font-size: ${s.typography.h4Size}px !important; }` : ''}
      ${s.typography.h5Size ? `h5 { font-size: ${s.typography.h5Size}px !important; }` : ''}
      ${s.typography.h6Size ? `h6 { font-size: ${s.typography.h6Size}px !important; }` : ''}
      a { color: ${s.colors.link} !important; }
      a:hover { color: ${s.colors.linkHover} !important; }
      .container, .content-wrapper, main { max-width: ${s.layout.contentWidth}px !important; }
      section { padding: ${s.spacing.sectionPadding}px 0 !important; }
      .card, .post-card, .widget { border-radius: ${s.borders.radius}px !important; border-width: ${s.borders.width}px !important; }
    `;
  };

  const updateSettings = useCallback((path: string, value: any, actionName?: string) => {
    const newSettings = JSON.parse(JSON.stringify(draftSettings));
    const keys = path.split('.');
    let current: any = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setDraftSettings(newSettings, actionName || `Update ${path}`);
  }, [draftSettings, setDraftSettings]);

  // Apply a full color palette
  const applyColorPalette = useCallback((colors: CustomThemeSettings['colors']) => {
    const newSettings = { ...draftSettings, colors };
    setDraftSettings(newSettings, 'Apply color palette');
  }, [draftSettings, setDraftSettings]);

  // Import settings from JSON
  const handleImportSettings = useCallback((importedSettings: CustomThemeSettings, importedCSS?: string) => {
    setDraftSettings(importedSettings, 'Import settings');
    if (importedCSS !== undefined) {
      setCustomCSS(importedCSS);
    }
  }, [setDraftSettings]);

  // Add CSS from element inspector
  const handleAddCSSFromInspector = useCallback((css: string) => {
    setCustomCSS(prev => prev ? prev + '\n\n' + css : css);
    setActivePanel('css');
    toast.success('CSS rule added');
  }, []);

  const handleSaveDraft = async () => {
    if (!activeTheme) {
      toast.error('No active theme to save');
      return;
    }
    try {
      setSaving(true);
      await customThemesApi.update(activeTheme.id, {
        settings: draftSettings,
        customCSS: customCSS,
      });
      setSavedSettings(draftSettings);
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
      await customThemesApi.update(activeTheme.id, {
        settings: draftSettings,
        customCSS: customCSS,
      });
      await customThemesApi.activate(activeTheme.id);
      setSavedSettings(draftSettings);
      toast.success('Theme published successfully!');
      // Refresh iframe to show published changes
      if (iframeRef.current && previewToken) {
        setPreviewLoading(true);
        setPreviewReady(false);
        iframeRef.current.src = getPreviewUrl() || '';
      }
    } catch (error) {
      toast.error('Failed to publish theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetHistory(savedSettings);
    setCustomCSS(activeTheme?.customCSS || '');
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
    const width = getViewportWidth(viewport);
    return typeof width === 'number' ? `${width}px` : width;
  };

  // Panel definitions - Basic and Advanced
  const basicPanels = [
    { id: 'colors' as PanelType, name: 'Colors', icon: FiEye },
    { id: 'typography' as PanelType, name: 'Typography', icon: FiType },
    { id: 'header' as PanelType, name: 'Header', icon: FiLayout },
    { id: 'footer' as PanelType, name: 'Footer', icon: FiGrid },
    { id: 'layout' as PanelType, name: 'Layout', icon: FiSettings },
    { id: 'homepage' as PanelType, name: 'Homepage', icon: FiHomeIcon },
  ];

  const advancedPanels = [
    { id: 'palette' as PanelType, name: 'Color Palette', icon: FiDroplet },
    { id: 'advTypography' as PanelType, name: 'Advanced Typography', icon: FiType },
    { id: 'spacing' as PanelType, name: 'Spacing & Layout', icon: FiBox },
    { id: 'css' as PanelType, name: 'Custom CSS', icon: FiCode },
    { id: 'inspector' as PanelType, name: 'Element Inspector', icon: FiTarget },
    { id: 'importExport' as PanelType, name: 'Import / Export', icon: FiDownload },
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
            {/* Basic Panels */}
            <div className="mb-4">
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">Basic</h3>
              <div className="space-y-1">
                {basicPanels.map(panel => (
                  <button
                    key={panel.id}
                    onClick={() => setActivePanel(panel.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <panel.icon size={18} />
                    <span className="text-sm">{panel.name}</span>
                    <FiChevronRight size={14} className="ml-auto text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
            {/* Advanced Panels */}
            <div>
              <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">Advanced</h3>
              <div className="space-y-1">
                {advancedPanels.map(panel => (
                  <button
                    key={panel.id}
                    onClick={() => setActivePanel(panel.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <panel.icon size={18} />
                    <span className="text-sm">{panel.name}</span>
                    <FiChevronRight size={14} className="ml-auto text-gray-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Panel Content */}
        {!sidebarCollapsed && activePanel && (
          <div className="flex-1 overflow-y-auto">
            <button
              onClick={() => { setActivePanel(null); toggleInspector(false); }}
              className="flex items-center gap-2 p-4 text-gray-400 hover:text-white border-b border-gray-700 w-full"
            >
              <FiChevronLeft size={16} />
              <span>Back</span>
            </button>
            <div className="p-4">
              {/* Basic Panels */}
              {activePanel === 'colors' && <ColorPanel settings={draftSettings} onChange={updateSettings} />}
              {activePanel === 'typography' && <TypographyPanel settings={draftSettings} onChange={updateSettings} />}
              {activePanel === 'header' && <HeaderPanel settings={draftSettings} onChange={updateSettings} />}
              {activePanel === 'footer' && <FooterPanel settings={draftSettings} onChange={updateSettings} />}
              {activePanel === 'layout' && <LayoutPanel settings={draftSettings} onChange={updateSettings} />}
              {activePanel === 'homepage' && <HomepagePanel settings={draftSettings} onChange={updateSettings} />}
              {/* Advanced Panels */}
              {activePanel === 'palette' && <ColorPaletteManager settings={draftSettings} onChange={updateSettings} onApplyPalette={applyColorPalette} />}
              {activePanel === 'advTypography' && <AdvancedTypographyPanel settings={draftSettings} onChange={updateSettings} onLoadFont={loadFontInPreview} />}
              {activePanel === 'spacing' && <SpacingLayoutPanel settings={draftSettings} onChange={updateSettings} />}
              {activePanel === 'css' && <CustomCSSEditor value={customCSS} onChange={setCustomCSS} />}
              {activePanel === 'inspector' && <ElementInspector isEnabled={inspectorEnabled} onToggle={toggleInspector} selectedElement={selectedElement} onGenerateCSS={handleAddCSSFromInspector} />}
              {activePanel === 'importExport' && <ImportExportPanel settings={draftSettings} customCSS={customCSS} themeName={activeTheme?.name || 'Theme'} onImport={handleImportSettings} />}
            </div>
          </div>
        )}

        {/* Collapsed sidebar icons */}
        {sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {[...basicPanels, ...advancedPanels].map(panel => (
                <button
                  key={panel.id}
                  onClick={() => { setSidebarCollapsed(false); setActivePanel(panel.id); }}
                  className="w-full p-2.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center"
                  title={panel.name}
                >
                  <panel.icon size={18} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          {!sidebarCollapsed && (
            <>
              {/* Undo/Redo buttons */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  title="Undo"
                >
                  <FiRotateCcw size={14} />
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                  title="Redo"
                >
                  <FiRotateCw size={14} />
                  Redo
                </button>
              </div>
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
            <ResponsivePreview currentViewport={viewport} onViewportChange={setViewport} />
          </div>
          <div className="flex items-center gap-4">
            {inspectorEnabled && (
              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                Inspector Active
              </span>
            )}
            <a
              href={backendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Open in new tab →
            </a>
          </div>
        </div>

        {/* Preview iframe */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 relative"
            style={{ width: getPreviewWidth(), height: viewport === 'full' ? '100%' : '90%', maxHeight: '100%' }}
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

