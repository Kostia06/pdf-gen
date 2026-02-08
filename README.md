# @kostia06/pdf-gen

Template-based PDF generation for browser and Node.js. Define templates, render anywhere.

## Install

```bash
npm install @kostia06/pdf-gen jspdf jspdf-autotable
# For server-side rendering (optional):
npm install puppeteer
```

## Quick Start

```typescript
import { PDFGenerator } from '@kostia06/pdf-gen';
import type { PDFTemplate } from '@kostia06/pdf-gen';

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

const pdf = new PDFGenerator();
pdf.register(receiptTemplate);
await pdf.render('receipt', data, { format: 'save', filename: 'receipt.pdf' });
```

## How It Works

```
Template + Data ──► Client Renderer (jsPDF)     ──► PDF
                ──► Server Renderer (Puppeteer)  ──► PDF
```

Same template, two renderers:

| | Client (jsPDF) | Server (Puppeteer) |
|---|---|---|
| **Best for** | Browser downloads | Email attachments |
| **Speed** | Fast | Slower |
| **Quality** | Good | Pixel-perfect |
| **Fonts** | Built-in only | Any web font |
| **Bundle** | ~300KB | Requires Chrome |

## Output Formats

```typescript
// Download in browser
await pdf.render('receipt', data, { format: 'save', filename: 'receipt.pdf' });

// Get as Blob (for uploads, previews)
const { blob } = await pdf.render('receipt', data, { format: 'blob' });

// Get as Buffer (Node.js, email attachments)
const { buffer } = await pdf.render('receipt', data, { format: 'buffer' });

// Get as base64
const { base64 } = await pdf.render('receipt', data, { format: 'base64' });
```

## Server-Side Rendering

Use Puppeteer for pixel-perfect output. Add an `html()` method to your template:

```typescript
const myTemplate: PDFTemplate<MyData> = {
  id: 'doc',
  name: 'Document',
  config: { pageSize: 'letter' },
  render: (data, ctx) => { /* jsPDF rendering */ },
  html: (data) => `<div style="padding: 48px;">
    <h1>${data.title}</h1>
    <!-- inline-styled HTML -->
  </div>`,
};

const { buffer } = await pdf.generate(myTemplate, data, {
  format: 'buffer',
  server: true,
});
```

## Reusable Components

Build templates faster with pre-built components:

```typescript
import { renderHeader, renderTotals, renderSignatureBlock, renderFooter } from '@kostia06/pdf-gen';

const myTemplate: PDFTemplate<MyData> = {
  id: 'custom',
  name: 'Custom Doc',
  config: { pageSize: 'letter' },
  render: (data, ctx) => {
    renderHeader(ctx, { title: 'WORK ORDER', subtitle: '#WO-001' });
    ctx.table(['Task', 'Hours', 'Rate'], rows);
    renderTotals(ctx, { subtotal: 1500, taxRate: 5, taxAmount: 75, total: 1575 });
    renderSignatureBlock(ctx, { labels: ['Client', 'Contractor'] });
    renderFooter(ctx, { text: 'Thank you!', showPageNumber: true });
  },
};
```

## Customization

```typescript
const pdf = new PDFGenerator({
  pageSize: 'a4',
  orientation: 'portrait',
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
