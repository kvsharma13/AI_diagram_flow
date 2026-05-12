'use client';

import { X } from 'lucide-react';
import { ProposalBranding } from '@/types/project';

interface BrandingSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  branding: ProposalBranding;
  onUpdate: (branding: ProposalBranding) => void;
}

export default function BrandingSettings({ isOpen, onClose, branding, onUpdate }: BrandingSettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Branding Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Company Name</label>
            <input
              type="text"
              value={branding.companyName}
              onChange={(e) => onUpdate({ ...branding, companyName: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Primary Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => onUpdate({ ...branding, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => onUpdate({ ...branding, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Secondary Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => onUpdate({ ...branding, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => onUpdate({ ...branding, secondaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Font Family</label>
            <select
              value={branding.fontFamily}
              onChange={(e) => onUpdate({ ...branding, fontFamily: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Inter">Inter</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Georgia">Georgia</option>
              <option value="Helvetica">Helvetica</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Header Style</label>
            <select
              value={branding.headerStyle}
              onChange={(e) => onUpdate({ ...branding, headerStyle: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-500 mb-2 uppercase font-medium">Preview</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: branding.primaryColor }} />
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: branding.secondaryColor }} />
              <span className="text-sm font-medium" style={{ fontFamily: branding.fontFamily }}>
                {branding.companyName || 'Company Name'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
