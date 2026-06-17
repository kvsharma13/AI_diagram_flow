import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, Header, Footer, PageNumber,
} from 'docx';
import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { captureDiagramSnapshot } from '@/lib/proposal/diagramSnapshot';
import { buildModuleExport, EXPORTABLE_MODULE_IDS, type ModuleExport, type ExportFormat, type ExportTable } from './model';
import type { Project } from '@/types/project';

/* Heavy export builders — this module is dynamically imported so docx/jspdf/
   exceljs/jszip never load until the user actually exports. Header/footer
   branding (Project · Module · Date · Page X of Y) is applied consistently. */

const sanitize = (x: string) => (x || 'untitled').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'untitled';
const dateStamp = () => new Date().toISOString().slice(0, 10);
const getBranding = (project: Project) => ({ projectName: project.name || 'Project', date: new Date().toLocaleDateString() });
const fileName = (project: Project, model: ModuleExport, ext: string) => `${sanitize(project.name)}_${sanitize(model.moduleName)}_${dateStamp()}.${ext}`;

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function capturePngBlob(id?: string): Promise<Blob | null> {
  if (!id) return null;
  const dataUrl = await captureDiagramSnapshot(id);
  if (!dataUrl) return null;
  const res = await fetch(dataUrl);
  return await res.blob();
}

/* ── Word ── */
function docxTable(t: ExportTable): Table {
  const header = new TableRow({
    children: t.columns.map((c) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: c, bold: true, size: 18 })] })] })),
    tableHeader: true,
  });
  const rows = t.rows.map((r) => new TableRow({
    children: r.map((cell) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(cell ?? ''), size: 18 })] })] })),
  }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] });
}

export async function toDocx(model: ModuleExport, project: Project): Promise<Blob> {
  const branding = getBranding(project);
  const children: (Paragraph | Table)[] = [new Paragraph({ text: model.title, heading: HeadingLevel.HEADING_1 })];
  for (const sec of model.sections) {
    if (sec.heading) children.push(new Paragraph({ text: sec.heading, heading: HeadingLevel.HEADING_2 }));
    if (sec.body) sec.body.split('\n').forEach((line) => children.push(new Paragraph({ children: [new TextRun({ text: line, size: 20 })] })));
    if (sec.table) children.push(docxTable(sec.table));
    children.push(new Paragraph({ text: '' }));
  }
  const doc = new Document({
    sections: [{
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${branding.projectName}  —  ${model.moduleName}`, size: 16, color: '9ca3af' })] })] }),
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: `${branding.date}    Page `, size: 16, color: '9ca3af' }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '9ca3af' }),
          new TextRun({ text: ' of ', size: 16, color: '9ca3af' }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '9ca3af' }),
        ] })] }),
      },
      children,
    }],
  });
  return await Packer.toBlob(doc);
}

/* ── PDF ── */
function drawPdfTable(pdf: jsPDF, table: ExportTable, x: number, width: number, cur: { y: number }, ensure: (h: number) => void) {
  const n = table.columns.length || 1;
  const colW = width / n;
  const lineH = 10;
  const pad = 3;
  const drawRow = (cells: string[], bold: boolean) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(7.5);
    const cellLines = cells.map((c) => pdf.splitTextToSize(String(c ?? ''), colW - pad * 2) as string[]);
    const rowH = Math.max(1, ...cellLines.map((l) => l.length)) * lineH + pad * 2;
    ensure(rowH);
    if (bold) { pdf.setFillColor(243, 244, 246); pdf.rect(x, cur.y, width, rowH, 'F'); }
    cellLines.forEach((lines, ci) => lines.forEach((ln, li) => pdf.text(ln, x + ci * colW + pad, cur.y + pad + (li + 1) * lineH - 2)));
    pdf.setDrawColor(225);
    pdf.line(x, cur.y + rowH, x + width, cur.y + rowH);
    cur.y += rowH;
  };
  drawRow(table.columns, true);
  table.rows.forEach((r) => drawRow(r, false));
}

export async function toPdf(model: ModuleExport, project: Project): Promise<Blob> {
  const branding = getBranding(project);
  const wide = model.sections.some((s) => s.table && s.table.columns.length > 6);
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: wide ? 'landscape' : 'portrait' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const M = 40;
  const contentW = pageW - M * 2;
  const cur = { y: M + 18 };
  const ensure = (h: number) => { if (cur.y + h > pageH - 44) { pdf.addPage(); cur.y = M + 18; } };

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(model.title, M, cur.y);
  cur.y += 24;

  if (model.diagramElementId) {
    const dataUrl = await captureDiagramSnapshot(model.diagramElementId);
    if (dataUrl) {
      let imgW = contentW;
      let imgH = contentW * 0.58;
      if (imgH > pageH - 170) { imgH = pageH - 170; imgW = imgH / 0.58; }
      ensure(imgH);
      try { pdf.addImage(dataUrl, 'PNG', M, cur.y, imgW, imgH); cur.y += imgH + 16; } catch { /* ignore */ }
    }
  }

  for (const sec of model.sections) {
    if (sec.heading) { ensure(22); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.text(sec.heading, M, cur.y); cur.y += 16; }
    if (sec.body) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(sec.body, contentW) as string[];
      for (const ln of lines) { ensure(13); pdf.text(ln, M, cur.y); cur.y += 13; }
      cur.y += 6;
    }
    if (sec.table) { drawPdfTable(pdf, sec.table, M, contentW, cur, ensure); cur.y += 12; }
  }

  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`${branding.projectName} — ${model.moduleName}`, M, 26);
    pdf.text(branding.date, M, pageH - 22);
    pdf.text(`Page ${i} of ${pages}`, pageW - M, pageH - 22, { align: 'right' });
    pdf.setTextColor(0);
  }
  return pdf.output('blob');
}

/* ── Excel ── */
export async function toXlsx(model: ModuleExport, project: Project): Promise<Blob> {
  const branding = getBranding(project);
  const wb = new ExcelJS.Workbook();
  const used = new Set<string>();
  const uniqueName = (base: string) => {
    let name = (base || 'Sheet').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'Sheet';
    let n = name;
    let i = 2;
    while (used.has(n)) { n = `${name.slice(0, 25)} ${i++}`; }
    used.add(n);
    return n;
  };

  const tables = model.sections.filter((s) => s.table);
  if (!tables.length) {
    const ws = wb.addWorksheet(uniqueName(model.moduleName));
    model.sections.forEach((sec) => {
      if (sec.heading) { const r = ws.addRow([sec.heading]); r.font = { bold: true }; }
      if (sec.body) ws.addRow([sec.body]);
      ws.addRow([]);
    });
    ws.getColumn(1).width = 90;
    ws.headerFooter.oddHeader = `&L${branding.projectName}&R${model.moduleName}`;
    ws.headerFooter.oddFooter = `&L${branding.date}&RPage &P of &N`;
  } else {
    tables.forEach((sec) => {
      const ws = wb.addWorksheet(uniqueName(sec.heading || sec.table!.title || model.moduleName));
      const header = ws.addRow(sec.table!.columns);
      header.font = { bold: true };
      sec.table!.rows.forEach((r) => ws.addRow(r));
      sec.table!.columns.forEach((_, ci) => { ws.getColumn(ci + 1).width = 26; });
      ws.headerFooter.oddHeader = `&L${branding.projectName}&R${model.moduleName}`;
      ws.headerFooter.oddFooter = `&L${branding.date}&RPage &P of &N`;
    });
  }
  const buf = await wb.xlsx.writeBuffer();
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function buildBlob(model: ModuleExport, project: Project, fmt: ExportFormat): Promise<Blob | null> {
  if (fmt === 'png') return capturePngBlob(model.diagramElementId);
  if (fmt === 'docx') return toDocx(model, project);
  if (fmt === 'xlsx') return toXlsx(model, project);
  return toPdf(model, project);
}

export async function exportModuleAs(project: Project, moduleId: string, fmt: ExportFormat): Promise<void> {
  const model = buildModuleExport(project, moduleId);
  const blob = await buildBlob(model, project, fmt);
  if (!blob) throw new Error(fmt === 'png' ? 'Nothing to capture — open this diagram tab first.' : 'Export produced no file.');
  saveBlob(blob, fileName(project, model, fmt));
}

/* Bundle every module into one ZIP (one primary doc per module). Pure-diagram
   modules are included only if their canvas happens to be mounted to capture. */
export async function exportAllZip(project: Project): Promise<number> {
  const zip = new JSZip();
  let added = 0;
  for (const id of EXPORTABLE_MODULE_IDS) {
    const model = buildModuleExport(project, id);
    try {
      // pure-diagram module (no tabular/text content): only via PNG if mounted
      if (model.diagramElementId && model.sections.length === 0) {
        const png = await capturePngBlob(model.diagramElementId);
        if (png) { zip.file(`${model.moduleName}/${fileName(project, model, 'png')}`, png); added++; }
        continue;
      }
      const fmt: ExportFormat = model.formats.includes('docx') ? 'docx' : model.formats.includes('xlsx') ? 'xlsx' : 'pdf';
      const blob = await buildBlob(model, project, fmt);
      if (blob) { zip.file(`${model.moduleName}/${fileName(project, model, fmt)}`, blob); added++; }
    } catch (e) {
      console.warn('Export All: skipped', id, e);
    }
  }
  const out = await zip.generateAsync({ type: 'blob' });
  saveBlob(out, `${sanitize(project.name)}_BA_export_${dateStamp()}.zip`);
  return added;
}
