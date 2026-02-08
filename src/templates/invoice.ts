import type { PDFTemplate } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

export interface InvoiceData {
  documentNumber: string;
  businessName: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  documentDate: string | Date;
  dueDate: string | Date;
  paymentTerms?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit?: string;
    rate: number;
  }>;
  taxRate?: number;
  notes?: string;
}

export const invoiceTemplate: PDFTemplate<InvoiceData> = {
  id: 'invoice',
  name: 'Invoice',
  config: {
    pageSize: 'letter',
    orientation: 'portrait'
  },

  render: (data, ctx) => {
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const taxAmount = data.taxRate ? subtotal * (data.taxRate / 100) : 0;
    const total = subtotal + taxAmount;

    // Header
    ctx.heading('INVOICE', 1);
    ctx.text(data.documentNumber, { color: '#6b7280', size: 12 });
    ctx.space(0.3);

    ctx.text(data.businessName, { bold: true, size: 14, align: 'right' });
    ctx.space(0.5);

    // From / Bill To
    ctx.text('FROM', { size: 9, color: '#6b7280', bold: true });
    ctx.space(0.1);
    ctx.text(data.businessName, { bold: true });
    if (data.businessEmail) ctx.text(data.businessEmail);
    if (data.businessPhone) ctx.text(data.businessPhone);
    if (data.businessAddress) ctx.text(data.businessAddress);
    ctx.space(0.3);

    ctx.text('BILL TO', { size: 9, color: '#6b7280', bold: true });
    ctx.space(0.1);
    ctx.text(data.clientName, { bold: true });
    if (data.clientEmail) ctx.text(data.clientEmail);
    if (data.clientPhone) ctx.text(data.clientPhone);
    if (data.clientAddress) ctx.text(data.clientAddress);
    ctx.space(0.4);

    // Dates bar
    ctx.rect(ctx.marginLeft, ctx.y, ctx.width, 0.6, { fill: '#f9fafb' });
    ctx.space(0.15);
    ctx.text(
      `Invoice Date: ${formatDate(data.documentDate)}    Due Date: ${formatDate(data.dueDate)}    ${data.paymentTerms || 'Net 30'}`
    );
    ctx.space(0.5);

    // Line items table
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
    ctx.text(`Total: ${formatCurrency(total)}`, { align: 'right', bold: true, size: 16 });
    ctx.space(0.4);

    // Amount due box
    ctx.rect(ctx.marginLeft, ctx.y, ctx.width, 0.7, { fill: '#0066FF' });
    ctx.space(0.25);
    ctx.text(`Amount Due: ${formatCurrency(total)}`, {
      color: '#ffffff',
      bold: true,
      size: 18
    });
    ctx.space(0.5);

    // Notes
    if (data.notes) {
      ctx.text('NOTES', { size: 9, color: '#6b7280', bold: true });
      ctx.space(0.1);
      ctx.text(data.notes, { color: '#6b7280' });
    }
  },

  html: (data) => {
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const taxAmount = data.taxRate ? subtotal * (data.taxRate / 100) : 0;
    const total = subtotal + taxAmount;

    return `
      <div style="padding: 48px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h1 style="font-size: 32px; font-weight: 700; color: #0066FF; margin: 0 0 4px;">INVOICE</h1>
        <p style="color: #6b7280; font-family: monospace; font-size: 12px;">${escapeHtml(data.documentNumber)}</p>

        <div style="display: flex; justify-content: space-between; margin: 32px 0;">
          <div>
            <p style="font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px;">From</p>
            <p style="font-weight: 700; font-size: 14px;">${escapeHtml(data.businessName)}</p>
            ${data.businessEmail ? `<p style="font-size: 11px; color: #1a1a1a;">${escapeHtml(data.businessEmail)}</p>` : ''}
            ${data.businessPhone ? `<p style="font-size: 11px; color: #1a1a1a;">${escapeHtml(data.businessPhone)}</p>` : ''}
            ${data.businessAddress ? `<p style="font-size: 11px; color: #1a1a1a;">${escapeHtml(data.businessAddress)}</p>` : ''}
          </div>
          <div>
            <p style="font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px;">Bill To</p>
            <p style="font-weight: 700; font-size: 14px;">${escapeHtml(data.clientName)}</p>
            ${data.clientEmail ? `<p style="font-size: 11px; color: #1a1a1a;">${escapeHtml(data.clientEmail)}</p>` : ''}
            ${data.clientPhone ? `<p style="font-size: 11px; color: #1a1a1a;">${escapeHtml(data.clientPhone)}</p>` : ''}
            ${data.clientAddress ? `<p style="font-size: 11px; color: #1a1a1a;">${escapeHtml(data.clientAddress)}</p>` : ''}
          </div>
        </div>

        <div style="display: flex; gap: 150px; padding: 14px 24px; background: #f5f5f5; border-radius: 6px; margin-bottom: 32px;">
          <div>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Invoice Date</span><br>
            <span style="font-size: 11px; font-weight: 600;">${formatDate(data.documentDate)}</span>
          </div>
          <div>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Due Date</span><br>
            <span style="font-size: 11px; font-weight: 600;">${formatDate(data.dueDate)}</span>
          </div>
          ${data.paymentTerms ? `<div>
            <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Payment Terms</span><br>
            <span style="font-size: 11px; font-weight: 600;">${escapeHtml(data.paymentTerms)}</span>
          </div>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 10px 0; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Description</th>
              <th style="text-align: right; padding: 10px 0; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Qty</th>
              <th style="text-align: right; padding: 10px 0; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Rate</th>
              <th style="text-align: right; padding: 10px 0; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.items
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 14px 0; font-size: 11px; font-weight: 600;">${escapeHtml(item.description)}</td>
                <td style="text-align: right; padding: 14px 0; font-size: 11px; font-family: monospace; color: #6b7280;">${item.quantity}</td>
                <td style="text-align: right; padding: 14px 0; font-size: 11px; font-family: monospace; color: #6b7280;">${formatCurrency(item.rate)}</td>
                <td style="text-align: right; padding: 14px 0; font-size: 11px; font-family: monospace; font-weight: 700;">${formatCurrency(item.quantity * item.rate)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div style="width: 220px; margin-left: auto;">
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px;">
            <span style="color: #6b7280;">Subtotal</span>
            <span style="font-family: monospace;">${formatCurrency(subtotal)}</span>
          </div>
          ${data.taxRate ? `
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px;">
            <span style="color: #6b7280;">Tax (${data.taxRate}%)</span>
            <span style="font-family: monospace;">${formatCurrency(taxAmount)}</span>
          </div>` : ''}
          <div style="display: flex; justify-content: space-between; padding-top: 10px; margin-top: 8px; border-top: 2px solid #1a1a1a;">
            <span style="font-size: 14px; font-weight: 700;">Total</span>
            <span style="font-size: 20px; font-weight: 700; font-family: monospace;">${formatCurrency(total)}</span>
          </div>
        </div>

        <div style="background: #0066FF; color: white; padding: 18px 24px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
          <span style="font-size: 12px; font-weight: 500;">Amount Due</span>
          <span style="font-size: 24px; font-weight: 700; font-family: monospace;">${formatCurrency(total)}</span>
        </div>

        ${data.notes ? `
        <div style="margin-top: 32px;">
          <p style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 6px;">Notes</p>
          <p style="font-size: 10px; color: #6b7280; line-height: 1.5;">${escapeHtml(data.notes)}</p>
        </div>` : ''}

        <div style="text-align: center; margin-top: auto; padding-top: 16px; font-size: 11px; color: #0066FF;">
          Powered by mrblu
        </div>
      </div>
    `;
  }
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
