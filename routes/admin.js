const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { verify, requireAdmin } = require('../lib/auth');
const { listLeads, getLead, updateLead, deleteLead, counts, STATUSES } = require('../db');
const { clean } = require('../lib/validate');

const router = express.Router();
const view = (f) => path.join(__dirname, '..', 'views', f);
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: 'Too many attempts. Try again later.' });

router.get('/admin/login', (req, res) => res.sendFile(view('login.html')));
router.post('/admin/login', loginLimiter, (req, res) => {
  if (verify(req.body.username || '', req.body.password || '')) {
    return req.session.regenerate(() => { req.session.admin = true; res.redirect('/admin'); });
  }
  res.redirect('/admin/login?error=1');
});
router.post('/admin/logout', (req, res) => req.session.destroy(() => res.redirect('/admin/login')));

router.get('/admin', requireAdmin, (req, res) => res.sendFile(view('dashboard.html')));

router.get('/admin/api/leads', requireAdmin, (req, res) => {
  res.json({ leads: listLeads(req.query.status), counts: counts(), statuses: STATUSES });
});
router.patch('/admin/api/leads/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (!getLead(id)) return res.status(404).json({ error: 'Not found' });
  const status = STATUSES.includes(req.body.status) ? req.body.status : undefined;
  const notes = typeof req.body.notes === 'string' ? clean(req.body.notes, 5000) : undefined;
  updateLead(id, { status, notes });
  res.json({ ok: true, lead: getLead(id) });
});
router.delete('/admin/api/leads/:id', requireAdmin, (req, res) => {
  deleteLead(Number(req.params.id));
  res.json({ ok: true });
});
router.get('/admin/api/export.csv', requireAdmin, (req, res) => {
  const cols = ['id', 'created_at', 'name', 'phone', 'email', 'town', 'project_type', 'status', 'message', 'notes'];
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = listLeads().map((l) => cols.map((c) => q(l[c])).join(','));
  res.type('text/csv').attachment('mccauley-leads.csv').send([cols.join(','), ...rows].join('\n'));
});
module.exports = router;
