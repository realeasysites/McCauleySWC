(function () {
  const list = document.getElementById('list'), tabs = document.getElementById('tabs');
  let filter = '', statuses = [];
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const when = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  async function api(url, opt) {
    const r = await fetch(url, opt);
    if (r.status === 401) { location.href = '/admin/login'; throw new Error('auth'); }
    return r.json();
  }
  async function load() {
    const d = await api('/admin/api/leads' + (filter ? '?status=' + filter : ''));
    statuses = d.statuses;
    const total = d.counts.reduce((a, c) => a + c.n, 0);
    const n = (s) => (d.counts.find((c) => c.status === s) || { n: 0 }).n;
    tabs.innerHTML = [['', 'All (' + total + ')'], ...statuses.map((s) => [s, s[0].toUpperCase() + s.slice(1) + ' (' + n(s) + ')'])]
      .map(([v, l]) => '<button class="tab" role="tab" data-f="' + v + '" aria-selected="' + (v === filter) + '">' + l + '</button>').join('');
    list.innerHTML = d.leads.length ? d.leads.map(card).join('') : '<p class="muted">No leads here yet.</p>';
  }
  function card(l) {
    return '<article class="lead" data-id="' + l.id + '"><h3>' + esc(l.name) + '<span class="pill ' + l.status + '">' + l.status + '</span></h3>' +
      '<div class="meta">' + when(l.created_at) + ' · ' + esc(l.project_type || 'No project type') + (l.town ? ' · ' + esc(l.town) : '') + '</div>' +
      '<div class="meta"><a href="tel:' + esc(l.phone) + '">' + esc(l.phone) + '</a>' + (l.email ? ' · <a href="mailto:' + esc(l.email) + '">' + esc(l.email) + '</a>' : '') + '</div>' +
      (l.message ? '<div class="msg">' + esc(l.message) + '</div>' : '') +
      '<div class="row"><select data-act="status" aria-label="Status">' + statuses.map((s) => '<option' + (s === l.status ? ' selected' : '') + '>' + s + '</option>').join('') + '</select>' +
      '<textarea data-act="notes" placeholder="Private notes…" aria-label="Notes">' + esc(l.notes) + '</textarea>' +
      '<button class="btn" data-act="save">Save</button><button class="btn ghost" data-act="del">Delete</button></div></article>';
  }
  tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-f]'); if (b) { filter = b.dataset.f; load(); } });
  list.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const el = b.closest('.lead'), id = el.dataset.id;
    if (b.dataset.act === 'save') {
      await api('/admin/api/leads/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: el.querySelector('select').value, notes: el.querySelector('textarea').value }) });
      load();
    } else if (b.dataset.act === 'del' && confirm('Delete this lead permanently?')) {
      await api('/admin/api/leads/' + id, { method: 'DELETE' }); load();
    }
  });
  load();
})();
