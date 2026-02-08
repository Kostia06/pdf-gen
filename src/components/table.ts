import type { PDFContext, TableOptions } from '../types';

export function renderTable(
  ctx: PDFContext,
  headers: string[],
  rows: string[][],
  options?: TableOptions
): void {
  ctx.table(headers, rows, options);
}
