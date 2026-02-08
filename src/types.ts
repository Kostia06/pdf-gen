export interface PDFConfig {
  /** Page size */
  pageSize?: 'letter' | 'a4' | 'legal';
  /** Page orientation */
  orientation?: 'portrait' | 'landscape';
  /** Page margins in inches */
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  /** Brand colors */
  colors?: {
    primary: string;
    text: string;
    textLight: string;
    border: string;
    background: string;
  };
  /** Font configuration */
  fonts?: {
    heading: string;
    body: string;
    mono: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PDFTemplate<T extends Record<string, any>> {
  /** Template unique identifier */
  id: string;
  /** Template display name */
  name: string;
  /** Default configuration */
  config: PDFConfig;
  /** Render function (jsPDF client-side) */
  render: (data: T, ctx: PDFContext) => void;
  /** HTML template for Puppeteer server-side (optional) */
  html?: (data: T) => string;
}

export interface PDFContext {
  /** Current Y position */
  y: number;
  /** Page width (content area) */
  width: number;
  /** Page height (content area) */
  height: number;
  /** Left margin */
  marginLeft: number;
  /** Add text */
  text: (content: string, options?: TextOptions) => void;
  /** Add heading */
  heading: (content: string, level?: 1 | 2 | 3) => void;
  /** Add table */
  table: (headers: string[], rows: string[][], options?: TableOptions) => void;
  /** Add horizontal line */
  line: (options?: LineOptions) => void;
  /** Add spacing */
  space: (amount?: number) => void;
  /** Add page break */
  pageBreak: () => void;
  /** Add image */
  image: (src: string, options?: ImageOptions) => void;
  /** Add signature block */
  signature: (label: string, options?: SignatureOptions) => void;
  /** Get current page number */
  pageNumber: () => number;
  /** Set font */
  setFont: (family: string, style?: 'normal' | 'bold' | 'italic') => void;
  /** Set font size */
  setFontSize: (size: number) => void;
  /** Set text color */
  setTextColor: (color: string) => void;
  /** Draw rectangle */
  rect: (x: number, y: number, w: number, h: number, options?: RectOptions) => void;
}

export interface TextOptions {
  x?: number;
  align?: 'left' | 'center' | 'right';
  color?: string;
  font?: string;
  size?: number;
  bold?: boolean;
  maxWidth?: number;
}

export interface TableOptions {
  /** Column widths (percentages or fixed) */
  columnWidths?: (number | 'auto')[];
  /** Header style */
  headerStyle?: {
    fillColor?: string;
    textColor?: string;
    fontStyle?: 'normal' | 'bold';
  };
  /** Body style */
  bodyStyle?: {
    fillColor?: string | ((row: number) => string);
    textColor?: string;
  };
  /** Show grid lines */
  showGrid?: boolean;
  /** Stripe rows */
  striped?: boolean;
}

export interface LineOptions {
  color?: string;
  width?: number;
}

export interface ImageOptions {
  x?: number;
  width?: number;
  height?: number;
}

export interface SignatureOptions {
  width?: number;
}

export interface RectOptions {
  fill?: string;
  stroke?: string;
}

export interface RenderOptions {
  /** Output format */
  format?: 'buffer' | 'blob' | 'base64' | 'save';
  /** Filename (for 'save' format) */
  filename?: string;
  /** Use server renderer (Puppeteer) */
  server?: boolean;
}

export interface PDFResult {
  /** PDF as Buffer (Node.js) */
  buffer?: Buffer;
  /** PDF as Blob (browser) */
  blob?: Blob;
  /** PDF as base64 string */
  base64?: string;
  /** Number of pages */
  pages: number;
}
