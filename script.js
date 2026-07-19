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
   FULL-PAGE PARTICLE FIELD (dark particles on light sections)
   ============================================================ */
(function () {
  const canvas = document.getElementById('pageParticles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const COUNT = 90;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const particles = Array.from({ length: COUNT }, () => ({
    x:     Math.random() * canvas.width,
    y:     Math.random() * canvas.height,
    r:     Math.random() * 1.3 + 0.2,
    vx:    (Math.random() - 0.5) * 0.28,
    vy:    (Math.random() - 0.5) * 0.28,
    alpha: Math.random() * 0.07 + 0.03,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.016 + 0.006,
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
      ctx.fillStyle = `rgba(20,50,90,${flicker})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ============================================================
   SCROLL-DRIVEN FADE-IN
   ============================================================ */
const fadeEls = document.querySelectorAll('.bento-card, .timeline__step, .pricing-card, .faq-item');

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
