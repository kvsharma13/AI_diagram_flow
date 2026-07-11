import mammoth from 'mammoth';

// Server-side plain-text extraction for uploaded client documents (PDF/DOCX/TXT).
// unpdf is serverless-friendly (no native deps / no fs test-file quirks).

const MAX_CHARS = 400_000; // guardrail (~100k tokens) for very large documents
const NULL_CHARS = new RegExp(String.fromCharCode(0), 'g');

export const ACCEPTED_EXT = ['.pdf', '.docx', '.txt', '.md'];
export const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

export function isAcceptedFile(fileName: string, fileType: string): boolean {
  const name = (fileName || '').toLowerCase();
  if (ACCEPTED_EXT.some((e) => name.endsWith(e))) return true;
  return ACCEPTED_TYPES.includes((fileType || '').toLowerCase());
}

export interface ExtractResult {
  text: string;
  chars: number;
}

export async function extractText(buffer: Buffer, fileType: string, fileName: string): Promise<ExtractResult> {
  const type = (fileType || '').toLowerCase();
  const name = (fileName || '').toLowerCase();
  let text = '';

  if (type.includes('pdf') || name.endsWith('.pdf')) {
    const { extractText: pdfExtract, getDocumentProxy } = await import('unpdf');
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const res = await pdfExtract(pdf, { mergePages: true });
    text = Array.isArray(res.text) ? res.text.join('\n') : res.text;
  } else if (type.includes('wordprocessing') || type.includes('msword') || name.endsWith('.docx')) {
    const res = await mammoth.extractRawText({ buffer });
    text = res.value;
  } else {
    // txt / md / unknown -> best-effort utf-8
    text = buffer.toString('utf-8');
  }

  text = (text || '')
    .replace(NULL_CHARS, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const truncated = text.slice(0, MAX_CHARS);
  return { text: truncated, chars: truncated.length };
}
