/**
 * Color Panel Component
 * Allows customization of theme colors with helpful tooltips
 */

import { CustomThemeSettings } from '../../services/api';
import Tooltip from '../Tooltip';
import { FiHelpCircle } from 'react-icons/fi';

// Tooltips for each color setting
const COLOR_TOOLTIPS: Record<string, string> = {
  primary: 'Main brand color used for buttons, links, and key interactive elements.',
  secondary: 'Complementary color for secondary buttons, badges, and accents.',
  accent: 'Highlight color for special elements, call-to-actions, and emphasis.',
  background: 'Main page background color. Usually light for light themes, dark for dark themes.',
  surface: 'Card and container background color. Slightly different from background for depth.',
  border: 'Border color for cards, inputs, and dividers.',
  heading: 'Color for all headings (h1-h6). Usually darker or bolder than body text.',
  text: 'Main body text color. Should have good contrast with background.',
  textMuted: 'Color for secondary text, captions, and less important content.',
  link: 'Default color for clickable links.',
  linkHover: 'Link color when user hovers over it.',
  success: 'Color indicating success states, confirmations, and positive actions.',
  warning: 'Color for warnings and actions that need attention.',
  error: 'Color for errors, destructive actions, and critical alerts.',
};

interface ColorPanelProps {
  settings: CustomThemeSettings;
  onChange: (path: string, value: any) => void;
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tooltipKey?: string;
}

function ColorInput({ label, value, onChange, tooltipKey }: ColorInputProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-1.5">
        <label className="text-sm text-gray-300">{label}</label>
        {tooltipKey && COLOR_TOOLTIPS[tooltipKey] && (
          <Tooltip content={COLOR_TOOLTIPS[tooltipKey]} position="right" variant="help">
            <FiHelpCircle size={12} className="text-gray-500 hover:text-violet-400 cursor-help" />
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-600"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-200"
        />
      </div>
    </div>
  );
}

export default function ColorPanel({ settings, onChange }: ColorPanelProps) {
  const colors = settings.colors;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Brand Colors</h3>
        <div className="space-y-1">
          <ColorInput
            label="Primary"
            value={colors.primary}
            onChange={(v) => onChange('colors.primary', v)}
            tooltipKey="primary"
          />
          <ColorInput
            label="Secondary"
            value={colors.secondary}
            onChange={(v) => onChange('colors.secondary', v)}
            tooltipKey="secondary"
          />
          <ColorInput
            label="Accent"
            value={colors.accent}
            onChange={(v) => onChange('colors.accent', v)}
            tooltipKey="accent"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Background</h3>
        <div className="space-y-1">
          <ColorInput
            label="Background"
            value={colors.background}
            onChange={(v) => onChange('colors.background', v)}
            tooltipKey="background"
          />
          <ColorInput
            label="Surface"
            value={colors.surface}
            onChange={(v) => onChange('colors.surface', v)}
            tooltipKey="surface"
          />
          <ColorInput
            label="Border"
            value={colors.border}
            onChange={(v) => onChange('colors.border', v)}
            tooltipKey="border"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Text</h3>
        <div className="space-y-1">
          <ColorInput
            label="Heading"
            value={colors.heading}
            onChange={(v) => onChange('colors.heading', v)}
            tooltipKey="heading"
          />
          <ColorInput
            label="Body Text"
            value={colors.text}
            onChange={(v) => onChange('colors.text', v)}
            tooltipKey="text"
          />
          <ColorInput
            label="Muted Text"
            value={colors.textMuted}
            onChange={(v) => onChange('colors.textMuted', v)}
            tooltipKey="textMuted"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Links</h3>
        <div className="space-y-1">
          <ColorInput
            label="Link Color"
            value={colors.link}
            onChange={(v) => onChange('colors.link', v)}
            tooltipKey="link"
          />
          <ColorInput
            label="Link Hover"
            value={colors.linkHover}
            onChange={(v) => onChange('colors.linkHover', v)}
            tooltipKey="linkHover"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-white mb-3">Status Colors</h3>
        <div className="space-y-1">
          <ColorInput
            label="Success"
            value={colors.success || '#10B981'}
            onChange={(v) => onChange('colors.success', v)}
            tooltipKey="success"
          />
          <ColorInput
            label="Warning"
            value={colors.warning || '#F59E0B'}
            onChange={(v) => onChange('colors.warning', v)}
            tooltipKey="warning"
          />
          <ColorInput
            label="Error"
            value={colors.error || '#EF4444'}
            onChange={(v) => onChange('colors.error', v)}
            tooltipKey="error"
          />
        </div>
      </div>
    </div>
  );
}

