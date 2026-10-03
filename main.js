/**
 * AKBAR KHAN — PREMIUM MUSICIAN WEBSITE
 * Main JavaScript — Interactions, Animations & UX
 */

'use strict';

/* ══════════════════════════════════════════════════════
   UTILITY HELPERS
══════════════════════════════════════════════════════ */

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

/* ══════════════════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════════════════ */

function initLoader() {
  const loader = $('#loader');
  const progress = $('#loaderProgress');

  if (!loader) return;

  let pct = 0;
  const target = 100;
  const duration = 1600; // ms
  const interval = 30;
  const step = (target / (duration / interval));

  const timer = setInterval(() => {
    pct = Math.min(pct + step + Math.random() * step * 0.5, target);
    if (progress) progress.style.width = pct + '%';

    if (pct >= target) {
      clearInterval(timer);
      setTimeout(finishLoader, 200);
    }
  }, interval);

  function finishLoader() {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    document.body.classList.add('page-ready');

    // Start hero background zoom
    const heroBg = $('#heroBg');
    if (heroBg && !prefersReducedMotion) {
      heroBg.style.transition = 'transform 8s cubic-bezier(0.16, 1, 0.3, 1)';
      heroBg.style.transform = 'scale(1.04)';
    }

    initScrollAnimations();
    initCountUp();
  }
}

/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════ */

function initCursor() {
  if (isTouchDevice()) return;

  const cursor = $('#cursor');
  const cursorText = $('#cursorText');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    curX += (mouseX - curX) * 0.15;
    curY += (mouseY - curY) * 0.15;
    cursor.style.transform = `translate(${curX}px, ${curY}px)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Cursor expand on interactive elements
  const expandTargets = $$('[data-cursor], .gallery-item, .instrument-card, .video-play, .video-feature__frame, .btn');

  expandTargets.forEach(el => {
    const label = el.dataset.cursor || getLabelFromEl(el);

    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--expand');
      if (cursorText && label) cursorText.textContent = label;
    });

    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--expand');
      if (cursorText) cursorText.textContent = '';
    });
  });

  function getLabelFromEl(el) {
    if (el.classList.contains('video-play') || el.classList.contains('video-feature__frame')) return 'PLAY';
    if (el.classList.contains('gallery-item')) return 'VIEW';
    if (el.classList.contains('btn')) return 'CLICK';
    return '';
  }

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
}

/* ══════════════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════════════ */

function initNav() {
  const nav = $('#nav');
  const hamburger = $('#hamburger');
  const drawer = $('#navDrawer');
  const drawerLinks = $$('.nav__drawer-link');
  if (!nav) return;

  // Scroll state
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
    updateActiveLink();
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      drawer.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link highlight
  function updateActiveLink() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav__link');
    const scrollPos = window.scrollY + window.innerHeight * 0.3;

    sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPos >= top && scrollPos < bottom) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${section.id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Smooth scroll for all anchor links
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight || 0);
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
══════════════════════════════════════════════════════ */

function initScrollAnimations() {
  if (prefersReducedMotion) {
    $$('[data-reveal]').forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Stagger children in a grid
        const siblings = el.parentElement ? $$('[data-reveal]', el.parentElement) : [];
        const idx = siblings.indexOf(el);
        const delay = siblings.length > 1 ? idx * 80 : 0;

        setTimeout(() => {
          el.classList.add('revealed');
        }, delay);

        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  $$('[data-reveal]').forEach(el => observer.observe(el));

  // Timeline lines
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.3 });

  $$('.timeline__step').forEach(el => timelineObserver.observe(el));
}

/* ══════════════════════════════════════════════════════
   COUNT-UP ANIMATION
══════════════════════════════════════════════════════ */

function initCountUp() {
  const statEls = $$('[data-count]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const text = el.dataset.text || '';

      if (text && target === 0) {
        el.textContent = text;
        observer.unobserve(el);
        return;
      }

      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        observer.unobserve(el);
        return;
      }

      let current = 0;
      const duration = 1800;
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        current = Math.round(eased * target);

        if (text && target === 100) {
          el.textContent = text;
        } else {
          el.textContent = current + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = text || (target + suffix);
        }
      }

      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════════
   PARTICLES
══════════════════════════════════════════════════════ */

function initParticles() {
  if (prefersReducedMotion) return;
  const container = $('#particles');
  if (!container) return;

  const count = window.innerWidth < 768 ? 8 : 18;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 2.5 + 0.5;
    const left = Math.random() * 100;
    const delay = Math.random() * 8;
    const dur = Math.random() * 6 + 6;
    const bottom = Math.random() * 60;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: ${bottom}%;
      opacity: 0;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    container.appendChild(p);
  }
}

/* ══════════════════════════════════════════════════════
   GALLERY & LIGHTBOX
══════════════════════════════════════════════════════ */

function initGallery() {
  const items = $$('.gallery-item');
  const lightbox = $('#lightbox');
  const lightboxClose = $('#lightboxClose');
  const lightboxImage = $('#lightboxImage');
  const lightboxTitle = $('#lightboxTitle');

  if (!lightbox) return;

  function openLightbox(item) {
    const title = item.dataset.title || '';
    const imgEl = item.querySelector('.gallery-item__image');
    const bg = imgEl ? getComputedStyle(imgEl).getPropertyValue('--img-bg').trim() : '';

    if (lightboxImage) {
      lightboxImage.style.background = bg ? `${bg} center/cover no-repeat, var(--surface)` : 'var(--surface)';
      lightboxImage.setAttribute('aria-label', item.getAttribute('aria-label') || title);
    }
    if (lightboxTitle) lightboxTitle.textContent = title;

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  items.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });
}

/* ══════════════════════════════════════════════════════
   VIDEO PLACEHOLDER INTERACTION
══════════════════════════════════════════════════════ */

function initVideos() {
  const playBtns = $$('.video-play');

  playBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Placeholder interaction — show notice
      showVideoNotice();
    });
  });

  function showVideoNotice() {
    // Check if notice already exists
    if ($('.video-modal')) return;

    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Video information');
    modal.innerHTML = `
      <div class="video-modal__inner">
        <div class="video-modal__title">PERFORMANCE VIDEOS</div>
        <p class="video-modal__text">Videos are available on request. Contact Akbar Khan directly to see live performance footage.</p>
        <div class="video-modal__actions">
          <a href="tel:9274452138" class="btn btn--gold">CALL 9274452138</a>
          <button class="btn btn--outline video-modal__close">CLOSE</button>
        </div>
      </div>
    `;

    Object.assign(modal.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '9500',
      padding: '20px',
      opacity: '0',
      transition: 'opacity 0.3s',
    });

    const inner = modal.querySelector('.video-modal__inner');
    if (inner) {
      Object.assign(inner.style, {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
      });
    }

    const title = modal.querySelector('.video-modal__title');
    if (title) Object.assign(title.style, {
      fontFamily: 'var(--font-display)',
      fontSize: '22px',
      letterSpacing: '0.1em',
      color: 'var(--gold)',
    });

    const text = modal.querySelector('.video-modal__text');
    if (text) Object.assign(text.style, {
      fontSize: '14px',
      color: 'var(--text-dim)',
      lineHeight: '1.7',
    });

    const actions = modal.querySelector('.video-modal__actions');
    if (actions) Object.assign(actions.style, {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: '8px',
    });

    document.body.appendChild(modal);
    requestAnimationFrame(() => { modal.style.opacity = '1'; });

    const closeBtn = modal.querySelector('.video-modal__close');
    function closeModal() {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    }

    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function handler(e) {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', handler); }
    });
  }
}

/* ══════════════════════════════════════════════════════
   BOOKING FORM
══════════════════════════════════════════════════════ */

function initBookingForm() {
  const form = $('#bookingForm');
  const success = $('#formSuccess');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic client-side validation
    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = 'rgba(200, 80, 80, 0.6)';
        valid = false;
      }
    });

    if (!valid) {
      const firstInvalid = form.querySelector('[required]:not([value]):not([value=""])');
      const actualFirstInvalid = [...required].find(f => !f.value.trim());
      actualFirstInvalid?.focus();
      return;
    }

    // The page intentionally has no mail or booking backend connected yet.
    // Never imply that an enquiry has been sent until an integration is added.
    if (success) {
      success.setAttribute('aria-hidden', 'false');
      success.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  });

  // Live validation feedback
  const inputs = $$('.form-input', form);
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (input.required && !input.value.trim()) {
        input.style.borderColor = 'rgba(200, 80, 80, 0.5)';
      } else {
        input.style.borderColor = '';
      }
    });

    input.addEventListener('focus', () => {
      input.style.borderColor = '';
    });
  });
}

/* ══════════════════════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════════════════════ */

function initMagneticButtons() {
  if (isTouchDevice() || prefersReducedMotion) return;

  $$('.btn--magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════════════════════
   PARALLAX HERO
══════════════════════════════════════════════════════ */

function initParallax() {
  if (prefersReducedMotion || isTouchDevice()) return;

  const heroBg = $('#heroBg');
  if (!heroBg) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const offset = scrollY * 0.3;
        heroBg.style.transform = `scale(1.04) translateY(${offset}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════
   SOUND TOGGLE
══════════════════════════════════════════════════════ */

function initSoundToggle() {
  const btn = $('#soundToggle');
  if (!btn) return;

  const iconOff = btn.querySelector('.sound-icon--off');
  const iconOn = btn.querySelector('.sound-icon--on');
  const label = btn.querySelector('span');
  let muted = true;

  btn.addEventListener('click', () => {
    muted = !muted;
    btn.setAttribute('aria-pressed', !muted);

    if (!muted) {
      if (iconOff) iconOff.style.display = 'none';
      if (iconOn) iconOn.style.display = '';
      if (label) label.textContent = '♪ SOUND OFF';
      // Audio integration point — connect audio source here
    } else {
      if (iconOff) iconOff.style.display = '';
      if (iconOn) iconOn.style.display = 'none';
      if (label) label.textContent = '♪ SOUND ON';
    }
  });
}

/* ══════════════════════════════════════════════════════
   FOOTER RHYTHM LINE
══════════════════════════════════════════════════════ */

function initFooterRhythm() {
  const container = $('#footerRhythm');
  if (!container) return;

  const count = 60;
  for (let i = 0; i < count; i++) {
    const bar = document.createElement('div');
    const h = Math.random() * 100;
    Object.assign(bar.style, {
      flex: '1',
      height: h + '%',
      background: `rgba(201, 168, 76, ${0.08 + Math.random() * 0.2})`,
      borderRadius: '1px',
      alignSelf: 'center',
      animation: prefersReducedMotion ? 'none' : `rhythmBounce ${1 + Math.random() * 1.5}s ease-in-out infinite ${Math.random() * 2}s`,
    });
    container.appendChild(bar);
  }
}

/* ══════════════════════════════════════════════════════
   INSTRUMENT CARD TILT (DESKTOP)
══════════════════════════════════════════════════════ */

function initCardTilt() {
  if (isTouchDevice() || prefersReducedMotion) return;

  $$('.instrument-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / rect.height) * -6;
      const ry = ((e.clientX - cx) / rect.width) * 6;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════════════════════
   MOBILE BOOK CTA SHOW/HIDE
══════════════════════════════════════════════════════ */

function initMobileCta() {
  const cta = $('#mobileBookCta');
  if (!cta) return;

  // Show after scrolling past hero
  const hero = $('#home');

  window.addEventListener('scroll', () => {
    if (!hero) return;
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    if (window.scrollY > heroBottom * 0.5) {
      cta.style.display = 'flex';
    } else {
      cta.style.display = 'none';
    }
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════
   ANIMATED UNDERLINES ON NAV
══════════════════════════════════════════════════════ */

function initAnimatedElements() {
  // Gold line sweep on section headings
  if (prefersReducedMotion) return;

  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const line = entry.target.querySelector('.section-heading-line');
        if (line) {
          line.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s';
          line.style.width = '60px';
        }
        headingObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  $$('.section-header').forEach(h => {
    const line = h.querySelector('.section-heading-line');
    if (line) {
      line.style.width = '0px';
      headingObserver.observe(h);
    }
  });
}

/* ══════════════════════════════════════════════════════
   IMAGE LAZY LOAD
══════════════════════════════════════════════════════ */

function initLazyImages() {
  // All background images are already CSS-based; this handles future <img> tags
  const images = $$('img[loading="lazy"]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => observer.observe(img));
}

/* ══════════════════════════════════════════════════════
   INIT ALL
══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initNav();
  initParticles();
  initGallery();
  initVideos();
  initBookingForm();
  initMagneticButtons();
  initParallax();
  initSoundToggle();
  initFooterRhythm();
  initCardTilt();
  initMobileCta();
  initAnimatedElements();
  initLazyImages();
});

/* ══════════════════════════════════════════════════════
   GSAP ENHANCEMENTS (if loaded)
══════════════════════════════════════════════════════ */

window.addEventListener('load', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (prefersReducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  // ── Hero bg subtle zoom ──
  const heroBg = document.getElementById('heroBg');
  if (heroBg) {
    gsap.to(heroBg, {
      scale: 1.08,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // ── About image parallax ──
  const aboutImg = document.querySelector('.about__image');
  if (aboutImg) {
    gsap.to(aboutImg, {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about__visual',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // ── Section background numbers parallax ──
  document.querySelectorAll('.section-bg-number').forEach(el => {
    gsap.to(el, {
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  });

  // ── Gallery items stagger reveal ──
  gsap.utils.toArray('.gallery-item').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      delay: (i % 4) * 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // ── Why cards horizontal stagger ──
  gsap.utils.toArray('.why-card').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 50,
      duration: 0.9,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.why__grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });
  });

  // ── Instrument cards stagger ──
  gsap.utils.toArray('.instrument-card').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      scale: 0.95,
      y: 30,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.instruments__grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });
  });

  // ── Timeline steps stagger ──
  gsap.utils.toArray('.timeline__step').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      x: -30,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.timeline__steps',
        start: 'top 75%',
        toggleActions: 'play none none none',
      }
    });
  });

  // ── Event cards stagger ──
  gsap.utils.toArray('.event-card').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      delay: i * 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.events__grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });
  });

  // ── Contact heading dramatic reveal ──
  const contactHeading = document.querySelector('.contact__heading');
  if (contactHeading) {
    gsap.from(contactHeading, {
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: contactHeading,
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });
  }

  console.log('%cAKBAR KHAN | Live Percussionist | akbarforYou@gmail.com | 9274452138', 'color: #c9a84c; font-family: monospace; font-size: 12px; background: #0a0804; padding: 8px 16px;');
});
