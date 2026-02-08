# @kos/pdf-gen

Template-based PDF generation for browser and Node.js. Write templates once, render anywhere.

## Install

```bash
npm install @kos/pdf-gen jspdf jspdf-autotable
# For server-side rendering (optional):
npm install puppeteer
```

## Quick Start

```typescript
import { PDFGenerator, invoiceTemplate } from '@kos/pdf-gen';

const pdf = new PDFGenerator();
pdf.register(invoiceTemplate);

// Generate and download in the browser
await pdf.render('invoice', {
  documentNumber: 'INV-001',
  businessName: 'Acme Co',
  clientName: 'John Doe',
  documentDate: '2026-01-15',
  dueDate: '2026-02-15',
  items: [
    { description: 'Web Development', quantity: 40, rate: 150 },
    { description: 'Design Review', quantity: 5, rate: 200 },
  ],
  taxRate: 5,
}, { format: 'save', filename: 'Invoice-001.pdf' });
```

## How It Works

```
Template + Data ──► Client Renderer (jsPDF)     ──► PDF
                ──► Server Renderer (Puppeteer)  ──► PDF
```

Same template, two renderers. Pick the right one for your use case:

| | Client (jsPDF) | Server (Puppeteer) |
|---|---|---|
| **Best for** | Browser downloads | Email attachments |
| **Speed** | Fast | Slower |
| **Quality** | Good | Pixel-perfect |
| **Fonts** | Built-in only | Any web font |
| **Bundle** | ~300KB | Requires Chrome |

## Built-in Templates

### Invoice

```typescript
import { invoiceTemplate } from '@kos/pdf-gen';

await pdf.generate(invoiceTemplate, {
  documentNumber: 'INV-042',
  businessName: 'Smith Contracting',
  businessEmail: 'hello@smith.co',
  clientName: 'Jane Wilson',
  clientEmail: 'jane@example.com',
  documentDate: new Date(),
  dueDate: '2026-03-01',
  items: [
    { description: 'Kitchen renovation', quantity: 1, rate: 12000 },
    { description: 'Materials', quantity: 1, rate: 4500 },
  ],
  taxRate: 13,
  notes: 'Thank you for your business!',
});
```

### Estimate

```typescript
import { estimateTemplate } from '@kos/pdf-gen';

await pdf.generate(estimateTemplate, {
  documentNumber: 'EST-007',
  businessName: 'Smith Contracting',
  clientName: 'Bob Chen',
  documentDate: new Date(),
  validUntil: '2026-04-01',
  items: [
    { description: 'Deck construction', quantity: 200, unit: 'sqft', rate: 45 },
    { description: 'Railing install', quantity: 50, unit: 'ft', rate: 35 },
  ],
  terms: 'Estimate valid for 30 days.',
});
```

### Agreement

```typescript
import { agreementTemplate } from '@kos/pdf-gen';

await pdf.generate(agreementTemplate, {
  title: 'Service Agreement',
  effectiveDate: '2026-03-01',
  parties: [
    { name: 'Alice Johnson', role: 'Client', email: 'alice@example.com' },
    { name: 'Bob Smith', role: 'Contractor', email: 'bob@example.com' },
  ],
  sections: [
    { title: 'Scope of Work', content: 'Full bathroom renovation including...' },
    { title: 'Payment Terms', content: '50% deposit, 50% on completion.' },
    { title: 'Timeline', content: 'Work begins March 15, estimated 3 weeks.' },
  ],
  signatures: true,
});
```

## Output Formats

```typescript
// Download in browser
await pdf.render('invoice', data, { format: 'save', filename: 'invoice.pdf' });

// Get as Blob (for uploads, previews)
const { blob } = await pdf.render('invoice', data, { format: 'blob' });

// Get as Buffer (Node.js, email attachments)
const { buffer } = await pdf.render('invoice', data, { format: 'buffer' });

// Get as base64
const { base64 } = await pdf.render('invoice', data, { format: 'base64' });
```

## Server-Side Rendering

Use Puppeteer for pixel-perfect output (great for email attachments):

```typescript
const { buffer } = await pdf.render('invoice', data, {
  format: 'buffer',
  server: true, // Uses Puppeteer + HTML template
});

// Attach to email
await resend.emails.send({
  to: 'client@example.com',
  subject: 'Your Invoice',
  attachments: [{ filename: 'invoice.pdf', content: buffer }],
});
```

## Custom Templates

```typescript
import type { PDFTemplate } from '@kos/pdf-gen';

interface ReceiptData {
  receiptNumber: string;
  items: Array<{ name: string; price: number }>;
  total: number;
}

const receiptTemplate: PDFTemplate<ReceiptData> = {
  id: 'receipt',
  name: 'Receipt',
  config: { pageSize: 'letter' },

  render: (data, ctx) => {
    ctx.heading('RECEIPT', 1);
    ctx.text(data.receiptNumber, { color: '#6b7280' });
    ctx.space(0.3);

    const rows = data.items.map(item => [item.name, `$${item.price.toFixed(2)}`]);
    ctx.table(['Item', 'Price'], rows, { striped: true });

    ctx.line();
    ctx.text(`Total: $${data.total.toFixed(2)}`, { align: 'right', bold: true, size: 16 });
  },
};

pdf.register(receiptTemplate);
```

## Reusable Components

Build templates faster with pre-built components:

```typescript
import { renderHeader, renderTotals, renderSignatureBlock, renderFooter } from '@kos/pdf-gen';

const myTemplate: PDFTemplate<MyData> = {
  id: 'custom',
  name: 'Custom Doc',
  config: { pageSize: 'letter' },

  render: (data, ctx) => {
    renderHeader(ctx, { title: 'WORK ORDER', subtitle: '#WO-001' });

    ctx.table(['Task', 'Hours', 'Rate'], rows);

    renderTotals(ctx, {
      subtotal: 1500,
      taxRate: 5,
      taxAmount: 75,
      total: 1575,
      showAmountDueBox: true,
    });

    renderSignatureBlock(ctx, {
      labels: ['Client Signature', 'Contractor Signature'],
    });

    renderFooter(ctx, { text: 'Thank you!', showPageNumber: true });
  },
};
```

## Customization

```typescript
const pdf = new PDFGenerator({
  pageSize: 'a4',           // 'letter' | 'a4' | 'legal'
  orientation: 'portrait',  // 'portrait' | 'landscape'
  margins: { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 },
  colors: {
    primary: '#0066FF',
    text: '#1a1a1a',
    textLight: '#6b7280',
    border: '#e5e7eb',
    background: '#f9fafb',
  },
  fonts: {
    heading: 'Helvetica',
    body: 'Helvetica',
    mono: 'Courier',
  },
});
```

## License

MIT
