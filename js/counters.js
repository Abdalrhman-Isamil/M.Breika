/* ================================================================
   counters.js — Animated Number Counters
   Triggers smooth count-up when stats section enters viewport
   ================================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     EASING FUNCTION
  ────────────────────────────────────────── */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /* ──────────────────────────────────────────
     ANIMATE SINGLE COUNTER
  ────────────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = 2200; // ms
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const value    = Math.round(eased * target);

      el.textContent = value.toLocaleString('ar-EG') + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString('ar-EG') + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  /* ──────────────────────────────────────────
     OBSERVE STATS SECTION
  ────────────────────────────────────────── */
  function initCounters() {
    const counterEls = document.querySelectorAll('.stat-number[data-target]');
    if (!counterEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          /* Staggered start per card */
          const card  = entry.target.closest('.stat-card');
          const cards = [...document.querySelectorAll('.stat-card')];
          const idx   = cards.indexOf(card);
          const delay = idx * 120;

          setTimeout(() => animateCounter(entry.target), delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5,
    });

    counterEls.forEach(el => observer.observe(el));
  }

  /* ──────────────────────────────────────────
     BOOT
  ────────────────────────────────────────── */
  document.addEventListener('intro:done', initCounters);

  /* Safety fallback */
  document.addEventListener('DOMContentLoaded', () => {
    const mainSite = document.getElementById('main-site');
    if (mainSite && mainSite.classList.contains('ready')) {
      initCounters();
    }
  });

})();
