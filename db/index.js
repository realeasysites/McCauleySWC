const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(dir, { recursive: true });
const db = new Database(path.join(dir, 'leads.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  town TEXT,
  project_type TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT DEFAULT '',
  source_ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
`);

const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'];

module.exports = {
  db, STATUSES,
  insertLead: (l) => db.prepare(
    `INSERT INTO leads (name, phone, email, town, project_type, message, source_ip)
     VALUES (@name, @phone, @email, @town, @project_type, @message, @source_ip)`).run(l).lastInsertRowid,
  listLeads: (status) => status && STATUSES.includes(status)
    ? db.prepare('SELECT * FROM leads WHERE status = ? ORDER BY id DESC').all(status)
    : db.prepare('SELECT * FROM leads ORDER BY id DESC').all(),
  getLead: (id) => db.prepare('SELECT * FROM leads WHERE id = ?').get(id),
  updateLead: (id, { status, notes }) => db.prepare(
    'UPDATE leads SET status = COALESCE(@status, status), notes = COALESCE(@notes, notes) WHERE id = @id'
  ).run({ id, status: status ?? null, notes: notes ?? null }),
  deleteLead: (id) => db.prepare('DELETE FROM leads WHERE id = ?').run(id),
  counts: () => db.prepare('SELECT status, COUNT(*) AS n FROM leads GROUP BY status').all()
};
