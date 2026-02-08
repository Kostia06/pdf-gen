import { describe, it, expect } from 'vitest';
import { agreementTemplate } from './agreement';
import type { AgreementData } from './agreement';

const sampleAgreement: AgreementData = {
  title: 'Roommate Agreement',
  effectiveDate: '2026-03-01',
  parties: [
    { name: 'Alice Johnson', role: 'Tenant A', email: 'alice@example.com' },
    { name: 'Bob Smith', role: 'Tenant B', email: 'bob@example.com' }
  ],
  sections: [
    { title: 'Rent', content: 'Each party pays $750/month.' },
    { title: 'Utilities', content: 'Split equally between all parties.' }
  ],
  signatures: true
};

describe('agreementTemplate', () => {
  it('has correct id and name', () => {
    expect(agreementTemplate.id).toBe('agreement');
    expect(agreementTemplate.name).toBe('Agreement');
  });

  it('generates HTML with parties', () => {
    const html = agreementTemplate.html!(sampleAgreement);
    expect(html).toContain('Alice Johnson');
    expect(html).toContain('Bob Smith');
    expect(html).toContain('Tenant A');
    expect(html).toContain('Tenant B');
  });

  it('generates HTML with sections', () => {
    const html = agreementTemplate.html!(sampleAgreement);
    expect(html).toContain('Rent');
    expect(html).toContain('Utilities');
    expect(html).toContain('$750/month');
  });

  it('includes signature blocks', () => {
    const html = agreementTemplate.html!(sampleAgreement);
    expect(html).toContain('Signatures');
    expect(html).toContain('Date: _______________');
  });

  it('omits signatures when disabled', () => {
    const noSig: AgreementData = { ...sampleAgreement, signatures: false };
    const html = agreementTemplate.html!(noSig);
    expect(html).not.toContain('Signatures');
  });

  it('escapes HTML in content', () => {
    const xssData: AgreementData = {
      ...sampleAgreement,
      title: '<img onerror=alert(1)>'
    };
    const html = agreementTemplate.html!(xssData);
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
  });
});
