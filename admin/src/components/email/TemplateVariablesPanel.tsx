/**
 * Template Variables Panel Component
 * Shows available variables with descriptions and examples
 */

import { useState } from 'react';
import { FiChevronDown, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Variable {
  name: string;
  description?: string;
  example?: string;
}

interface TemplateVariablesPanelProps {
  variables?: Variable[];
}

const DEFAULT_VARIABLES: Variable[] = [
  {
    name: 'user.name',
    description: 'Full name of the user',
    example: 'John Doe',
  },
  {
    name: 'user.firstName',
    description: 'First name of the user',
    example: 'John',
  },
  {
    name: 'user.email',
    description: 'Email address of the user',
    example: 'john@example.com',
  },
  {
    name: 'site.name',
    description: 'Name of your website',
    example: 'My Awesome Site',
  },
  {
    name: 'site.url',
    description: 'URL of your website',
    example: 'https://example.com',
  },
  {
    name: 'year',
    description: 'Current year',
    example: '2024',
  },
];

export default function TemplateVariablesPanel({
  variables = DEFAULT_VARIABLES,
}: TemplateVariablesPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const handleCopyVariable = (varName: string) => {
    navigator.clipboard.writeText(`{{${varName}}}`);
    toast.success(`Copied: {{${varName}}}`);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all border-b border-gray-200"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Template Variables</h3>
            <p className="text-xs text-gray-600">Click to insert variables</p>
          </div>
        </div>
        <FiChevronDown
          size={20}
          className={`text-gray-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Variables List */}
      {expanded && (
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {variables.map((variable, index) => (
            <div
              key={index}
              className="p-4 hover:bg-indigo-50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {`{{${variable.name}}}`}
                    </code>
                  </div>
                  {variable.description && (
                    <p className="text-sm text-gray-600 mb-1">{variable.description}</p>
                  )}
                  {variable.example && (
                    <p className="text-xs text-gray-500">
                      Example: <span className="font-mono text-gray-700">{variable.example}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCopyVariable(variable.name)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Copy variable"
                >
                  <FiCopy size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          💡 Use double curly braces {`{{variable}}`} in your template
        </p>
      </div>
    </div>
  );
}

