import { describe, it, expect } from 'vitest';
import { invoiceTemplate } from './invoice';
import type { InvoiceData } from './invoice';

const sampleInvoice: InvoiceData = {
  documentNumber: 'INV-001',
  businessName: 'Acme Construction',
  businessEmail: 'info@acme.com',
  clientName: 'John Doe',
  clientEmail: 'john@example.com',
  documentDate: '2026-01-15',
  dueDate: '2026-02-15',
  items: [
    { description: 'Flooring', quantity: 200, rate: 5 },
    { description: 'Labor', quantity: 8, rate: 75 }
  ],
  taxRate: 5,
  notes: 'Payment due within 30 days'
};

describe('invoiceTemplate', () => {
  it('has correct id and name', () => {
    expect(invoiceTemplate.id).toBe('invoice');
    expect(invoiceTemplate.name).toBe('Invoice');
  });

  it('has a render function', () => {
    expect(typeof invoiceTemplate.render).toBe('function');
  });

  it('has an html function', () => {
    expect(typeof invoiceTemplate.html).toBe('function');
  });

  it('generates HTML with correct data', () => {
    const html = invoiceTemplate.html!(sampleInvoice);
    expect(html).toContain('INVOICE');
    expect(html).toContain('INV-001');
    expect(html).toContain('Acme Construction');
    expect(html).toContain('John Doe');
    expect(html).toContain('Flooring');
    expect(html).toContain('Labor');
  });

  it('calculates totals correctly in HTML', () => {
    const html = invoiceTemplate.html!(sampleInvoice);
    // Subtotal: 200*5 + 8*75 = 1000 + 600 = 1600
    expect(html).toContain('$1,600.00');
    // Tax: 1600 * 0.05 = 80
    expect(html).toContain('$80.00');
    // Total: 1680
    expect(html).toContain('$1,680.00');
  });

  it('escapes HTML in client data', () => {
    const xssData: InvoiceData = {
      ...sampleInvoice,
      clientName: '<script>alert("xss")</script>'
    };
    const html = invoiceTemplate.html!(xssData);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('handles missing optional fields', () => {
    const minimal: InvoiceData = {
      documentNumber: 'INV-002',
      businessName: 'Test Co',
      clientName: 'Client',
      documentDate: '2026-01-01',
      dueDate: '2026-02-01',
      items: [{ description: 'Service', quantity: 1, rate: 500 }]
    };
    const html = invoiceTemplate.html!(minimal);
    expect(html).toContain('INV-002');
    expect(html).toContain('$500.00');
    expect(html).not.toContain('Tax');
    expect(html).not.toContain('Notes');
  });
});
