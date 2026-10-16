const express = require('express');
const rateLimit = require('express-rate-limit');
const { validateQuote } = require('../lib/validate');
const { insertLead } = require('../db');
const { notifyNewLead } = require('../lib/mailer');
const site = require('../lib/site');

const router = express.Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests. Please call us instead.' } });

router.get('/api/site', (req, res) => {
  const { name, phone, phoneHref, email, area, base, yearsExperience, socials, projectTypes } = site;
  res.json({ name, phone, phoneHref, email, area, base, yearsExperience, projectTypes,
    socials: Object.fromEntries(Object.entries(socials).filter(([, v]) => v)) });
});

router.post('/api/quote', limiter, async (req, res) => {
  // Honeypot: bots fill the hidden "website" field. Pretend success.
  if (req.body && req.body.website) return res.json({ ok: true });
  const { lead, errors, ok } = validateQuote(req.body || {});
  if (!ok) return res.status(400).json({ ok: false, errors });
  const id = insertLead({ ...lead, source_ip: req.ip });
  notifyNewLead(lead, id).catch((e) => console.error('[mailer] failed:', e.message));
  res.json({ ok: true });
});
module.exports = router;
