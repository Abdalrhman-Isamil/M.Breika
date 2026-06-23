/* ================================================================
   main.js — Primary Application Controller
   Handles: general utilities, accessibility, performance tweaks,
            lazy loading, keyboard navigation, and global polish
   ================================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     UTILITY HELPERS
  ────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  /* ──────────────────────────────────────────
     FLOAT WHATSAPP VISIBILITY
     Hide while hero is in view, show after
  ────────────────────────────────────────── */
  function initFloatWA() {
    const btn  = $('#float-whatsapp');
    const hero = $('#hero');
    if (!btn || !hero) return;

    const obs = new IntersectionObserver(([entry]) => {
      btn.style.opacity        = entry.isIntersecting ? '0' : '1';
      btn.style.pointerEvents  = entry.isIntersecting ? 'none' : 'all';
    }, { threshold: 0.3 });

    obs.observe(hero);
  }

  /* ──────────────────────────────────────────
     PHONE LINK CLICK TRACKING (Analytics hook)
  ────────────────────────────────────────── */
  function initPhoneLinks() {
    $$('a[href^="tel:"]').forEach(link => {
      link.addEventListener('click', () => {
        /* Placeholder for analytics event */
        /* e.g. gtag('event', 'phone_click', { ... }) */
        console.info('[Portfolio] Phone link clicked');
      });
    });

    $$('a[href^="https://wa.me"]').forEach(link => {
      link.addEventListener('click', () => {
        console.info('[Portfolio] WhatsApp link clicked');
      });
    });
  }

  /* ──────────────────────────────────────────
     LAZY LOAD IMAGES (future-proof for photos)
  ────────────────────────────────────────── */
  function initLazyImages() {
    const imgs = $$('img[data-src]');
    if (!imgs.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    imgs.forEach(img => obs.observe(img));
  }

  /* ──────────────────────────────────────────
     KEYBOARD ACCESSIBILITY FOCUS RINGS
     Only show focus rings during keyboard nav
  ────────────────────────────────────────── */
  function initFocusMode() {
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-focus');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-focus');
      }
    });

    /* Inject style */
    const style = document.createElement('style');
    style.textContent = `
      body:not(.keyboard-focus) *:focus {
        outline: none;
      }
      body.keyboard-focus *:focus {
        outline: 2px solid #D9B24C;
        outline-offset: 3px;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
  }

  /* ──────────────────────────────────────────
     SERVICE CARD TILT EFFECT (subtle 3D on hover)
  ────────────────────────────────────────── */
  function initCardTilt() {
    /* Only for non-touch devices */
    if (window.matchMedia('(hover: none)').matches) return;

    $$('.service-card, .stat-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const tiltX  = dy * -5;
        const tiltY  = dx *  5;

        card.style.transform = `
          translateY(-8px)
          perspective(800px)
          rotateX(${tiltX}deg)
          rotateY(${tiltY}deg)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => { card.style.transition = ''; }, 500);
      });
    });
  }

  /* ──────────────────────────────────────────
     ABOUT FEATURES STAGGER
  ────────────────────────────────────────── */
  function initAboutFeatures() {
    const features = $$('.about-feature-item');
    if (!features.length) return;

    /* Fallback if IntersectionObserver is not supported */
    if (!window.IntersectionObserver) {
      features.forEach(item => {
        item.style.opacity = '1';
        item.style.transform = 'none';
      });
      return;
    }

    const container = $('.about-features');
    if (!container) return;

    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        features.forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity   = '1';
            item.style.transform = 'translateY(0)';
          }, i * 100);
        });
        obs.disconnect();
      }
    }, { threshold: 0.1 });

    /* Set initial state (sliding up gently) */
    features.forEach(item => {
      item.style.opacity   = '0';
      item.style.transform = 'translateY(16px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    obs.observe(container);
  }

  /* ──────────────────────────────────────────
     TIMELINE ITEMS STAGGER
  ────────────────────────────────────────── */
  function initTimelineStagger() {
    const items = $$('.timeline-item');
    if (!items.length) return;

    /* Fallback if IntersectionObserver is not supported */
    if (!window.IntersectionObserver) {
      items.forEach(item => {
        item.style.opacity = '1';
        item.style.transform = 'none';
      });
      return;
    }

    items.forEach(item => {
      item.style.opacity   = '0';
      item.style.transform = 'translateY(24px)';
      item.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = items.indexOf(entry.target);
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
          }, idx * 150);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    items.forEach(item => obs.observe(item));
  }

  /* ──────────────────────────────────────────
     FOOTER LINK SMOOTH SCROLL (already handled
     by animations.js initSmoothScroll — this
     ensures footer links also close mobile drawer)
  ────────────────────────────────────────── */
  function initFooterLinks() {
    $$('.footer-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        /* Close drawer if open */
        const drawer = $('#nav-drawer');
        const toggle = $('#nav-toggle');
        if (drawer && drawer.classList.contains('open')) {
          drawer.classList.remove('open');
          toggle && toggle.classList.remove('open');
        }
      });
    });
  }

  /* ──────────────────────────────────────────
     CONTACT SECTION — WhatsApp pre-fill message
  ────────────────────────────────────────── */
  function initWhatsAppLinks() {
    const message = encodeURIComponent(
      'السلام عليكم، أود الاستفسار عن حلقات تحفيظ القرآن الكريم مع فضيلة الشيخ محمد أبو بريكة.'
    );
    const phone = '201027347928';
    const url   = `https://wa.me/${phone}?text=${message}`;

    $$('a[href="https://wa.me/201027347928"]').forEach(link => {
      link.href = url;
    });

    /* Floating button */
    const floatBtn = $('#float-whatsapp');
    if (floatBtn) floatBtn.href = url;
  }

  /* ──────────────────────────────────────────
     GOOGLE MAPS IFRAME (optional enhancement)
     Uncomment and add your embed URL to activate
  ────────────────────────────────────────── */
  /*
  function initMap() {
    const placeholder = document.querySelector('.map-placeholder');
    if (!placeholder) return;

    const iframe = document.createElement('iframe');
    iframe.src   = 'YOUR_GOOGLE_MAPS_EMBED_URL';
    iframe.width  = '100%';
    iframe.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = 'var(--radius-lg)';
    iframe.loading = 'lazy';
    iframe.title   = 'موقع الشيخ محمد أبو بريكة على الخريطة';
    iframe.setAttribute('allowfullscreen', '');
    placeholder.innerHTML = '';
    placeholder.appendChild(iframe);
  }
  */

  /* ──────────────────────────────────────────
     PERFORMANCE — reduce motion if preferred
  ────────────────────────────────────────── */
  function checkReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--duration-fast',  '0.01ms');
      document.documentElement.style.setProperty('--duration-med',   '0.01ms');
      document.documentElement.style.setProperty('--duration-slow',  '0.01ms');
    }
  }

  /* ──────────────────────────────────────────
     COPY PHONE NUMBER ON CLICK
  ────────────────────────────────────────── */
  function initCopyPhone() {
    const phoneLinks = $$('a[href^="tel:"]');
    phoneLinks.forEach(link => {
      link.addEventListener('dblclick', (e) => {
        e.preventDefault();
        const num = link.textContent.trim();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(num).then(() => {
            showToast('تم نسخ رقم الهاتف ✓');
          });
        }
      });
      link.title = 'انقر مرتين لنسخ الرقم';
    });
  }

  /* ──────────────────────────────────────────
     TOAST NOTIFICATION
  ────────────────────────────────────────── */
  function showToast(message) {
    const existing = $('#portfolio-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id    = 'portfolio-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 140px;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      background: rgba(13, 103, 116, 0.95);
      color: #fff;
      font-family: var(--font-main, 'Cairo', sans-serif);
      font-size: 0.9rem;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 999px;
      border: 1px solid rgba(217,178,76,0.3);
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      direction: rtl;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 2500);
  }

  /* ──────────────────────────────────────────
     STAR RATING HOVER (Testimonials)
  ────────────────────────────────────────── */
  function initStarGlow() {
    $$('.testimonial-stars').forEach(stars => {
      stars.style.transition = 'text-shadow 0.3s ease';
      stars.closest('.testimonial-card').addEventListener('mouseenter', () => {
        stars.style.textShadow = '0 0 15px rgba(217,178,76,0.7)';
      });
      stars.closest('.testimonial-card').addEventListener('mouseleave', () => {
        stars.style.textShadow = '';
      });
    });
  }

  /* ──────────────────────────────────────────
     SECTION DIVIDERS — animated gold shimmer
  ────────────────────────────────────────── */
  function initSectionDividers() {
    const style = document.createElement('style');
    style.textContent = `
      .section-ornament svg {
        overflow: visible;
        transition: filter 0.5s ease;
      }
      .section-header.in-view .section-ornament svg {
        filter: drop-shadow(0 0 8px rgba(217,178,76,0.4));
      }
    `;
    document.head.appendChild(style);
  }

  /* ──────────────────────────────────────────
     MAIN BOOT
  ────────────────────────────────────────── */
  function boot() {
    checkReducedMotion();
    initFloatWA();
    initPhoneLinks();
    initLazyImages();
    initFocusMode();
    initCardTilt();
    initAboutFeatures();
    initTimelineStagger();
    initFooterLinks();
    initWhatsAppLinks();
    initCopyPhone();
    initStarGlow();
    initSectionDividers();

    /* Uncomment when you have a Google Maps embed URL: */
    /* initMap(); */

    console.info(
      '%c الشيخ محمد أبو بريكة | موقع احترافي ',
      'background:#0D6774;color:#D9B24C;font-family:Cairo,sans-serif;font-size:14px;padding:8px 16px;border-radius:4px;'
    );
  }

  /* ──────────────────────────────────────────
     INIT STRATEGY
     • If intro fires 'intro:done' → boot from there
     • If page loaded without intro  → boot on DOMContentLoaded
  ────────────────────────────────────────── */
  document.addEventListener('intro:done', boot);

  document.addEventListener('DOMContentLoaded', () => {
    const mainSite = document.getElementById('main-site');
    if (mainSite && mainSite.classList.contains('ready')) {
      boot();
    }
  });

  /* Expose showToast globally for external use */
  window.portfolioToast = showToast;

})();
