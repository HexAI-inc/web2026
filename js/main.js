/**
 * HexAI — Main JavaScript
 * Handles: Navigation, Hero Canvas Animation, Scroll Reveals, Form
 */

(function () {
  'use strict';

  // ============================================
  // Mobile Navigation Toggle
  // ============================================
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('nav__links--open');
      navToggle.classList.toggle('nav__toggle--active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('nav__links--open');
        navToggle.classList.remove('nav__toggle--active');
      });
    });
  }

  // ============================================
  // Navbar Scroll Effect
  // ============================================
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
      nav.style.background = 'rgba(10, 15, 26, 0.97)';
    } else {
      nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
      nav.style.background = 'rgba(10, 15, 26, 0.92)';
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ============================================
  // Scroll Reveal Animation
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show all elements
    revealElements.forEach(el => el.classList.add('reveal--visible'));
  }

  // ============================================
  // Hero Canvas — Animated Network Grid
  // ============================================
  const canvas = document.getElementById('heroCanvas');

  if (canvas) {
    const ctx = canvas.getContext('2d');
    let animationId;
    let nodes = [];
    let width, height;
    const NODE_COUNT = 60;
    const CONNECTION_DISTANCE = 160;
    const NODE_SPEED = 0.3;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    function createNodes() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * NODE_SPEED,
          vy: (Math.random() - 0.5) * NODE_SPEED,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    }

    function drawNode(node) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(3, 172, 240, ${node.opacity})`;
      ctx.fill();
    }

    function drawConnection(a, b, distance) {
      const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.15;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(3, 172, 240, ${opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    function updateNode(node) {
      node.x += node.vx;
      node.y += node.vy;

      // Wrap around edges
      if (node.x < 0) node.x = width;
      if (node.x > width) node.x = 0;
      if (node.y < 0) node.y = height;
      if (node.y > height) node.y = 0;
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw grid pattern (subtle)
      ctx.strokeStyle = 'rgba(30, 69, 112, 0.08)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        updateNode(nodes[i]);
        drawNode(nodes[i]);

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < CONNECTION_DISTANCE) {
            drawConnection(nodes[i], nodes[j], distance);
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    }

    // Init
    resize();
    createNodes();
    animate();

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
        createNodes();
      }, 250);
    });

    // Pause animation when not visible
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animationId) animate();
        } else {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      });
    }, { threshold: 0 });

    heroObserver.observe(canvas.closest('.hero') || canvas);
  }

  // ============================================
  // Contact Form Handling
  // ============================================
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Show loading state
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="animation: spin 1s linear infinite;">
          <path d="M12 2v4m0 12v4m-8-10h4m8 0h4m-2.93-6.07l-2.83 2.83m-4.48 4.48l-2.83 2.83m0-10.14l2.83 2.83m4.48 4.48l2.83 2.83"/>
        </svg>
        Sending...
      `;
      submitBtn.disabled = true;

      // Simulate form submission
      setTimeout(() => {
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Request Submitted
        `;
        submitBtn.style.background = '#059669';
        submitBtn.style.boxShadow = '0 4px 20px rgba(5, 150, 105, 0.3)';

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.style.boxShadow = '';
          submitBtn.disabled = false;
          contactForm.reset();
        }, 3000);
      }, 1500);
    });
  }

  // ============================================
  // Animated Counter (for metrics)
  // ============================================
  function animateCounter(element, target, suffix = '') {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * eased);

      element.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Observe stat elements for counter animation
  const statElements = document.querySelectorAll('.hero__stat-value, .metric__value');
  if (statElements.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();

          // Parse value and suffix
          const match = text.match(/^([\d.]+)(.*)$/);
          if (match) {
            const num = parseFloat(match[1]);
            const suffix = match[2];
            if (!isNaN(num) && num > 0) {
              animateCounter(el, num, suffix);
            }
          }
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statElements.forEach(el => counterObserver.observe(el));
  }

  // ============================================
  // Team Carousel Active Card
  // ============================================
  const teamCarousels = document.querySelectorAll('.team-carousel');

  teamCarousels.forEach(carousel => {
    const track = carousel.querySelector('.team-carousel__track');
    const items = track ? track.querySelectorAll('.team-carousel__item') : [];
    if (!track || items.length === 0 || !('IntersectionObserver' in window)) return;

    // Direct fix for single item or few items
    if (items.length <= 2) {
      items.forEach(item => item.classList.add('is-active'));
      return;
    }

    const activeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        } else {
          entry.target.classList.remove('is-active');
        }
      });
    }, {
      root: track,
      threshold: 0.6
    });

    items.forEach(item => {
      activeObserver.observe(item);
      
      // Tap to flip on mobile
      item.addEventListener('click', () => {
        if (window.matchMedia('(hover: none)').matches) {
          item.classList.toggle('is-flipped');
        }
      });
    });
  });

  // ============================================
  // Smooth scroll for anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav')?.offsetHeight || 72;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // Add spin animation via JS (for form loading)
  // ============================================
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

})();
