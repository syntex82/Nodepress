/**
 * Advanced Typography Panel Component
 * Font family, weight, size, line-height, letter-spacing with Google Fonts integration
 */

import { useState, useEffect } from 'react';
import { FiType, FiSearch, FiCheck } from 'react-icons/fi';
import { CustomThemeSettings } from '../../services/api';

interface AdvancedTypographyPanelProps {
  settings: CustomThemeSettings;
  onChange: (path: string, value: any) => void;
  onLoadFont: (font: string) => void;
}

// Popular Google Fonts organized by category
const GOOGLE_FONTS = {
  'Sans-Serif': ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Nunito', 'Work Sans', 'DM Sans', 'Outfit', 'Manrope', 'Source Sans Pro', 'Raleway', 'Ubuntu', 'Rubik', 'Noto Sans', 'Quicksand', 'Mulish', 'Karla', 'Lexend'],
  'Serif': ['Playfair Display', 'Merriweather', 'Lora', 'Libre Baskerville', 'EB Garamond', 'Crimson Text', 'PT Serif', 'Noto Serif', 'Source Serif Pro', 'Bitter'],
  'Display': ['Oswald', 'Bebas Neue', 'Anton', 'Archivo Black', 'Righteous', 'Alfa Slab One', 'Permanent Marker', 'Pacifico', 'Lobster', 'Dancing Script'],
  'Monospace': ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Roboto Mono', 'Space Mono', 'Ubuntu Mono'],
};

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
];

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (font: string) => void;
  onLoadFont: (font: string) => void;
}

function FontSelector({ label, value, onChange, onLoadFont }: FontSelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const allFonts = Object.entries(GOOGLE_FONTS).flatMap(([category, fonts]) => fonts.map(f => ({ font: f, category })));
  const filtered = search ? allFonts.filter(f => f.font.toLowerCase().includes(search.toLowerCase())) : allFonts;

  const handleSelect = (font: string) => {
    onChange(font);
    onLoadFont(font);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-300">{label}</label>
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between hover:border-gray-500">
          <span style={{ fontFamily: `"${value}", sans-serif` }}>{value}</span>
          <FiType size={16} className="text-gray-400" />
        </button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-hidden">
            <div className="p-2 border-b border-gray-700">
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fonts..."
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {Object.entries(GOOGLE_FONTS).map(([category]) => {
                const categoryFonts = filtered.filter(f => f.category === category);
                if (categoryFonts.length === 0) return null;
                return (
                  <div key={category}>
                    <div className="px-3 py-1 text-xs text-gray-500 bg-gray-750 sticky top-0">{category}</div>
                    {categoryFonts.map(({ font }) => (
                      <button
                        key={font}
                        onClick={() => handleSelect(font)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center justify-between ${value === font ? 'bg-gray-700 text-blue-400' : 'text-gray-300'}`}
                        style={{ fontFamily: `"${font}", sans-serif` }}
                      >
                        {font}
                        {value === font && <FiCheck size={14} />}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdvancedTypographyPanel({ settings, onChange, onLoadFont }: AdvancedTypographyPanelProps) {
  const { typography } = settings;

  // Load current fonts on mount
  useEffect(() => {
    onLoadFont(typography.headingFont);
    onLoadFont(typography.bodyFont);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Font Families</h3>
        <div className="space-y-4">
          <FontSelector label="Heading Font" value={typography.headingFont} onChange={(v) => onChange('typography.headingFont', v)} onLoadFont={onLoadFont} />
          <FontSelector label="Body Font" value={typography.bodyFont} onChange={(v) => onChange('typography.bodyFont', v)} onLoadFont={onLoadFont} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Font Weights</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Heading Weight</label>
            <select value={typography.headingWeight} onChange={(e) => onChange('typography.headingWeight', parseInt(e.target.value))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
              {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label} ({w.value})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Body Weight</label>
            <select value={typography.bodyWeight || 400} onChange={(e) => onChange('typography.bodyWeight', parseInt(e.target.value))} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
              {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label} ({w.value})</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Size & Spacing</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Base Font Size: {typography.baseFontSize}px</label>
            <input type="range" min="12" max="24" value={typography.baseFontSize} onChange={(e) => onChange('typography.baseFontSize', parseInt(e.target.value))} className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>12px</span><span>24px</span></div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Line Height: {typography.lineHeight}</label>
            <input type="range" min="1" max="2.5" step="0.1" value={typography.lineHeight} onChange={(e) => onChange('typography.lineHeight', parseFloat(e.target.value))} className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Tight (1)</span><span>Loose (2.5)</span></div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Letter Spacing: {typography.letterSpacing || 0}em</label>
            <input type="range" min="-0.05" max="0.2" step="0.01" value={typography.letterSpacing || 0} onChange={(e) => onChange('typography.letterSpacing', parseFloat(e.target.value))} className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Tight</span><span>Wide</span></div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Heading Sizes</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map(level => {
            const key = `h${level}Size` as keyof typeof typography;
            const defaultSize = 48 - (level - 1) * 6;
            const currentSize = (typography[key] as number) || defaultSize;
            return (
              <div key={level}>
                <label className="block text-sm text-gray-300 mb-1">H{level}: {currentSize}px</label>
                <input type="range" min="12" max="72" value={currentSize} onChange={(e) => onChange(`typography.h${level}Size`, parseInt(e.target.value))} className="w-full accent-blue-500" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview */}
      <div className="p-4 bg-gray-700 rounded-lg">
        <h4 className="text-xs text-gray-400 uppercase mb-3">Preview</h4>
        <div style={{ fontFamily: `"${typography.headingFont}", sans-serif`, fontWeight: typography.headingWeight }}>
          <div className="text-2xl text-white mb-2" style={{ letterSpacing: `${typography.letterSpacing || 0}em` }}>Heading Text</div>
        </div>
        <div style={{ fontFamily: `"${typography.bodyFont}", sans-serif`, fontSize: typography.baseFontSize, lineHeight: typography.lineHeight, letterSpacing: `${typography.letterSpacing || 0}em` }}>
          <p className="text-gray-300">This is sample body text showing the selected typography settings. The quick brown fox jumps over the lazy dog.</p>
        </div>
      </div>
    </div>
  );
}

