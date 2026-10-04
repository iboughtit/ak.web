'use strict';

/* ─── PRELOADER ─────────────────────────────────────────────────── */
const preloader = document.getElementById('preloader');
const hidePre = () => {
  preloader.classList.add('is-done');
  document.body.style.overflow = '';
};
document.body.style.overflow = 'hidden';
if (document.readyState === 'complete') {
  setTimeout(hidePre, 900);
} else {
  window.addEventListener('load', () => setTimeout(hidePre, 900));
}

/* ─── NAVIGATION ────────────────────────────────────────────────── */
const navWrap  = document.getElementById('nav-wrap');
const toggle   = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

const setScrolled = () => {
  navWrap.classList.toggle('is-scrolled', window.scrollY > 30);
};
setScrolled();
window.addEventListener('scroll', setScrolled, { passive: true });

function openMenu() {
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Close menu');
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
toggle?.addEventListener('click', () => {
  toggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
});
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* ─── SCROLL REVEAL ─────────────────────────────────────────────── */
const revealObs = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObs.unobserve(e.target);
    }
  }),
  { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
);
document.querySelectorAll('.reveal-up, .reveal-clip').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  revealObs.observe(el);
});

/* ─── CUSTOM CURSOR ─────────────────────────────────────────────── */
const cursor = document.getElementById('cursor');
if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dot  = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  const lbl  = cursor.querySelector('.cursor__label');
  let mx = 0, my = 0, rx = 0, ry = 0;
  let raf;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.cssText  = `left:${mx}px;top:${my}px`;
    if (!raf) raf = requestAnimationFrame(tick);
  });

  function tick() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.cssText = `left:${rx}px;top:${ry}px`;
    raf = requestAnimationFrame(tick);
  }

  document.querySelectorAll('a, button, [tabindex="0"]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      if (el.matches('.gallery__item')) {
        cursor.classList.add('cursor--view');
        lbl.textContent = 'VIEW';
      } else if (el.matches('.media__play, .media__reel, .feature__btn')) {
        cursor.classList.add('cursor--play');
        lbl.textContent = 'PLAY';
      }
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover', 'cursor--view', 'cursor--play');
      lbl.textContent = '';
    });
  });
} else {
  if (cursor) cursor.style.display = 'none';
}

/* ─── GALLERY LIGHTBOX ──────────────────────────────────────────── */
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbClose  = document.getElementById('lb-close');
const lbPrev   = document.getElementById('lb-prev');
const lbNext   = document.getElementById('lb-next');
const lbBack   = document.getElementById('lb-backdrop');
const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
let lbIndex = 0;

function openLb(index) {
  lbIndex = index;
  const item = galleryItems[lbIndex];
  lbImg.src = item.dataset.src || item.querySelector('img').src;
  lbImg.alt = item.querySelector('img').alt;
  lightbox.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}
function closeLb() {
  lightbox.setAttribute('hidden', '');
  document.body.style.overflow = '';
  galleryItems[lbIndex]?.focus();
}
function prevLb() {
  lbIndex = (lbIndex - 1 + galleryItems.length) % galleryItems.length;
  lbImg.style.opacity = '0';
  setTimeout(() => {
    const item = galleryItems[lbIndex];
    lbImg.src = item.dataset.src || item.querySelector('img').src;
    lbImg.alt = item.querySelector('img').alt;
    lbImg.style.opacity = '1';
  }, 180);
}
function nextLb() {
  lbIndex = (lbIndex + 1) % galleryItems.length;
  lbImg.style.opacity = '0';
  setTimeout(() => {
    const item = galleryItems[lbIndex];
    lbImg.src = item.dataset.src || item.querySelector('img').src;
    lbImg.alt = item.querySelector('img').alt;
    lbImg.style.opacity = '1';
  }, 180);
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLb(i));
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
  });
});

lbClose?.addEventListener('click', closeLb);
lbBack?.addEventListener('click', closeLb);
lbPrev?.addEventListener('click', prevLb);
lbNext?.addEventListener('click', nextLb);
document.addEventListener('keydown', e => {
  if (lightbox?.hasAttribute('hidden')) return;
  if (e.key === 'Escape')     closeLb();
  if (e.key === 'ArrowLeft')  prevLb();
  if (e.key === 'ArrowRight') nextLb();
});

/* ─── MEDIA / SHOWREEL ──────────────────────────────────────────── */
const mediaPlay       = document.getElementById('media-play');
const mediaReel       = document.getElementById('media-reel');
const mediaVideoWrap  = document.getElementById('media-video-wrap');
const mediaVideo      = document.getElementById('media-video');
const mediaCloseVideo = document.getElementById('media-close-video');

mediaPlay?.addEventListener('click', () => {
  mediaReel.hidden = true;
  mediaVideoWrap.hidden = false;
  mediaVideo?.play().catch(() => {});
});
mediaCloseVideo?.addEventListener('click', () => {
  mediaVideo?.pause();
  mediaVideoWrap.hidden = true;
  mediaReel.hidden = false;
});

/* ─── CONTACT FORM ──────────────────────────────────────────────── */
const form        = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

function validate(form) {
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    const err = field.parentElement.querySelector('.form__err') ||
                field.closest('.form__field')?.querySelector('.form__err');
    if (!field.value.trim()) {
      field.classList.add('is-error');
      if (err) err.textContent = 'This field is required.';
      valid = false;
    } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
      field.classList.add('is-error');
      if (err) err.textContent = 'Please enter a valid email.';
      valid = false;
    } else {
      field.classList.remove('is-error');
      if (err) err.textContent = '';
    }
  });
  return valid;
}

form?.querySelectorAll('input, textarea, select').forEach(field => {
  field.addEventListener('input', () => {
    field.classList.remove('is-error');
    const err = field.closest('.form__field')?.querySelector('.form__err');
    if (err) err.textContent = '';
  });
});

form?.addEventListener('submit', e => {
  e.preventDefault();
  if (!validate(form)) return;
  // Simulate submission
  const btn = form.querySelector('[type="submit"]');
  btn.textContent = 'SENDING…';
  btn.disabled = true;
  setTimeout(() => {
    form.reset();
    btn.textContent = 'SEND BOOKING REQUEST →';
    btn.disabled = false;
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => { formSuccess.hidden = true; }, 6000);
  }, 1200);
});

/* ─── PARALLAX (hero & feature) ────────────────────────────────── */
const heroImg   = document.querySelector('.hero__img-wrap');
const featureImg = document.querySelector('.feature__img');
let ticking = false;

function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      if (heroImg) {
        heroImg.style.transform = `translateY(${sy * 0.25}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

/* ─── ACTIVE NAV ────────────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav__links a');

const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + e.target.id
          ? 'var(--ivory)' : '';
      });
    }
  });
}, { threshold: 0.3 });
sections.forEach(s => navObs.observe(s));
