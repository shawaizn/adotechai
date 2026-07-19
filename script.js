/* ============================================================
   CUSTOM CURSOR — gold stardust scatter
   ============================================================ */
(function () {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (dot)  dot.style.display  = 'none';
  if (ring) ring.style.display = 'none';

  if (window.matchMedia('(hover: none)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  let mouseX = -200, mouseY = -200;
  let lastX  = -200, lastY  = -200;
  const particles = [];

  // Gold palette: light → rich → deep
  const GOLDS = [
    [245, 217, 122],  // #f5d97a — bright
    [232, 201, 106],  // #e8c96a — mid
    [201, 168,  76],  // #c9a84c — rich
    [255, 236, 160],  // #ffeca0 — pale shimmer
  ];

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const dx = mouseX - lastX;
    const dy = mouseY - lastY;
    const speed = Math.sqrt(dx * dx + dy * dy);

    // Spawn more particles the faster you move
    const count = Math.min(Math.floor(speed * 0.5) + 1, 6);
    for (let i = 0; i < count; i++) {
      const [r, g, b] = GOLDS[Math.floor(Math.random() * GOLDS.length)];
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 2.2;
      const vel   = Math.random() * 2.2 + 0.6;
      particles.push({
        x:     mouseX + (Math.random() - 0.5) * 6,
        y:     mouseY + (Math.random() - 0.5) * 6,
        vx:    Math.cos(angle) * vel * 0.6 + (Math.random() - 0.5) * 1.2,
        vy:    Math.sin(angle) * vel * 0.6 + (Math.random() - 0.5) * 1.2 - 0.4,
        r:     Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.5 + 0.6,
        decay: Math.random() * 0.022 + 0.018,
        cr: r, cg: g, cb: b,
      });
    }

    lastX = mouseX;
    lastY = mouseY;
  }, { passive: true });

  // Click burst — spray 30 particles outward
  document.addEventListener('mousedown', () => {
    for (let i = 0; i < 30; i++) {
      const [r, g, b] = GOLDS[Math.floor(Math.random() * GOLDS.length)];
      const angle = Math.random() * Math.PI * 2;
      const vel   = Math.random() * 4 + 1.5;
      particles.push({
        x: mouseX, y: mouseY,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel - 1,
        r:  Math.random() * 2.8 + 0.6,
        alpha: Math.random() * 0.4 + 0.7,
        decay: Math.random() * 0.018 + 0.012,
        cr: r, cg: g, cb: b,
      });
    }
  });

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x     += p.vx;
      p.y     += p.vy;
      p.vy    += 0.06; // gentle gravity
      p.vx    *= 0.97;
      p.alpha -= p.decay;

      if (p.alpha <= 0) { particles.splice(i, 1); continue; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.shadowColor = `rgba(${p.cr},${p.cg},${p.cb},${p.alpha * 0.9})`;
      ctx.shadowBlur  = 8;
      ctx.fillStyle   = `rgba(${p.cr},${p.cg},${p.cb},${p.alpha})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ============================================================
   HERO MOBILE NAV
   ============================================================ */
const mobileToggle = document.getElementById('heroMobileToggle');
const mobileMenu   = document.getElementById('heroMobileMenu');

if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  document.addEventListener('click', e => {
    if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

/* ============================================================
   HERO — floating card + mouse tilt + blob parallax
   ============================================================ */
const blobs = document.querySelectorAll('.blob');
const card  = document.getElementById('heroCard');
const hero  = document.querySelector('.hero');

// Float: smooth sine wave bob in JS so tilt can stack on top
let floatStart = null;
const FLOAT_AMPLITUDE = 22; // px
const FLOAT_PERIOD    = 3800; // ms

let tiltX = 0, tiltY = 0;

function animateCard(ts) {
  if (!card) return;
  if (!floatStart) floatStart = ts;

  const elapsed = ts - floatStart;
  const floatY  = Math.sin((elapsed / FLOAT_PERIOD) * Math.PI * 2) * FLOAT_AMPLITUDE;

  card.style.transform =
    `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(${floatY}px)`;

  requestAnimationFrame(animateCard);
}

// Wait for card entrance animation to finish before starting float
setTimeout(() => requestAnimationFrame(animateCard), 1100);

// Mouse tilt
document.addEventListener('mousemove', e => {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  // Blob parallax
  blobs.forEach((blob, i) => {
    const depth = (i + 1) * 12;
    blob.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
  });

  // Feed tilt values — animateCard picks them up on next frame
  tiltX =  dy * 5;
  tiltY = -dx * 5;
}, { passive: true });

// Reset tilt on mouse leave
if (hero) {
  hero.addEventListener('mouseleave', () => { tiltX = 0; tiltY = 0; });
}

/* ============================================================
   PARTICLE FIELD
   ============================================================ */
(function () {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const COUNT = 90;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const particles = Array.from({ length: COUNT }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     Math.random() * 1.4 + 0.3,
    vx:    (Math.random() - 0.5) * 0.35,
    vy:    (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.5 + 0.15,
    // individual flicker phase
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.02 + 0.008,
  }));

  function draw(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      // drift
      p.x += p.vx;
      p.y += p.vy;

      // wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // flicker
      p.phase += p.speed;
      const flicker = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${flicker})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();

/* ============================================================
   FULL-PAGE PARTICLE FIELD
   Canvas is fixed z-index:-1, behind all content.
   Particles live in page-space (pageY) so they don't drift
   when scrolling — they're anchored to the document.
   ============================================================ */
(function () {
  const canvas = document.getElementById('pageParticles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const COUNT = 260;

  let W = window.innerWidth;
  let H = window.innerHeight;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Determine dark section page-Y ranges
  const DARK_SELECTORS = '.hero, .demo-section, .usp-section, .footer';
  let darkRanges = [];

  function buildDarkRanges() {
    darkRanges = Array.from(document.querySelectorAll(DARK_SELECTORS)).map(el => ({
      top:    el.offsetTop,
      bottom: el.offsetTop + el.offsetHeight,
    }));
  }
  buildDarkRanges();
  window.addEventListener('resize', buildDarkRanges, { passive: true });

  function isOverDark(pageY) {
    return darkRanges.some(r => pageY >= r.top && pageY <= r.bottom);
  }

  // Particles use pageY (document coordinates)
  const pageH = () => document.documentElement.scrollHeight;

  const particles = Array.from({ length: COUNT }, () => ({
    x:     Math.random() * W,
    pageY: Math.random() * pageH(),
    r:     Math.random() * 4 + 2,
    vx:    (Math.random() - 0.5) * 0.35,
    vy:    (Math.random() - 0.5) * 0.35,
    alpha: Math.random() * 0.3 + 0.7,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.016 + 0.007,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const scrollY = window.scrollY;
    const docH    = pageH();

    particles.forEach(p => {
      // Move in page space
      p.x     += p.vx;
      p.pageY += p.vy;

      // Wrap horizontally
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;

      // Wrap vertically across full document height
      if (p.pageY < 0)     p.pageY = docH;
      if (p.pageY > docH)  p.pageY = 0;

      // Convert to viewport Y for rendering
      const viewY = p.pageY - scrollY;

      // Skip if off screen
      if (viewY < -4 || viewY > H + 4) return;

      p.phase += p.speed;
      const flicker = p.alpha * (0.8 + 0.2 * Math.sin(p.phase));
      const onDark  = isOverDark(p.pageY);

      ctx.beginPath();
      ctx.arc(p.x, viewY, p.r, 0, Math.PI * 2);
      if (onDark) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255,255,255,${flicker})`;
      } else {
        ctx.shadowColor = '#378ADD';
        ctx.shadowBlur = 24;
        ctx.fillStyle = `rgba(55,138,221,${Math.min(flicker * 2.5, 1)})`;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ============================================================
   SECTION PARTICLE FIELDS (demo + usp) — white, same as hero
   ============================================================ */
(function () {
  function initSectionParticles(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const COUNT = 90;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const particles = Array.from({ length: COUNT }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.4 + 0.3,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.008,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        p.phase += p.speed;
        const flicker = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${flicker})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  initSectionParticles('demoParticles');
  initSectionParticles('uspParticles');
})();

/* ============================================================
   SCROLL-DRIVEN FADE-IN
   ============================================================ */
const fadeEls = document.querySelectorAll('.bento-card, .process-card, .pricing-card, .faq-item');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

fadeEls.forEach((el, i) => {
  el.style.setProperty('--delay', `${i * 60}ms`);
  observer.observe(el);
});

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answer = btn.nextElementSibling;

    // close all others
    document.querySelectorAll('.faq-q').forEach(other => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.classList.remove('open');
      }
    });

    btn.setAttribute('aria-expanded', !expanded);
    answer.classList.toggle('open', !expanded);
  });
});

/* ============================================================
   CONTACT FORM — placeholder handler
   ============================================================ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    // REPLACE: wire form submission (e.g. Formspree action URL)
    // Until wired, show a simple confirmation
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Message sent!';
    btn.disabled = true;
    contactForm.reset();
  });
}
