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
   HERO — mouse parallax on blobs
   ============================================================ */
const blobs = document.querySelectorAll('.blob');

document.addEventListener('mousemove', e => {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;

  blobs.forEach((blob, i) => {
    const depth = (i + 1) * 12;
    blob.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
  });
}, { passive: true });

/* ============================================================
   SCROLL-DRIVEN FADE-IN
   ============================================================ */
const fadeEls = document.querySelectorAll('.card, .step, .benefit-item, .pricing-card, .faq-item');

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
