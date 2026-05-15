// Navbar scroll effect
const navbar = document.getElementById('navbar');

// Progress bar
const progressBar = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // Progress bar
  if (progressBar) {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = Math.min(pct, 100) + '%';
  }

  // Back to top
  backToTop.classList.toggle('visible', window.scrollY > 400);

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.style.background = a.getAttribute('href') === `#${current}`
      ? 'rgba(255,255,255,.2)' : '';
  });
});

// Mobile nav
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

function openNav() {
  navLinks.classList.add('open');
  if (navOverlay) navOverlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeNav() {
  navLinks.classList.remove('open');
  if (navOverlay) navOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeNav() : openNav();
});

if (navOverlay) navOverlay.addEventListener('click', closeNav);

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeNav);
});

// Scroll animation (AOS-lite)
const animatedEls = document.querySelectorAll('[data-aos]');
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('aos-animate');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
animatedEls.forEach(el => observer.observe(el));

// Active nav
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

// Contact form
const form       = document.getElementById('contactForm');
const successMsg = document.getElementById('formSuccess');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'جاري الإرسال...';
  btn.disabled = true;
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    document.getElementById('name').value,
        phone:   document.getElementById('phone').value,
        email:   document.getElementById('email').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value,
      })
    });
    const data = await res.json();
    if (data.success) {
      successMsg.classList.add('show');
      form.reset();
      setTimeout(() => successMsg.classList.remove('show'), 6000);
    }
  } catch {
    alert('حدث خطأ، يرجى المحاولة مرة أخرى');
  } finally {
    btn.textContent = 'إرسال الطلب';
    btn.disabled = false;
  }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

// Back to top
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Preloader
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) setTimeout(() => preloader.classList.add('hide'), 700);
});

// Exit intent modal
const exitModal  = document.getElementById('exitModal');
const exitClose  = document.getElementById('exitModalClose');
const exitBack   = exitModal?.querySelector('.exit-modal-backdrop');
let exitShown = false;

function showExit() {
  if (exitShown || sessionStorage.getItem('exitShown')) return;
  exitShown = true;
  sessionStorage.setItem('exitShown', '1');
  exitModal.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function hideExit() {
  exitModal?.classList.remove('show');
  document.body.style.overflow = '';
}

if (exitModal) {
  document.addEventListener('mouseleave', e => { if (e.clientY < 8) showExit(); });
  setTimeout(showExit, 35000);
  exitClose.addEventListener('click', hideExit);
  exitBack.addEventListener('click', hideExit);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideExit(); });
}

// Typewriter effect
const typedEl = document.getElementById('typedText');
if (typedEl) {
  const words = ['القضايا المدنية','القضايا الجنائية','الأحوال الشخصية','الاستثمار العقاري','تأسيس الشركات','المحاسبة الضريبية','تخليص الجمارك'];
  let wi = 0, ci = 0, del = false;
  function typeLoop() {
    const w = words[wi];
    typedEl.textContent = del ? w.slice(0, ci--) : w.slice(0, ci++);
    if (!del && ci > w.length)   { del = true;  return setTimeout(typeLoop, 1800); }
    if (del  && ci < 0)          { del = false; wi = (wi + 1) % words.length; ci = 0; return setTimeout(typeLoop, 400); }
    setTimeout(typeLoop, del ? 55 : 85);
  }
  typeLoop();
}

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// WhatsApp chat bubble
const waBubble = document.getElementById('waChatBubble');
const waClose  = document.getElementById('waChatClose');
if (waBubble) {
  setTimeout(() => waBubble.classList.add('show'), 4500);
  waClose.addEventListener('click', e => {
    e.preventDefault();
    waBubble.classList.remove('show');
    waBubble.style.display = 'none';
  });
}
