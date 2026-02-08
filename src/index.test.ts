import { describe, it, expect } from 'vitest';
import { PDFGenerator, invoiceTemplate, estimateTemplate, agreementTemplate } from './index';

describe('PDFGenerator', () => {
  it('creates with default config', () => {
    const gen = new PDFGenerator();
    expect(gen).toBeDefined();
  });

  it('creates with custom config', () => {
    const gen = new PDFGenerator({
      pageSize: 'a4',
      colors: {
        primary: '#ff0000',
        text: '#000000',
        textLight: '#666666',
        border: '#cccccc',
        background: '#f0f0f0'
      }
    });
    expect(gen).toBeDefined();
  });

  it('registers templates', () => {
    const gen = new PDFGenerator();
    const result = gen.register(invoiceTemplate).register(estimateTemplate).register(agreementTemplate);
    expect(result).toBe(gen); // returns this for chaining
  });

  it('throws on unknown template', async () => {
    const gen = new PDFGenerator();
    await expect(gen.render('nonexistent', {})).rejects.toThrow('Template "nonexistent" not found');
  });
});

describe('exports', () => {
  it('exports all templates', () => {
    expect(invoiceTemplate).toBeDefined();
    expect(invoiceTemplate.id).toBe('invoice');
    expect(estimateTemplate).toBeDefined();
    expect(estimateTemplate.id).toBe('estimate');
    expect(agreementTemplate).toBeDefined();
    expect(agreementTemplate.id).toBe('agreement');
  });
});
