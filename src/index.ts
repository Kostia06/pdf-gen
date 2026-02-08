import type { PDFConfig, PDFTemplate, RenderOptions, PDFResult } from './types';
import { ClientRenderer } from './client/renderer';
import { ServerRenderer } from './server/renderer';

export class PDFGenerator {
  private config: Required<PDFConfig>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private templates: Map<string, PDFTemplate<Record<string, any>>> = new Map();

  constructor(config?: Partial<PDFConfig>) {
    this.config = {
      pageSize: config?.pageSize ?? 'letter',
      orientation: config?.orientation ?? 'portrait',
      margins: config?.margins ?? { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
      colors: config?.colors ?? {
        primary: '#0066FF',
        text: '#1a1a1a',
        textLight: '#6b7280',
        border: '#e5e7eb',
        background: '#f9fafb'
      },
      fonts: config?.fonts ?? {
        heading: 'Helvetica',
        body: 'Helvetica',
        mono: 'Courier'
      }
    };
  }

  /** Register a template for later use */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register<T extends Record<string, any>>(template: PDFTemplate<T>): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.templates.set(template.id, template as PDFTemplate<Record<string, any>>);
    return this;
  }

  /** Render a registered template by ID */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async render<T extends Record<string, any>>(
    templateId: string,
    data: T,
    options?: RenderOptions
  ): Promise<PDFResult> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template "${templateId}" not found`);
    }

    const mergedConfig = { ...this.config, ...template.config };

    if (options?.server && template.html) {
      const renderer = new ServerRenderer(mergedConfig);
      return renderer.render(template.html(data), options);
    }

    const renderer = new ClientRenderer(mergedConfig);
    return renderer.render(template as PDFTemplate<T>, data, options);
  }

  /** Quick render without pre-registering a template */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async generate<T extends Record<string, any>>(
    template: PDFTemplate<T>,
    data: T,
    options?: RenderOptions
  ): Promise<PDFResult> {
    const mergedConfig = { ...this.config, ...template.config };

    if (options?.server && template.html) {
      const renderer = new ServerRenderer(mergedConfig);
      return renderer.render(template.html(data), options);
    }

    const renderer = new ClientRenderer(mergedConfig);
    return renderer.render(template, data, options);
  }
}

/** Default instance */
export const pdf = new PDFGenerator();

// Re-export everything
export * from './types';
export * from './templates';
export * from './components';
export { formatCurrency, formatDate } from './utils/format';
export { defaultColors } from './utils/colors';
export { ClientRenderer } from './client/renderer';
export { ServerRenderer } from './server/renderer';
