(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);

  /* Theme: follows the system setting (resolved inline in <head> to avoid a flash)
     until the visitor uses the toggle, which saves their choice */
  const saved = () => { try { return localStorage.getItem('hexai-theme'); } catch (e) { return null; } };
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (saved()) return;
    root.dataset.theme = e.matches ? 'light' : 'dark';
    drawMesh();
  });
  $('themeBtn').addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('hexai-theme', root.dataset.theme); } catch (e) {}
    drawMesh();
  });

  /* Mobile menu */
  const menuBtn = $('menuBtn'), panel = $('mobilePanel');
  menuBtn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    panel.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false);
  }));

  /* Banjul clock (GMT, no DST) */
  const clock = $('clock');
  if (clock) {
    const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Banjul' }); };
    tick(); setInterval(tick, 1000);
  }

  /* Reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* Mark last-row cards so grid borders close cleanly */
  const markRows = () => document.querySelectorAll('.grid').forEach(g => {
    const cols = getComputedStyle(g).gridTemplateColumns.split(' ').length;
    const cards = [...g.children];
    cards.forEach((c, i) => c.classList.toggle('last-row', i >= cards.length - (cards.length % cols || cols)));
  });
  markRows();

  /* Background line mesh: hubs on a jittered lattice, each joined to its neighbours */
  const mesh = $('mesh'), mctx = mesh.getContext('2d');
  let hubs = [];
  function buildHubs() {
    const w = innerWidth, h = innerHeight, step = Math.max(w, h) / 3.2;
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    hubs = [];
    for (let y = -step; y < h + step * 2; y += step * 0.62)
      for (let x = -step; x < w + step; x += step * 0.9)
        hubs.push({ x: x + (rnd() - .5) * step * .8, y: y + (rnd() - .5) * step * .6, r: rnd() });
  }
  function drawMesh() {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = innerWidth, h = innerHeight;
    mesh.width = w * dpr; mesh.height = h * dpr; mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = getComputedStyle(root), line = cs.getPropertyValue('--mesh'), dot = cs.getPropertyValue('--mesh-dot');
    const off = reduced ? 0 : (scrollY * 0.15) % (Math.max(w, h) / 3.2 * 0.62 * 2);
    mctx.clearRect(0, 0, w, h);
    mctx.strokeStyle = line; mctx.lineWidth = 1;
    const reach = Math.max(w, h) / 1.6;
    mctx.beginPath();
    for (let i = 0; i < hubs.length; i++) {
      const a = hubs[i];
      for (let j = i + 1; j < hubs.length; j++) {
        const b = hubs[j], dx = a.x - b.x, dy = a.y - b.y;
        if (dx * dx + dy * dy < reach * reach && (a.r + b.r) > 1.05) {
          mctx.moveTo(a.x, a.y - off); mctx.lineTo(b.x, b.y - off);
        }
      }
    }
    mctx.stroke();
    mctx.fillStyle = dot;
    hubs.forEach(p => { if (p.r > .6) { mctx.beginPath(); mctx.arc(p.x, p.y - off, 2.2, 0, Math.PI * 2); mctx.fill(); } });
  }
  buildHubs(); drawMesh();
  addEventListener('resize', () => { buildHubs(); drawMesh(); markRows(); });
  let raf = 0;
  addEventListener('scroll', () => { if (!raf && !reduced) raf = requestAnimationFrame(() => { raf = 0; drawMesh(); }); }, { passive: true });

  /* Interactive network field (home page) */
  const field = $('field');
  if (field) {
    const fc = $('fieldCanvas'), fx = fc.getContext('2d'), state = $('fieldState');
    let nodes = [], ptr = null, W = 0, H = 0, running = false;
    const sizeField = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2), r = field.getBoundingClientRect();
      W = r.width; H = r.height; fc.width = W * dpr; fc.height = H * dpr; fx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, W * H / 9000));
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }));
    };
    const frame = () => {
      const accent = getComputedStyle(root).getPropertyValue('--accent').trim();
      fx.clearRect(0, 0, W, H);
      for (const n of nodes) {
        if (ptr) { const dx = ptr.x - n.x, dy = ptr.y - n.y, d = Math.hypot(dx, dy); if (d < 160) { n.vx += dx / d * .03; n.vy += dy / d * .03; } }
        n.vx *= .985; n.vy *= .985; n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      fx.strokeStyle = accent;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 90) { fx.globalAlpha = (1 - d / 90) * (ptr ? .55 : .2); fx.beginPath(); fx.moveTo(a.x, a.y); fx.lineTo(b.x, b.y); fx.stroke(); }
      }
      fx.globalAlpha = 1; fx.fillStyle = accent;
      for (const n of nodes) { fx.beginPath(); fx.arc(n.x, n.y, 1.6, 0, Math.PI * 2); fx.fill(); }
      if (ptr) { fx.globalAlpha = .15; fx.beginPath(); fx.arc(ptr.x, ptr.y, 160, 0, Math.PI * 2); fx.stroke(); fx.globalAlpha = 1; }
      if (running) requestAnimationFrame(frame);
    };
    const pos = e => { const r = fc.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    fc.addEventListener('pointermove', e => { ptr = pos(e); field.classList.add('active'); state.textContent = 'Active · network connected'; });
    fc.addEventListener('pointerleave', () => { ptr = null; field.classList.remove('active'); state.textContent = 'Inactive · hover to activate'; });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running && !reduced) { running = true; requestAnimationFrame(frame); } else if (!e.isIntersecting) running = false;
    }).observe(field);
    sizeField(); addEventListener('resize', sizeField);
    if (reduced) frame();
  }

  /* Contact form → /api/contact */
  const form = $('contactForm');
  if (form) {
    const btn = form.querySelector('button[type="submit"]'), msg = $('formMsg'), label = btn.innerHTML;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      btn.disabled = true; btn.textContent = 'Sending…';
      msg.className = 'form-msg'; msg.textContent = '';
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        if (res.ok) {
          form.reset();
          msg.className = 'form-msg ok';
          msg.textContent = '✓ Request received. We\'ll be in touch within 24 hours.';
        } else {
          const { error } = await res.json().catch(() => ({}));
          msg.className = 'form-msg err';
          msg.textContent = 'Something went wrong: ' + (error || 'please try again.');
        }
      } catch (err) {
        msg.className = 'form-msg err';
        msg.textContent = 'Network error. Please email admin@hexai.gm instead.';
      }
      btn.disabled = false; btn.innerHTML = label;
    });
  }
})();
