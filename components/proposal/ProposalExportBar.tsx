'use client';

import { useState } from 'react';
import { FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ProposalDocument } from '@/types/project';
import { exportToPDF } from '@/lib/proposal/pdfExport';
import { exportToDOCX } from '@/lib/proposal/docxExport';

interface ProposalExportBarProps {
  document: ProposalDocument;
}

export default function ProposalExportBar({ document }: ProposalExportBarProps) {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingDOCX, setExportingDOCX] = useState(false);

  const handlePDFExport = async () => {
    setExportingPDF(true);
    try {
      await exportToPDF(document);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleDOCXExport = async () => {
    setExportingDOCX(true);
    try {
      await exportToDOCX(document);
    } catch (error) {
      console.error('DOCX export failed:', error);
      alert('DOCX export failed. Please try again.');
    } finally {
      setExportingDOCX(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePDFExport}
        disabled={exportingPDF}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
      >
        {exportingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
        Export PDF
      </button>
      <button
        onClick={handleDOCXExport}
        disabled={exportingDOCX}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
      >
        {exportingDOCX ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
        Export DOCX
      </button>
    </div>
  );
}
