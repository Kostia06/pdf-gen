import type { PDFTemplate } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

export interface EstimateData {
  documentNumber: string;
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  documentDate: string | Date;
  validUntil?: string | Date;
  items: Array<{
    description: string;
    quantity: number;
    unit?: string;
    rate: number;
  }>;
  taxRate?: number;
  notes?: string;
  terms?: string;
}

export const estimateTemplate: PDFTemplate<EstimateData> = {
  id: 'estimate',
  name: 'Estimate',
  config: {
    pageSize: 'letter',
    orientation: 'portrait'
  },

  render: (data, ctx) => {
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const taxAmount = data.taxRate ? subtotal * (data.taxRate / 100) : 0;
    const total = subtotal + taxAmount;

    ctx.heading('ESTIMATE', 1);
    ctx.text(data.documentNumber, { color: '#6b7280', size: 12 });
    ctx.space(0.3);

    ctx.text('FROM', { size: 9, color: '#6b7280', bold: true });
    ctx.space(0.1);
    ctx.text(data.businessName, { bold: true });
    if (data.businessEmail) ctx.text(data.businessEmail);
    if (data.businessPhone) ctx.text(data.businessPhone);
    ctx.space(0.3);

    ctx.text('PREPARED FOR', { size: 9, color: '#6b7280', bold: true });
    ctx.space(0.1);
    ctx.text(data.clientName, { bold: true });
    if (data.clientEmail) ctx.text(data.clientEmail);
    if (data.clientPhone) ctx.text(data.clientPhone);
    if (data.clientAddress) ctx.text(data.clientAddress);
    ctx.space(0.4);

    // Dates
    ctx.rect(ctx.marginLeft, ctx.y, ctx.width, 0.6, { fill: '#f9fafb' });
    ctx.space(0.15);
    let dateStr = `Estimate Date: ${formatDate(data.documentDate)}`;
    if (data.validUntil) dateStr += `    Valid Until: ${formatDate(data.validUntil)}`;
    ctx.text(dateStr);
    ctx.space(0.5);

    // Items
    const rows = data.items.map((item) => [
      item.description,
      String(item.quantity),
      formatCurrency(item.rate),
      formatCurrency(item.quantity * item.rate)
    ]);
    ctx.table(['Description', 'Qty', 'Rate', 'Amount'], rows, { striped: true });

    // Totals
    ctx.space(0.2);
    ctx.text(`Subtotal: ${formatCurrency(subtotal)}`, { align: 'right' });
    if (data.taxRate) {
      ctx.text(`Tax (${data.taxRate}%): ${formatCurrency(taxAmount)}`, { align: 'right' });
    }
    ctx.line();
    ctx.text(`Estimated Total: ${formatCurrency(total)}`, {
      align: 'right',
      bold: true,
      size: 16
    });
    ctx.space(0.5);

    // Notes
    if (data.notes) {
      ctx.text('NOTES', { size: 9, color: '#6b7280', bold: true });
      ctx.space(0.1);
      ctx.text(data.notes, { color: '#6b7280' });
      ctx.space(0.3);
    }

    // Terms
    if (data.terms) {
      ctx.text('TERMS & CONDITIONS', { size: 9, color: '#6b7280', bold: true });
      ctx.space(0.1);
      ctx.text(data.terms, { color: '#6b7280' });
    }
  }
};
