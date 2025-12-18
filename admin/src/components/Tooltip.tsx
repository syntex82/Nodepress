/**
 * Tooltip Component
 * Beautiful, accessible tooltips with animations and smart positioning
 */

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'default' | 'info' | 'success' | 'warning' | 'help';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  title?: string;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  maxWidth?: number;
  shortcut?: string;
  disabled?: boolean;
}

const variantStyles: Record<TooltipVariant, { bg: string; border: string; icon: string }> = {
  default: { bg: 'bg-gray-900', border: 'border-gray-700', icon: '' },
  info: { bg: 'bg-blue-900', border: 'border-blue-700', icon: 'ℹ️' },
  success: { bg: 'bg-green-900', border: 'border-green-700', icon: '✅' },
  warning: { bg: 'bg-amber-900', border: 'border-amber-700', icon: '⚠️' },
  help: { bg: 'bg-indigo-900', border: 'border-indigo-700', icon: '💡' },
};

export default function Tooltip({
  children,
  content,
  title,
  position = 'top',
  variant = 'default',
  delay = 300,
  maxWidth = 280,
  shortcut,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = window.setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const gap = 10;

    let top = 0, left = 0;

    switch (position) {
      case 'top':
        top = trigger.top - tooltip.height - gap;
        left = trigger.left + (trigger.width - tooltip.width) / 2;
        break;
      case 'bottom':
        top = trigger.bottom + gap;
        left = trigger.left + (trigger.width - tooltip.width) / 2;
        break;
      case 'left':
        top = trigger.top + (trigger.height - tooltip.height) / 2;
        left = trigger.left - tooltip.width - gap;
        break;
      case 'right':
        top = trigger.top + (trigger.height - tooltip.height) / 2;
        left = trigger.right + gap;
        break;
    }

    // Keep tooltip within viewport
    if (left < 10) left = 10;
    if (left + tooltip.width > window.innerWidth - 10) left = window.innerWidth - tooltip.width - 10;
    if (top < 10) top = 10;
    if (top + tooltip.height > window.innerHeight - 10) top = window.innerHeight - tooltip.height - 10;

    setCoords({ top, left });
  }, [isVisible, position]);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const { bg, border, icon } = variantStyles[variant];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          style={{ top: coords.top, left: coords.left, maxWidth }}
          className={`fixed z-[9999] px-3 py-2 rounded-lg ${bg} ${border} border text-white text-sm shadow-xl
            animate-in fade-in zoom-in-95 duration-150`}
        >
          {title && (
            <div className="flex items-center gap-2 mb-1 font-semibold text-white">
              {icon && <span>{icon}</span>}
              <span>{title}</span>
            </div>
          )}
          <div className="text-gray-200 leading-relaxed">{content}</div>
          {shortcut && (
            <div className="mt-2 pt-2 border-t border-gray-700 flex items-center gap-1">
              <span className="text-gray-400 text-xs">Shortcut:</span>
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-xs font-mono text-gray-300">{shortcut}</kbd>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// Quick tooltip wrapper for icons/buttons
export function TooltipIcon({ tooltip, children, ...props }: { tooltip: string; children: ReactNode } & Partial<TooltipProps>) {
  return <Tooltip content={tooltip} {...props}>{children}</Tooltip>;
}

