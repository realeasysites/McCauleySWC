const nodemailer = require('nodemailer');
const site = require('./site');

let transport = null;
if (process.env.SMTP_HOST) {
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function notifyNewLead(lead, id) {
  const to = process.env.NOTIFY_EMAIL || site.email;
  const subject = `New quote request: ${lead.name} (${lead.project_type || 'project'})`;
  const text = [
    `New lead #${id} from the website`, '',
    `Name: ${lead.name}`, `Phone: ${lead.phone}`, `Email: ${lead.email || '-'}`,
    `Town: ${lead.town || '-'}`, `Project: ${lead.project_type || '-'}`, '', lead.message || '(no message)'
  ].join('\n');
  const html = `<h2>New quote request #${id}</h2>
    <p><b>${esc(lead.name)}</b><br>Phone: <a href="tel:${esc(lead.phone)}">${esc(lead.phone)}</a><br>
    Email: ${esc(lead.email || '-')}<br>Town: ${esc(lead.town || '-')}<br>Project: ${esc(lead.project_type || '-')}</p>
    <p>${esc(lead.message || '(no message)').replace(/\n/g, '<br>')}</p>`;
  if (!transport) {
    console.log(`[mailer] SMTP not configured. Would email ${to}:\n${text}\n`);
    return;
  }
  await transport.sendMail({
    from: process.env.MAIL_FROM || `"${site.name} Website" <${process.env.SMTP_USER || to}>`,
    to, replyTo: lead.email || undefined, subject, text, html
  });
}
module.exports = { notifyNewLead };
