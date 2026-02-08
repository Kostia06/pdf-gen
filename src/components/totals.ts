import type { PDFContext } from '../types';
import { formatCurrency } from '../utils/format';

export interface TotalsOptions {
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  amountDueLabel?: string;
  showAmountDueBox?: boolean;
}

export function renderTotals(ctx: PDFContext, options: TotalsOptions): void {
  ctx.space(0.2);
  ctx.text(`Subtotal: ${formatCurrency(options.subtotal)}`, { align: 'right' });

  if (options.taxRate && options.taxAmount) {
    ctx.text(`Tax (${options.taxRate}%): ${formatCurrency(options.taxAmount)}`, {
      align: 'right'
    });
  }

  ctx.line();
  ctx.text(`Total: ${formatCurrency(options.total)}`, {
    align: 'right',
    bold: true,
    size: 16
  });

  if (options.showAmountDueBox) {
    ctx.space(0.4);
    ctx.rect(ctx.marginLeft, ctx.y, ctx.width, 0.7, { fill: '#0066FF' });
    ctx.space(0.25);
    ctx.text(
      `${options.amountDueLabel || 'Amount Due'}: ${formatCurrency(options.total)}`,
      { color: '#ffffff', bold: true, size: 18 }
    );
    ctx.space(0.5);
  }
}
