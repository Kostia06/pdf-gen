import puppeteer from 'puppeteer';
import type { PDFConfig, RenderOptions, PDFResult } from '../types';

export class ServerRenderer {
  private config: Required<PDFConfig>;

  constructor(config: PDFConfig) {
    this.config = {
      pageSize: config.pageSize ?? 'letter',
      orientation: config.orientation ?? 'portrait',
      margins: config.margins ?? { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      colors: config.colors ?? {
        primary: '#0066FF',
        text: '#1a1a1a',
        textLight: '#6b7280',
        border: '#e5e7eb',
        background: '#f9fafb'
      },
      fonts: config.fonts ?? {
        heading: 'Helvetica',
        body: 'Helvetica',
        mono: 'Courier'
      }
    };
  }

  async render(html: string, options?: RenderOptions): Promise<PDFResult> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();

      const fullHtml = this.wrapHtml(html);
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready');

      const pdfBuffer = await page.pdf({
        format: this.config.pageSize as 'letter' | 'a4' | 'legal',
        landscape: this.config.orientation === 'landscape',
        printBackground: true,
        margin: {
          top: `${this.config.margins.top}in`,
          right: `${this.config.margins.right}in`,
          bottom: `${this.config.margins.bottom}in`,
          left: `${this.config.margins.left}in`
        }
      });

      const buffer = Buffer.from(pdfBuffer);
      const pages = this.estimatePageCount(buffer);

      switch (options?.format) {
        case 'base64':
          return { base64: buffer.toString('base64'), pages };
        case 'blob':
          return { blob: new Blob([buffer], { type: 'application/pdf' }), pages };
        case 'buffer':
        default:
          return { buffer, pages };
      }
    } finally {
      await browser.close();
    }
  }

  private estimatePageCount(buffer: Buffer): number {
    // Count /Type /Page occurrences in the PDF for accurate page count
    const content = buffer.toString('latin1');
    const matches = content.match(/\/Type\s*\/Page[^s]/g);
    return matches ? matches.length : 1;
  }

  private wrapHtml(html: string): string {
    const colors = this.config.colors;
    const fonts = this.config.fonts;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --color-primary: ${colors.primary};
      --color-text: ${colors.text};
      --color-text-light: ${colors.textLight};
      --color-border: ${colors.border};
      --color-background: ${colors.background};
      --font-heading: ${fonts.heading}, sans-serif;
      --font-body: ${fonts.body}, sans-serif;
      --font-mono: ${fonts.mono}, monospace;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: ${this.config.pageSize};
      margin: 0;
    }

    body {
      font-family: var(--font-body);
      font-size: 11pt;
      line-height: 1.5;
      color: var(--color-text);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    h1, h2, h3 { font-family: var(--font-heading); }
    code, pre, .mono { font-family: var(--font-mono); }

    .text-primary { color: var(--color-primary); }
    .text-light { color: var(--color-text-light); }
    .bg-primary { background-color: var(--color-primary); }
    .bg-light { background-color: var(--color-background); }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  }
}
