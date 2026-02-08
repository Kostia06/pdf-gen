import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  PDFConfig,
  PDFTemplate,
  PDFContext,
  RenderOptions,
  PDFResult,
  LineOptions,
  ImageOptions,
  SignatureOptions
} from '../types';

export class ClientRenderer {
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

  async render<T extends Record<string, any>>(
    template: PDFTemplate<T>,
    data: T,
    options?: RenderOptions
  ): Promise<PDFResult> {
    const doc = new jsPDF({
      orientation: this.config.orientation,
      unit: 'in',
      format: this.config.pageSize
    });

    const margins = this.config.margins;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margins.left - margins.right;
    const contentHeight = pageHeight - margins.top - margins.bottom;

    const ctx = this.createContext(doc, contentWidth, contentHeight);
    template.render(data, ctx);

    return this.output(doc, options);
  }

  private createContext(doc: jsPDF, width: number, height: number): PDFContext {
    const margins = this.config.margins;
    const colors = this.config.colors;
    const fonts = this.config.fonts;
    let y = margins.top;

    const ctx: PDFContext = {
      get y() {
        return y;
      },
      set y(val: number) {
        y = val;
      },
      width,
      height,
      marginLeft: margins.left,

      text: (content, options = {}) => {
        const x = options.x ?? margins.left;
        const align = options.align ?? 'left';

        if (options.bold) doc.setFont(fonts.body, 'bold');
        if (options.size) doc.setFontSize(options.size);
        if (options.color) doc.setTextColor(options.color);

        let textX = x;
        if (align === 'center') textX = margins.left + width / 2;
        if (align === 'right') textX = margins.left + width;

        if (options.maxWidth) {
          doc.text(content, textX, y, { align, maxWidth: options.maxWidth });
        } else {
          doc.text(content, textX, y, { align });
        }

        const fontSize = options.size ?? 11;
        y += fontSize / 72 + 0.05;

        // Reset
        doc.setFont(fonts.body, 'normal');
        doc.setFontSize(11);
        doc.setTextColor(colors.text);
      },

      heading: (content, level = 1) => {
        const sizes = { 1: 24, 2: 18, 3: 14 } as const;
        doc.setFont(fonts.heading, 'bold');
        doc.setFontSize(sizes[level]);
        doc.setTextColor(colors.text);
        doc.text(content, margins.left, y);
        y += sizes[level] / 72 + 0.1;
        doc.setFont(fonts.body, 'normal');
        doc.setFontSize(11);
      },

      table: (headers, rows, options = {}) => {
        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: y,
          margin: { left: margins.left, right: margins.right },
          headStyles: {
            fillColor: options.headerStyle?.fillColor || colors.primary,
            textColor: options.headerStyle?.textColor || '#ffffff',
            fontStyle: options.headerStyle?.fontStyle || 'bold'
          },
          bodyStyles: {
            textColor: colors.text
          },
          alternateRowStyles: options.striped
            ? { fillColor: colors.background }
            : undefined,
          columnStyles: options.columnWidths?.reduce(
            (acc, w, i) => {
              if (typeof w === 'number') acc[i] = { cellWidth: w };
              return acc;
            },
            {} as Record<number, { cellWidth: number }>
          )
        });

        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 0.2;
      },

      line: (options: LineOptions = {}) => {
        doc.setDrawColor(options.color || colors.border);
        doc.setLineWidth(options.width || 0.01);
        doc.line(margins.left, y, margins.left + width, y);
        y += 0.1;
      },

      space: (amount = 0.2) => {
        y += amount;
      },

      pageBreak: () => {
        doc.addPage();
        y = margins.top;
      },

      image: (src: string, options: ImageOptions = {}) => {
        const imgWidth = options.width || 1;
        const imgHeight = options.height || 1;
        const x = options.x ?? margins.left;
        doc.addImage(src, 'PNG', x, y, imgWidth, imgHeight);
        y += imgHeight + 0.1;
      },

      signature: (_label: string, options: SignatureOptions = {}) => {
        const lineWidth = options.width || 2.5;
        doc.setDrawColor(colors.border);
        doc.setLineWidth(0.01);
        doc.line(margins.left, y + 0.3, margins.left + lineWidth, y + 0.3);
        doc.setFontSize(9);
        doc.setTextColor(colors.textLight);
        doc.text(_label, margins.left, y + 0.45);
        y += 0.6;
      },

      pageNumber: () => (doc as any).getNumberOfPages(),

      setFont: (family, style = 'normal') => {
        doc.setFont(family, style);
      },

      setFontSize: (size) => {
        doc.setFontSize(size);
      },

      setTextColor: (color) => {
        doc.setTextColor(color);
      },

      rect: (rx, ry, rw, rh, options = {}) => {
        if (options.fill) {
          doc.setFillColor(options.fill);
          doc.rect(rx, ry, rw, rh, 'F');
        }
        if (options.stroke) {
          doc.setDrawColor(options.stroke);
          doc.rect(rx, ry, rw, rh, 'S');
        }
      }
    };

    return ctx;
  }

  private output(doc: jsPDF, options?: RenderOptions): PDFResult {
    const pages = (doc as any).getNumberOfPages();

    switch (options?.format) {
      case 'buffer':
        return {
          buffer: Buffer.from(doc.output('arraybuffer')),
          pages
        };
      case 'base64':
        return {
          base64: doc.output('datauristring').split(',')[1],
          pages
        };
      case 'save':
        doc.save(options.filename || 'document.pdf');
        return { pages };
      case 'blob':
      default:
        return {
          blob: doc.output('blob'),
          pages
        };
    }
  }
}
