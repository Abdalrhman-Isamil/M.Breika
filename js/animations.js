/* ================================================================
   animations.js — Scroll Animations & Hero Particle Canvas
   Handles: AOS-style observer, hero particles, parallax, ripple
   ================================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     SCROLL PROGRESS BAR
  ────────────────────────────────────────── */
  function initScrollProgress() {
    /* Create the element */
    const container = document.createElement('div');
    container.id = 'scroll-progress';
    const bar = document.createElement('div');
    bar.id = 'scroll-progress-bar';
    container.appendChild(bar);
    document.body.appendChild(container);

    /* Inject minimal style */
    const style = document.createElement('style');
    style.textContent = `
      #scroll-progress {
        position: fixed; top: 0; left: 0; right: 0;
        height: 3px; z-index: 9999; pointer-events: none;
      }
      #scroll-progress-bar {
        height: 100%; width: 0%;
        background: linear-gradient(to left, #E9C86B, #D9B24C);
        transition: width 0.1s linear;
        border-radius: 0 2px 2px 0;
      }
    `;
    document.head.appendChild(style);

    window.addEventListener('scroll', () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width  = pct + '%';
    }, { passive: true });
  }

  /* ──────────────────────────────────────────
     AOS-STYLE INTERSECTION OBSERVER
  ────────────────────────────────────────── */
  function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target); /* animate once */
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px',
    });

    elements.forEach(el => observer.observe(el));
  }

  /* ──────────────────────────────────────────
     SECTION HEADER IN-VIEW (for underline)
  ────────────────────────────────────────── */
  function initSectionHeaders() {
    const headers = document.querySelectorAll('.section-header');
    if (!headers.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    headers.forEach(h => observer.observe(h));
  }

  /* ──────────────────────────────────────────
     HERO PARTICLE CANVAS
  ────────────────────────────────────────── */
  function initHeroParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    function resize() {
      const parent = canvas.parentElement;
      W = canvas.width  = parent ? parent.offsetWidth  : window.innerWidth;
      H = canvas.height = parent ? parent.offsetHeight : window.innerHeight;
    }

    function makeParticle() {
      const type = Math.random();
      return {
        x      : Math.random() * W,
        y      : Math.random() * H,
        r      : type > 0.85 ? Math.random() * 3 + 1.5 : Math.random() * 1.5 + 0.3,
        dx     : (Math.random() - 0.5) * 0.3,
        dy     : -(Math.random() * 0.35 + 0.1),
        alpha  : Math.random() * 0.45 + 0.05,
        phase  : Math.random() * Math.PI * 2,
        speed  : Math.random() * 0.015 + 0.008,
        isStar : type > 0.92,
      };
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      particles.forEach(p => {
        p.phase += p.speed;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));

        if (p.isStar) {
          /* Draw 4-point star */
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.fillStyle = `rgba(217,178,76,${a})`;
          const s = p.r;
          ctx.beginPath();
          ctx.moveTo(0, -s * 2.5);
          ctx.lineTo(s * 0.6, -s * 0.6);
          ctx.lineTo(s * 2.5, 0);
          ctx.lineTo(s * 0.6, s * 0.6);
          ctx.lineTo(0, s * 2.5);
          ctx.lineTo(-s * 0.6, s * 0.6);
          ctx.lineTo(-s * 2.5, 0);
          ctx.lineTo(-s * 0.6, -s * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(217,178,76,${a})`;
          ctx.fill();
        }

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) {
          p.x = Math.random() * W;
          p.y = H + 10;
        }
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    particles = Array.from({ length: 70 }, makeParticle);
    draw();

    window.addEventListener('resize', () => {
      resize();
    }, { passive: true });
  }

  /* ──────────────────────────────────────────
     PARALLAX ON HERO PATTERN (Mouse)
  ────────────────────────────────────────── */
  function initHeroParallax() {
    const hero    = document.getElementById('hero');
    const pattern = hero ? hero.querySelector('.hero-pattern') : null;
    const ornaments = hero ? hero.querySelector('.floating-ornaments') : null;
    if (!hero || !pattern) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let ticking = false;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const cx   = rect.width  / 2;
      const cy   = rect.height / 2;
      targetX    = (e.clientX - rect.left - cx) / cx * 12;
      targetY    = (e.clientY - rect.top  - cy) / cy * 8;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    }, { passive: true });

    function updateParallax() {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;

      pattern.style.transform = `translate(${currentX}px, ${currentY}px)`;
      if (ornaments) {
        ornaments.style.transform = `translate(${currentX * 0.5}px, ${currentY * 0.5}px)`;
      }

      ticking = false;
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }
  }

  /* ──────────────────────────────────────────
     BUTTON RIPPLE EFFECT
  ────────────────────────────────────────── */
  function initRipple() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const rect   = this.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height) * 2;
        const x      = e.clientX - rect.left - size / 2;
        const y      = e.clientY - rect.top  - size / 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          right: ${x}px;
          top: ${y}px;
        `;
        this.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  /* ──────────────────────────────────────────
     NAVBAR HIDE ON SCROLL DOWN
  ────────────────────────────────────────── */
  function initNavbarBehavior() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll   = 0;
    let scrollTimeout;

    window.addEventListener('scroll', () => {
      const current = window.scrollY;

      /* Scrolled class */
      if (current > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      /* Hide / show */
      if (current > lastScroll && current > 200) {
        navbar.classList.add('hidden');
      } else {
        navbar.classList.remove('hidden');
      }

      lastScroll = current;
    }, { passive: true });
  }

  /* ──────────────────────────────────────────
     ACTIVE NAV LINK ON SCROLL
  ────────────────────────────────────────── */
  function initActiveNav() {
    const navLinks    = document.querySelectorAll('.nav-link');
    const drawerLinks = document.querySelectorAll('.nav-drawer-link');
    const sections    = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    function updateActive() {
      let current = '';
      sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        if (window.scrollY >= top) current = sec.getAttribute('id');
      });

      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === current);
      });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ──────────────────────────────────────────
     SCROLL-TO-TOP BUTTON
  ────────────────────────────────────────── */
  function initScrollTop() {
    const btn = document.getElementById('scroll-top-btn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ──────────────────────────────────────────
     MOBILE NAV DRAWER
  ────────────────────────────────────────── */
  function initMobileNav() {
    const toggle  = document.getElementById('nav-toggle');
    const drawer  = document.getElementById('nav-drawer');
    const links   = document.querySelectorAll('.nav-drawer-link');
    if (!toggle || !drawer) return;

    function closeDrawer() {
      toggle.classList.remove('open');
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeDrawer();
      } else {
        toggle.classList.add('open');
        drawer.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    links.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !drawer.contains(e.target)) {
        closeDrawer();
      }
    });
  }

  /* ──────────────────────────────────────────
     SMOOTH SCROLL FOR ANCHOR LINKS
  ────────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top    = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ──────────────────────────────────────────
     TESTIMONIAL SLIDER
  ────────────────────────────────────────── */
  function initSlider() {
    const track  = document.getElementById('testimonials-track');
    const prevBtn= document.getElementById('slider-prev');
    const nextBtn= document.getElementById('slider-next');
    const dotsEl = document.getElementById('slider-dots');
    if (!track) return;

    const slides = track.querySelectorAll('.testimonial-slide');
    let current  = 0;
    let autoPlay;
    const total  = slides.length;

    /* Build dots */
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('slider-dot');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `الشريحة ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsEl && dotsEl.appendChild(dot);
    });

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(${current * -100}%)`;

      /* For RTL the logical direction is positive */
      dotsEl && dotsEl.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', i === current);
      });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    nextBtn && nextBtn.addEventListener('click', () => { next(); resetAuto(); });
    prevBtn && prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

    /* Touch swipe */
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
        resetAuto();
      }
    }, { passive: true });

    /* Auto-play */
    function startAuto() {
      autoPlay = setInterval(next, 5000);
    }
    function resetAuto() {
      clearInterval(autoPlay);
      startAuto();
    }

    startAuto();

    /* Pause on hover */
    const slider = document.getElementById('testimonials-slider');
    if (slider) {
      slider.addEventListener('mouseenter', () => clearInterval(autoPlay));
      slider.addEventListener('mouseleave', startAuto);
    }
  }

  /* ──────────────────────────────────────────
     BOOT — wait for intro:done
  ────────────────────────────────────────── */
  function boot() {
    initScrollProgress();
    initAOS();
    initSectionHeaders();
    initHeroParticles();
    initHeroParallax();
    initRipple();
    initNavbarBehavior();
    initActiveNav();
    initScrollTop();
    initMobileNav();
    initSmoothScroll();
    initSlider();
  }

  document.addEventListener('intro:done', boot);

  /* Safety net: if intro was already dismissed */
  if (document.getElementById('main-site') &&
      document.getElementById('main-site').classList.contains('ready')) {
    boot();
  }

})();
