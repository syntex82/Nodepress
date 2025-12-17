/**
 * Theme Designer JavaScript
 * Handles theme customization with live preview
 */

(function() {
  'use strict';

  // Theme presets
  const THEME_PRESETS = {
    'cyber-dark': {
      colors: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#EC4899', background: '#0F0F1A', surface: '#1E1E2E', text: '#E2E8F0', muted: '#94A3B8', heading: '#F8FAFC', link: '#818CF8', border: '#3F3F5A' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, lineHeight: 1.7, headingWeight: 700 },
      layout: { contentWidth: 1200, sectionPadding: 48, elementSpacing: 24, borderRadius: 16 }
    },
    'midnight-blue': {
      colors: { primary: '#3B82F6', secondary: '#2563EB', accent: '#10B981', background: '#0B1120', surface: '#111827', text: '#D1D5DB', muted: '#6B7280', heading: '#F9FAFB', link: '#60A5FA', border: '#1F2937' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 15, lineHeight: 1.6, headingWeight: 600 },
      layout: { contentWidth: 1100, sectionPadding: 40, elementSpacing: 20, borderRadius: 12 }
    },
    'minimal-dark': {
      colors: { primary: '#60a5fa', secondary: '#3b82f6', accent: '#3b82f6', background: '#0f172a', surface: '#1e293b', text: '#e2e8f0', muted: '#94a3b8', heading: '#f8fafc', link: '#60a5fa', border: '#334155' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, lineHeight: 1.6, headingWeight: 600 },
      layout: { contentWidth: 720, sectionPadding: 32, elementSpacing: 16, borderRadius: 8 }
    },
    'portfolio': {
      colors: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', background: '#0f0f0f', surface: '#1a1a1a', text: '#e5e5e5', muted: '#a3a3a3', heading: '#ffffff', link: '#8b5cf6', border: '#2a2a2a' },
      typography: { headingFont: 'Poppins', bodyFont: 'system-ui', baseFontSize: 16, lineHeight: 1.6, headingWeight: 600 },
      layout: { contentWidth: 1000, sectionPadding: 48, elementSpacing: 24, borderRadius: 12 }
    },
    'minimal-light': {
      colors: { primary: '#2563eb', secondary: '#1d4ed8', accent: '#3b82f6', background: '#ffffff', surface: '#f8fafc', text: '#334155', muted: '#64748b', heading: '#0f172a', link: '#2563eb', border: '#e2e8f0' },
      typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, lineHeight: 1.6, headingWeight: 600 },
      layout: { contentWidth: 720, sectionPadding: 32, elementSpacing: 16, borderRadius: 8 }
    },
    'ecommerce': {
      colors: { primary: '#059669', secondary: '#047857', accent: '#10b981', background: '#ffffff', surface: '#f9fafb', text: '#374151', muted: '#6b7280', heading: '#111827', link: '#059669', border: '#e5e7eb' },
      typography: { headingFont: 'system-ui', bodyFont: 'system-ui', baseFontSize: 15, lineHeight: 1.6, headingWeight: 600 },
      layout: { contentWidth: 1280, sectionPadding: 32, elementSpacing: 16, borderRadius: 8 }
    }
  };

  // Current theme settings
  let currentSettings = {
    colors: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#EC4899', background: '#0F0F1A', surface: '#1E1E2E', text: '#E2E8F0', muted: '#94A3B8', heading: '#F8FAFC', link: '#818CF8', border: '#3F3F5A' },
    typography: { headingFont: 'Inter', bodyFont: 'Inter', baseFontSize: 16, lineHeight: 1.7, headingWeight: 700 },
    layout: { contentWidth: 1200, sectionPadding: 48, elementSpacing: 24, borderRadius: 16, headerStyle: 'default' }
  };

  // History for undo/redo
  let history = [JSON.parse(JSON.stringify(currentSettings))];
  let historyIndex = 0;
  let selectedThemeId = null;

  // DOM Elements
  const previewFrame = document.getElementById('preview-frame');
  const loadingOverlay = document.getElementById('loading-overlay');

  // Initialize
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupTabNavigation();
    setupColorInputs();
    setupTypographyInputs();
    setupLayoutInputs();
    setupDeviceSwitcher();
    setupModeSwitcher();
    setupPresets();
    setupSaveButton();
    setupUndoRedo();
    setupImportExport();
    setupAiGenerator();
    loadExistingThemes();
    applySettingsToPreview();
  }

  // Tab Navigation
  function setupTabNavigation() {
    document.querySelectorAll('.sidebar-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabId = tab.dataset.tab;
        document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
        document.getElementById(`${tabId}-panel`).style.display = 'block';
      });
    });
  }

  // Color Inputs
  function setupColorInputs() {
    const colorKeys = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'muted', 'heading', 'link', 'border'];
    
    colorKeys.forEach(key => {
      const swatch = document.getElementById(`color-${key}`);
      const hex = document.getElementById(`hex-${key}`);
      
      if (swatch && hex) {
        swatch.addEventListener('input', (e) => {
          hex.value = e.target.value;
          updateColor(key, e.target.value);
        });
        
        hex.addEventListener('input', (e) => {
          if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            swatch.value = e.target.value;
            updateColor(key, e.target.value);
          }
        });
      }
    });
  }

  function updateColor(key, value) {
    currentSettings.colors[key] = value;
    pushHistory();
    applySettingsToPreview();
  }

  // Typography
  function setupTypographyInputs() {
    const headingFont = document.getElementById('heading-font');
    const bodyFont = document.getElementById('body-font');
    const baseFontSize = document.getElementById('base-font-size');
    const lineHeight = document.getElementById('line-height');
    const headingWeight = document.getElementById('heading-weight');

    if (headingFont) {
      headingFont.value = currentSettings.typography.headingFont;
      headingFont.addEventListener('change', (e) => {
        currentSettings.typography.headingFont = e.target.value;
        loadGoogleFont(e.target.value);
        pushHistory();
        applySettingsToPreview();
      });
    }

    if (bodyFont) {
      bodyFont.value = currentSettings.typography.bodyFont;
      bodyFont.addEventListener('change', (e) => {
        currentSettings.typography.bodyFont = e.target.value;
        loadGoogleFont(e.target.value);
        pushHistory();
        applySettingsToPreview();
      });
    }

    setupSlider(baseFontSize, 'font-size-value', 'px', (val) => {
      currentSettings.typography.baseFontSize = parseInt(val);
    });

    setupSlider(lineHeight, 'line-height-value', '', (val) => {
      currentSettings.typography.lineHeight = parseFloat(val);
    });

    setupSlider(headingWeight, 'heading-weight-value', '', (val) => {
      currentSettings.typography.headingWeight = parseInt(val);
    });
  }

  function setupSlider(slider, valueId, suffix, callback) {
    if (!slider) return;
    const valueEl = document.getElementById(valueId);

    slider.addEventListener('input', (e) => {
      if (valueEl) valueEl.textContent = e.target.value + suffix;
      callback(e.target.value);
      applySettingsToPreview();
    });

    slider.addEventListener('change', pushHistory);
  }

  // Layout Inputs
  function setupLayoutInputs() {
    const contentWidth = document.getElementById('content-width');
    const sectionPadding = document.getElementById('section-padding');
    const elementSpacing = document.getElementById('element-spacing');
    const borderRadius = document.getElementById('border-radius');
    const headerStyle = document.getElementById('header-style');

    setupSlider(contentWidth, 'content-width-value', 'px', (val) => {
      currentSettings.layout.contentWidth = parseInt(val);
    });

    setupSlider(sectionPadding, 'section-padding-value', 'px', (val) => {
      currentSettings.layout.sectionPadding = parseInt(val);
    });

    setupSlider(elementSpacing, 'element-spacing-value', 'px', (val) => {
      currentSettings.layout.elementSpacing = parseInt(val);
    });

    setupSlider(borderRadius, 'border-radius-value', 'px', (val) => {
      currentSettings.layout.borderRadius = parseInt(val);
    });

    if (headerStyle) {
      headerStyle.addEventListener('change', (e) => {
        currentSettings.layout.headerStyle = e.target.value;
        pushHistory();
        applySettingsToPreview();
      });
    }
  }

  // Device Switcher
  function setupDeviceSwitcher() {
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const device = btn.dataset.device;
        const wrapper = document.getElementById('preview-frame-wrapper');
        wrapper.className = `preview-frame-wrapper ${device}`;
      });
    });
  }

  // Mode Switcher (Light/Dark)
  function setupModeSwitcher() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Mode switching would apply to preview
      });
    });
  }

  // Presets
  function setupPresets() {
    document.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const presetId = card.dataset.preset;
        const preset = THEME_PRESETS[presetId];
        if (preset) {
          applyPreset(preset);
          showNotification(`Applied "${presetId.replace('-', ' ')}" preset`);
        }
      });
    });
  }

  function applyPreset(preset) {
    currentSettings = JSON.parse(JSON.stringify(preset));
    updateUIFromSettings();
    pushHistory();
    applySettingsToPreview();
  }

  function updateUIFromSettings() {
    // Update color inputs
    const colorKeys = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'muted', 'heading', 'link', 'border'];
    colorKeys.forEach(key => {
      const swatch = document.getElementById(`color-${key}`);
      const hex = document.getElementById(`hex-${key}`);
      if (swatch && currentSettings.colors[key]) swatch.value = currentSettings.colors[key];
      if (hex && currentSettings.colors[key]) hex.value = currentSettings.colors[key];
    });

    // Update typography
    const headingFont = document.getElementById('heading-font');
    const bodyFont = document.getElementById('body-font');
    if (headingFont) headingFont.value = currentSettings.typography.headingFont;
    if (bodyFont) bodyFont.value = currentSettings.typography.bodyFont;

    // Update sliders
    updateSliderUI('base-font-size', 'font-size-value', currentSettings.typography.baseFontSize, 'px');
    updateSliderUI('line-height', 'line-height-value', currentSettings.typography.lineHeight, '');
    updateSliderUI('heading-weight', 'heading-weight-value', currentSettings.typography.headingWeight, '');
    updateSliderUI('content-width', 'content-width-value', currentSettings.layout.contentWidth, 'px');
    updateSliderUI('section-padding', 'section-padding-value', currentSettings.layout.sectionPadding, 'px');
    updateSliderUI('element-spacing', 'element-spacing-value', currentSettings.layout.elementSpacing, 'px');
    updateSliderUI('border-radius', 'border-radius-value', currentSettings.layout.borderRadius, 'px');
  }

  function updateSliderUI(sliderId, valueId, value, suffix) {
    const slider = document.getElementById(sliderId);
    const valueEl = document.getElementById(valueId);
    if (slider) slider.value = value;
    if (valueEl) valueEl.textContent = value + suffix;
  }

  // Save Theme
  function setupSaveButton() {
    const saveBtn = document.getElementById('save-theme-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveTheme);
    }
  }

  async function saveTheme() {
    const themeName = prompt('Enter theme name:', 'My Custom Theme');
    if (!themeName) return;

    showLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const method = selectedThemeId ? 'PUT' : 'POST';
      const url = selectedThemeId
        ? `/api/custom-themes/${selectedThemeId}`
        : '/api/custom-themes';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: themeName,
          description: 'Created with Theme Designer',
          settings: {
            colors: currentSettings.colors,
            typography: currentSettings.typography,
            layout: {
              sidebarPosition: 'none',
              contentWidth: currentSettings.layout.contentWidth,
              headerStyle: currentSettings.layout.headerStyle || 'default',
              footerStyle: 'default'
            },
            spacing: {
              sectionPadding: currentSettings.layout.sectionPadding,
              elementSpacing: currentSettings.layout.elementSpacing,
              containerPadding: 24
            },
            borders: {
              radius: currentSettings.layout.borderRadius,
              width: 1
            }
          }
        })
      });

      if (!response.ok) throw new Error('Failed to save theme');

      const data = await response.json();
      selectedThemeId = data.id;
      showNotification('Theme saved successfully!');
    } catch (err) {
      console.error('Save error:', err);
      showNotification('Failed to save theme', 'error');
    } finally {
      showLoading(false);
    }
  }

  // Undo/Redo
  function setupUndoRedo() {
    document.getElementById('undo-btn')?.addEventListener('click', undo);
    document.getElementById('redo-btn')?.addEventListener('click', redo);
  }

  function pushHistory() {
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.parse(JSON.stringify(currentSettings)));
    historyIndex = history.length - 1;
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      currentSettings = JSON.parse(JSON.stringify(history[historyIndex]));
      updateUIFromSettings();
      applySettingsToPreview();
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      currentSettings = JSON.parse(JSON.stringify(history[historyIndex]));
      updateUIFromSettings();
      applySettingsToPreview();
    }
  }

  // Import/Export
  function setupImportExport() {
    const exportBtn = document.getElementById('export-theme-btn');
    const importBtn = document.getElementById('import-theme-btn');
    const importFile = document.getElementById('import-file');

    if (exportBtn) {
      exportBtn.addEventListener('click', exportTheme);
    }

    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', handleImport);
    }
  }

  function exportTheme() {
    const exportData = {
      name: 'Custom Theme',
      settings: currentSettings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-export.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Theme exported!');
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.settings) {
          currentSettings = data.settings;
          updateUIFromSettings();
          pushHistory();
          applySettingsToPreview();
          showNotification('Theme imported!');
        }
      } catch (err) {
        showNotification('Invalid theme file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // AI Theme Generator
  function setupAiGenerator() {
    const generateBtn = document.getElementById('generate-ai-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', generateAiTheme);
    }
  }

  async function generateAiTheme() {
    const prompt = document.getElementById('ai-prompt')?.value;
    if (!prompt?.trim()) {
      showNotification('Please describe the theme you want', 'error');
      return;
    }

    showLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/custom-themes/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt,
          themeName: 'AI Generated Theme',
          description: prompt.substring(0, 100),
          style: 'modern',
          colorScheme: 'dark'
        })
      });

      if (!response.ok) throw new Error('Failed to generate theme');

      const data = await response.json();
      if (data.settings) {
        // Map AI response to our settings format
        currentSettings.colors = data.settings.colors || currentSettings.colors;
        currentSettings.typography = data.settings.typography || currentSettings.typography;
        if (data.settings.layout) {
          currentSettings.layout.contentWidth = data.settings.layout.contentWidth || 1200;
        }
        if (data.settings.spacing) {
          currentSettings.layout.sectionPadding = data.settings.spacing.sectionPadding || 48;
          currentSettings.layout.elementSpacing = data.settings.spacing.elementSpacing || 24;
        }
        if (data.settings.borders) {
          currentSettings.layout.borderRadius = data.settings.borders.radius || 12;
        }

        updateUIFromSettings();
        pushHistory();
        applySettingsToPreview();
        showNotification('AI theme generated!');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      showNotification('Failed to generate theme. Make sure you are logged in as admin.', 'error');
    } finally {
      showLoading(false);
    }
  }

  // Load existing themes
  async function loadExistingThemes() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('/api/custom-themes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const themes = await response.json();
        // Could populate a theme selector dropdown here
      }
    } catch (err) {
      console.error('Failed to load themes:', err);
    }
  }

  // Apply settings to preview iframe
  function applySettingsToPreview() {
    if (!previewFrame || !previewFrame.contentWindow) return;

    const css = generateCSS();

    try {
      previewFrame.contentWindow.postMessage({
        type: 'THEME_UPDATE',
        css: css,
        settings: currentSettings
      }, '*');
    } catch (err) {
      // If postMessage fails, inject CSS directly
      injectCSSToPreview(css);
    }
  }

  function injectCSSToPreview(css) {
    try {
      const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
      let styleEl = doc.getElementById('theme-designer-styles');

      if (!styleEl) {
        styleEl = doc.createElement('style');
        styleEl.id = 'theme-designer-styles';
        doc.head.appendChild(styleEl);
      }

      styleEl.textContent = css;
    } catch (err) {
      console.error('Cannot inject CSS to preview:', err);
    }
  }

  function generateCSS() {
    const { colors, typography, layout } = currentSettings;

    return `
      :root {
        --color-primary: ${colors.primary};
        --color-secondary: ${colors.secondary};
        --color-accent: ${colors.accent};
        --color-background: ${colors.background};
        --color-surface: ${colors.surface};
        --color-text: ${colors.text};
        --color-text-muted: ${colors.muted};
        --color-heading: ${colors.heading};
        --color-link: ${colors.link};
        --color-border: ${colors.border};
        --font-heading: ${typography.headingFont}, system-ui, sans-serif;
        --font-body: ${typography.bodyFont}, system-ui, sans-serif;
        --font-size-base: ${typography.baseFontSize}px;
        --line-height: ${typography.lineHeight};
        --heading-weight: ${typography.headingWeight};
        --content-width: ${layout.contentWidth}px;
        --section-padding: ${layout.sectionPadding}px;
        --element-spacing: ${layout.elementSpacing}px;
        --border-radius: ${layout.borderRadius}px;
      }

      body {
        background-color: var(--color-background);
        color: var(--color-text);
        font-family: var(--font-body);
        font-size: var(--font-size-base);
        line-height: var(--line-height);
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
        font-weight: var(--heading-weight);
        color: var(--color-heading);
      }

      a { color: var(--color-link); }

      .container { max-width: var(--content-width); }

      .btn-primary {
        background: var(--color-primary);
        border-color: var(--color-primary);
      }

      .btn-primary:hover {
        background: var(--color-secondary);
        border-color: var(--color-secondary);
      }
    `;
  }

  // Load Google Font
  function loadGoogleFont(fontName) {
    if (['system-ui', 'Georgia'].includes(fontName)) return;

    const linkId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700;800;900&display=swap`;
    document.head.appendChild(link);
  }

  // Utility functions
  function showLoading(show) {
    if (loadingOverlay) {
      loadingOverlay.classList.toggle('show', show);
    }
  }

  function showNotification(message, type = 'success') {
    // Use existing notification system if available
    if (window.showNotification) {
      window.showNotification(message, type);
      return;
    }

    // Fallback notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Listen for messages from preview iframe
  window.addEventListener('message', (e) => {
    if (e.data.type === 'PREVIEW_READY') {
      applySettingsToPreview();
    }
  });

  // When preview iframe loads, apply settings
  if (previewFrame) {
    previewFrame.addEventListener('load', () => {
      setTimeout(applySettingsToPreview, 500);
    });
  }

})();

