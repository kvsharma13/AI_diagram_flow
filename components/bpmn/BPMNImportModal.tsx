'use client';

import { useState } from 'react';
import { X, Upload, Code, FileJson, AlertCircle, CheckCircle2, FileCode } from 'lucide-react';
import { parseBPMNXml } from '@/lib/bpmn/bpmnXmlParser';
import { BPMNDiagram } from '@/types/project';

interface BPMNImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: BPMNDiagram) => void;
}

export default function BPMNImportModal({ isOpen, onClose, onImport }: BPMNImportModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'xml'>('json');

  if (!isOpen) return null;

  const handleImport = () => {
    setError('');
    setSuccess(false);
    try {
      if (activeTab === 'json') {
        const parsed = JSON.parse(code);
        onImport(parsed);
      } else {
        const diagram = parseBPMNXml(code);
        onImport(diagram);
      }
      setSuccess(true);
      setTimeout(() => { onClose(); setCode(''); setSuccess(false); }, 1000);
    } catch (err) {
      setError(activeTab === 'json' ? 'Invalid JSON format.' : 'Invalid BPMN XML format.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Code className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import BPMN Diagram</h2>
              <p className="text-sm text-gray-500 mt-0.5">Paste JSON or BPMN XML</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-600" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('json')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'json' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <FileJson className="w-4 h-4 inline mr-1" />JSON
            </button>
            <button onClick={() => setActiveTab('xml')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'xml' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <FileCode className="w-4 h-4 inline mr-1" />BPMN XML
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(''); setSuccess(false); }}
            placeholder={activeTab === 'json' ? '{\n  "nodes": [...],\n  "edges": [...],\n  "swimlanes": [...]\n}' : '<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions ...>'}
            className="w-full h-80 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" /><p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /><p className="text-sm text-green-700">Imported successfully!</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleImport} disabled={!code.trim()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-all">
              <Upload className="w-4 h-4" />Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
