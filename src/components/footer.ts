import type { PDFContext } from '../types';

export interface FooterOptions {
  text?: string;
  showPageNumber?: boolean;
}

export function renderFooter(ctx: PDFContext, options: FooterOptions = {}): void {
  ctx.space(0.3);
  ctx.line();
  ctx.space(0.1);

  if (options.text) {
    ctx.text(options.text, { align: 'center', size: 9, color: '#9ca3af' });
  }

  if (options.showPageNumber) {
    ctx.text(`Page ${ctx.pageNumber()}`, { align: 'right', size: 9, color: '#9ca3af' });
  }
}
