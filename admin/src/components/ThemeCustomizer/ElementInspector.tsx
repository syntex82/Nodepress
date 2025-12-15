/**
 * Element Inspector Component
 * Click-to-select elements in the preview iframe to customize them directly
 */

import { useState } from 'react';
import { FiTarget, FiX, FiCopy, FiCheck, FiCode } from 'react-icons/fi';

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

interface ElementInspectorProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  selectedElement: ElementInfo | null;
  onGenerateCSS: (css: string) => void;
}

export default function ElementInspector({ isEnabled, onToggle, selectedElement, onGenerateCSS }: ElementInspectorProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyValue = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const generateSelector = (): string => {
    if (!selectedElement) return '';
    let selector = selectedElement.tagName;
    if (selectedElement.id) selector = `#${selectedElement.id}`;
    else if (selectedElement.className) {
      const firstClass = selectedElement.className.split(' ')[0];
      if (firstClass) selector = `.${firstClass}`;
    }
    return selector;
  };

  const generateCSSRule = (): string => {
    if (!selectedElement) return '';
    const selector = generateSelector();
    return `${selector} {\n  /* Add your styles here */\n  color: ${selectedElement.styles.color};\n  background-color: ${selectedElement.styles.backgroundColor};\n  font-size: ${selectedElement.styles.fontSize};\n}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <FiTarget size={16} />
          Element Inspector
        </h3>
        <button
          onClick={() => onToggle(!isEnabled)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            isEnabled
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isEnabled ? 'Inspecting...' : 'Enable'}
        </button>
      </div>

      {isEnabled && !selectedElement && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-400">
            Click on any element in the preview to inspect it.
          </p>
          <p className="text-xs text-blue-400/70 mt-1">
            Elements will be highlighted as you hover over them.
          </p>
        </div>
      )}

      {selectedElement && (
        <div className="space-y-4">
          {/* Element Info */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <code className="text-sm text-cyan-400">
                &lt;{selectedElement.tagName}
                {selectedElement.id && <span className="text-purple-400">#{selectedElement.id}</span>}
                {selectedElement.className && <span className="text-green-400">.{selectedElement.className.split(' ')[0]}</span>}
                &gt;
              </code>
              <button
                onClick={() => onToggle(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <FiX size={14} />
              </button>
            </div>
            {selectedElement.text && (
              <p className="text-xs text-gray-400 truncate">
                "{selectedElement.text}"
              </p>
            )}
          </div>

          {/* Computed Styles */}
          <div>
            <h4 className="text-xs text-gray-400 uppercase mb-2">Computed Styles</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(selectedElement.styles).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-1.5 px-2 bg-gray-700/50 rounded group">
                  <span className="text-gray-400 text-xs">{key.replace(/([A-Z])/g, '-$1').toLowerCase()}</span>
                  <div className="flex items-center gap-2">
                    {(key === 'color' || key === 'backgroundColor') && value !== 'rgba(0, 0, 0, 0)' && (
                      <div className="w-4 h-4 rounded border border-gray-500" style={{ backgroundColor: value }} />
                    )}
                    <span className="text-gray-200 text-xs font-mono">{value}</span>
                    <button
                      onClick={() => copyValue(key, value)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-white transition-opacity"
                    >
                      {copied === key ? <FiCheck size={12} className="text-green-400" /> : <FiCopy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generate CSS */}
          <div className="pt-2 border-t border-gray-700">
            <button
              onClick={() => onGenerateCSS(generateCSSRule())}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FiCode size={14} />
              Add CSS Rule for Element
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

