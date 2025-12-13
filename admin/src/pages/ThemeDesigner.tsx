/**
 * Visual Theme Designer Page
 * Professional-grade theme customization tool with live preview
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customThemesApi, CustomTheme, CustomThemeSettings } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiDroplet, FiType, FiLayout, FiSave,
  FiCode, FiSmartphone, FiTablet, FiMonitor, FiSun, FiMoon, FiCopy, FiTrash2,
  FiDownload, FiUpload, FiRotateCcw, FiRotateCw, FiChevronDown, FiChevronRight,
  FiPlus, FiGrid, FiSliders, FiBox
} from 'react-icons/fi';
import {
  ContentBlock, BlockType, BLOCK_CONFIGS,
  ContentBlocksPanel, BlockRenderer
} from '../components/ThemeDesigner/ContentBlocks';

// Theme presets
const THEME_PRESETS: { id: string; name: string; description: string; settings: CustomThemeSettings }[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean, minimalist design with focus on content',
    settings: {
      colors: { primary: '#2563eb', secondary: '#1d4ed8', background: '#ffffff', surface: '#f8fafc', text: '#334155', textMuted: '#64748b', heading: '#0f172a', link: '#2563eb', linkHover: '#1d4ed8', border: '#e2e8f0', accent: '#3b82f6' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, lineHeight: 1.6, headingWeight: 600 },
      layout: { sidebarPosition: 'none', contentWidth: 720, headerStyle: 'centered', footerStyle: 'centered' },
      spacing: { sectionPadding: 32, elementSpacing: 16, containerPadding: 24 },
      borders: { radius: 8, width: 1 },
    },
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Dark mode minimalist design',
    settings: {
      colors: { primary: '#60a5fa', secondary: '#3b82f6', background: '#0f172a', surface: '#1e293b', text: '#e2e8f0', textMuted: '#94a3b8', heading: '#f8fafc', link: '#60a5fa', linkHover: '#93c5fd', border: '#334155', accent: '#3b82f6' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, lineHeight: 1.6, headingWeight: 600 },
      layout: { sidebarPosition: 'none', contentWidth: 720, headerStyle: 'centered', footerStyle: 'centered' },
      spacing: { sectionPadding: 32, elementSpacing: 16, containerPadding: 24 },
      borders: { radius: 8, width: 1 },
    },
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Bold typography for rich content sites',
    settings: {
      colors: { primary: '#dc2626', secondary: '#b91c1c', background: '#fafafa', surface: '#ffffff', text: '#1f2937', textMuted: '#6b7280', heading: '#111827', link: '#dc2626', linkHover: '#b91c1c', border: '#e5e7eb', accent: '#ef4444' },
      typography: { headingFont: 'Georgia', bodyFont: 'system-ui', baseFontSize: 17, lineHeight: 1.7, headingWeight: 700 },
      layout: { sidebarPosition: 'right', contentWidth: 1200, headerStyle: 'default', footerStyle: 'default' },
      spacing: { sectionPadding: 40, elementSpacing: 20, containerPadding: 32 },
      borders: { radius: 4, width: 1 },
    },
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Modern portfolio with dark accents',
    settings: {
      colors: { primary: '#8b5cf6', secondary: '#7c3aed', background: '#0f0f0f', surface: '#1a1a1a', text: '#e5e5e5', textMuted: '#a3a3a3', heading: '#ffffff', link: '#8b5cf6', linkHover: '#a78bfa', border: '#2a2a2a', accent: '#a78bfa' },
      typography: { headingFont: 'Poppins', bodyFont: 'system-ui', baseFontSize: 16, lineHeight: 1.6, headingWeight: 600 },
      layout: { sidebarPosition: 'none', contentWidth: 1000, headerStyle: 'minimal', footerStyle: 'minimal' },
      spacing: { sectionPadding: 48, elementSpacing: 24, containerPadding: 24 },
      borders: { radius: 12, width: 1 },
    },
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Professional corporate look',
    settings: {
      colors: { primary: '#0284c7', secondary: '#0369a1', background: '#f1f5f9', surface: '#ffffff', text: '#475569', textMuted: '#94a3b8', heading: '#1e293b', link: '#0284c7', linkHover: '#0369a1', border: '#cbd5e1', accent: '#0ea5e9' },
      typography: { headingFont: 'system-ui', bodyFont: 'system-ui', baseFontSize: 15, lineHeight: 1.65, headingWeight: 600 },
      layout: { sidebarPosition: 'left', contentWidth: 1140, headerStyle: 'sticky', footerStyle: 'default' },
      spacing: { sectionPadding: 36, elementSpacing: 18, containerPadding: 28 },
      borders: { radius: 6, width: 1 },
    },
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Shop-focused design with product emphasis',
    settings: {
      colors: { primary: '#059669', secondary: '#047857', background: '#ffffff', surface: '#f9fafb', text: '#374151', textMuted: '#6b7280', heading: '#111827', link: '#059669', linkHover: '#047857', border: '#e5e7eb', accent: '#10b981' },
      typography: { headingFont: 'system-ui', bodyFont: 'system-ui', baseFontSize: 15, lineHeight: 1.6, headingWeight: 600 },
      layout: { sidebarPosition: 'left', contentWidth: 1280, headerStyle: 'sticky', footerStyle: 'default' },
      spacing: { sectionPadding: 32, elementSpacing: 16, containerPadding: 24 },
      borders: { radius: 8, width: 1 },
    },
  },
];

const FONT_OPTIONS = [
  'system-ui', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat',
  'Georgia', 'Merriweather', 'Playfair Display', 'Lora', 'Source Serif Pro',
  'Raleway', 'Nunito', 'Work Sans', 'Oswald', 'Quicksand',
];

type DesignSection = 'colors' | 'typography' | 'layout' | 'spacing' | 'components' | 'css' | 'blocks';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';
type PreviewMode = 'light' | 'dark';

// Generate unique ID for blocks
const generateBlockId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default theme settings
const DEFAULT_SETTINGS: CustomThemeSettings = {
  colors: { primary: '#3b82f6', secondary: '#2563eb', background: '#ffffff', surface: '#f9fafb', text: '#374151', textMuted: '#6b7280', heading: '#111827', link: '#3b82f6', linkHover: '#2563eb', border: '#e5e7eb', accent: '#60a5fa' },
  typography: { headingFont: 'system-ui', bodyFont: 'system-ui', baseFontSize: 16, lineHeight: 1.6, headingWeight: 600 },
  layout: { sidebarPosition: 'right', contentWidth: 1100, headerStyle: 'default', footerStyle: 'default' },
  spacing: { sectionPadding: 32, elementSpacing: 16, containerPadding: 24 },
  borders: { radius: 8, width: 1 },
};

export default function ThemeDesigner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(editId);
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [settings, setSettings] = useState<CustomThemeSettings>(DEFAULT_SETTINGS);
  const [customCSS, setCustomCSS] = useState('');
  const [activeSection, setActiveSection] = useState<DesignSection>('colors');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('light');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ colors: true });

  // Undo/Redo history
  const [history, setHistory] = useState<CustomThemeSettings[]>([DEFAULT_SETTINGS]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showThemeList, setShowThemeList] = useState(!editId);
  const [showPresets, setShowPresets] = useState(false);

  // Content Blocks state
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Block management functions
  const addBlock = useCallback((type: BlockType) => {
    const config = BLOCK_CONFIGS[type];
    const newBlock: ContentBlock = {
      id: generateBlockId(),
      type,
      props: { ...config.defaultProps },
    };
    setContentBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, []);

  const removeBlock = useCallback((id: string) => {
    setContentBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setContentBlocks(prev => {
      const index = prev.findIndex(b => b.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const newBlocks = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
      return newBlocks;
    });
  }, []);

  const updateBlockProps = useCallback((id: string, props: Record<string, any>) => {
    setContentBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, props } : b
    ));
  }, []);

  // Load themes on mount
  useEffect(() => {
    loadThemes();
  }, []);

  // Load theme for editing
  useEffect(() => {
    if (editId) {
      loadTheme(editId);
    }
  }, [editId]);

  const loadThemes = async () => {
    try {
      const res = await customThemesApi.getAll();
      setThemes(res.data);
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  };

  const loadTheme = async (id: string) => {
    setLoading(true);
    try {
      const res = await customThemesApi.getById(id);
      const theme = res.data;
      setSelectedThemeId(theme.id);
      setThemeName(theme.name);
      setThemeDescription(theme.description || '');
      setSettings(theme.settings);
      setCustomCSS(theme.customCSS || '');
      setHistory([theme.settings]);
      setHistoryIndex(0);
      setShowThemeList(false);
    } catch (error: any) {
      toast.error('Failed to load theme');
    } finally {
      setLoading(false);
    }
  };

  // Update settings with history tracking
  const updateSettings = useCallback((newSettings: CustomThemeSettings) => {
    setSettings(newSettings);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newSettings);
    if (newHistory.length > 50) newHistory.shift(); // Limit history
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSettings(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSettings(history[historyIndex + 1]);
    }
  };

  const updateColors = (key: keyof CustomThemeSettings['colors'], value: string) => {
    updateSettings({ ...settings, colors: { ...settings.colors, [key]: value } });
  };

  const updateTypography = (key: keyof CustomThemeSettings['typography'], value: string | number) => {
    updateSettings({ ...settings, typography: { ...settings.typography, [key]: value } });
  };

  const updateLayout = (key: keyof CustomThemeSettings['layout'], value: string | number) => {
    updateSettings({ ...settings, layout: { ...settings.layout, [key]: value } as any });
  };

  const updateSpacing = (key: keyof CustomThemeSettings['spacing'], value: number) => {
    updateSettings({ ...settings, spacing: { ...settings.spacing, [key]: value } });
  };

  const updateBorders = (key: keyof CustomThemeSettings['borders'], value: number) => {
    updateSettings({ ...settings, borders: { ...settings.borders, [key]: value } });
  };

  // Save theme
  const handleSave = async () => {
    if (!themeName.trim()) {
      toast.error('Please enter a theme name');
      return;
    }
    setSaving(true);
    try {
      if (selectedThemeId) {
        await customThemesApi.update(selectedThemeId, {
          name: themeName,
          description: themeDescription,
          settings,
          customCSS,
        });
        toast.success('Theme updated successfully!');
      } else {
        const res = await customThemesApi.create({
          name: themeName,
          description: themeDescription,
          settings,
          customCSS,
        });
        setSelectedThemeId(res.data.id);
        toast.success('Theme created successfully!');
      }
      loadThemes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  // Delete theme
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    try {
      await customThemesApi.delete(id);
      toast.success('Theme deleted');
      if (selectedThemeId === id) {
        setSelectedThemeId(null);
        setThemeName('');
        setThemeDescription('');
        setSettings(DEFAULT_SETTINGS);
        setCustomCSS('');
        setShowThemeList(true);
      }
      loadThemes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete theme');
    }
  };

  // Duplicate theme
  const handleDuplicate = async (id: string) => {
    try {
      const res = await customThemesApi.duplicate(id);
      toast.success('Theme duplicated');
      loadThemes();
      loadTheme(res.data.id);
    } catch (error: any) {
      toast.error('Failed to duplicate theme');
    }
  };

  // Export theme
  const handleExport = async (id: string) => {
    try {
      const res = await customThemesApi.export(id);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-${res.data.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Theme exported');
    } catch (error) {
      toast.error('Failed to export theme');
    }
  };

  // Import theme
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await customThemesApi.import(data);
      toast.success('Theme imported successfully');
      loadThemes();
      loadTheme(res.data.id);
    } catch (error: any) {
      toast.error('Failed to import theme: Invalid file format');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Apply preset
  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    updateSettings(preset.settings);
    setShowPresets(false);
    toast.success(`Applied "${preset.name}" preset`);
  };

  // Create new theme
  const handleNewTheme = () => {
    setSelectedThemeId(null);
    setThemeName('');
    setThemeDescription('');
    setSettings(DEFAULT_SETTINGS);
    setCustomCSS('');
    setHistory([DEFAULT_SETTINGS]);
    setHistoryIndex(0);
    setShowThemeList(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Theme list view
  if (showThemeList) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/settings')} className="p-2 hover:bg-gray-800 rounded-lg">
                <FiArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Theme Designer</h1>
                <p className="text-gray-400">Create and manage custom themes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input type="file" ref={fileInputRef} accept=".json" onChange={handleImport} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                <FiUpload size={16} /> Import
              </button>
              <button onClick={handleNewTheme} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                <FiPlus size={16} /> New Theme
              </button>
            </div>
          </div>

          {/* Theme Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map(theme => (
              <div key={theme.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all">
                {/* Theme Preview */}
                <div className="h-40 relative" style={{ background: (theme.settings as CustomThemeSettings).colors.background }}>
                  <div className="absolute inset-0 p-4">
                    <div className="h-6 rounded" style={{ background: (theme.settings as CustomThemeSettings).colors.surface, borderBottom: `2px solid ${(theme.settings as CustomThemeSettings).colors.border}` }} />
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 h-16 rounded" style={{ background: (theme.settings as CustomThemeSettings).colors.surface }} />
                      <div className="w-16 h-16 rounded" style={{ background: (theme.settings as CustomThemeSettings).colors.surface }} />
                    </div>
                    <div className="mt-2 h-4 w-24 rounded" style={{ background: (theme.settings as CustomThemeSettings).colors.primary }} />
                  </div>
                  {theme.isActive && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">Active</div>
                  )}
                </div>
                {/* Theme Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{theme.name}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{theme.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <button onClick={() => loadTheme(theme.id)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDuplicate(theme.id)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg" title="Duplicate">
                      <FiCopy size={16} />
                    </button>
                    <button onClick={() => handleExport(theme.id)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg" title="Export">
                      <FiDownload size={16} />
                    </button>
                    <button onClick={() => handleDelete(theme.id)} className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg" title="Delete">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {themes.length === 0 && (
              <div className="col-span-full text-center py-16">
                <FiGrid size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No custom themes yet</h3>
                <p className="text-gray-400 mb-6">Create your first theme or import an existing one</p>
                <button onClick={handleNewTheme} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
                  Create Your First Theme
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main editor view
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading theme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowThemeList(true)} className="p-2 hover:bg-gray-700 rounded-lg">
              <FiArrowLeft size={20} />
            </button>
            <div>
              <input
                type="text"
                value={themeName}
                onChange={e => setThemeName(e.target.value)}
                placeholder="Theme Name"
                className="bg-transparent text-xl font-bold border-none outline-none focus:ring-0 placeholder-gray-500"
              />
              <input
                type="text"
                value={themeDescription}
                onChange={e => setThemeDescription(e.target.value)}
                placeholder="Add a description..."
                className="block bg-transparent text-sm text-gray-400 border-none outline-none focus:ring-0 placeholder-gray-600 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 border-r border-gray-700 pr-3">
              <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-gray-700 rounded disabled:opacity-30" title="Undo">
                <FiRotateCcw size={18} />
              </button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-gray-700 rounded disabled:opacity-30" title="Redo">
                <FiRotateCw size={18} />
              </button>
            </div>

            {/* Preview Controls */}
            <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
              <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-gray-600' : 'hover:bg-gray-600'}`} title="Desktop">
                <FiMonitor size={16} />
              </button>
              <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-gray-600' : 'hover:bg-gray-600'}`} title="Tablet">
                <FiTablet size={16} />
              </button>
              <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-gray-600' : 'hover:bg-gray-600'}`} title="Mobile">
                <FiSmartphone size={16} />
              </button>
            </div>

            {/* Light/Dark Toggle */}
            <button onClick={() => setPreviewMode(previewMode === 'light' ? 'dark' : 'light')} className="p-2 hover:bg-gray-700 rounded-lg" title="Toggle Preview Mode">
              {previewMode === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
            </button>

            {/* Presets */}
            <div className="relative">
              <button onClick={() => setShowPresets(!showPresets)} className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                <FiSliders size={16} /> Presets
              </button>
              {showPresets && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                  {THEME_PRESETS.map(preset => (
                    <button key={preset.id} onClick={() => applyPreset(preset)} className="w-full p-3 text-left hover:bg-gray-700 border-b border-gray-700 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${preset.settings.colors.primary}, ${preset.settings.colors.secondary})` }} />
                        <div>
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs text-gray-400">{preset.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button onClick={handleSave} disabled={saving || !themeName.trim()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium">
              {saving ? <span className="animate-spin">⏳</span> : <FiSave size={16} />}
              {selectedThemeId ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden">
          {/* Section Tabs */}
          <div className="flex border-b border-gray-700 flex-shrink-0">
            {[
              { id: 'colors', icon: FiDroplet, label: 'Colors' },
              { id: 'typography', icon: FiType, label: 'Type' },
              { id: 'layout', icon: FiLayout, label: 'Layout' },
              { id: 'blocks', icon: FiBox, label: 'Blocks' },
              { id: 'css', icon: FiCode, label: 'CSS' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as DesignSection)}
                className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                  activeSection === tab.id ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className={`flex-1 overflow-y-auto ${activeSection === 'blocks' ? '' : 'p-4'}`}>
            {activeSection === 'colors' && renderColorsSection()}
            {activeSection === 'typography' && renderTypographySection()}
            {activeSection === 'layout' && renderLayoutSection()}
            {activeSection === 'blocks' && (
              <ContentBlocksPanel
                blocks={contentBlocks}
                onAddBlock={addBlock}
                onRemoveBlock={removeBlock}
                onMoveBlock={moveBlock}
                onUpdateBlock={updateBlockProps}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
              />
            )}
            {activeSection === 'css' && renderCSSSection()}
          </div>
        </aside>

        {/* Preview */}
        <main className="flex-1 bg-gray-950 p-6 overflow-auto flex items-start justify-center">
          <div
            className={`bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ${
              previewDevice === 'desktop' ? 'w-full max-w-5xl' :
              previewDevice === 'tablet' ? 'w-[768px]' : 'w-[375px]'
            }`}
            style={{ minHeight: '600px' }}
          >
            <ThemePreview
              settings={settings}
              previewMode={previewMode}
              blocks={contentBlocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
              onDeleteBlock={removeBlock}
              onMoveBlock={moveBlock}
              onUpdateBlockProps={updateBlockProps}
            />
          </div>
        </main>
      </div>
    </div>
  );

  // Render sections
  function renderColorsSection() {
    const colorGroups = [
      { title: 'Brand Colors', keys: ['primary', 'secondary', 'accent'] },
      { title: 'Background', keys: ['background', 'surface'] },
      { title: 'Text', keys: ['text', 'textMuted', 'heading'] },
      { title: 'Interactive', keys: ['link', 'linkHover'] },
      { title: 'Borders', keys: ['border'] },
    ];

    return (
      <div className="space-y-4">
        {colorGroups.map(group => (
          <div key={group.title}>
            <button onClick={() => toggleSection(group.title)} className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-300">
              {group.title}
              {expandedSections[group.title] ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
            </button>
            {expandedSections[group.title] && (
              <div className="space-y-3 mt-2">
                {group.keys.map(key => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(settings.colors as any)[key] || '#000000'}
                        onChange={e => updateColors(key as keyof CustomThemeSettings['colors'], e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-600"
                      />
                      <input
                        type="text"
                        value={(settings.colors as any)[key] || ''}
                        onChange={e => updateColors(key as keyof CustomThemeSettings['colors'], e.target.value)}
                        className="w-20 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderTypographySection() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Heading Font</label>
          <select
            value={settings.typography.headingFont}
            onChange={e => updateTypography('headingFont', e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Body Font</label>
          <select
            value={settings.typography.bodyFont}
            onChange={e => updateTypography('bodyFont', e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Base Font Size: {settings.typography.baseFontSize}px</label>
          <input
            type="range"
            min="12"
            max="22"
            value={settings.typography.baseFontSize}
            onChange={e => updateTypography('baseFontSize', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Line Height: {settings.typography.lineHeight}</label>
          <input
            type="range"
            min="1.2"
            max="2"
            step="0.1"
            value={settings.typography.lineHeight}
            onChange={e => updateTypography('lineHeight', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Heading Weight: {settings.typography.headingWeight}</label>
          <input
            type="range"
            min="400"
            max="900"
            step="100"
            value={settings.typography.headingWeight}
            onChange={e => updateTypography('headingWeight', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    );
  }

  function renderLayoutSection() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Sidebar Position</label>
          <div className="grid grid-cols-3 gap-2">
            {(['left', 'none', 'right'] as const).map(pos => (
              <button
                key={pos}
                onClick={() => updateLayout('sidebarPosition', pos)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  settings.layout.sidebarPosition === pos
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {pos === 'none' ? 'None' : pos.charAt(0).toUpperCase() + pos.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Content Width: {settings.layout.contentWidth}px</label>
          <input
            type="range"
            min="600"
            max="1400"
            step="20"
            value={settings.layout.contentWidth}
            onChange={e => updateLayout('contentWidth', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Header Style</label>
          <div className="grid grid-cols-2 gap-2">
            {(['default', 'centered', 'minimal', 'sticky'] as const).map(style => (
              <button
                key={style}
                onClick={() => updateLayout('headerStyle', style)}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  settings.layout.headerStyle === style
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Section Padding: {settings.spacing.sectionPadding}px</label>
          <input
            type="range"
            min="16"
            max="64"
            step="4"
            value={settings.spacing.sectionPadding}
            onChange={e => updateSpacing('sectionPadding', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Border Radius: {settings.borders.radius}px</label>
          <input
            type="range"
            min="0"
            max="24"
            value={settings.borders.radius}
            onChange={e => updateBorders('radius', Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>
    );
  }

  function renderCSSSection() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Custom CSS</label>
          <p className="text-xs text-gray-500 mb-3">Add custom CSS to override or extend theme styles</p>
          <textarea
            value={customCSS}
            onChange={e => setCustomCSS(e.target.value)}
            placeholder={`/* Custom CSS */\n.my-class {\n  color: var(--color-primary);\n}`}
            className="w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-lg font-mono text-sm text-gray-200 resize-none"
            spellCheck={false}
          />
        </div>
        <div className="p-3 bg-gray-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Available CSS Variables</h4>
          <div className="text-xs text-gray-400 font-mono space-y-1">
            <div>--color-primary, --color-secondary</div>
            <div>--color-background, --color-surface</div>
            <div>--color-text, --color-heading</div>
            <div>--font-heading, --font-body</div>
            <div>--border-radius, --border-width</div>
          </div>
        </div>
      </div>
    );
  }
}

// Live Preview Component
function ThemePreview({
  settings,
  previewMode,
  blocks = [],
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onMoveBlock,
  onUpdateBlockProps,
}: {
  settings: CustomThemeSettings;
  previewMode: 'light' | 'dark';
  blocks?: ContentBlock[];
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onDeleteBlock?: (id: string) => void;
  onMoveBlock?: (id: string, direction: 'up' | 'down') => void;
  onUpdateBlockProps?: (id: string, props: Record<string, any>) => void;
}) {
  const { colors, typography, layout, spacing, borders } = settings;
  const hasSidebar = layout.sidebarPosition !== 'none';
  const headerClass = layout.headerStyle === 'centered' ? 'text-center' : '';

  // Use dark mode colors if available and in dark mode
  const activeColors = previewMode === 'dark' && settings.darkMode
    ? { ...colors, ...settings.darkMode }
    : colors;

  const containerStyle: React.CSSProperties = {
    fontFamily: `${typography.bodyFont}, system-ui, sans-serif`,
    fontSize: typography.baseFontSize,
    lineHeight: typography.lineHeight,
    color: activeColors.text,
    background: activeColors.background,
  };

  return (
    <div style={containerStyle} className="min-h-full">
      {/* Header */}
      <header
        style={{
          background: activeColors.surface,
          borderBottom: `${borders.width}px solid ${activeColors.border}`,
          padding: `${spacing.sectionPadding * (layout.headerStyle === 'minimal' ? 0.5 : 1)}px ${spacing.containerPadding}px`,
        }}
        className={headerClass}
      >
        <div style={{ maxWidth: layout.contentWidth, margin: '0 auto' }}>
          <h1 style={{ fontFamily: `${typography.headingFont}, system-ui`, fontWeight: typography.headingWeight, color: activeColors.heading, fontSize: '1.5rem', margin: 0 }}>
            My Website
          </h1>
          <nav style={{ display: 'flex', gap: 16, marginTop: 12, justifyContent: layout.headerStyle === 'centered' ? 'center' : 'flex-start' }}>
            {['Home', 'About', 'Blog', 'Shop', 'Contact'].map(item => (
              <a key={item} href="#" style={{ color: activeColors.text, fontWeight: 500, textDecoration: 'none' }}>{item}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* Content Blocks Section */}
      {blocks.length > 0 && (
        <section style={{ padding: `${spacing.sectionPadding}px ${spacing.containerPadding}px`, maxWidth: layout.contentWidth, margin: '0 auto' }}>
          <div className="space-y-6">
            {blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                settings={settings}
                isSelected={selectedBlockId === block.id}
                onSelect={() => onSelectBlock?.(block.id)}
                onDelete={() => onDeleteBlock?.(block.id)}
                onMoveUp={() => onMoveBlock?.(block.id, 'up')}
                onMoveDown={() => onMoveBlock?.(block.id, 'down')}
                onUpdateProps={(props) => onUpdateBlockProps?.(block.id, props)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main */}
      <main style={{ padding: `${spacing.sectionPadding}px ${spacing.containerPadding}px`, maxWidth: layout.contentWidth, margin: '0 auto' }}>
        <div style={{
          display: hasSidebar ? 'grid' : 'block',
          gridTemplateColumns: hasSidebar ? (layout.sidebarPosition === 'left' ? '200px 1fr' : '1fr 200px') : undefined,
          gap: spacing.sectionPadding * 1.5
        }}>
          <div style={{ order: layout.sidebarPosition === 'left' ? 1 : 0 }}>
            {/* Post Card */}
            <article style={{
              background: activeColors.surface,
              border: `${borders.width}px solid ${activeColors.border}`,
              borderRadius: borders.radius,
              padding: spacing.sectionPadding,
              marginBottom: spacing.elementSpacing
            }}>
              <h2 style={{ fontFamily: `${typography.headingFont}, system-ui`, fontWeight: typography.headingWeight, color: activeColors.heading, fontSize: '1.5rem', marginBottom: spacing.elementSpacing / 2 }}>
                Welcome to Your Theme
              </h2>
              <p style={{ color: activeColors.textMuted, fontSize: '0.875rem', marginBottom: spacing.elementSpacing }}>
                By Author • December 13, 2025
              </p>
              <p style={{ marginBottom: spacing.elementSpacing }}>
                This is a preview of how your content will appear with the current theme settings. The colors, typography, and layout you've chosen are reflected here in real-time.
              </p>
              <a href="#" style={{
                display: 'inline-block',
                background: activeColors.primary,
                color: 'white',
                padding: '8px 16px',
                borderRadius: borders.radius,
                fontWeight: 500,
                textDecoration: 'none'
              }}>
                Read More
              </a>
            </article>

            {/* Second Card */}
            <article style={{
              background: activeColors.surface,
              border: `${borders.width}px solid ${activeColors.border}`,
              borderRadius: borders.radius,
              padding: spacing.sectionPadding,
            }}>
              <h2 style={{ fontFamily: `${typography.headingFont}, system-ui`, fontWeight: typography.headingWeight, color: activeColors.heading, fontSize: '1.25rem', marginBottom: spacing.elementSpacing / 2 }}>
                Another Post Title
              </h2>
              <p style={{ color: activeColors.textMuted, fontSize: '0.875rem', marginBottom: spacing.elementSpacing }}>
                By Author • December 12, 2025
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </article>
          </div>

          {hasSidebar && (
            <aside style={{ order: layout.sidebarPosition === 'left' ? 0 : 1 }}>
              <div style={{
                background: activeColors.surface,
                border: `${borders.width}px solid ${activeColors.border}`,
                borderRadius: borders.radius,
                padding: spacing.sectionPadding,
                marginBottom: spacing.elementSpacing
              }}>
                <h3 style={{
                  fontFamily: `${typography.headingFont}, system-ui`,
                  fontWeight: typography.headingWeight,
                  color: activeColors.heading,
                  fontSize: '1rem',
                  marginBottom: spacing.elementSpacing * 0.75,
                  paddingBottom: spacing.elementSpacing * 0.5,
                  borderBottom: `${borders.width}px solid ${activeColors.border}`
                }}>
                  About
                </h3>
                <p style={{ color: activeColors.textMuted, fontSize: '0.875rem' }}>
                  Your site description goes here.
                </p>
              </div>
              <div style={{
                background: activeColors.surface,
                border: `${borders.width}px solid ${activeColors.border}`,
                borderRadius: borders.radius,
                padding: spacing.sectionPadding,
              }}>
                <h3 style={{
                  fontFamily: `${typography.headingFont}, system-ui`,
                  fontWeight: typography.headingWeight,
                  color: activeColors.heading,
                  fontSize: '1rem',
                  marginBottom: spacing.elementSpacing * 0.75,
                  paddingBottom: spacing.elementSpacing * 0.5,
                  borderBottom: `${borders.width}px solid ${activeColors.border}`
                }}>
                  Categories
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.875rem' }}>
                  {['Technology', 'Design', 'Business'].map(c => (
                    <li key={c} style={{ marginBottom: 8 }}>
                      <a href="#" style={{ color: activeColors.link, textDecoration: 'none' }}>{c}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: activeColors.surface,
        borderTop: `${borders.width}px solid ${activeColors.border}`,
        padding: `${spacing.sectionPadding}px ${spacing.containerPadding}px`,
        textAlign: 'center',
        color: activeColors.textMuted,
        fontSize: '0.875rem'
      }}>
        © 2025 My Website. All rights reserved.
      </footer>
    </div>
  );
}