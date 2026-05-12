export interface MarkdownElement {
  type: 'heading' | 'paragraph' | 'bold' | 'italic' | 'bullet' | 'numbered' | 'table' | 'text';
  level?: number;
  content: string;
  children?: MarkdownElement[];
  rows?: string[][];
}

export function parseMarkdown(md: string): MarkdownElement[] {
  const lines = md.split('\n');
  const elements: MarkdownElement[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      elements.push({ type: 'heading', level: headingMatch[1].length, content: headingMatch[2] });
      i++;
      continue;
    }

    // Table detection
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1]?.match(/^\|[\s-:|]+\|/)) {
      const rows: string[][] = [];
      // Header row
      rows.push(line.split('|').filter(Boolean).map(c => c.trim()));
      i++; // skip separator
      i++;
      // Data rows
      while (i < lines.length && lines[i].includes('|')) {
        rows.push(lines[i].split('|').filter(Boolean).map(c => c.trim()));
        i++;
      }
      elements.push({ type: 'table', content: '', rows });
      continue;
    }

    // Bullet list
    if (line.match(/^[\s]*[-*]\s+/)) {
      elements.push({ type: 'bullet', content: line.replace(/^[\s]*[-*]\s+/, '') });
      i++;
      continue;
    }

    // Numbered list
    if (line.match(/^[\s]*\d+\.\s+/)) {
      elements.push({ type: 'numbered', content: line.replace(/^[\s]*\d+\.\s+/, '') });
      i++;
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    elements.push({ type: 'paragraph', content: line });
    i++;
  }

  return elements;
}

export function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1');
}
