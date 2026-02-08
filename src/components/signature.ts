import type { PDFContext } from '../types';

export interface SignatureBlockOptions {
  labels: string[];
  includeDate?: boolean;
  spacing?: number;
}

export function renderSignatureBlock(ctx: PDFContext, options: SignatureBlockOptions): void {
  const { labels, includeDate = true, spacing = 0.4 } = options;

  ctx.space(0.3);
  ctx.line();
  ctx.space(0.3);
  ctx.heading('Signatures', 2);
  ctx.space(0.3);

  for (const label of labels) {
    ctx.signature(label);
    if (includeDate) {
      ctx.text('Date: _______________', { color: '#6b7280', size: 9 });
    }
    ctx.space(spacing);
  }
}
