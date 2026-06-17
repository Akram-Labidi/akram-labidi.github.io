/* ══════════════════════════════════════════════════
   CURSOR — CROSSHAIR
══════════════════════════════════════════════════ */
(function() {
  const dot  = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  if (!dot || !ring) return;
  let mx = -300, my = -300, rx = -300, ry = -300;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.addEventListener('mousedown', () => document.body.classList.add('cur-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cur-click'));

  const hoverEls = 'a,button,.tag,.pill,.stat-box,.social-btn,.proj-card,.skill-card,.contact-link-item,input,textarea,.nav-cta';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cur-hover'));
  });
})();

/* ══════════════════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
}, { passive: true });

/* ══════════════════════════════════════════════════
   NETWORK TOPOLOGY CANVAS — SIGNATURE BACKGROUND
══════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], mouse = { x: -999, y: -999 };
  const RED = 'rgba(230,57,70,', BLUE = 'rgba(74,158,255,';

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  class Node {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : -20;
      this.r  = Math.random() * 1.4 + .3;
      this.vx = (Math.random() - .5) * .2;
      this.vy = (Math.random() - .5) * .2;
      this.alpha = Math.random() * .35 + .06;
      this.isRed = Math.random() < .8;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 130 && d > 0) {
        const f = (130 - d) / 130;
        this.x += (dx / d) * f * 1.8;
        this.y += (dy / d) * f * 1.8;
      }
      if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = (this.isRed ? RED : BLUE) + this.alpha + ')';
      ctx.fill();
    }
  }

  const COUNT = Math.min(160, Math.floor(W * H / 8500));
  for (let i = 0; i < COUNT; i++) nodes.push(new Node());

  function drawEdges() {
    const T = 110;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < T * T) {
          const a = .095 * (1 - Math.sqrt(d2) / T);
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = RED + a + ')';
          ctx.lineWidth = .4;
          ctx.stroke();
        }
      }
    }
  }

  function drawMouseNode() {
    if (mouse.x < 0) return;
    const r = 50 + Math.sin(Date.now() * .002) * 10;
    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, r);
    g.addColorStop(0, 'rgba(230,57,70,.08)');
    g.addColorStop(1, 'rgba(230,57,70,0)');
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  let last = 0;
  function loop(ts) {
    if (ts - last > 14) {
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(p => { p.update(); p.draw(); });
      drawEdges();
      drawMouseNode();
      last = ts;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ══════════════════════════════════════════════════
   NAV TOGGLE
══════════════════════════════════════════════════ */
const navToggle   = document.getElementById('navToggle');
const navLinksEl  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const open = navLinksEl.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open.toString());
});
document.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ══════════════════════════════════════════════════
   ACTIVE NAV + SCROLL SHADOW
══════════════════════════════════════════════════ */
const navEl      = document.getElementById('nav');
const sectionEls = document.querySelectorAll('section[id]');
const linkEls    = document.querySelectorAll('.nav-link');
window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 40);
  let cur = '';
  sectionEls.forEach(s => { if (window.scrollY >= s.offsetTop - 180) cur = s.id; });
  linkEls.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${cur}`));
}, { passive: true });

/* ══════════════════════════════════════════════════
   TYPING EFFECT
══════════════════════════════════════════════════ */
(function() {
  const el = document.getElementById('typing');
  const roles = ['Student', 'Network Engineer', 'Security Researcher', 'Full-Stack Developer', 'CTF Enthusiast', 'System Builder'];
  let ri = 0, ci = 0, del = false;
  function tick() {
    const r = roles[ri];
    el.textContent = del ? r.slice(0, --ci) : r.slice(0, ++ci);
    if (!del && ci === r.length) { setTimeout(() => { del = true; tick(); }, 2500); return; }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    setTimeout(tick, del ? 36 : 85);
  }
  setTimeout(tick, 1000);
})();

/* ══════════════════════════════════════════════════
   TERMINAL TYPEWRITER
══════════════════════════════════════════════════ */
(function() {
  const body = document.getElementById('terminalBody');
  if (!body) return;
  const lines = [
    { type: 'cmd', cmd: 'whoami' },
    { type: 'out', html: '<span class="term-success">akram-labidi</span>' },
    { type: 'cmd', cmd: 'cat profile.json' },
    { type: 'raw', html: '<span class="term-brace">{</span>' },
    { type: 'raw', html: '&nbsp;&nbsp;<span class="term-key">"name"</span><span class="term-brace">:</span> <span class="term-string">"Akram Labidi"</span><span class="term-brace">,</span>' },
    { type: 'raw', html: '&nbsp;&nbsp;<span class="term-key">"role"</span><span class="term-brace">:</span> <span class="term-string">"Engineering Student"</span><span class="term-brace">,</span>' },
    { type: 'raw', html: '&nbsp;&nbsp;<span class="term-key">"location"</span><span class="term-brace">:</span> <span class="term-string">"Tunis, Tunisia 🇹🇳"</span><span class="term-brace">,</span>' },
    { type: 'raw', html: '&nbsp;&nbsp;<span class="term-key">"status"</span><span class="term-brace">:</span> <span class="term-string">"open_to_opportunities"</span><span class="term-brace">,</span>' },
    { type: 'raw', html: '&nbsp;&nbsp;<span class="term-key">"passions"</span><span class="term-brace">:</span> <span class="term-brace">[</span><span class="term-string">"development"</span><span class="term-brace">,</span> <span class="term-string">"networks"</span><span class="term-brace">,</span> <span class="term-string">"learning"</span><span class="term-brace">]</span>' },
    { type: 'raw', html: '<span class="term-brace">}</span>' },
    { type: 'cmd', cmd: 'ping 8.8.8.8 -c 1' },
    { type: 'out', html: '<span style="color:#4a9eff">PING 8.8.8.8: 56 bytes — 1ms TTL=64</span>' },
    { type: 'cmd', cmd: '_', cursor: true },
  ];
  let i = 0;
  function renderLine() {
    if (i >= lines.length) return;
    const l = lines[i++];
    const div = document.createElement('div');
    div.style.cssText = 'opacity:0;transition:opacity .3s;';
    if (l.type === 'cmd') {
      div.innerHTML = `<span class="term-prompt">$ </span><span class="term-cmd">${l.cmd}</span>` + (l.cursor ? '<span class="cursor-blink-term"></span>' : '');
    } else if (l.type === 'out') {
      div.innerHTML = `<span class="term-output">${l.html}</span>`;
    } else {
      div.innerHTML = l.html;
    }
    body.appendChild(div);
    requestAnimationFrame(() => { div.style.opacity = '1'; });
    setTimeout(renderLine, l.type === 'cmd' && !l.cursor ? 200 : 130);
  }
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { setTimeout(renderLine, 500); obs.disconnect(); }
  }, { threshold: .3 });
  obs.observe(body);
})();

/* ══════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════ */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: .07, rootMargin: '0px 0px -48px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .tl-item').forEach(el => io.observe(el));

/* ══════════════════════════════════════════════════
   SKILL CARD 3D TILT
══════════════════════════════════════════════════ */
document.querySelectorAll('.skill-card, .proj-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top)  / r.height;
    const tx = (x - .5) * 10;
    const ty = (y - .5) * -10;
    card.style.transform = `translateY(-10px) rotateX(${ty}deg) rotateY(${tx}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ══════════════════════════════════════════════════
   STAT COUNTER ANIMATION
══════════════════════════════════════════════════ */
const statIo = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, raw = el.textContent.trim(), num = parseInt(raw);
    if (isNaN(num)) return;
    const suffix = raw.replace(num.toString(), '');
    let start = null;
    const dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * num) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = num + suffix;
    }
    requestAnimationFrame(step);
    statIo.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('.stat-num').forEach(el => { if (el.textContent.trim() !== '∞') statIo.observe(el); });

/* ══════════════════════════════════════════════════
   SKILL BAR ANIMATION
══════════════════════════════════════════════════ */
const barIo = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
      setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 300);
    });
    barIo.unobserve(e.target);
  });
}, { threshold: .4 });
const barsWrap = document.getElementById('aboutBars');
if (barsWrap) barIo.observe(barsWrap.parentElement);

/* ══════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════ */
function handleContact() {
  const name    = document.getElementById('cName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const msg     = document.getElementById('cMsg').value.trim();
  const status  = document.getElementById('formStatus');
  const btn     = document.querySelector('.contact-form-card .btn');
  status.className = 'form-status';
  status.style.display = 'none';
  if (!name || !email || !msg) {
    status.textContent = '⚠ Please fill in all required fields.';
    status.className = 'form-status error';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = '⚠ Please enter a valid email address.';
    status.className = 'form-status error';
    return;
  }
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin .8s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Sending…';
  btn.style.opacity = '.7';
  btn.style.pointerEvents = 'none';
  setTimeout(() => {
    status.textContent = `✓ Message sent, ${name}! I'll get back to you shortly.`;
    status.className = 'form-status success';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message';
    btn.style.opacity = '1';
    btn.style.pointerEvents = '';
    ['cName','cEmail','cSubject','cMsg'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  }, 1400);
}

/* spin keyframe */
const sty = document.createElement('style');
sty.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(sty);
