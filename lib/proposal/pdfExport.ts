import jsPDF from 'jspdf';
import { ProposalDocument, ProposalSection } from '@/types/project';
import { parseMarkdown, stripMarkdownFormatting } from './markdownParser';

export async function exportToPDF(document: ProposalDocument): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const visibleSections = document.sections
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  const addPage = () => {
    pdf.addPage();
    yPos = margin;
    // Header strip
    pdf.setFillColor(document.branding.primaryColor || '#6366f1');
    pdf.rect(0, 0, pageWidth, 3, 'F');
  };

  const checkPage = (needed: number) => {
    if (yPos + needed > pageHeight - margin) addPage();
  };

  // Cover Page
  const coverSection = visibleSections.find((s) => s.type === 'cover');
  if (coverSection || document.title) {
    // Background
    pdf.setFillColor(document.branding.primaryColor || '#6366f1');
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Title
    pdf.setTextColor('#ffffff');
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    const title = document.title || 'Untitled Proposal';
    pdf.text(title, pageWidth / 2, 100, { align: 'center' });

    // Subtitle
    if (document.subtitle) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(document.subtitle, pageWidth / 2, 115, { align: 'center' });
    }

    // Company
    if (document.branding.companyName) {
      pdf.setFontSize(14);
      pdf.text(document.branding.companyName, pageWidth / 2, 140, { align: 'center' });
    }

    // Author & Date
    pdf.setFontSize(11);
    if (document.author) pdf.text(`Prepared by: ${document.author}`, pageWidth / 2, 160, { align: 'center' });
    if (document.date) pdf.text(document.date, pageWidth / 2, 170, { align: 'center' });
    if (document.version) pdf.text(`Version ${document.version}`, pageWidth / 2, 180, { align: 'center' });

    addPage();
  }

  // Table of Contents
  pdf.setTextColor('#1f2937');
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Table of Contents', margin, yPos + 10);
  yPos += 20;

  const contentSections = visibleSections.filter((s) => s.type !== 'cover');
  contentSections.forEach((section, idx) => {
    checkPage(8);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#4b5563');
    pdf.text(`${idx + 1}. ${section.title}`, margin + 5, yPos);
    yPos += 8;
  });

  // Content Sections
  for (const section of contentSections) {
    addPage();

    // Section heading
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(document.branding.primaryColor || '#6366f1');
    pdf.text(section.title, margin, yPos + 5);
    yPos += 15;

    // Divider
    pdf.setDrawColor(document.branding.primaryColor || '#6366f1');
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, margin + contentWidth, yPos);
    yPos += 10;

    // Helper: render parsed markdown elements to PDF
    const renderElements = (elements: ReturnType<typeof parseMarkdown>) => {
      for (const el of elements) {
        switch (el.type) {
          case 'heading':
            checkPage(12);
            pdf.setFontSize(el.level === 2 ? 16 : el.level === 3 ? 13 : 11);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor('#1f2937');
            pdf.text(stripMarkdownFormatting(el.content), margin, yPos);
            yPos += el.level === 2 ? 10 : 8;
            break;
          case 'paragraph':
            checkPage(8);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor('#374151');
            const lines = pdf.splitTextToSize(stripMarkdownFormatting(el.content), contentWidth);
            pdf.text(lines, margin, yPos);
            yPos += lines.length * 5 + 3;
            break;
          case 'bullet':
            checkPage(7);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor('#374151');
            pdf.text(`  •  ${stripMarkdownFormatting(el.content)}`, margin, yPos);
            yPos += 6;
            break;
          case 'numbered':
            checkPage(7);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor('#374151');
            pdf.text(`     ${stripMarkdownFormatting(el.content)}`, margin, yPos);
            yPos += 6;
            break;
          case 'table':
            if (el.rows && el.rows.length > 0) {
              const colCount = el.rows[0].length;
              const colWidth = contentWidth / colCount;
              checkPage(10);
              pdf.setFillColor('#f3f4f6');
              pdf.rect(margin, yPos - 4, contentWidth, 8, 'F');
              pdf.setFontSize(9);
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor('#1f2937');
              el.rows[0].forEach((cell, ci) => {
                pdf.text(stripMarkdownFormatting(cell), margin + ci * colWidth + 2, yPos);
              });
              yPos += 8;
              pdf.setFont('helvetica', 'normal');
              pdf.setTextColor('#4b5563');
              for (let ri = 1; ri < el.rows.length; ri++) {
                checkPage(7);
                el.rows[ri].forEach((cell, ci) => {
                  pdf.text(stripMarkdownFormatting(cell).substring(0, 30), margin + ci * colWidth + 2, yPos);
                });
                yPos += 6;
              }
              yPos += 4;
            }
            break;
        }
      }
    };

    // Helper: embed a diagram image with a caption label
    const embedDiagramImage = (snapshot: string, label: string) => {
      checkPage(75);
      try {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor('#6b7280');
        pdf.text(label, margin, yPos);
        yPos += 5;
        pdf.addImage(snapshot, 'PNG', margin, yPos, contentWidth, 60);
        yPos += 65;
      } catch (e) {
        console.error('Failed to add diagram image:', e);
      }
    };

    // Content — split by diagram tokens so each embeds at its exact location
    if (section.content) {
      const diagrams = (section.metadata?.diagrams as Record<string, { snapshot?: string | null; label?: string }>) || {};
      const contentLines = section.content.split('\n');
      const TOKEN_RE = /^\{\{DIAGRAM:(\w+):([a-z0-9]{8}):([^}]+)\}\}$/;
      let textBuffer: string[] = [];

      for (const line of contentLines) {
        const tokenMatch = line.trim().match(TOKEN_RE);
        if (tokenMatch) {
          // Flush accumulated text first
          if (textBuffer.length > 0) {
            renderElements(parseMarkdown(textBuffer.join('\n')));
            textBuffer = [];
          }
          // Embed diagram if snapshot is available
          const uid = tokenMatch[2];
          const label = tokenMatch[3].trim();
          const slot = diagrams[uid];
          if (slot?.snapshot) {
            embedDiagramImage(slot.snapshot, label);
          }
        } else {
          textBuffer.push(line);
        }
      }
      // Flush remaining text
      if (textBuffer.length > 0) {
        renderElements(parseMarkdown(textBuffer.join('\n')));
      }
    }

    // Legacy per-section snapshot (captured via "Insert from Project" button)
    if (section.diagramSnapshot) {
      checkPage(80);
      try {
        pdf.addImage(section.diagramSnapshot, 'PNG', margin, yPos, contentWidth, 60);
        yPos += 65;
      } catch (e) {
        console.error('Failed to add diagram image:', e);
      }
    }
  }

  // Page numbers
  const totalPages = pdf.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor('#9ca3af');
    pdf.text(`Page ${i - 1} of ${totalPages - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  pdf.save(`${document.title || 'proposal'}.pdf`);
}
