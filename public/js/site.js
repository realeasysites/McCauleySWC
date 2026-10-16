(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  document.getElementById('yr').textContent = new Date().getFullYear();

  // nav
  const nav = $('#nav'), burger = $('#burger');
  burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  $$('a', nav).forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

  // gallery filter
  $$('.chip').forEach((c) => c.addEventListener('click', () => {
    $$('.chip').forEach((x) => x.classList.toggle('on', x === c));
    const f = c.dataset.f;
    $$('.g').forEach((g) => { g.hidden = f !== 'all' && !g.dataset.cat.split(' ').includes(f); });
  }));

  // lightbox
  const lb = $('#lb'), lbi = $('img', lb);
  $$('.gb').forEach((b) => b.addEventListener('click', () => { lbi.src = b.dataset.full; lbi.alt = $('img', b).alt; lb.hidden = false; $('.lb-x').focus(); }));
  const close = () => { lb.hidden = true; lbi.removeAttribute('src'); };
  lb.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) close(); });

  // site data: extra socials + project types
  const icons = {
    instagram: 'M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17.3 6.3a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21 8c-.1-1.6-.4-3-1.6-4.2C18.2 2.6 16.8 2.3 15.2 2.2 13.6 2.1 10.4 2.1 8.8 2.2 7.2 2.3 5.8 2.6 4.6 3.8 3.4 5 3.1 6.4 3 8c-.1 1.6-.1 4.8 0 6.4.1 1.6.4 3 1.6 4.2 1.2 1.2 2.6 1.5 4.2 1.6 1.6.1 4.8.1 6.4 0 1.6-.1 3-.4 4.2-1.6 1.2-1.2 1.5-2.6 1.6-4.2.1-1.6.1-4.8 0-6.4z',
    tiktok: 'M16.6 2h-3.2v13.2a2.8 2.8 0 1 1-2.8-2.8c.3 0 .6 0 .8.1V9.2a6 6 0 1 0 5.2 5.9V8.5a7 7 0 0 0 4 1.3V6.6a4 4 0 0 1-4-4.6z',
    youtube: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z'
  };
  fetch('/api/site').then((r) => r.json()).then((s) => {
    $$('[data-socials]').forEach((box) => {
      Object.entries(s.socials).forEach(([k, url]) => {
        if (k === 'facebook' || !icons[k] || $('[data-n="' + k + '"]', box)) return;
        const a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.dataset.n = k; a.setAttribute('aria-label', 'McCauley Stoneworks on ' + k);
        a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + icons[k] + '"/></svg>';
        box.appendChild(a);
      });
    });
    const sel = $('#ptype');
    s.projectTypes.forEach((t) => { const o = document.createElement('option'); o.textContent = t; o.value = t; sel.appendChild(o); });
  }).catch(() => {
    ['Patio', 'Walkway / Steps', 'Stone or Block Wall', 'Fire Pit', 'Flagstone', 'Stone Veneer', 'Interior Tile', 'Not sure yet']
      .forEach((t) => { const o = document.createElement('option'); o.textContent = o.value = t; $('#ptype').appendChild(o); });
  });

  // quote form
  const form = $('#quote'), status = $('#status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'status'; status.textContent = 'Sending…';
    const btn = $('button[type=submit]', form); btn.disabled = true;
    try {
      const r = await fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const d = await r.json();
      if (d.ok) { form.reset(); status.className = 'status ok'; status.textContent = "Thanks! We got your request and will be in touch soon. Need it sooner? Call (207) 408-2811."; }
      else { status.className = 'status bad'; status.textContent = d.errors ? Object.values(d.errors).join(' ') : (d.error || 'Something went wrong. Please call us.'); }
    } catch (_) { status.className = 'status bad'; status.textContent = 'Could not send. Please call (207) 408-2811.'; }
    btn.disabled = false;
  });
})();
