'use client';

import { ProposalDocument, ProposalBranding } from '@/types/project';

interface CoverPageEditorProps {
  document: ProposalDocument;
  onUpdateMeta: (meta: { title?: string; subtitle?: string; author?: string; version?: string }) => void;
  onUpdateBranding: (branding: ProposalBranding) => void;
}

export default function CoverPageEditor({ document, onUpdateMeta, onUpdateBranding }: CoverPageEditorProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Editor Fields */}
      <div className="w-80 border-r border-gray-200 overflow-y-auto p-6 space-y-5">
        <h3 className="font-semibold text-gray-800">Cover Page Details</h3>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Document Title</label>
          <input
            type="text"
            value={document.title || ''}
            onChange={(e) => onUpdateMeta({ title: e.target.value })}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Project Proposal"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Subtitle</label>
          <input
            type="text"
            value={document.subtitle || ''}
            onChange={(e) => onUpdateMeta({ subtitle: e.target.value })}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="For [Client Name]"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Company Name</label>
          <input
            type="text"
            value={document.branding.companyName || ''}
            onChange={(e) => onUpdateBranding({ ...document.branding, companyName: e.target.value })}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Your Company"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Author</label>
          <input
            type="text"
            value={document.author || ''}
            onChange={(e) => onUpdateMeta({ author: e.target.value })}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Author Name"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
            <input
              type="date"
              value={document.date || ''}
              onChange={(e) => onUpdateMeta({ ...document as any, date: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Version</label>
            <input
              type="text"
              value={document.version || ''}
              onChange={(e) => onUpdateMeta({ version: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="1.0"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Primary Color</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              value={document.branding.primaryColor || '#6366f1'}
              onChange={(e) => onUpdateBranding({ ...document.branding, primaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border-0"
            />
            <input
              type="text"
              value={document.branding.primaryColor || '#6366f1'}
              onChange={(e) => onUpdateBranding({ ...document.branding, primaryColor: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex items-start justify-center">
        <div
          className="w-[595px] h-[842px] bg-white shadow-2xl rounded-lg overflow-hidden relative"
          style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}
        >
          {/* Colored background */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: document.branding.primaryColor || '#6366f1' }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
            {/* Logo placeholder */}
            {document.branding.companyLogo ? (
              <img src={document.branding.companyLogo} alt="Logo" className="h-16 mb-8 object-contain" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-8">
                <span className="text-2xl font-bold">{(document.branding.companyName || 'P')[0]}</span>
              </div>
            )}

            <h1 className="text-4xl font-bold text-center mb-4 leading-tight">
              {document.title || 'Document Title'}
            </h1>
            {document.subtitle && (
              <p className="text-xl opacity-90 text-center mb-8">{document.subtitle}</p>
            )}

            <div className="mt-auto space-y-2 text-center opacity-80">
              {document.branding.companyName && (
                <p className="text-lg">{document.branding.companyName}</p>
              )}
              {document.author && <p className="text-sm">Prepared by: {document.author}</p>}
              {document.date && <p className="text-sm">{document.date}</p>}
              {document.version && <p className="text-sm">Version {document.version}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
