import { jsPDF } from 'jspdf';
import type { Canvas } from 'fabric';
import type { TitleBlockData, Sheet } from '../stores/useSheetStore';

// ─── Page sizes (width × height, landscape, in mm) ────────────────────────
export const PAGE_SIZES = {
  'LETTER (8.5×11)': { w: 279.4, h: 215.9 },
  'ANSI B (11×17)':  { w: 431.8, h: 279.4 },
  'ANSI D (34×22)':  { w: 863.6, h: 558.8 },
  'A4':              { w: 297,   h: 210   },
  'A1':              { w: 841,   h: 594   },
} as const;
export type PageSizeName = keyof typeof PAGE_SIZES;

// ─── Title block constants ─────────────────────────────────────────────────
const TB_H = 38;   // height of title block strip in mm
const MARGIN = 10; // page margin in mm

// ─── Draw title block via jsPDF primitives ─────────────────────────────────
function drawTitleBlock(
  doc: jsPDF,
  tb: TitleBlockData,
  sheet: Sheet,
  sheetNumber: number,
  totalSheets: number,
  pageW: number,
  pageH: number,
) {
  const x0 = MARGIN;
  const y0 = pageH - TB_H - MARGIN;
  const w  = pageW - MARGIN * 2;
  const h  = TB_H;

  // Outer border
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.rect(x0, y0, w, h);

  // Vertical dividers  — split title block into 4 sections
  const col1 = x0 + w * 0.35; // project info | drawing info
  const col2 = x0 + w * 0.65; // drawing info | stamp area
  const col3 = x0 + w * 0.82; // stamp area   | sheet info

  doc.setLineWidth(0.3);
  doc.line(col1, y0, col1, y0 + h);
  doc.line(col2, y0, col2, y0 + h);
  doc.line(col3, y0, col3, y0 + h);

  // Horizontal dividers inside left section
  const hMid = y0 + h * 0.5;
  doc.line(x0, hMid, col1, hMid);

  // ── Project info (left section) ──
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('PROJECT', x0 + 2, y0 + 4);
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text(tb.projectName || '—', x0 + 2, y0 + 9, { maxWidth: col1 - x0 - 4 });

  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('CLIENT', x0 + 2, y0 + 15);
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text(tb.client || '—', x0 + 2, y0 + 19.5, { maxWidth: col1 - x0 - 4 });

  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('ADDRESS', x0 + 2, hMid + 4);
  doc.setFontSize(7);
  doc.setTextColor(20, 20, 20);
  doc.text(tb.address || '—', x0 + 2, hMid + 8.5, { maxWidth: col1 - x0 - 4 });

  // ── Drawing info (centre-left section) ──
  const c1x = col1 + 2;
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('DRAWING TITLE', c1x, y0 + 4);
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text(sheet.name, c1x, y0 + 9, { maxWidth: col2 - col1 - 4 });

  // Horizontal divider rows in centre section
  const rowH = h / 4;
  for (let r = 1; r < 4; r++) {
    doc.setLineWidth(0.2);
    doc.line(col1, y0 + rowH * r, col2, y0 + rowH * r);
  }

  const rows = [
    { label: 'DRAWN BY',    val: tb.drawnBy   || '—' },
    { label: 'CHECKED BY',  val: tb.checkedBy || '—' },
    { label: 'ENGINEER',    val: tb.engineer  || '—' },
    { label: 'SCALE',       val: tb.scale     || '—' },
  ];
  rows.forEach(({ label, val }, i) => {
    const ry = y0 + rowH * i;
    doc.setFontSize(5);
    doc.setTextColor(100, 100, 100);
    doc.text(label, c1x, ry + 3.5);
    doc.setFontSize(7.5);
    doc.setTextColor(20, 20, 20);
    doc.text(val, c1x, ry + 7.5, { maxWidth: col2 - col1 - 4 });
  });

  // ── Stamp area (centre-right) ──
  const c2x = col2 + 2;
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('ENGINEER STAMP / SIGNATURE', c2x, y0 + 4);
  // Blank box
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.rect(c2x, y0 + 6, col3 - col2 - 4, h - 10);

  // ── Sheet info (right section) ──
  const c3x = col3 + 2;
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('PROJECT NO.', c3x, y0 + 4);
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text(tb.projectNumber || '—', c3x, y0 + 8);

  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('DATE', c3x, y0 + 14);
  doc.setFontSize(8);
  doc.setTextColor(20, 20, 20);
  doc.text(new Date().toLocaleDateString(), c3x, y0 + 18);

  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('SHEET', c3x, y0 + 24);
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text(`${sheetNumber} / ${totalSheets}`, c3x, y0 + 30);

  // Page border
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.8);
  doc.rect(MARGIN, MARGIN, pageW - MARGIN * 2, pageH - MARGIN * 2);
}

// ─── Export current sheet as PDF ───────────────────────────────────────────
export async function exportSheetPDF(
  canvas: Canvas,
  sheet: Sheet,
  sheetIndex: number,
  totalSheets: number,
  titleBlock: TitleBlockData,
  pageSize: PageSizeName = 'ANSI B (11×17)',
): Promise<void> {
  const { w: pageW, h: pageH } = PAGE_SIZES[pageSize];

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [pageW, pageH],
  });

  // Canvas drawing area (above title block)
  const drawW = pageW - MARGIN * 2;
  const drawH = pageH - MARGIN * 2 - TB_H - 2; // 2 mm gap

  // Rasterise canvas content
  const imgData = canvas.toDataURL({ format: 'png', multiplier: 2 });

  doc.addImage(imgData, 'PNG', MARGIN, MARGIN, drawW, drawH);

  drawTitleBlock(doc, titleBlock, sheet, sheetIndex + 1, totalSheets, pageW, pageH);

  const safeName = sheet.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  doc.save(`${safeName}-${Date.now()}.pdf`);
}

// ─── Export ALL sheets as a multi-page PDF ─────────────────────────────────
export async function exportAllSheetsPDF(
  canvasGetter: (json: string | null) => Promise<string>,
  sheets: Sheet[],
  titleBlock: TitleBlockData,
  pageSize: PageSizeName = 'ANSI B (11×17)',
): Promise<void> {
  const { w: pageW, h: pageH } = PAGE_SIZES[pageSize];

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [pageW, pageH],
  });

  const drawW = pageW - MARGIN * 2;
  const drawH = pageH - MARGIN * 2 - TB_H - 2;

  for (let i = 0; i < sheets.length; i++) {
    if (i > 0) doc.addPage([pageW, pageH], 'landscape');

    const imgData = await canvasGetter(sheets[i].canvasJson);
    if (imgData) doc.addImage(imgData, 'PNG', MARGIN, MARGIN, drawW, drawH);

    drawTitleBlock(doc, titleBlock, sheets[i], i + 1, sheets.length, pageW, pageH);
  }

  const safeName = (titleBlock.projectName || 'project').replace(/[^a-z0-9]/gi, '-').toLowerCase();
  doc.save(`${safeName}-${Date.now()}.pdf`);
}
