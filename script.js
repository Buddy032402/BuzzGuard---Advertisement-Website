"use strict";

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('BuzzGuard website initialized');
  initAllFeatures();
});

function initAllFeatures() {
  initThemeToggle();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    initMosquito();
    initLightning();
  } else {
    console.log('Reduced motion enabled — skipping swarm and lightning');
  }
  initNavigation();
  initScrollSnapping();
  initMobileMenu();
  initContactForm();
  initFeedbackStore();
  initStatsCounter();
  initButtonEffects();
  initIntersectionObservers();
  initDeviceMockup();
  initDeviceSmoke();
  initDownloadGate();
}

// ============================================
// THEME TOGGLE (Light / Dark)
// ============================================
function applyTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
}

function initThemeToggle() {
  const stored = localStorage.getItem('bg-theme');
  const initial = stored || 'dark';
  applyTheme(initial);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = initial === 'light' ? '☀️' : '🌙';
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem('bg-theme', next);
      btn.textContent = next === 'light' ? '☀️' : '🌙';
    });
  }
}

// ============================================
// MOSQUITO ANIMATION (Swarm of 5) + subtle smoke trail
// ============================================
let mosquitos = [];
let swarmIntervals = [];
let smokeIntervals = [];

function initMosquito() {
  const containerId = 'mosquito-swarm';
  let swarm = document.getElementById(containerId);
  if (!swarm) {
    swarm = document.createElement('div');
    swarm.id = containerId;
    document.body.appendChild(swarm);
  }
  swarm.innerHTML = '';
  mosquitos = [];
  for (let i = 0; i < 5; i++) {
    const m = createMosquito(0.85 + Math.random() * 0.5);
    mosquitos.push(m);
    swarm.appendChild(m);
  }
  startMosquitoAnimation();
  window.addEventListener('resize', () => {
    mosquitos.forEach(el => flyToRandomPosition(el));
  }, { passive: true });
}

function createMosquito(scale) {
  const m = document.createElement('div');
  m.className = 'mosquito';
  m.style.transform = `scale(${scale})`;
  m.dataset.scale = String(scale);
  const body = document.createElement('div');
  body.className = 'mosquito-body';
  const leftWing = document.createElement('div');
  leftWing.className = 'wing left-wing';
  const rightWing = document.createElement('div');
  rightWing.className = 'wing right-wing';
  const head = document.createElement('div');
  head.className = 'mosquito-head';
  const proboscis = document.createElement('div');
  proboscis.className = 'proboscis';
  const legs = ['l1','l2','l3','r1','r2','r3'].map(cls => {
    const leg = document.createElement('div');
    leg.className = `leg ${cls}`;
    return leg;
  });
  body.appendChild(leftWing);
  body.appendChild(rightWing);
  body.appendChild(head);
  body.appendChild(proboscis);
  legs.forEach(l => body.appendChild(l));
  m.appendChild(body);
  return m;
}

function startMosquitoAnimation() {
  swarmIntervals.forEach(id => clearInterval(id));
  swarmIntervals = [];
  smokeIntervals.forEach(id => clearInterval(id));
  smokeIntervals = [];
  mosquitos.forEach(m => {
    flyToRandomPosition(m);
    const interval = setInterval(() => {
      flyToRandomPosition(m);
    }, 3800 + Math.random() * 2600);
    swarmIntervals.push(interval);

    // Gentle smoke emission, not too frequent
    const smokeIv = setInterval(() => {
      if (Math.random() < 0.2) emitSmoke(m);
    }, 2200 + Math.random() * 1600);
    smokeIntervals.push(smokeIv);
  });
}

function flyToRandomPosition(m) {
  if (!m) return;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const randomX = Math.random() * (windowWidth - 120) + 60;
  const randomY = Math.random() * (windowHeight - 140) + 70;
  const randomRot = (Math.random() * 20) - 10;
  m.style.left = `${randomX}px`;
  m.style.top = `${randomY}px`;
  const scl = parseFloat(m.dataset.scale || '1');
  m.style.transform = `scale(${scl}) rotate(${randomRot}deg)`;
}

function emitSmoke(m) {
  const swarm = document.getElementById('mosquito-swarm') || document.body;
  const smoke = document.createElement('div');
  smoke.className = 'smoke';
  const baseX = parseFloat(m.style.left || '0');
  const baseY = parseFloat(m.style.top || '0');
  const jitterX = (Math.random() * 10) - 5; // small horizontal drift
  const jitterY = (Math.random() * 6) - 3;  // small vertical offset
  const size = 9 + Math.random() * 6;
  smoke.style.left = `${baseX + 8 + jitterX}px`;
  smoke.style.top = `${baseY + 10 + jitterY}px`;
  smoke.style.width = `${size}px`;
  smoke.style.height = `${size}px`;
  swarm.appendChild(smoke);
  // Cleanup after animation
  setTimeout(() => {
    smoke.remove();
  }, 1700);
  // Keep DOM tidy
  if (swarm.childElementCount > 150) {
    for (let i = 0; i < 10; i++) {
      const first = swarm.firstElementChild;
      if (first && first.classList.contains('smoke')) first.remove();
    }
  }
}

// ============================================
// DEVICE SMOKE EMITTER (hero)
// ============================================
let deviceSmokeInterval;
function initDeviceSmoke() {
  const deviceImg = document.querySelector('.device-img');
  const container = document.querySelector('.hero-image') || document.body;
  if (!deviceImg || !container) return;
  if (deviceSmokeInterval) clearInterval(deviceSmokeInterval);

  const getAnchor = () => {
    const rect = deviceImg.getBoundingClientRect();
    const ax = parseFloat(deviceImg.getAttribute('data-smoke-anchor-x') || '52');
    const ay = parseFloat(deviceImg.getAttribute('data-smoke-anchor-y') || '28');
    return {
      x: rect.left + (ax / 100) * rect.width,
      y: rect.top + (ay / 100) * rect.height,
    };
  };

  const emit = () => {
    if (!isElementInViewport(deviceImg)) return;
    const { x, y } = getAnchor();
    const burst = 4;
    for (let i = 0; i < burst; i++) {
      const jitterX = (Math.random() - 0.5) * 3;
      const jitterY = (Math.random() - 0.5) * 2;
      const size = 14 + Math.random() * 16;

      const smoke = document.createElement('div');
      smoke.className = 'smoke';
      smoke.style.position = 'fixed';
      smoke.style.left = `${x + jitterX}px`;
      smoke.style.top = `${y + jitterY}px`;
      smoke.style.width = `${size}px`;
      smoke.style.height = `${size}px`;
      smoke.style.borderRadius = '50%';
      smoke.style.pointerEvents = 'none';
      smoke.style.background = 'radial-gradient(circle at 50% 60%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 40%, rgba(255,255,255,0.45) 72%, rgba(255,255,255,0.1) 100%)';
      smoke.style.filter = 'blur(0.8px)';
      smoke.style.opacity = '0.95';
      smoke.style.animation = 'none';
      document.body.appendChild(smoke);

      const driftX = (Math.random() - 0.5) * 14;
      const driftY = -(28 + Math.random() * 18);
      const finalScale = 2.2 + Math.random() * 0.8;
      const duration = 2800 + Math.random() * 800;
      const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
      smoke.animate([
        { transform: 'translate(0px, 0px) scale(1)', opacity: 0.95 },
        { transform: `translate(${driftX * 0.45}px, ${driftY * 0.45}px) scale(${(finalScale + 1) / 2})`, opacity: 0.85 },
        { transform: `translate(${driftX}px, ${driftY}px) scale(${finalScale})`, opacity: 0 }
      ], { duration, easing, fill: 'forwards' });

      setTimeout(() => smoke.remove(), duration + 150);
    }
  };

  // Run only while hero is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!deviceSmokeInterval) deviceSmokeInterval = setInterval(emit, 900);
      } else {
        if (deviceSmokeInterval) {
          clearInterval(deviceSmokeInterval);
          deviceSmokeInterval = null;
        }
      }
    });
  }, { threshold: 0.3 });
  observer.observe(deviceImg);
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0
  );
}

// ============================================
// LIGHTNING EFFECTS
// ============================================
function initLightning() {
  setInterval(() => {
    if (Math.random() < 0.2) {
      createLightningFlash();
    }
  }, 10000);
}

// ============================================
// DOWNLOAD PIN GATE
// ============================================
function initDownloadGate() {
  const btn = document.getElementById('downloadBtn');
  const modal = document.getElementById('downloadModal');
  const input = document.getElementById('downloadPinInput');
  const confirmBtn = document.getElementById('confirmPinBtn');
  const cancelBtn = document.getElementById('cancelPinBtn');
  const errorEl = document.getElementById('pinError');
  const PIN = '032402';
  const DOWNLOAD_URL = 'https://drive.google.com/file/d/15OMMldWRasz-E8BDCpJCuYJa4icQH0Jn/view?usp=sharing';
  if (!btn || !modal || !input || !confirmBtn || !cancelBtn) return;

  const open = () => {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    errorEl.textContent = '';
    input.value = '';
    setTimeout(() => input.focus(), 10);
  };
  const close = () => {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  };
  const validate = () => {
    const val = (input.value || '').trim();
    if (val === PIN) {
      close();
      window.location.href = DOWNLOAD_URL;
    } else {
      errorEl.textContent = 'Invalid PIN. Please try again.';
    }
  };

  btn.addEventListener('click', open);
  confirmBtn.addEventListener('click', validate);
  cancelBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target && e.target.getAttribute('data-close')) close(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') validate(); if (e.key === 'Escape') close(); });
}

function createLightningFlash() {
  const lightning = document.querySelector('.lightning');
  if (lightning) {
    lightning.style.opacity = '0.4';
    lightning.style.animation = 'none';
    setTimeout(() => {
      lightning.style.opacity = '0.1';
      lightning.style.animation = 'lightningFlash 15s infinite';
    }, 150);
  }
}

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
  // Navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSection = link.getAttribute('href').substring(1);
      navigateToSection(targetSection);
    });
  });

  // Navigation dots
  document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const targetSection = dot.getAttribute('data-section');
      navigateToSection(targetSection);
    });
  });
}

function navigateToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
    updateActiveStates(sectionId);
  }
}

function navigateToNextSection() {
  const sections = ['home', 'about', 'features', 'technology', 'problems', 'solution', 'team', 'contact', 'feedback', 'download'];
  const currentSection = getCurrentSection();
  const currentIndex = sections.indexOf(currentSection);
  const nextIndex = (currentIndex + 1) % sections.length;
  navigateToSection(sections[nextIndex]);
}

function navigateToPreviousSection() {
  const sections = ['home', 'about', 'features', 'technology', 'problems', 'solution', 'team', 'contact', 'feedback', 'download'];
  const currentSection = getCurrentSection();
  const currentIndex = sections.indexOf(currentSection);
  const prevIndex = (currentIndex - 1 + sections.length) % sections.length;
  navigateToSection(sections[prevIndex]);
}

function getCurrentSection() {
  const sections = document.querySelectorAll('.section');
  const navbar = document.querySelector('.navbar');
  const offset = (navbar?.offsetHeight || 0) + 120; // account for fixed navbar + breathing room
  const scrollPos = window.scrollY + offset;
  let currentSection = sections[0]?.id || 'home';
  sections.forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    if (scrollPos >= top && scrollPos < bottom) {
      currentSection = section.id;
    }
  });
  return currentSection;
}

function updateActiveStates(sectionId) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${sectionId}`) link.classList.add('active');
  });
  document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.classList.remove('active');
    if (dot.getAttribute('data-section') === sectionId) dot.classList.add('active');
  });
}

// ============================================
// SCROLL SNAPPING
// ============================================
function initScrollSnapping() {
  // With free scrolling, track window scroll to update active states
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentSection = getCurrentSection();
        updateActiveStates(currentSection);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
    document.addEventListener('click', (e) => {
      if (navbar && !e.target.closest('.navbar')) navLinks.classList.remove('active');
    });
  }
}

// ============================================
// CONTACT FORM
// ============================================
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      setTimeout(() => {
        submitButton.textContent = '✓ Message Sent!';
        submitButton.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        // Store feedback locally and render
        const feedbackItem = {
          name: (data.name || 'Anonymous').trim(),
          subject: (data.subject || '').trim(),
          message: (data.message || '').trim(),
          email: (data.email || '').trim(),
          time: new Date().toISOString()
        };
        addFeedback(feedbackItem);
        renderFeedback();
        // Navigate to Feedback section for immediate visibility
        navigateToSection('feedback');
        contactForm.reset();
        setTimeout(() => {
          submitButton.textContent = originalText;
          submitButton.style.background = '';
          submitButton.disabled = false;
        }, 3000);
      }, 2000);
    });
  }
}

// ============================================
// RECENT FEEDBACK (LocalStorage)
// ============================================
const FEEDBACK_KEY = 'buzzguard_feedback_v1';

function initFeedbackStore() {
  try {
    // Initialize storage if not present
    const existing = localStorage.getItem(FEEDBACK_KEY);
    if (!existing) localStorage.setItem(FEEDBACK_KEY, JSON.stringify([]));
  } catch (err) {
    console.warn('LocalStorage not available', err);
  }
  renderFeedback();
}

function getFeedback() {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFeedback(list) {
  try {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to write feedback', err);
  }
}

function addFeedback(item) {
  const list = getFeedback();
  // Add newest first, cap to 20 items
  list.unshift(item);
  if (list.length > 20) list.length = 20;
  setFeedback(list);
}

function renderFeedback() {
  const ul = document.getElementById('feedbackList');
  const empty = document.getElementById('feedbackEmpty');
  if (!ul) return;
  const list = getFeedback();
  ul.innerHTML = '';
  if (!list.length) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';
  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'feedback-item';
    const who = item.name ? item.name : 'Anonymous';
    const when = item.time ? new Date(item.time).toLocaleString() : '';
    const subject = item.subject ? ` — ${item.subject}` : '';
    // Safe insertion using text nodes
    const text = `“${item.message}”`;
    const header = document.createElement('div');
    header.className = 'feedback-item-header';
    header.textContent = `${who}${subject}`;
    const body = document.createElement('div');
    body.className = 'feedback-item-body';
    body.textContent = text;
    const meta = document.createElement('div');
    meta.className = 'feedback-item-meta';
    meta.textContent = when;
    li.appendChild(header);
    li.appendChild(body);
    li.appendChild(meta);
    ul.appendChild(li);
  });
}

// ============================================
// STATISTICS COUNTER
// ============================================
function initStatsCounter() {
  function animateCounter(element, target, duration) {
    let current = 0;
    const increment = target / (duration / 16);
    const isPercentage = element.textContent.includes('%');
    const isTiming = element.textContent.includes('s');
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      if (isPercentage) {
        element.textContent = Math.floor(current) + '%';
      } else if (isTiming) {
        element.textContent = Math.floor(current) + 's';
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
          const text = stat.textContent;
          let target;
          if (text.includes('%')) {
            target = parseInt(text, 10);
            animateCounter(stat, target, 2000);
          } else if (text.includes('s')) {
            target = parseInt(text, 10);
            animateCounter(stat, target, 1500);
          } else if (text.includes('/')) {
            stat.textContent = '24/7';
          }
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats');
  if (statsSection) statsObserver.observe(statsSection);
}

// ============================================
// BUTTON EFFECTS
// ============================================
function initButtonEffects() {
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.className = 'ripple';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ============================================
// INTERSECTION OBSERVERS
// ============================================
function initIntersectionObservers() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card').forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
    observer.observe(card);
  });

  document.querySelectorAll('.team-member').forEach((member, index) => {
    member.style.opacity = '0';
    member.style.transform = 'scale(0.9)';
    member.style.transition = `opacity 0.6s ease-out ${index * 0.15}s, transform 0.6s ease-out ${index * 0.15}s`;
    observer.observe(member);
  });

  document.querySelectorAll('.tech-item').forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
    observer.observe(item);
  });
}

// ============================================
// DEVICE MOCKUP ANIMATION
// ============================================
function initDeviceMockup() {
  const deviceMockup = document.querySelector('.device-mockup');
  if (!deviceMockup) return;
  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
  });
  function animateMockup() {
    deviceMockup.style.transform = `
      translateY(-20px)
      rotateY(${mouseX}deg)
      rotateX(${-mouseY}deg)
    `;
    requestAnimationFrame(animateMockup);
  }
  animateMockup();
}

// ============================================
// CONSOLE EASTER EGG
// ============================================
console.log('%c BuzzGuard', 'font-size: 40px; font-weight: bold; background: linear-gradient(135deg, #00d4ff, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent;');
console.log('%cSmart Indoor Flying Insect Control System', 'font-size: 16px; color: #9ca3af;');
console.log('%cDeveloped by: Mike Angelo N. Collamat, Ronald Christian V. Eder, Marc Jullan M. Pague, Billy James T. Salog', 'font-size: 12px; color: #6b7280;');
console.log('%cAssumption College of Davao - November 2025', 'font-size: 12px; color: #4b5563;');
