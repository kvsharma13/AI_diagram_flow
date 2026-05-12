import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageBreak, ImageRun, TableOfContents, Header, Footer, PageNumber,
  NumberFormat, Table, TableRow, TableCell, WidthType, BorderStyle,
} from 'docx';
import { ProposalDocument } from '@/types/project';
import { parseMarkdown, stripMarkdownFormatting } from './markdownParser';

export async function exportToDOCX(document: ProposalDocument): Promise<void> {
  const visibleSections = document.sections
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  const children: any[] = [];

  // Cover page
  children.push(
    new Paragraph({ spacing: { before: 4000 } }),
    new Paragraph({
      children: [new TextRun({ text: document.title || 'Untitled Proposal', bold: true, size: 64, color: document.branding.primaryColor?.replace('#', '') || '6366f1' })],
      alignment: AlignmentType.CENTER,
    }),
  );

  if (document.subtitle) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: document.subtitle, size: 32, color: '6b7280' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
      }),
    );
  }

  if (document.branding.companyName) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: document.branding.companyName, size: 28, color: '374151' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
      }),
    );
  }

  if (document.author) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Prepared by: ${document.author}`, size: 22, color: '6b7280' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
      }),
    );
  }

  if (document.date) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: document.date, size: 22, color: '6b7280' })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
      }),
    );
  }

  // Page break after cover
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Table of Contents
  children.push(
    new Paragraph({
      children: [new TextRun({ text: 'Table of Contents', bold: true, size: 36 })],
      spacing: { after: 400 },
    }),
    new TableOfContents('Table of Contents', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  // Content sections
  const contentSections = visibleSections.filter((s) => s.type !== 'cover');
  for (const section of contentSections) {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),
    );

    if (section.content) {
      const elements = parseMarkdown(section.content);
      for (const el of elements) {
        switch (el.type) {
          case 'heading':
            children.push(
              new Paragraph({
                text: stripMarkdownFormatting(el.content),
                heading: el.level === 2 ? HeadingLevel.HEADING_2 : el.level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4,
                spacing: { before: 240, after: 120 },
              }),
            );
            break;
          case 'paragraph':
            children.push(
              new Paragraph({
                children: parseInlineFormatting(el.content),
                spacing: { after: 120 },
              }),
            );
            break;
          case 'bullet':
            children.push(
              new Paragraph({
                children: parseInlineFormatting(el.content),
                bullet: { level: 0 },
                spacing: { after: 60 },
              }),
            );
            break;
          case 'numbered':
            children.push(
              new Paragraph({
                children: parseInlineFormatting(el.content),
                numbering: { reference: 'default-numbering', level: 0 },
                spacing: { after: 60 },
              }),
            );
            break;
          case 'table':
            if (el.rows && el.rows.length > 0) {
              const tableRows = el.rows.map((row, ri) =>
                new TableRow({
                  children: row.map((cell) =>
                    new TableCell({
                      children: [new Paragraph({ children: [new TextRun({ text: stripMarkdownFormatting(cell), bold: ri === 0, size: 20 })] })],
                      width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
                    }),
                  ),
                }),
              );
              children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
              children.push(new Paragraph({ spacing: { after: 200 } }));
            }
            break;
        }
      }
    }

    // Diagram snapshot
    if (section.diagramSnapshot) {
      try {
        const base64Data = section.diagramSnapshot.split(',')[1];
        if (base64Data) {
          const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
          children.push(
            new Paragraph({
              children: [new ImageRun({ data: imageBuffer, transformation: { width: 600, height: 300 }, type: 'png' })],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            }),
          );
        }
      } catch (e) {
        console.error('Failed to add diagram image:', e);
      }
    }

    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{ level: 0, format: NumberFormat.DECIMAL, text: '%1.', alignment: AlignmentType.START }],
      }],
    },
    sections: [{
      properties: {},
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: document.branding.companyName || '', size: 16, color: '9ca3af' })],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'Page ', size: 16, color: '9ca3af' }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '9ca3af' }),
            ],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${document.title || 'proposal'}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}

function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 22 }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, size: 22 }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New', size: 20 }));
    } else if (part) {
      runs.push(new TextRun({ text: part, size: 22 }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, size: 22 })];
}
