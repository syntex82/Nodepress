/**
 * Responsive Preview Component
 * Preview customizations at different viewport sizes
 */

import { FiMonitor, FiTablet, FiSmartphone, FiMaximize2 } from 'react-icons/fi';

export type ViewportSize = 'desktop' | 'tablet' | 'mobile' | 'full';

interface ViewportOption {
  id: ViewportSize;
  label: string;
  icon: React.ReactNode;
  width: number | '100%';
  height?: number;
}

export const VIEWPORT_OPTIONS: ViewportOption[] = [
  { id: 'full', label: 'Full Width', icon: <FiMaximize2 size={18} />, width: '100%' },
  { id: 'desktop', label: 'Desktop', icon: <FiMonitor size={18} />, width: 1280 },
  { id: 'tablet', label: 'Tablet', icon: <FiTablet size={18} />, width: 768 },
  { id: 'mobile', label: 'Mobile', icon: <FiSmartphone size={18} />, width: 375 },
];

interface ResponsivePreviewProps {
  currentViewport: ViewportSize;
  onViewportChange: (viewport: ViewportSize) => void;
}

export default function ResponsivePreview({ currentViewport, onViewportChange }: ResponsivePreviewProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
      {VIEWPORT_OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => onViewportChange(option.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
            currentViewport === option.id
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
          title={option.label}
        >
          {option.icon}
          <span className="text-sm hidden lg:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

export function getViewportWidth(viewport: ViewportSize): number | '100%' {
  const option = VIEWPORT_OPTIONS.find(v => v.id === viewport);
  return option?.width || '100%';
}

