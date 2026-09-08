/* =========================================================
   MOHIT PAL — PORTFOLIO  ·  main.js
   GSAP 3 + ScrollTrigger + Lenis
   ========================================================= */

/* ---------- 1. EDIT ME ---------- */
const SITE = {
  linkedin: 'https://www.linkedin.com/in/mohit-pal-0b7561352/',
  dob: new Date(2003, 10, 16), // 16 Nov 2003 (month is 0-based)
};

/* ---------- 2. Boot ---------- */
(function boot() {
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Fill dynamic bits that don't need libraries
  document.querySelectorAll('[data-linkedin]').forEach(a => (a.href = SITE.linkedin));
  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));
  const age = calcAge(SITE.dob);
  document.querySelectorAll('[data-age]').forEach(el => (el.textContent = age));

  // If a CDN failed, show the page without motion instead of a black screen.
  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) {
    console.warn('Animation libraries failed to load; rendering static fallback.');
    showStaticFallback();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const lenis = initLenis();
  initProgress();
  initGridGlow(HOVER);
  initNav(lenis);
  initHeroCanvas(REDUCED);
  prepareHero();
  initMarquee(lenis);
  initSectionTitles();
  initReveals(REDUCED);
  initWords();
  initCounters();
  initTerminal(age);
  initTilt(HOVER);
  initMagnetic(HOVER);
  initTimeline();
  initProjects();
  initContact();
  initModal(lenis);
  initScramble();

  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());

  runPreloader(lenis, REDUCED).then(() => {
    ScrollTrigger.refresh();
    heroIntro(REDUCED).then(() => initHeroParallax(HOVER));
  });
})();

/* =========================================================
   Helpers
   ========================================================= */
function calcAge(dob) {
  const now = new Date();
  let a = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
  return a;
}

function splitChars(el) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const frag = document.createDocumentFragment();
  [...text].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch === ' ' ? ' ' : ch;
    s.setAttribute('aria-hidden', 'true');
    frag.appendChild(s);
  });
  el.appendChild(frag);
  return el.querySelectorAll('.char');
}

function splitWordsFragment(node) {
  const frag = document.createDocumentFragment();
  [...node.childNodes].forEach(child => {
    if (child.nodeType === 3) {
      child.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
        else {
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = part;
          frag.appendChild(s);
        }
      });
    } else if (child.nodeType === 1) {
      const clone = child.cloneNode(false);
      clone.appendChild(splitWordsFragment(child));
      frag.appendChild(clone);
    }
  });
  return frag;
}

function showStaticFallback() {
  const pre = document.querySelector('.preloader');
  if (pre) pre.remove();
  document.querySelectorAll('[data-intro], .chip, .datacard, .hero__scroll, .nav').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
  const frame = document.querySelector('.portrait__frame');
  if (frame) frame.style.clipPath = 'none';
  document.querySelectorAll('.w').forEach(w => (w.style.opacity = '1'));
}

/* =========================================================
   Lenis smooth scroll
   ========================================================= */
function initLenis() {
  const lenis = new Lenis({
    duration: 1.25,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/* =========================================================
   Preloader
   ========================================================= */
function runPreloader(lenis, reduced) {
  return new Promise(resolve => {
    const el = document.querySelector('.preloader');
    if (!el) return resolve();
    lenis.stop();
    window.scrollTo(0, 0);

    const num = el.querySelector('.preloader__num');
    const bar = el.querySelector('.preloader__bar i');
    const lines = el.querySelectorAll('.preloader__log span');
    const o = { v: 0 };
    const dur = reduced ? 0.4 : 1.9;

    const tl = gsap.timeline({
      onComplete: () => {
        el.style.display = 'none';
        lenis.start();
        resolve();
      },
    });

    tl.from(lines, { opacity: 0, y: 8, stagger: 0.28, duration: 0.35, ease: 'power2.out' }, 0)
      .to(o, {
        v: 100, duration: dur, ease: 'power2.inOut',
        onUpdate: () => {
          num.textContent = String(Math.round(o.v)).padStart(3, '0');
          bar.style.transform = `scaleX(${o.v / 100})`;
        },
      }, 0.1)
      .to(el.querySelector('.preloader__inner'), { yPercent: -25, opacity: 0, duration: 0.5, ease: 'power2.in' })
      .to(el, { yPercent: -100, duration: reduced ? 0.3 : 0.95, ease: 'power4.inOut' }, '-=0.25');
  });
}

/* =========================================================
   Scroll progress bar
   ========================================================= */
function initProgress() {
  gsap.to('.progress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });
}

/* =========================================================
   Mouse-following grid glow
   ========================================================= */
function initGridGlow(hover) {
  const glow = document.querySelector('.grid-glow');
  if (!glow) return;
  if (!hover) { glow.style.display = 'none'; return; }
  const pos = { x: 50, y: 30 }, target = { x: 50, y: 30 };
  window.addEventListener('mousemove', e => {
    target.x = (e.clientX / window.innerWidth) * 100;
    target.y = (e.clientY / window.innerHeight) * 100;
  }, { passive: true });
  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.08;
    pos.y += (target.y - pos.y) * 0.08;
    glow.style.setProperty('--sx', pos.x + '%');
    glow.style.setProperty('--sy', pos.y + '%');
  });
}

/* =========================================================
   Nav: show/hide, active state, smooth anchors, mobile menu
   ========================================================= */
function initNav(lenis) {
  const nav = document.getElementById('nav');
  const burger = nav.querySelector('.nav__burger');
  const menu = document.querySelector('.mobile-menu');
  let menuOpen = false, hidden = false;

  ScrollTrigger.create({
    trigger: document.body, start: 'top top', end: 'bottom bottom',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('nav--solid', y > 60);
      if (nav.dataset.ready !== '1') return;
      const shouldHide = self.direction === 1 && y > 320 && !menuOpen;
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        gsap.to(nav, { yPercent: hidden ? -100 : 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      }
    },
  });

  // Active link
  nav.querySelectorAll('.nav__links a[href^="#"]').forEach(a => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%',
      onToggle: self => a.classList.toggle('active', self.isActive),
    });
  });

  // Smooth anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (menuOpen) toggleMenu(false);
      lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    });
  });

  function toggleMenu(force) {
    menuOpen = typeof force === 'boolean' ? force : !menuOpen;
    burger.classList.toggle('is-open', menuOpen);
    burger.setAttribute('aria-expanded', String(menuOpen));
    menu.classList.toggle('is-open', menuOpen);
    menu.setAttribute('aria-hidden', String(!menuOpen));
    hidden = false;
    gsap.to(nav, { yPercent: 0, duration: 0.4, overwrite: 'auto' });
    if (menuOpen) {
      lenis.stop();
      gsap.fromTo(menu.querySelectorAll('.mobile-menu__links a, .mobile-menu__foot a'),
        { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: 'power4.out', delay: 0.05 });
    } else {
      lenis.start();
    }
  }
  burger.addEventListener('click', () => toggleMenu());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) toggleMenu(false); });
}

/* =========================================================
   Hero: particle network canvas
   ========================================================= */
function initHeroCanvas(reduced) {
  const canvas = document.getElementById('net');
  if (!canvas) return;
  if (reduced) { canvas.style.display = 'none'; return; }
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, pts = [], running = true, raf = 0;
  const mouse = { x: -9999, y: -9999 };
  const LINK = 130;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(40, Math.min(120, Math.floor((w * h) / 16000)));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.4 + 0.6,
    }));
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy;
      if (d2 < 220 * 220) { p.x += dx * 0.006; p.y += dy * 0.006; }
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          const alpha = (1 - Math.sqrt(d2) / LINK) * 0.28;
          ctx.strokeStyle = `rgba(0,229,255,${alpha})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(mouse.x - a.x, mouse.y - a.y);
      if (md < 200) {
        ctx.strokeStyle = `rgba(139,92,246,${(1 - md / 200) * 0.5})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    for (const p of pts) {
      ctx.fillStyle = 'rgba(0,229,255,0.85)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }

  resize();
  step();
  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  }, { passive: true });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  // Pause when the hero leaves the viewport
  new IntersectionObserver(([entry]) => {
    const visible = entry.isIntersecting;
    if (visible && !running) { running = true; step(); }
    else if (!visible && running) { running = false; cancelAnimationFrame(raf); }
  }, { threshold: 0.02 }).observe(canvas);
}

/* =========================================================
   Hero: initial states + intro timeline + scroll parallax
   ========================================================= */
function prepareHero() {
  document.querySelectorAll('.hero__name .split-chars').forEach(splitChars);
  gsap.set('.hero__name .char', { yPercent: 120, rotate: 8, opacity: 0 });
  gsap.set('.nav', { yPercent: -100, opacity: 0 });
}

function heroIntro(reduced) {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  const d = reduced ? 0.01 : 1;

  tl.to('.hero__name .char', { yPercent: 0, rotate: 0, opacity: 1, duration: 1.1 * d, stagger: 0.045 * d })
    .to('.portrait__frame', { clipPath: 'circle(75% at 50% 50%)', duration: 1.4 * d, ease: 'power3.inOut' }, 0.15)
    .to('.portrait__ring', { opacity: 1, scale: 1, duration: 1 * d, stagger: 0.1 }, 0.5)
    .to('[data-intro]', { y: 0, opacity: 1, duration: 0.9 * d, stagger: 0.1 * d }, 0.45)
    .to('[data-float]', { opacity: 1, y: 0, scale: 1, duration: 0.8 * d, stagger: 0.08, ease: 'back.out(1.8)' }, 0.9)
    .to('.nav', { yPercent: 0, opacity: 1, duration: 0.8 * d, onComplete: () => (document.getElementById('nav').dataset.ready = '1') }, 0.7)
    .to('.hero__scroll', { opacity: 1, duration: 0.8 * d }, 1.3);

  // Scroll parallax: name lines slide apart, text fades, portrait sinks
  const hero = document.querySelector('.hero');
  const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero__name .line:nth-child(1)', { xPercent: -12, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__name .line:nth-child(2)', { xPercent: 12, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__text', { yPercent: -18, opacity: 0.1, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__visual', { yPercent: 22, scale: 0.92, opacity: 0.4, ease: 'none', scrollTrigger: st });
  gsap.to('.hero__scroll', { opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '25% top', scrub: true } });
  return tl;
}

function initHeroParallax(hover) {
  if (!hover) return;
  const hero = document.querySelector('.hero');
  const floats = gsap.utils.toArray('[data-float]');
  const frame = document.querySelector('.portrait__frame');
  const depths = [0.6, 0.9, 0.5, 1.1, 0.8];
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    floats.forEach((el, i) => {
      gsap.to(el, { x: nx * 40 * depths[i % depths.length], y: ny * 40 * depths[i % depths.length], duration: 0.9, ease: 'power3.out' });
    });
    gsap.to(frame, { x: nx * -14, y: ny * -14, rotateY: nx * 8, rotateX: -ny * 8, transformPerspective: 900, duration: 1, ease: 'power3.out' });
  }, { passive: true });
  hero.addEventListener('mouseleave', () => {
    gsap.to([...floats, frame], { x: 0, y: 0, rotateX: 0, rotateY: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
  });
}

/* =========================================================
   Marquee — direction and speed follow scroll velocity
   ========================================================= */
function initMarquee(lenis) {
  const rows = gsap.utils.toArray('[data-marquee]');
  if (!rows.length) return;
  const tweens = [];

  rows.forEach(row => {
    const inner = row.querySelector('.marquee__inner');
    if (!inner || !inner.offsetWidth) return;
    // Make the base strip wider than the viewport, then clone it once for a seamless loop
    let guard = 0;
    while (inner.offsetWidth < window.innerWidth * 1.2 && guard++ < 10) {
      inner.innerHTML += inner.innerHTML;
    }
    row.appendChild(inner.cloneNode(true));

    const dir = Number(row.dataset.dir) || 1;
    const dur = Math.max(18, inner.offsetWidth / 60);
    const tween = dir > 0
      ? gsap.fromTo(row, { xPercent: 0 }, { xPercent: -50, duration: dur, ease: 'none', repeat: -1 })
      : gsap.fromTo(row, { xPercent: -50 }, { xPercent: 0, duration: dur, ease: 'none', repeat: -1 });
    tweens.push(tween);
  });

  let idle;
  lenis.on('scroll', ({ velocity }) => {
    const v = gsap.utils.clamp(-1, 1, velocity / 40);
    const scale = 1 + Math.abs(v) * 5;
    const sign = v < 0 ? -1 : 1;
    tweens.forEach(t => gsap.to(t, { timeScale: scale * sign, duration: 0.3, overwrite: true }));
    clearTimeout(idle);
    idle = setTimeout(() => tweens.forEach(t => gsap.to(t, { timeScale: 1, duration: 1.2, overwrite: true })), 120);
  });
}

/* =========================================================
   Section titles: masked char reveal + rule line
   ========================================================= */
function initSectionTitles() {
  document.querySelectorAll('[data-split]').forEach(title => {
    const chars = splitChars(title);
    const line = title.parentElement.querySelector('.section__line');
    gsap.set(chars, { yPercent: 110, opacity: 0 });
    if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left' });
    ScrollTrigger.create({
      trigger: title, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(chars, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.04, ease: 'power4.out' });
        if (line) gsap.to(line, { scaleX: 1, duration: 1.4, ease: 'power3.out', delay: 0.2 });
      },
    });
  });
}

/* =========================================================
   Generic reveals
   ========================================================= */
function initReveals(reduced) {
  document.querySelectorAll('[data-reveal]').forEach(el => {
    if (reduced) return;
    gsap.fromTo(el, { y: 60, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1.1, ease: 'power4.out',
      delay: Number(el.dataset.delay) || 0,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* =========================================================
   Word-by-word scroll reveal (about lead)
   ========================================================= */
function initWords() {
  document.querySelectorAll('[data-words]').forEach(el => {
    const frag = splitWordsFragment(el);
    el.textContent = '';
    el.appendChild(frag);
    const words = el.querySelectorAll('.w');
    gsap.to(words, {
      opacity: 1, ease: 'none', stagger: 0.06,
      scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 },
    });
  });
}

/* =========================================================
   Counters
   ========================================================= */
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const dec = Number(el.dataset.decimals) || 0;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const fmt = v => prefix + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    const o = { v: 0 };
    el.textContent = fmt(0);
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(o, { v: target, duration: 2.2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) }),
    });
  });
}

/* =========================================================
   Typing terminal
   ========================================================= */
function initTerminal(age) {
  const box = document.querySelector('[data-terminal] .terminal__body');
  if (!box) return;
  const PROMPT = '<span class="c">mohit=# </span>';
  const LINES = [
    { cmd: true, parts: [['whoami', '']] },
    { parts: [[`Mohit Pal · ${age} · Gwalior, India`, 'g']] },
    { cmd: true, parts: [['SELECT ', 'k'], ['role, focus ', ''], ['FROM ', 'k'], ['profile;', '']] },
    { parts: [[' role             | focus', 'd']] },
    { parts: [['------------------+---------------------------', 'd']] },
    { parts: [[' Business Analyst | decisions, not dashboards', '']] },
    { parts: [[' Data Analyst     | SQL · Python · Power BI', '']] },
    { parts: [['(2 rows)', 'd']] },
    { cmd: true, parts: [['SELECT ', 'k'], ['status ', ''], ['FROM ', 'k'], ['availability;', '']] },
    { parts: [['✔ open to Data / Business Analyst roles', 'g']] },
  ];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let started = false;

  async function run() {
    box.innerHTML = '';
    for (const line of LINES) {
      const div = document.createElement('div');
      box.appendChild(div);
      if (line.cmd) {
        div.innerHTML = PROMPT;
        for (const [text, cls] of line.parts) {
          const span = document.createElement('span');
          if (cls) span.className = cls;
          div.appendChild(span);
          for (const ch of text) { span.textContent += ch; await wait(26 + Math.random() * 30); }
        }
        await wait(260);
      } else {
        div.innerHTML = line.parts.map(([t, c]) => `<span class="${c}">${esc(t)}</span>`).join('');
        await wait(70);
      }
    }
    const cur = document.createElement('div');
    cur.innerHTML = PROMPT + '<span class="cursor-blink"></span>';
    box.appendChild(cur);
  }

  ScrollTrigger.create({
    trigger: box, start: 'top 80%', once: true,
    onEnter: () => { if (!started) { started = true; run(); } },
  });
}

/* =========================================================
   3D tilt + spotlight cards
   ========================================================= */
function initTilt(hover) {
  if (!hover) return;
  document.querySelectorAll('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      gsap.to(card, { rotateY: (x - 0.5) * 12, rotateX: (0.5 - y) * 12, transformPerspective: 1000, duration: 0.5, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* =========================================================
   Magnetic buttons
   ========================================================= */
function initMagnetic(hover) {
  if (!hover) return;
  document.querySelectorAll('.magnetic').forEach(btn => {
    const strength = 0.35;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      gsap.to(btn, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power3.out' });
      const label = btn.querySelector('span');
      if (label) gsap.to(label, { x: x * 0.12, y: y * 0.12, duration: 0.4, ease: 'power3.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      const label = btn.querySelector('span');
      if (label) gsap.to(label, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* =========================================================
   Experience timeline line
   ========================================================= */
function initTimeline() {
  const line = document.querySelector('.timeline__line i');
  if (!line) return;
  gsap.to(line, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 55%', scrub: true },
  });
}

/* =========================================================
   Projects: pinned horizontal scroll (desktop only)
   ========================================================= */
function initProjects() {
  const section = document.getElementById('projects');
  const track = section && section.querySelector('.projects__track');
  if (!track) return;
  const panels = gsap.utils.toArray('.project', track);
  const projectsOnly = panels.filter(p => !p.classList.contains('project--intro'));
  const count = section.querySelector('[data-proj-count]');
  const bar = section.querySelector('.projects__bar i');

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const distance = () => track.scrollWidth - window.innerWidth;

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: self => {
          if (bar) bar.style.transform = `scaleX(${self.progress})`;
          if (count) {
            const x = self.progress * distance() + window.innerWidth * 0.5;
            let idx = -1;
            projectsOnly.forEach((p, i) => { if (p.offsetLeft <= x) idx = i; });
            count.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(projectsOnly.length).padStart(2, '0')}`;
          }
        },
      },
    });

    panels.forEach(panel => {
      const inner = panel.querySelector('.project__inner');
      const bg = panel.querySelector('.project__bg');
      const metrics = panel.querySelectorAll('.metric');
      // The first project peeks in beside the intro panel, so its triggers start closer to where it already sits.
      const first = panel === projectsOnly[0];

      if (!panel.classList.contains('project--intro')) {
        gsap.fromTo(inner, { xPercent: 18, opacity: 0.15 }, {
          xPercent: 0, opacity: 1, ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: first ? 'left 62%' : 'left 95%', end: 'left 30%', scrub: true },
        });
        gsap.fromTo(metrics, { y: 80, opacity: 0 }, {
          y: 0, opacity: 1, stagger: 0.12, ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: first ? 'left 58%' : 'left 80%', end: 'left 22%', scrub: true },
        });
      }
      if (bg) {
        gsap.fromTo(bg, { xPercent: 30 }, {
          xPercent: -30, ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
        });
      }
    });

    // Intro panel: its content parallaxes out as you move on
    const intro = section.querySelector('.project--intro .project__inner');
    if (intro) {
      gsap.to(intro, {
        xPercent: -30, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: section.querySelector('.project--intro'), containerAnimation: tween, start: 'left left', end: 'right 8%', scrub: true },
      });
    }
  });

  // Mobile / tablet: plain vertical reveals
  mm.add('(max-width: 1023px)', () => {
    projectsOnly.forEach(panel => {
      gsap.fromTo(panel.querySelector('.project__inner'), { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'power4.out',
        scrollTrigger: { trigger: panel, start: 'top 85%', once: true },
      });
    });
  });
}

/* =========================================================
   Contact: giant text reveal
   ========================================================= */
function initContact() {
  const words = document.querySelectorAll('[data-split-scroll]');
  if (!words.length) return;
  const chars = [];
  words.forEach(w => chars.push(...splitChars(w)));
  gsap.set(chars, { yPercent: 120, rotate: 6, opacity: 0 });
  ScrollTrigger.create({
    trigger: '.contact__big', start: 'top 85%', once: true,
    onEnter: () => gsap.to(chars, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.2, stagger: 0.05, ease: 'power4.out' }),
  });
  gsap.to('.contact__blob', {
    scale: 1.25, ease: 'none',
    scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

/* =========================================================
   Case-study modal
   ========================================================= */
function initModal(lenis) {
  const modal = document.querySelector('.modal');
  if (!modal) return;
  const panel = modal.querySelector('.modal__panel');
  const bg = modal.querySelector('.modal__bg');
  const content = modal.querySelector('.modal__content');
  let open = false, lastFocus = null;

  function show(id) {
    const tpl = document.getElementById('case-' + id);
    if (!tpl) return;
    content.innerHTML = '';
    content.appendChild(tpl.content.cloneNode(true));
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    open = true;
    lenis.stop();
    panel.scrollTop = 0;
    gsap.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    gsap.fromTo(panel, { yPercent: 6, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power4.out' });
    gsap.fromTo(content.children, { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04, duration: 0.6, ease: 'power3.out', delay: 0.15 });
    modal.querySelector('.modal__close').focus();
  }

  function hide() {
    if (!open) return;
    open = false;
    gsap.to(bg, { opacity: 0, duration: 0.3 });
    gsap.to(panel, {
      yPercent: 6, opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete: () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        lenis.start();
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      },
    });
  }

  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-open]');
    if (opener) { e.preventDefault(); show(opener.dataset.open); return; }
    if (e.target.closest('[data-close]')) hide();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) hide(); });
}

/* =========================================================
   Text scramble on hover
   ========================================================= */
function initScramble() {
  const CHARS = '!<>-_\\/[]{}=+*^?#0123456789';
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const original = el.textContent;
    el.dataset.text = original;
    let raf = 0;
    el.addEventListener('mouseenter', () => {
      cancelAnimationFrame(raf);
      const len = original.length;
      const start = performance.now();
      const dur = 380 + len * 14;
      const tick = now => {
        const p = Math.min(1, (now - start) / dur);
        const reveal = Math.floor(p * len * 1.15);
        let out = '';
        for (let i = 0; i < len; i++) {
          const ch = original[i];
          if (ch === ' ' || ch === '@' || ch === '.') out += ch;
          else out += i < reveal ? ch : CHARS[(Math.random() * CHARS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) raf = requestAnimationFrame(tick);
        else el.textContent = original;
      };
      raf = requestAnimationFrame(tick);
    });
    el.addEventListener('mouseleave', () => { cancelAnimationFrame(raf); el.textContent = original; });
  });
}
