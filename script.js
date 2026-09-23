/**
 * Parth Patel - Full Stack Developer Portfolio
 * Pure Vanilla JavaScript (ES6+) - No external dependencies or frameworks
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Custom Interactive Cursor
     -------------------------------------------------------------------------- */
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorFollower = document.querySelector('.cursor-follower');

  if (cursorDot && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    // Smooth physics loop for trailing follower
    const renderCursor = () => {
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;
      cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Expand follower on interactive element hover
    const hoverTargets = document.querySelectorAll('a, button, input, select, textarea, .service-card, .metric-card, .filter-btn');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursorFollower.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursorFollower.classList.remove('is-hovering'));
    });
  }

  /* --------------------------------------------------------------------------
     1.1 Parallax Background Glow Effect (Scroll & Organic Depth)
     -------------------------------------------------------------------------- */
  const parallaxLayers = document.querySelectorAll('.ambient-parallax-layer');
  if (parallaxLayers.length > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let targetScrollY = window.scrollY;
    let currentScrollY = targetScrollY;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let isParallaxRunning = false;

    // Smooth physics loop for ambient parallax
    const renderParallax = () => {
      const scrollDelta = targetScrollY - currentScrollY;
      const mouseDeltaX = targetMouseX - currentMouseX;
      const mouseDeltaY = targetMouseY - currentMouseY;

      // Smooth interpolation
      currentScrollY += scrollDelta * 0.08;
      currentMouseX += mouseDeltaX * 0.05;
      currentMouseY += mouseDeltaY * 0.05;

      parallaxLayers.forEach((layer) => {
        const speedY = parseFloat(layer.getAttribute('data-speed-y') || '0');
        const speedX = parseFloat(layer.getAttribute('data-speed-x') || '0');
        const mouseFactor = parseFloat(layer.getAttribute('data-mouse') || '20');

        const y = (currentScrollY * speedY) + (currentMouseY * mouseFactor);
        const x = (currentScrollY * speedX) + (currentMouseX * mouseFactor);

        layer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });

      // Keep running while moving; sleep when settled to preserve CPU & battery
      if (Math.abs(scrollDelta) > 0.1 || Math.abs(mouseDeltaX) > 0.002 || Math.abs(mouseDeltaY) > 0.002) {
        requestAnimationFrame(renderParallax);
      } else {
        isParallaxRunning = false;
      }
    };

    const wakeParallax = () => {
      if (!isParallaxRunning) {
        isParallaxRunning = true;
        requestAnimationFrame(renderParallax);
      }
    };

    // Track scroll
    window.addEventListener('scroll', () => {
      targetScrollY = window.scrollY;
      wakeParallax();
    }, { passive: true });

    // Track subtle mouse movement on desktop
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', (e) => {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        targetMouseX = (e.clientX - halfW) / halfW;
        targetMouseY = (e.clientY - halfH) / halfH;
        wakeParallax();
      }, { passive: true });
    }

    // Initial render
    wakeParallax();
  }

  /* --------------------------------------------------------------------------
     1.2 On-Scroll Counter Animation (Interactive Metric Numbers)
     -------------------------------------------------------------------------- */
  const counterElements = document.querySelectorAll('.counter-number');

  if (counterElements.length > 0) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animateCounter = (el) => {
      const rawTarget = el.getAttribute('data-target') || el.textContent;
      const target = parseFloat(rawTarget);
      if (isNaN(target)) return;

      const isInteger = Number.isInteger(target);
      const duration = 1400; // 1.4 seconds
      const startTime = performance.now();

      if (prefersReducedMotion) {
        el.textContent = target.toString();
        el.classList.add('counter-finished');
        return;
      }

      el.textContent = '0';

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth cubic-out easing curve (starts briskly, smoothly settles)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeOut * target;

        if (isInteger) {
          el.textContent = Math.round(currentVal);
        } else {
          el.textContent = currentVal.toFixed(1);
        }

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = target.toString();
          el.classList.add('counter-finished');
        }
      };

      requestAnimationFrame(updateCount);
    };

    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      });

      counterElements.forEach((el) => counterObserver.observe(el));
    } else {
      counterElements.forEach((el) => animateCounter(el));
    }
  }

  /* --------------------------------------------------------------------------
     2. Navigation: Sticky Header, Mobile Drawer & ScrollSpy
     -------------------------------------------------------------------------- */
  const header = document.getElementById('main-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTopBtn = document.getElementById('back-to-top');

  // Sticky header class toggle
  const handleScroll = () => {
    const scrollPos = window.scrollY;
    if (header) {
      header.classList.toggle('scrolled', scrollPos > 24);
    }
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('is-visible', scrollPos > 400);
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (mobileToggle && mobileDrawer) {
    const closeMobileMenu = () => {
      mobileDrawer.classList.remove('is-open');
      mobileToggle.classList.remove('is-active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileDrawer.classList.toggle('is-open');
      mobileToggle.classList.toggle('is-active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile drawer on link click or footer buttons
    mobileDrawer.querySelectorAll('.nav-link, button, a').forEach((el) => {
      el.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close on click outside drawer
    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('is-open')) {
        if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
          closeMobileMenu();
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  }

  // Smooth scroll with header offset
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const headerOffset = 76;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ScrollSpy using IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const scrollSpyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              const href = link.getAttribute('href');
              if (href === `#${currentId}`) {
                link.classList.add('active');
              } else if (href && href.startsWith('#')) {
                link.classList.remove('active');
              }
            });
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.1
      }
    );

    sections.forEach((section) => scrollSpyObserver.observe(section));
  }

  // Back to top button action
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     2.1 Theme Switcher (White / Light Mode Default & Dark Mode Toggle)
     -------------------------------------------------------------------------- */
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle-btn');
  const mobileThemeIcon = document.getElementById('mobile-theme-icon');
  const mobileThemeText = document.getElementById('mobile-theme-text');
  const metaThemeColor = document.getElementById('meta-theme-color');

  const updateThemeUI = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);

    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    if (mobileThemeIcon) {
      mobileThemeIcon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    }
    if (mobileThemeText) {
      mobileThemeText.textContent = theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    }
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#090B0D' : '#F8FAFC');
    }
    try {
      localStorage.setItem('parth_portfolio_theme', theme);
    } catch (e) {
      // Ignore localStorage restrictions if any
    }
  };

  // Determine initial theme: Default is white/light mode
  const savedTheme = (() => {
    try {
      return localStorage.getItem('parth_portfolio_theme');
    } catch (e) {
      return null;
    }
  })();

  const currentTheme = savedTheme === 'dark' ? 'dark' : 'light';
  updateThemeUI(currentTheme);

  const toggleTheme = () => {
    const active = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = active === 'dark' ? 'light' : 'dark';
    updateThemeUI(nextTheme);
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTheme();
    });
  }

  if (mobileThemeToggleBtn) {
    mobileThemeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTheme();
    });
  }

  /* --------------------------------------------------------------------------
     3. Scroll Reveal Animations (IntersectionObserver)
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const isMobile = window.innerWidth < 768;
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        // Group intersecting elements in current frame to apply subtle cascading delay
        const intersecting = entries.filter((entry) => entry.isIntersecting);

        intersecting.forEach((entry, idx) => {
          const el = entry.target;

          // Determine if element belongs to a multi-item grid or list for staggered cascading
          const parentGrid = el.closest('.services-grid, .credentials-grid, .testimonials-grid, .skills-grid, .metrics-grid');
          let staggerDelay = 0;

          if (parentGrid) {
            // Find index of this item among siblings in the same grid
            const siblings = Array.from(parentGrid.querySelectorAll('.reveal'));
            const siblingIndex = siblings.indexOf(el);
            if (siblingIndex > -1) {
              staggerDelay = (siblingIndex % 4) * 80;
            } else {
              staggerDelay = (idx % 4) * 80;
            }
          } else if (intersecting.length > 1) {
            staggerDelay = Math.min(idx * 80, 320);
          }

          if (staggerDelay > 0) {
            el.style.transitionDelay = `${staggerDelay}ms`;
          }

          // Trigger smooth visibility transition
          requestAnimationFrame(() => {
            el.classList.add('is-visible');
          });

          // Clean up inline transition-delay and will-change after animation finishes so hover states remain snappy
          const onTransitionEnd = (e) => {
            if (e.target === el && (e.propertyName === 'opacity' || e.propertyName === 'transform')) {
              el.style.transitionDelay = '';
              el.style.willChange = 'auto';
              el.removeEventListener('transitionend', onTransitionEnd);
            }
          };
          el.addEventListener('transitionend', onTransitionEnd);

          // Stop observing element once revealed
          observer.unobserve(el);
        });
      },
      {
        threshold: isMobile ? 0.05 : 0.08,
        rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => {
      // Immediate gentle reveal for elements already in viewport on page load (e.g. hero section)
      const rect = el.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= (window.innerHeight * 0.95)) {
        setTimeout(() => {
          el.classList.add('is-visible');
        }, 120);
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    // Graceful fallback if IntersectionObserver is unavailable
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* --------------------------------------------------------------------------
     4. Interactive CNC Industrial IoT Telemetry Simulation
     -------------------------------------------------------------------------- */
  const spindleValEl = document.getElementById('telemetry-spindle');
  const feedValEl = document.getElementById('telemetry-feed');
  const rmsValEl = document.getElementById('telemetry-rms');
  const gcodeStreamEl = document.getElementById('gcode-stream');
  const waveformCanvas = document.getElementById('waveform-canvas');

  // Oscillating metrics
  if (spindleValEl && feedValEl && rmsValEl) {
    setInterval(() => {
      const baseRpm = 18450;
      const rpmOffset = Math.floor((Math.random() - 0.5) * 140);
      spindleValEl.textContent = (baseRpm + rpmOffset).toLocaleString();

      const baseFeed = 1240;
      const feedOffset = Math.floor((Math.random() - 0.5) * 45);
      feedValEl.textContent = (baseFeed + feedOffset).toLocaleString();

      const rms = (0.014 + (Math.random() - 0.5) * 0.003).toFixed(3);
      rmsValEl.textContent = rms;
    }, 1800);
  }

  // Live G-Code log stream
  if (gcodeStreamEl) {
    const gcodePool = [
      'G01 X144.20 Y91.45 F1240 S18450',
      'M08 Coolant Flow High [OK]',
      'G02 X152.00 Y96.30 I5.20 J0.00',
      'Telemetry Sync: Chunk #4092 acknowledged',
      'G00 Z15.000 Rapid Traverse',
      'Spindle Vector Stabilized • 0.014 g-rms',
      'G01 X148.80 Y88.20 F1260',
      'T02 Tool Offset Verification PASS',
      'Axis Harmonic Vibration < 0.02mm/s'
    ];

    let gcodeIndex = 0;
    setInterval(() => {
      const line = gcodePool[gcodeIndex % gcodePool.length];
      const p = document.createElement('p');
      p.className = gcodeIndex % 2 === 0 ? 'stream-active' : 'stream-alt';
      p.textContent = `> ${line}`;
      gcodeStreamEl.appendChild(p);

      // Keep maximum 6 lines in view
      while (gcodeStreamEl.children.length > 5) {
        gcodeStreamEl.removeChild(gcodeStreamEl.firstChild);
      }
      gcodeIndex++;
    }, 2400);
  }

  // Animated Waveform Canvas
  if (waveformCanvas) {
    const ctx = waveformCanvas.getContext('2d');
    let step = 0;

    const resizeCanvas = () => {
      const rect = waveformCanvas.parentElement.getBoundingClientRect();
      waveformCanvas.width = rect.width;
      waveformCanvas.height = rect.height || 120;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawWaveform = () => {
      const width = waveformCanvas.width;
      const height = waveformCanvas.height;
      if (!ctx || width === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Main Emerald Sine Wave
      ctx.beginPath();
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
      ctx.shadowBlur = 10;

      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.sin((x + step * 1.5) * 0.04) * 22 * Math.sin(x * 0.008) +
          Math.sin((x + step * 0.8) * 0.08) * 8;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Secondary Mint Waveform
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;

      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.sin((x - step * 1.2) * 0.03) * 16 * Math.cos(x * 0.005);
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      step += 1.5;
      requestAnimationFrame(drawWaveform);
    };

    requestAnimationFrame(drawWaveform);
  }

  /* --------------------------------------------------------------------------
     5. Projects Filtering
     -------------------------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const flagshipSection = document.getElementById('flagship-case-study');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter') || 'all';

      // Toggle flagship visibility if filter is IoT or All
      if (flagshipSection) {
        if (filter === 'all' || filter === 'iot') {
          flagshipSection.style.display = 'block';
        } else {
          flagshipSection.style.display = 'none';
        }
      }

      // Filter remaining project cards
      projectCards.forEach((card) => {
        const categories = (card.getAttribute('data-category') || '').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
          }, 40);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* --------------------------------------------------------------------------
     6. Interactive Contact Form with Validation & Feedback
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (contactForm && formFeedback && submitBtn) {
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    const inquiryInput = document.getElementById('contact-inquiry');
    const charCounter = document.getElementById('message-char-count');
    const inquiryChips = document.querySelectorAll('.inquiry-chip');

    // Sync chips with select dropdown
    const updateActiveChip = (val) => {
      inquiryChips.forEach((chip) => {
        if (chip.dataset.value === val) {
          chip.classList.add('is-active');
        } else {
          chip.classList.remove('is-active');
        }
      });
    };

    inquiryChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.value;
        if (inquiryInput && val) {
          inquiryInput.value = val;
          updateActiveChip(val);
        }
      });
    });

    if (inquiryInput) {
      inquiryInput.addEventListener('change', () => {
        updateActiveChip(inquiryInput.value);
      });
    }

    // Live character counter for project message
    const updateCharCount = () => {
      if (messageInput && charCounter) {
        const len = messageInput.value.length;
        charCounter.textContent = `${len} / 1000`;
        if (len >= 10) {
          charCounter.classList.add('is-valid');
        } else {
          charCounter.classList.remove('is-valid');
        }
      }
    };

    const validateEmail = (email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateField = (input, isValid) => {
      if (!isValid) {
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
      }
      return isValid;
    };

    nameInput?.addEventListener('input', () => {
      validateField(nameInput, nameInput.value.trim().length >= 2);
    });

    emailInput?.addEventListener('input', () => {
      validateField(emailInput, validateEmail(emailInput.value.trim()));
    });

    messageInput?.addEventListener('input', () => {
      validateField(messageInput, messageInput.value.trim().length >= 10);
      updateCharCount();
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 2);
      const isEmailValid = validateField(emailInput, validateEmail(emailInput.value.trim()));
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 10);

      if (!isNameValid || !isEmailValid || !isMessageValid) {
        return;
      }

      // Show submitting state
      submitBtn.disabled = true;
      const originalContent = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span>
        <span class="btn-submit-text">Sending Proposal...</span>
      `;

      const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        inquiry_category: inquiryInput ? inquiryInput.options[inquiryInput.selectedIndex]?.text || inquiryInput.value : 'General Proposal',
        message: messageInput.value.trim(),
        _subject: `🚀 New Project Proposal from ${nameInput.value.trim()}`,
        _template: 'table',
        _captcha: 'false'
      };

      fetch('https://formsubmit.co/ajax/patelparth5133@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then((res) => res.json())
      .then((data) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;

        // Display success banner
        formFeedback.className = 'form-feedback-banner success';
        formFeedback.innerHTML = `
          <span class="material-symbols-outlined">check_circle</span>
          <div>
            <strong>Proposal Dispatched!</strong>
            <div>Thank you, ${nameInput.value.trim()}. Your project proposal has been sent to patelparth5133@gmail.com. Parth will reply within 24 hours.</div>
          </div>
        `;
        formFeedback.style.display = 'flex';

        contactForm.reset();
        updateCharCount();
        updateActiveChip('project');

        setTimeout(() => {
          formFeedback.style.display = 'none';
        }, 8000);
      })
      .catch((err) => {
        console.error('Email trigger error:', err);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;

        formFeedback.className = 'form-feedback-banner error';
        formFeedback.innerHTML = `
          <span class="material-symbols-outlined">error</span>
          <div>
            <strong>Submission Issue</strong>
            <div>Unable to send form automatically. Please email directly at patelparth5133@gmail.com</div>
          </div>
        `;
        formFeedback.style.display = 'flex';
      });
    });

    // Service cards click-to-select in contact form
    document.querySelectorAll('.service-card').forEach((card) => {
      card.addEventListener('click', () => {
        const serviceName = card.querySelector('.service-title')?.textContent || '';
        if (inquiryInput && serviceName) {
          // Select closest matching dropdown option
          for (let i = 0; i < inquiryInput.options.length; i++) {
            if (inquiryInput.options[i].text.includes(serviceName) || inquiryInput.options[i].value === 'custom') {
              inquiryInput.selectedIndex = i;
              break;
            }
          }
        }
        // Smoothly scroll to contact section
        const contactSec = document.getElementById('contact');
        if (contactSec) {
          const headerOffset = 76;
          const elementPosition = contactSec.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          nameInput?.focus();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. Interactive Modals: Resume & Interactive CLI Terminal
     -------------------------------------------------------------------------- */
  // Resume Modal
  const resumeModal = document.getElementById('resume-modal');
  const resumeTriggers = document.querySelectorAll('.trigger-resume');
  const resumeClose = document.getElementById('close-resume-modal');

  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  resumeTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(resumeModal);
    });
  });

  resumeClose?.addEventListener('click', () => closeModal(resumeModal));
  resumeModal?.addEventListener('click', (e) => {
    if (e.target === resumeModal) closeModal(resumeModal);
  });

  // Terminal Drawer
  const terminalModal = document.getElementById('terminal-modal');
  const terminalTriggers = document.querySelectorAll('.trigger-terminal');
  const terminalClose = document.getElementById('close-terminal-modal');
  const cliInput = document.getElementById('cli-input');
  const cliOutput = document.getElementById('cli-output');

  terminalTriggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(terminalModal);
      setTimeout(() => cliInput?.focus(), 100);
    });
  });

  terminalClose?.addEventListener('click', () => closeModal(terminalModal));
  terminalModal?.addEventListener('click', (e) => {
    if (e.target === terminalModal) closeModal(terminalModal);
  });

  // Terminal command processor
  if (cliInput && cliOutput) {
    const handleCliCommand = (cmd) => {
      const cleanCmd = cmd.trim().toLowerCase();
      const outputLine = document.createElement('div');
      outputLine.style.marginBottom = '6px';

      const echoPrompt = document.createElement('div');
      echoPrompt.style.color = '#34D399';
      echoPrompt.textContent = `visitor@parth.dev:~$ ${cmd}`;
      outputLine.appendChild(echoPrompt);

      const resp = document.createElement('div');
      resp.style.color = '#F5F7F5';
      resp.style.paddingLeft = '8px';

      switch (cleanCmd) {
        case 'help':
          resp.innerHTML = `Available commands:<br>
            • <span style="color:#22C55E">skills</span> - View core technical stack<br>
            • <span style="color:#22C55E">services</span> - View development services<br>
            • <span style="color:#22C55E">contact</span> - Get direct contact information<br>
            • <span style="color:#22C55E">ping</span> - Network health check<br>
            • <span style="color:#22C55E">clear</span> - Clear terminal output<br>
            • <span style="color:#22C55E">exit</span> - Close terminal window`;
          break;
        case 'skills':
          resp.innerHTML = `Backend: PHP 8.3, Laravel (Lead), Node.js, RESTful APIs, WebSockets<br>
            Frontend: JavaScript ES6+, Vue.js / Inertia, React, Tailwind CSS, HTML5/CSS3<br>
            Data: MySQL (InnoDB), PostgreSQL, Redis Cache, Eloquent ORM<br>
            DevOps: Docker, Git & CI/CD Actions, Linux/Nginx, AWS`;
          break;
        case 'services':
          resp.innerHTML = `• Full Stack Application Development (Laravel + Vue/React)<br>
            • High-Throughput RESTful & GraphQL API Architecture<br>
            • Database Schema Normalization & MySQL Query Tuning<br>
            • Cloud Infrastructure, Docker & CI/CD Automation`;
          break;
        case 'projects':
          resp.innerHTML = `Projects section is currently hidden.`;
          break;
        case 'experience':
          resp.innerHTML = `Experience timeline is hidden from main view. Open the "Resume" modal to view full career snapshot.`;
          break;
        case 'contact':
          resp.innerHTML = `Email: patelparth5133@gmail.com<br>
            Location: UTC+5:30 (IST) • Global Remote Flexible<br>
            GitHub: github.com/parth-5133<br>
            LinkedIn: linkedin.com/in/patel-parth-9a3a88282`;
          break;
        case 'ping':
          resp.innerHTML = `<span style="color:#22C55E">PONG parth.dev (192.0.2.1): 56 data bytes</span><br>
            64 bytes from 192.0.2.1: icmp_seq=1 ttl=58 time=11.4 ms<br>
            64 bytes from 192.0.2.1: icmp_seq=2 ttl=58 time=12.1 ms<br>
            --- parth.dev ping statistics: 0% packet loss, cluster healthy ---`;
          break;
        case 'clear':
          cliOutput.innerHTML = '';
          return;
        case 'exit':
          closeModal(terminalModal);
          return;
        case '':
          return;
        default:
          resp.innerHTML = `<span style="color:#EF4444">Command not found: ${cmd}</span>. Type <span style="color:#22C55E">help</span> for a list of commands.`;
      }

      outputLine.appendChild(resp);
      cliOutput.appendChild(outputLine);
      cliOutput.scrollTop = cliOutput.scrollHeight;
    };

    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = cliInput.value;
        cliInput.value = '';
        handleCliCommand(val);
      }
    });
  }

  // Escape key closes modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(resumeModal);
      closeModal(terminalModal);
      if (mobileDrawer?.classList.contains('is-open')) {
        mobileDrawer.classList.remove('is-open');
        mobileToggle?.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    }
  });

  /* --------------------------------------------------------------------------
     8. Copy Email to Clipboard
     -------------------------------------------------------------------------- */
  const emailCards = document.querySelectorAll('.copy-email-btn');
  emailCards.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = 'patelparth5133@gmail.com';
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          showToast('Email copied to clipboard: ' + email);
        });
      }
    });
  });

  // Global toast notification
  const showToast = (message) => {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      toast.style.backgroundColor = '#15191C';
      toast.style.color = '#22C55E';
      toast.style.border = '1px solid rgba(34, 197, 94, 0.4)';
      toast.style.padding = '10px 20px';
      toast.style.borderRadius = '8px';
      toast.style.fontFamily = 'var(--font-mono)';
      toast.style.fontSize = '12px';
      toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
      toast.style.zIndex = '1000';
      toast.style.opacity = '0';
      toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  };

  /* --------------------------------------------------------------------------
     9. 3D Floating Technology Ecosystem (Full Hero Section Floating Background)
     -------------------------------------------------------------------------- */
  const TECH_STACK_DATA = [
    {
      name: 'Laravel',
      color: '#FF2D20',
      rgb: '255, 45, 32',
      iconImg: 'assets/laravel-framework-logo.png',
      floatAnim: 'techFloat4',
      duration: '9.0s',
      delay: '0.2s',
      depth: 1.4,
      pos: { top: '38%', left: '2%' },
      mobileVisible: true
    },
    {
      name: 'React',
      color: '#61DAFB',
      rgb: '97, 218, 251',
      iconImg: 'assets/react.png',
      floatAnim: 'techFloat2',
      duration: '8.2s',
      delay: '0.3s',
      depth: 1.5,
      pos: { top: '6%', left: '44%' },
      mobileVisible: true
    },
    {
      name: 'Vue.js',
      color: '#4FC08D',
      rgb: '79, 192, 141',
      iconImg: 'assets/vuejs.png',
      floatAnim: 'techFloat3',
      duration: '7.5s',
      delay: '0.6s',
      depth: 1.3,
      pos: { top: '7%', right: '4%' },
      mobileVisible: true
    },
    {
      name: 'PHP',
      color: '#777BB4',
      rgb: '119, 123, 180',
      iconImg: 'assets/php.png',
      floatAnim: 'techFloat1',
      duration: '6.5s',
      delay: '0.1s',
      depth: 1.2,
      pos: { top: '8%', left: '3%' },
      mobileVisible: false
    },
    {
      name: 'JavaScript',
      color: '#F7DF1E',
      rgb: '247, 223, 30',
      iconImg: 'assets/javascript-logo.png',
      floatAnim: 'techFloat6',
      duration: '7.8s',
      delay: '0.8s',
      depth: 1.4,
      pos: { top: '68%', left: '42%' },
      mobileVisible: true
    },
    {
      name: 'HTML5',
      color: '#E34F26',
      rgb: '227, 79, 38',
      iconImg: 'assets/html-logo.png',
      floatAnim: 'techFloat5',
      duration: '6.8s',
      delay: '0.7s',
      depth: 1.1,
      pos: { top: '28%', right: '18%' },
      mobileVisible: false
    },
    {
      name: 'MySQL',
      color: '#4479A1',
      rgb: '68, 121, 161',
      iconImg: 'assets/mysql.png',
      floatAnim: 'techFloat2',
      duration: '6.2s',
      delay: '1.0s',
      depth: 1.3,
      pos: { bottom: '6%', left: '8%' },
      mobileVisible: true
    },
    {
      name: 'Bootstrap',
      color: '#7952B3',
      rgb: '121, 82, 179',
      iconImg: 'assets/bootstrap-framework-logo.png',
      floatAnim: 'techFloat1',
      duration: '8.8s',
      delay: '0.5s',
      depth: 1.4,
      pos: { top: '64%', left: '3%' },
      mobileVisible: true
    },
    {
      name: 'jQuery',
      color: '#0769AD',
      rgb: '7, 105, 173',
      iconImg: 'assets/jquery.png',
      floatAnim: 'techFloat3',
      duration: '9.5s',
      delay: '0.4s',
      depth: 1.2,
      pos: { bottom: '7%', left: '50%' },
      mobileVisible: false
    },
    {
      name: 'Java',
      color: '#007396',
      rgb: '0, 115, 150',
      iconImg: 'assets/java.png',
      floatAnim: 'techFloat4',
      duration: '7.0s',
      delay: '1.2s',
      depth: 1.2,
      pos: { bottom: '5%', right: '5%' },
      mobileVisible: false
    },
    {
      name: 'C Language',
      color: '#A8B9CC',
      rgb: '168, 185, 204',
      iconImg: 'assets/c-language-logo.png',
      floatAnim: 'techFloat6',
      duration: '7.5s',
      delay: '0.9s',
      depth: 1.3,
      pos: { bottom: '22%', right: '14%' },
      mobileVisible: false
    }
  ];

  const init3DTechEcosystem = () => {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    let ecosystemContainer = document.getElementById('tech-ecosystem');
    if (ecosystemContainer) {
      ecosystemContainer.innerHTML = '';
    } else {
      ecosystemContainer = document.createElement('div');
      ecosystemContainer.id = 'tech-ecosystem';
      ecosystemContainer.className = 'tech-ecosystem-container';
      ecosystemContainer.setAttribute('aria-hidden', 'true');
      heroSection.insertBefore(ecosystemContainer, heroSection.firstChild);
    }

    TECH_STACK_DATA.forEach((tech) => {
      const card = document.createElement('div');
      card.className = `tech-3d-card ${tech.mobileVisible ? '' : 'hide-on-mobile'}`;
      card.setAttribute('data-tech', tech.name);
      card.style.setProperty('--brand-color', tech.color);
      card.style.setProperty('--brand-rgb', tech.rgb);
      card.style.setProperty('--anim-name', tech.floatAnim);
      card.style.setProperty('--anim-duration', tech.duration);
      card.style.setProperty('--anim-delay', tech.delay);
      card.style.setProperty('--depth-factor', tech.depth);

      if (tech.pos.top) card.style.top = tech.pos.top;
      if (tech.pos.left) card.style.left = tech.pos.left;
      if (tech.pos.right) card.style.right = tech.pos.right;
      if (tech.pos.bottom) card.style.bottom = tech.pos.bottom;

      card.setAttribute('title', tech.name);
      card.setAttribute('aria-label', tech.name);

      const iconMarkup = tech.iconImg
        ? `<img src="${tech.iconImg}" alt="${tech.name}">`
        : tech.iconSvg;

      card.innerHTML = `
        <div class="tech-card-inner">
          <div class="tech-icon-box">
            ${iconMarkup}
          </div>
        </div>
      `;

      // Hover 3D Tilt interaction per card
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rx = (-y / rect.height) * 16;
        const ry = (x / rect.width) * 16;
        card.style.setProperty('--hover-rx', `${rx}deg`);
        card.style.setProperty('--hover-ry', `${ry}deg`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--hover-rx', '0deg');
        card.style.setProperty('--hover-ry', '0deg');
      });

      ecosystemContainer.appendChild(card);
    });

    // Parallax mouse tracking relative to full Hero section canvas
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovering = false;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetX = (e.clientX - centerX) / (rect.width / 2);
      targetY = (e.clientY - centerY) / (rect.height / 2);
      targetX = Math.max(-1, Math.min(1, targetX));
      targetY = Math.max(-1, Math.min(1, targetY));
      isHovering = true;
    });

    heroSection.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      isHovering = false;
    });

    // Smooth RAF loop for parallax
    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (Math.abs(currentX) > 0.001 || Math.abs(currentY) > 0.001 || isHovering) {
        const cards = ecosystemContainer.querySelectorAll('.tech-3d-card');
        cards.forEach((c) => {
          const depth = parseFloat(c.style.getPropertyValue('--depth-factor')) || 1;
          const moveX = currentX * 12 * depth;
          const moveY = currentY * 12 * depth;
          const rotX = -currentY * 6 * depth;
          const rotY = currentX * 6 * depth;
          c.style.setProperty('--para-x', `${moveX}px`);
          c.style.setProperty('--para-y', `${moveY}px`);
          c.style.setProperty('--para-rx', `${rotX}deg`);
          c.style.setProperty('--para-ry', `${rotY}deg`);
        });
      }

      requestAnimationFrame(updateParallax);
    };

    requestAnimationFrame(updateParallax);
  };

  // Initialize the 3D Tech Ecosystem
  init3DTechEcosystem();
});
