// Vercel serverless function: compose the signed agreement as a PDF and email
// it to both parties via Resend. Recipients: the agency address comes from the
// AGENCY_EMAIL env var (never from the request), the client address comes from
// the proposal build (intake email) and is validated here.
//
// Required env on the Vercel project: RESEND_API_KEY, RESEND_FROM, AGENCY_EMAIL.
//
// The agreement body below is a PLACEHOLDER legal skeleton (non-refundable
// setup fee, England and Wales law). Replace AGREEMENT_SECTIONS with the
// agency's real contract template before using it in anger.

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const MAX_SIG_BYTES = 300 * 1024;

const AGREEMENT_SECTIONS = [
  ['1. Parties', 'This Website Services Agreement (the "Agreement") is entered into between {AGENCY} (the "Provider") and {COMPANY} (the "Client"), together the "Parties", effective as of {DATE}.'],
  ['2. Services', 'The Provider will design, build, and launch a custom website for the Client as presented in the accompanying proposal, including hosting setup, lead-handling configuration, and search-optimisation foundations, followed by the ongoing monthly service plan selected in the proposal.'],
  ['3. Fees and payment', '{PAYBODY}'],
  ['4. Setup fee non-refundable', 'The setup fee compensates the Provider for immediate commencement of design, build, and configuration work and for access to the Provider\'s proprietary systems and processes. Accordingly, the setup fee is earned on receipt and is strictly non-refundable once work has commenced. The monthly service plan may be cancelled per Section 6 and no refunds are issued for any period already invoiced.'],
  ['5. Delivery guarantee', 'The Provider guarantees that the website will meet the scope agreed in the accompanying proposal. If any deliverable falls short of that scope, the Provider will remedy it through continued work at no additional cost until it meets the agreed scope. This continued-work remedy is the Client\'s sole and exclusive remedy for any shortfall in the deliverables and does not entitle the Client to any refund of the setup fee or of any fee already invoiced.'],
  ['6. Term and cancellation', 'The monthly service plan continues month to month. After the third month the Client may cancel with fourteen (14) days written notice ahead of the next billing date. The Provider may suspend services for non-payment.'],
  ['7. Intellectual property', 'Upon payment in full of the setup fee, the finished website content specific to the Client is licensed to the Client. The Provider retains ownership of its underlying systems, templates, tooling, and know-how.'],
  ['8. Governing law', 'This Agreement is governed by the laws of England and Wales, and the Parties submit to the exclusive jurisdiction of its courts.'],
];

function dataUrlToBytes(dataUrl) {
  const m = /^data:image\/png;base64,(.+)$/.exec(dataUrl || '');
  if (!m) return null;
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length === 0 || buf.length > MAX_SIG_BYTES) return null;
  return buf;
}

function wrapText(text, font, size, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const probe = line ? line + ' ' + w : w;
    if (font.widthOfTextAtSize(probe, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function buildPdf(p) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const A4 = [595.28, 841.89];
  let page = doc.addPage(A4);
  const margin = 64;
  const width = A4[0] - margin * 2;
  let y = A4[1] - margin;
  const ink = rgb(0.09, 0.08, 0.07);

  const ensure = (need) => {
    if (y - need < margin) { page = doc.addPage(A4); y = A4[1] - margin; }
  };
  const para = (text, f, size, gap, color) => {
    for (const line of wrapText(text, f, size, width)) {
      ensure(size + 4);
      page.drawText(line, { x: margin, y: y - size, size, font: f, color: color || ink });
      y -= size + 4;
    }
    y -= gap;
  };

  para('WEBSITE SERVICES AGREEMENT', bold, 16, 6);
  para(`${p.agencyName}  x  ${p.company}`, font, 11, 2, rgb(0.35, 0.3, 0.2));
  para(`Executed ${p.date}`, font, 10, 14, rgb(0.45, 0.42, 0.36));

  for (const [head, body] of AGREEMENT_SECTIONS) {
    const filled = body
      .replaceAll('{AGENCY}', p.agencyName)
      .replaceAll('{COMPANY}', p.company)
      .replaceAll('{DATE}', p.date)
      .replaceAll('{SETUP}', p.setup)
      .replaceAll('{MONTHLY}', p.monthly)
      .replaceAll('{PAYBODY}', p.payBody);
    ensure(40);
    para(head, bold, 11.5, 2);
    para(filled, font, 10.5, 10);
  }

  ensure(170);
  y -= 8;
  para('SIGNATURES', bold, 11.5, 6);

  const colW = width / 2 - 12;
  const sigTop = y;
  const drawSig = async (x, label, name, org, sigBytes) => {
    let yy = sigTop;
    page.drawText(label, { x, y: yy - 9, size: 9, font: bold, color: rgb(0.45, 0.42, 0.36) });
    yy -= 16;
    if (sigBytes) {
      const png = await doc.embedPng(sigBytes);
      const dims = png.scaleToFit(colW, 64);
      page.drawImage(png, { x, y: yy - dims.height, width: dims.width, height: dims.height });
      yy -= dims.height + 6;
    } else {
      yy -= 70;
    }
    page.drawLine({ start: { x, y: yy }, end: { x: x + colW, y: yy }, thickness: 0.7, color: ink });
    yy -= 13;
    page.drawText(name, { x, y: yy, size: 10.5, font: bold, color: ink });
    yy -= 13;
    page.drawText(org, { x, y: yy, size: 9.5, font, color: rgb(0.35, 0.32, 0.27) });
    yy -= 13;
    page.drawText(`Date: ${p.date}`, { x, y: yy, size: 9, font, color: rgb(0.45, 0.42, 0.36) });
    return yy;
  };

  const y1 = await drawSig(margin, 'PROVIDER', p.agencySigner, p.agencyName, p.sigAgencyBytes);
  const y2 = await drawSig(margin + colW + 24, 'CLIENT', p.clientName, p.company, p.sigClientBytes);
  y = Math.min(y1, y2) - 20;

  return Buffer.from(await doc.save());
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  try {
    const { RESEND_API_KEY, RESEND_FROM, AGENCY_EMAIL } = process.env;
    if (!RESEND_API_KEY || !RESEND_FROM || !AGENCY_EMAIL) {
      res.status(500).json({ error: 'Email is not configured on this deployment (RESEND_API_KEY / RESEND_FROM / AGENCY_EMAIL).' });
      return;
    }
    const b = req.body || {};
    const company = String(b.company || '').slice(0, 120).trim();
    const clientName = String(b.clientName || '').slice(0, 120).trim();
    const agencyName = String(b.agencyName || '').slice(0, 120).trim();
    const agencySigner = String(b.agencySigner || '').slice(0, 120).trim();
    const date = String(b.date || '').slice(0, 40).trim() || new Date().toISOString().slice(0, 10);
    const setup = String(b.setup || '').replace(/[^0-9,]/g, '').slice(0, 12) || '0';
    const monthly = String(b.monthly || '').replace(/[^0-9,]/g, '').slice(0, 12) || '0';
    const clientEmail = String(b.clientEmail || '').slice(0, 200).trim();
    const paymentTerms = String(b.paymentTerms || '').slice(0, 900).trim();
    const monthlyNum = parseInt(monthly.replace(/[^0-9]/g, ''), 10) || 0;

    // Section 3 body: the seller's negotiated terms if provided, else built from
    // the setup fee and (only if non-zero) the monthly retainer.
    let payBody = paymentTerms;
    if (!payBody) {
      payBody = `The Client agrees to pay a one-time setup fee of $${setup} due in full upon signing this Agreement`;
      payBody += monthlyNum > 0
        ? `, followed by a recurring monthly service fee of $${monthly} beginning thirty (30) days after the website goes live.`
        : '. No monthly retainer applies to this Agreement.';
    }

    if (!company || !clientName || !agencyName) {
      res.status(400).json({ error: 'Missing party details.' });
      return;
    }
    const sigAgencyBytes = dataUrlToBytes(b.sigAgency);
    const sigClientBytes = dataUrlToBytes(b.sigClient);
    if (!sigAgencyBytes || !sigClientBytes) {
      res.status(400).json({ error: 'Both signatures are required.' });
      return;
    }

    const pdf = await buildPdf({ company, clientName, agencyName, agencySigner, date, setup, monthly, payBody, sigAgencyBytes, sigClientBytes });

    const to = [AGENCY_EMAIL];
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clientEmail)) to.push(clientEmail);

    const filename = `Website Services Agreement - ${company}.pdf`;
    const html = [
      `<p>The Website Services Agreement between <strong>${agencyName}</strong> and <strong>${company}</strong> was signed by both parties on ${date}.</p>`,
      `<p>${paymentTerms ? paymentTerms : ('Setup fee: $' + setup + ' (non-refundable once work commences)' + (monthlyNum > 0 ? ' &middot; Monthly plan: $' + monthly + '/mo.' : ' &middot; No monthly retainer.'))}</p>`,
      `<p>The fully executed copy is attached as a PDF for your records.</p>`,
    ].join('');

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: RESEND_FROM,
        to,
        subject: `Signed agreement: ${agencyName} x ${company}`,
        html,
        attachments: [{ filename, content: pdf.toString('base64') }],
      }),
    });
    if (!resp.ok) {
      const detail = await resp.text();
      res.status(502).json({ error: 'Email provider rejected the send.', detail: detail.slice(0, 300) });
      return;
    }
    res.status(200).json({ ok: true, sentTo: to.length });
  } catch (err) {
    res.status(500).json({ error: 'Contract send failed.', detail: String(err && err.message || err).slice(0, 300) });
  }
};
