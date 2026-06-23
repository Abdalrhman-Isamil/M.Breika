/* ================================================================
   intro.js — Premium Intro Screen Controller
   Handles: Mushaf opening, particle canvas, audio, timing, transition
   ================================================================ */

(function () {
  'use strict';

  /* ─── Config ─── */
  const INTRO_DURATION   = 19000;   // total ms before auto-dismiss
  const MUSHAF_DELAY     = 300;    // ms before book opens
  const CONTENT_DELAY    = 1400;   // ms before verse fades in
  const PROGRESS_MS      = INTRO_DURATION;

  /* ─── Elements ─── */
  const introScreen    = document.getElementById('intro-screen');
  const mainSite       = document.getElementById('main-site');
  const mushafContainer= document.getElementById('mushaf-container');
  const introContent   = document.getElementById('intro-content');
  const progressBar    = document.getElementById('intro-progress-bar');
  const skipBtn        = document.getElementById('skip-intro-btn');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioIconOn    = document.getElementById('audio-icon-on');
  const audioIconOff   = document.getElementById('audio-icon-off');
  const audioEl        = document.getElementById('intro-audio');
  const audioControls  = document.querySelector('.intro-audio-controls');
  const introOrnaments = document.querySelectorAll('.intro-ornament');

  /* ─── State ─── */
  let dismissed  = false;
  let muted      = false;
  let progressInterval = null;
  let progressStart    = null;
  let particleAnimId   = null;

  /* ──────────────────────────────────────────
     PARTICLE SYSTEM
  ────────────────────────────────────────── */
  const canvas  = document.getElementById('intro-particles');
  const ctx     = canvas ? canvas.getContext('2d') : null;
  let   particles = [];
  let   W = 0, H = 0;

  function resizeCanvas() {
    if (!canvas) return;
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    const isGold = Math.random() > 0.4;
    return {
      x     : Math.random() * W,
      y     : Math.random() * H,
      r     : Math.random() * 2.5 + 0.5,
      dx    : (Math.random() - 0.5) * 0.4,
      dy    : -(Math.random() * 0.6 + 0.2),
      alpha : Math.random() * 0.5 + 0.1,
      color : isGold
                ? `rgba(217,178,76,`
                : `rgba(233,200,107,`,
      pulse : Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    };
  }

  function initParticles() {
    if (!canvas) return;
    resizeCanvas();
    particles = Array.from({ length: 90 }, createParticle);
    window.addEventListener('resize', resizeCanvas);
  }

  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.fill();

      /* tiny glow */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
      grd.addColorStop(0, p.color + (alpha * 0.4) + ')');
      grd.addColorStop(1, p.color + '0)');
      ctx.fillStyle = grd;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      /* wrap */
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) {
        p.x = Math.random() * W;
        p.y = H + 5;
      }
    });

    particleAnimId = requestAnimationFrame(drawParticles);
  }

  /* ──────────────────────────────────────────
     AUDIO SYSTEM
  ────────────────────────────────────────── */
  function initAudio() {
    if (!audioEl) return;
    audioEl.volume = 0;

    /* Try to auto-play on user gesture (first scroll/click) */
    const tryPlay = () => {
      if (dismissed) return;
      audioEl.play().then(() => {
        fadeAudioIn();
        document.removeEventListener('click',      tryPlay);
        document.removeEventListener('touchstart', tryPlay);
        document.removeEventListener('keydown',    tryPlay);
      }).catch(() => { /* silent fail — browser blocked */ });
    };

    document.addEventListener('click',      tryPlay, { once: true });
    document.addEventListener('touchstart', tryPlay, { once: true });
    document.addEventListener('keydown',    tryPlay, { once: true });
  }

  function fadeAudioIn(duration = 2000) {
    if (!audioEl) return;
    const steps = 40;
    const stepMs = duration / steps;
    const targetVol = 0.5;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      audioEl.volume = Math.min(targetVol, (step / steps) * targetVol);
      if (step >= steps) clearInterval(iv);
    }, stepMs);
  }

  function fadeAudioOut(duration = 1200, cb) {
    if (!audioEl || audioEl.paused) { if (cb) cb(); return; }
    const startVol = audioEl.volume;
    const steps = 30;
    const stepMs = duration / steps;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      audioEl.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(iv);
        audioEl.pause();
        audioEl.currentTime = 0;
        if (cb) cb();
      }
    }, stepMs);
  }

  function toggleMute() {
    if (!audioEl) return;
    muted = !muted;
    if (muted) {
      audioEl.volume = 0;
      audioIconOn.style.display  = 'none';
      audioIconOff.style.display = 'block';
    } else {
      fadeAudioIn(600);
      audioIconOn.style.display  = 'block';
      audioIconOff.style.display = 'none';
    }
  }

  /* ──────────────────────────────────────────
     PROGRESS BAR
  ────────────────────────────────────────── */
  function startProgress() {
    progressStart = performance.now();
    const tick = (now) => {
      if (dismissed) return;
      const elapsed  = now - progressStart;
      const pct      = Math.min(100, (elapsed / PROGRESS_MS) * 100);
      if (progressBar) progressBar.style.width = pct + '%';
      if (pct < 100) {
        progressInterval = requestAnimationFrame(tick);
      } else {
        dismissIntro();
      }
    };
    progressInterval = requestAnimationFrame(tick);
  }

  /* ──────────────────────────────────────────
     SEQUENCE
  ────────────────────────────────────────── */
  function runSequence() {
    /* 1. Open mushaf book */
    setTimeout(() => {
      if (mushafContainer) mushafContainer.classList.add('opening');
    }, MUSHAF_DELAY);

    /* 2. Show verse content */
    setTimeout(() => {
      if (introContent) introContent.classList.add('visible');
      introOrnaments.forEach(o => o.classList.add('show'));
      if (audioControls) audioControls.classList.add('show');
    }, CONTENT_DELAY);

    /* 3. Progress bar */
    setTimeout(() => startProgress(), CONTENT_DELAY + 300);
  }

  /* ──────────────────────────────────────────
     DISMISS INTRO
  ────────────────────────────────────────── */
  function dismissIntro() {
    if (dismissed) return;
    dismissed = true;

    /* Stop progress */
    if (progressInterval) cancelAnimationFrame(progressInterval);

    /* Fade audio out */
    fadeAudioOut(900);

    /* Stop particles */
    if (particleAnimId) cancelAnimationFrame(particleAnimId);

    /* Animate out */
    if (introScreen) {
      introScreen.classList.add('exiting');
      introScreen.addEventListener('animationend', () => {
        introScreen.style.display = 'none';
      }, { once: true });
    }

    /* Show main site */
    if (mainSite) {
      mainSite.classList.add('ready');
    }

    /* Trigger main site entrance */
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('intro:done'));
    }, 200);
  }

  /* ──────────────────────────────────────────
     INIT
  ────────────────────────────────────────── */
  function init() {
    initParticles();
    drawParticles();
    initAudio();
    runSequence();

    /* Skip button */
    if (skipBtn) {
      skipBtn.addEventListener('click', dismissIntro);
    }

    /* Audio toggle */
    if (audioToggleBtn) {
      audioToggleBtn.addEventListener('click', toggleMute);
    }

    /* Keyboard shortcut: Escape to skip */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dismissIntro();
    });
  }

  /* Run on DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
