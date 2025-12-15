/**
 * Color Palette Manager Component
 * Create and save custom color schemes with color picker and hex/RGB/HSL input
 */

import { useState } from 'react';
import { FiPlus, FiTrash2, FiSave, FiCheck, FiCopy } from 'react-icons/fi';
import { CustomThemeSettings } from '../../services/api';

interface ColorPalette {
  id: string;
  name: string;
  colors: CustomThemeSettings['colors'];
}

interface ColorPaletteManagerProps {
  settings: CustomThemeSettings;
  onChange: (path: string, value: any) => void;
  onApplyPalette: (colors: CustomThemeSettings['colors']) => void;
}

// Preset palettes
const PRESET_PALETTES: ColorPalette[] = [
  {
    id: 'default',
    name: 'Default Blue',
    colors: { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#F59E0B', background: '#FFFFFF', surface: '#F9FAFB', text: '#1F2937', textMuted: '#6B7280', heading: '#111827', link: '#3B82F6', linkHover: '#2563EB', border: '#E5E7EB' },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    colors: { primary: '#60A5FA', secondary: '#A78BFA', accent: '#FBBF24', background: '#111827', surface: '#1F2937', text: '#F9FAFB', textMuted: '#9CA3AF', heading: '#FFFFFF', link: '#60A5FA', linkHover: '#93C5FD', border: '#374151' },
  },
  {
    id: 'nature',
    name: 'Nature Green',
    colors: { primary: '#10B981', secondary: '#14B8A6', accent: '#F59E0B', background: '#FFFFFF', surface: '#ECFDF5', text: '#1F2937', textMuted: '#6B7280', heading: '#064E3B', link: '#10B981', linkHover: '#059669', border: '#D1FAE5' },
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    colors: { primary: '#F97316', secondary: '#EF4444', accent: '#FBBF24', background: '#FFFBEB', surface: '#FEF3C7', text: '#1F2937', textMuted: '#78716C', heading: '#7C2D12', link: '#EA580C', linkHover: '#C2410C', border: '#FED7AA' },
  },
];

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

interface ColorInputAdvancedProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorInputAdvanced({ label, value, onChange }: ColorInputAdvancedProps) {
  const [mode, setMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [copied, setCopied] = useState(false);
  const rgb = hexToRgb(value);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const copyValue = () => {
    let text = value;
    if (mode === 'rgb' && rgb) text = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    if (mode === 'hsl' && hsl) text = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between py-2 group">
      <label className="text-sm text-gray-300">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-gray-600" />
        <div className="relative">
          <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="w-14 px-1 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300">
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
          </select>
        </div>
        <input
          type="text"
          value={mode === 'hex' ? value : mode === 'rgb' && rgb ? `${rgb.r},${rgb.g},${rgb.b}` : hsl ? `${hsl.h},${hsl.s},${hsl.l}` : value}
          onChange={(e) => {
            if (mode === 'hex') onChange(e.target.value);
          }}
          className="w-24 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200"
          readOnly={mode !== 'hex'}
        />
        <button onClick={copyValue} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all">
          {copied ? <FiCheck size={12} className="text-green-400" /> : <FiCopy size={12} />}
        </button>
      </div>
    </div>
  );
}

export default function ColorPaletteManager({ settings, onChange, onApplyPalette }: ColorPaletteManagerProps) {
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>(() => {
    const saved = localStorage.getItem('theme-customizer-palettes');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const colors = settings.colors;

  const savePalette = () => {
    if (!paletteName.trim()) return;
    const newPalette: ColorPalette = { id: Date.now().toString(), name: paletteName, colors: { ...colors } };
    const updated = [...savedPalettes, newPalette];
    setSavedPalettes(updated);
    localStorage.setItem('theme-customizer-palettes', JSON.stringify(updated));
    setPaletteName('');
    setShowSaveDialog(false);
  };

  const deletePalette = (id: string) => {
    const updated = savedPalettes.filter(p => p.id !== id);
    setSavedPalettes(updated);
    localStorage.setItem('theme-customizer-palettes', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Color Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_PALETTES.map((palette) => (
            <button key={palette.id} onClick={() => onApplyPalette(palette.colors)} className="p-2 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors text-left">
              <div className="flex gap-1 mb-1">
                {[palette.colors.primary, palette.colors.secondary, palette.colors.accent, palette.colors.background].map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: c, border: c === '#FFFFFF' ? '1px solid #374151' : 'none' }} />
                ))}
              </div>
              <span className="text-xs text-gray-300">{palette.name}</span>
            </button>
          ))}
        </div>
      </div>

      {savedPalettes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Saved Palettes</h3>
          <div className="space-y-2">
            {savedPalettes.map((palette) => (
              <div key={palette.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-700">
                <button onClick={() => onApplyPalette(palette.colors)} className="flex items-center gap-2 flex-1 text-left">
                  <div className="flex gap-1">
                    {[palette.colors.primary, palette.colors.secondary, palette.colors.accent].map((c, i) => (
                      <div key={i} className="w-3 h-3 rounded" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-300">{palette.name}</span>
                </button>
                <button onClick={() => deletePalette(palette.id)} className="p-1 text-gray-400 hover:text-red-400">
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Brand Colors</h3>
        <div className="space-y-1">
          <ColorInputAdvanced label="Primary" value={colors.primary} onChange={(v) => onChange('colors.primary', v)} />
          <ColorInputAdvanced label="Secondary" value={colors.secondary} onChange={(v) => onChange('colors.secondary', v)} />
          <ColorInputAdvanced label="Accent" value={colors.accent} onChange={(v) => onChange('colors.accent', v)} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Background</h3>
        <div className="space-y-1">
          <ColorInputAdvanced label="Background" value={colors.background} onChange={(v) => onChange('colors.background', v)} />
          <ColorInputAdvanced label="Surface" value={colors.surface} onChange={(v) => onChange('colors.surface', v)} />
          <ColorInputAdvanced label="Border" value={colors.border} onChange={(v) => onChange('colors.border', v)} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Text</h3>
        <div className="space-y-1">
          <ColorInputAdvanced label="Heading" value={colors.heading} onChange={(v) => onChange('colors.heading', v)} />
          <ColorInputAdvanced label="Body Text" value={colors.text} onChange={(v) => onChange('colors.text', v)} />
          <ColorInputAdvanced label="Muted Text" value={colors.textMuted} onChange={(v) => onChange('colors.textMuted', v)} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Links</h3>
        <div className="space-y-1">
          <ColorInputAdvanced label="Link Color" value={colors.link} onChange={(v) => onChange('colors.link', v)} />
          <ColorInputAdvanced label="Link Hover" value={colors.linkHover} onChange={(v) => onChange('colors.linkHover', v)} />
        </div>
      </div>

      {/* Save Palette Button */}
      <div className="pt-2 border-t border-gray-700">
        {!showSaveDialog ? (
          <button onClick={() => setShowSaveDialog(true)} className="flex items-center gap-2 w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
            <FiPlus size={16} /> Save Current as Palette
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
              placeholder="Palette name..."
              className="flex-1 px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500"
              autoFocus
            />
            <button onClick={savePalette} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <FiSave size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

