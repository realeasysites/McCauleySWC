const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Admin password comes from ADMIN_PASSWORD (hashed in memory at boot).
// If unset we generate a one-time random password and print it, so the
// dashboard is never left open with a default password.
let adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  adminPassword = crypto.randomBytes(9).toString('base64url');
  console.warn(`[auth] ADMIN_PASSWORD not set. Temporary admin password for this run: ${adminPassword}`);
}
const hash = bcrypt.hashSync(adminPassword, 10);
// Password-only login (no username). First argument kept for compatibility.
function verify(_user, pass) {
  return bcrypt.compareSync(String(pass), hash);
}
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Not signed in' });
  return res.redirect('/admin/login');
}
module.exports = { verify, requireAdmin };
