import type { PDFTemplate } from '../types';
import { formatDate } from '../utils/format';

export interface AgreementData {
  title: string;
  effectiveDate: string | Date;
  parties: Array<{
    name: string;
    role: string;
    email?: string;
  }>;
  sections: Array<{
    title: string;
    content: string;
  }>;
  signatures?: boolean;
}

export const agreementTemplate: PDFTemplate<AgreementData> = {
  id: 'agreement',
  name: 'Agreement',
  config: {
    pageSize: 'letter',
    orientation: 'portrait'
  },

  render: (data, ctx) => {
    ctx.heading(data.title, 1);
    ctx.space(0.2);
    ctx.text(`Effective Date: ${formatDate(data.effectiveDate)}`, { color: '#6b7280' });
    ctx.space(0.4);

    // Parties
    ctx.heading('Parties', 2);
    ctx.space(0.1);
    data.parties.forEach((party, i) => {
      ctx.text(`${i + 1}. ${party.name} ("${party.role}")`, { bold: true });
      if (party.email) ctx.text(`   Email: ${party.email}`, { color: '#6b7280' });
      ctx.space(0.1);
    });
    ctx.space(0.3);

    // Sections
    data.sections.forEach((section, i) => {
      ctx.heading(`${i + 1}. ${section.title}`, 3);
      ctx.space(0.1);
      ctx.text(section.content);
      ctx.space(0.3);
    });

    // Signatures
    if (data.signatures !== false) {
      ctx.space(0.5);
      ctx.line();
      ctx.space(0.3);
      ctx.heading('Signatures', 2);
      ctx.space(0.3);

      data.parties.forEach((party) => {
        ctx.signature(`${party.name} (${party.role})`);
        ctx.text('Date: _______________', { color: '#6b7280', size: 9 });
        ctx.space(0.4);
      });
    }
  },

  html: (data) => {
    return `
      <div style="padding: 48px; font-family: 'Times New Roman', serif;">
        <h1 style="text-align: center; margin-bottom: 8px;">${escapeHtml(data.title)}</h1>
        <p style="text-align: center; color: #6b7280;">Effective Date: ${formatDate(data.effectiveDate)}</p>

        <h2 style="margin-top: 32px;">Parties</h2>
        ${data.parties
          .map(
            (party, i) => `
          <p><strong>${i + 1}. ${escapeHtml(party.name)}</strong> ("${escapeHtml(party.role)}")</p>
          ${party.email ? `<p style="color: #6b7280; margin-left: 20px;">Email: ${escapeHtml(party.email)}</p>` : ''}
        `
          )
          .join('')}

        ${data.sections
          .map(
            (section, i) => `
          <h3 style="margin-top: 24px;">${i + 1}. ${escapeHtml(section.title)}</h3>
          <p style="text-align: justify;">${escapeHtml(section.content)}</p>
        `
          )
          .join('')}

        ${
          data.signatures !== false
            ? `
          <div style="margin-top: 48px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
            <h2>Signatures</h2>
            ${data.parties
              .map(
                (party) => `
              <div style="margin: 32px 0;">
                <div style="border-bottom: 1px solid #1a1a1a; width: 250px; margin-bottom: 8px;"></div>
                <p style="font-size: 12px; color: #6b7280;">${escapeHtml(party.name)} (${escapeHtml(party.role)})</p>
                <p style="font-size: 12px; color: #6b7280; margin-top: 16px;">Date: _______________</p>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
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
