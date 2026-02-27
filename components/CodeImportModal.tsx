'use client';

import { useState } from 'react';
import { X, Upload, Code, FileJson, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CodeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
  type: 'gantt' | 'raci';
}

export default function CodeImportModal({ isOpen, onClose, onImport, type }: CodeImportModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const exampleCode = type === 'gantt' ? `{
  "timelineMonths": 12,
  "timelineUnit": "months",
  "phases": [
    {
      "name": "Planning",
      "startMonth": 1,
      "duration": 2,
      "deliverables": "Project plan, Requirements",
      "color": "blue"
    },
    {
      "name": "Development",
      "startMonth": 3,
      "duration": 6,
      "deliverables": "Core features, Testing",
      "color": "green"
    },
    {
      "name": "Launch",
      "startMonth": 9,
      "duration": 1,
      "deliverables": "Production deployment",
      "color": "purple"
    }
  ]
}` : `{
  "tasks": [
    "Design UI",
    "Backend API",
    "Testing",
    "Deployment"
  ],
  "stakeholders": [
    "John (Developer)",
    "Sarah (PM)",
    "Mike (QA)"
  ],
  "assignments": {
    "Design UI": {
      "John": "R/A",
      "Sarah": "C",
      "Mike": "I"
    },
    "Backend API": {
      "John": "R",
      "Sarah": "A",
      "Mike": "I"
    },
    "Testing": {
      "John": "C",
      "Sarah": "A",
      "Mike": "R"
    },
    "Deployment": {
      "John": "R/A",
      "Sarah": "I",
      "Mike": "C"
    }
  }
}`;

  const handleImport = () => {
    setError('');
    setSuccess(false);

    try {
      const parsed = JSON.parse(code);
      onImport(parsed);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setCode('');
        setSuccess(false);
      }, 1000);
    } catch (err) {
      setError('Invalid JSON format. Please check your syntax.');
    }
  };

  const loadExample = () => {
    setCode(exampleCode);
    setError('');
    setSuccess(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Import {type === 'gantt' ? 'Gantt Chart' : 'RACI Matrix'} from Code
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Paste your JSON code below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <FileJson className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">How to use</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Paste your JSON code in the editor below</li>
                  <li>• Click "Load Example" to see the format</li>
                  {type === 'raci' && <li>• Supports dual marks like "R/A", "C/I"</li>}
                  <li>• Click "Import" to load the data</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">JSON Code</label>
              <button
                onClick={loadExample}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <FileJson className="w-4 h-4" />
                Load Example
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
                setSuccess(false);
              }}
              placeholder={`Paste your JSON code here...\n\nExample:\n${exampleCode.substring(0, 200)}...`}
              className="w-full h-96 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Import Error</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">Import Successful!</h4>
                <p className="text-sm text-green-700">Your data has been imported successfully.</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!code.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
