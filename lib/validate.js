const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);

function validateQuote(body) {
  const lead = {
    name: clean(body.name, 100),
    phone: clean(body.phone, 30),
    email: clean(body.email, 150),
    town: clean(body.town, 100),
    project_type: clean(body.project_type, 60),
    message: clean(body.message, 3000)
  };
  const errors = {};
  if (lead.name.length < 2) errors.name = 'Please enter your name.';
  if (lead.phone.replace(/\D/g, '').length < 10) errors.phone = 'Please enter a valid phone number.';
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) errors.email = 'That email looks off.';
  return { lead, errors, ok: Object.keys(errors).length === 0 };
}
module.exports = { validateQuote, clean };
