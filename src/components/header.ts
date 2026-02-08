import type { PDFContext } from '../types';

export interface HeaderOptions {
  title: string;
  subtitle?: string;
  color?: string;
}

export function renderHeader(ctx: PDFContext, options: HeaderOptions): void {
  ctx.heading(options.title, 1);
  if (options.subtitle) {
    ctx.text(options.subtitle, { color: options.color || '#6b7280', size: 12 });
  }
  ctx.space(0.3);
}
