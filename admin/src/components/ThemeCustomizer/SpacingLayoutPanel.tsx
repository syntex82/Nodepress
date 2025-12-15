/**
 * Spacing & Layout Panel Component
 * Granular control over margins, padding, and layout properties
 */

import { useState } from 'react';
import { FiBox, FiLink, FiGrid } from 'react-icons/fi';
import { CustomThemeSettings } from '../../services/api';

interface SpacingLayoutPanelProps {
  settings: CustomThemeSettings;
  onChange: (path: string, value: any) => void;
}

interface SpacingControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function SpacingControl({ label, value, onChange, min = 0, max = 100, step = 4, unit = 'px' }: SpacingControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-xs text-gray-500">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}

interface BoxModelControlProps {
  label: string;
  values: { top: number; right: number; bottom: number; left: number };
  onChange: (values: { top: number; right: number; bottom: number; left: number }) => void;
}

function BoxModelControl({ label, values, onChange }: BoxModelControlProps) {
  const [linked, setLinked] = useState(true);

  const handleChange = (side: keyof typeof values, val: number) => {
    if (linked) {
      onChange({ top: val, right: val, bottom: val, left: val });
    } else {
      onChange({ ...values, [side]: val });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-300">{label}</label>
        <button
          onClick={() => setLinked(!linked)}
          className={`p-1.5 rounded transition-colors ${linked ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          title={linked ? 'Linked (all sides equal)' : 'Unlinked (individual sides)'}
        >
          <FiLink size={14} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <div key={side}>
            <label className="text-xs text-gray-500 capitalize block text-center mb-1">{side[0].toUpperCase()}</label>
            <input
              type="number"
              min={0}
              max={200}
              value={values[side]}
              onChange={(e) => handleChange(side, parseInt(e.target.value) || 0)}
              className="w-full px-2 py-1.5 text-sm text-center bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
        ))}
      </div>
      {/* Visual box model preview */}
      <div className="flex justify-center mt-2">
        <div
          className="relative bg-blue-500/20 rounded flex items-center justify-center text-xs text-gray-400"
          style={{ padding: `${Math.min(values.top, 20)}px ${Math.min(values.right, 20)}px ${Math.min(values.bottom, 20)}px ${Math.min(values.left, 20)}px` }}
        >
          <div className="bg-gray-600 rounded px-4 py-2">Content</div>
        </div>
      </div>
    </div>
  );
}

export default function SpacingLayoutPanel({ settings, onChange }: SpacingLayoutPanelProps) {
  const { layout, spacing, borders } = settings;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <FiGrid size={16} /> Layout
        </h3>
        <div className="space-y-4">
          <SpacingControl
            label="Content Width"
            value={layout.contentWidth}
            onChange={(v) => onChange('layout.contentWidth', v)}
            min={800}
            max={1600}
            step={50}
          />
          <div>
            <label className="block text-sm text-gray-300 mb-2">Sidebar Position</label>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'none', 'right'] as const).map(position => (
                <button
                  key={position}
                  onClick={() => onChange('layout.sidebarPosition', position)}
                  className={`p-3 rounded-lg border-2 transition-colors ${layout.sidebarPosition === position ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}`}
                >
                  <div className="flex gap-1 h-8 items-center justify-center">
                    {position === 'left' && <><div className="w-3 h-6 bg-gray-500 rounded" /><div className="w-6 h-6 bg-gray-400 rounded" /></>}
                    {position === 'none' && <div className="w-10 h-6 bg-gray-400 rounded" />}
                    {position === 'right' && <><div className="w-6 h-6 bg-gray-400 rounded" /><div className="w-3 h-6 bg-gray-500 rounded" /></>}
                  </div>
                  <div className="text-xs text-white capitalize mt-1">{position === 'none' ? 'No Sidebar' : position}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <FiBox size={16} /> Spacing
        </h3>
        <div className="space-y-4">
          <SpacingControl label="Section Padding" value={spacing.sectionPadding} onChange={(v) => onChange('spacing.sectionPadding', v)} min={16} max={96} step={8} />
          <SpacingControl label="Element Spacing" value={spacing.elementSpacing} onChange={(v) => onChange('spacing.elementSpacing', v)} min={8} max={48} step={4} />
          <SpacingControl label="Container Padding" value={spacing.containerPadding} onChange={(v) => onChange('spacing.containerPadding', v)} min={8} max={48} step={4} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Borders</h3>
        <div className="space-y-4">
          <SpacingControl
            label="Border Radius"
            value={borders.radius}
            onChange={(v) => onChange('borders.radius', v)}
            min={0}
            max={32}
            step={2}
          />
          <SpacingControl
            label="Border Width"
            value={borders.width}
            onChange={(v) => onChange('borders.width', v)}
            min={0}
            max={8}
            step={1}
          />
        </div>
      </div>

      {/* Advanced Box Model Controls */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Advanced Spacing (Coming Soon)</h3>
        <div className="p-4 bg-gray-700/50 rounded-lg">
          <BoxModelControl
            label="Content Margin"
            values={spacing.contentMargin || { top: 0, right: 0, bottom: 0, left: 0 }}
            onChange={(v) => onChange('spacing.contentMargin', v)}
          />
        </div>
      </div>

      {/* Layout Preview */}
      <div className="p-4 bg-gray-700 rounded-lg">
        <h4 className="text-xs text-gray-400 uppercase mb-2">Layout Preview</h4>
        <div className="bg-gray-800 rounded p-2">
          <div className="bg-gray-600 rounded h-4 mb-2" style={{ borderRadius: borders.radius }}></div>
          <div className="flex gap-2" style={{ padding: `${Math.min(spacing.containerPadding, 16)}px` }}>
            {layout.sidebarPosition === 'left' && (
              <div className="w-1/4 bg-gray-600 rounded h-20" style={{ borderRadius: borders.radius }}></div>
            )}
            <div className="flex-1 bg-gray-500 rounded h-20" style={{ borderRadius: borders.radius }}></div>
            {layout.sidebarPosition === 'right' && (
              <div className="w-1/4 bg-gray-600 rounded h-20" style={{ borderRadius: borders.radius }}></div>
            )}
          </div>
          <div className="bg-gray-600 rounded h-4 mt-2" style={{ borderRadius: borders.radius }}></div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Content width: {layout.contentWidth}px | Radius: {borders.radius}px
        </div>
      </div>
    </div>
  );
}

