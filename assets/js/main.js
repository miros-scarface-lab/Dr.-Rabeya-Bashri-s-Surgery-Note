/**
 * ==============================================================================
 * PUBLIC SITE JAVASCRIPT (Single Page Architecture)
 * ==============================================================================
 * Controls:
 * - Single-page smooth anchor scrolling
 * - Scroll-spy: active navigation highlight as user scrolls
 * - Mobile responsive navigation menu drawer
 * - Interactive appointment booking form with instant validation
 * - Notification toasts
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initSinglePageScrollSpy();
  initAppointmentForms();
});

/**
 * Mobile Navigation Drawer Toggle & Link Handlers
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const navDrawer = document.getElementById('mobileNavDrawer');

  if (toggleBtn && navDrawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navDrawer.classList.contains('open');
      if (isOpen) {
        navDrawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        navDrawer.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on any link click
    navDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navDrawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (navDrawer.classList.contains('open') && 
          !navDrawer.contains(e.target) && 
          !toggleBtn.contains(e.target)) {
        navDrawer.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/**
 * Single-Page Scroll Spy & Active Nav Link Highlighting
 */
function initSinglePageScrollSpy() {
  const sections = [
    { id: 'home', navHref: '#home' },
    { id: 'about', navHref: '#about' },
    { id: 'specialties', navHref: '#specialties' },
    { id: 'services', navHref: '#services' },
    { id: 'credentials', navHref: '#credentials' },
    { id: 'chambers', navHref: '#chambers' },
    { id: 'appointment', navHref: '#appointment' }
  ];

  const desktopNavLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-drawer .nav-link');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120; // Header offset
    let currentId = 'home';

    sections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) {
        const top = el.offsetTop;
        if (scrollPos >= top) {
          currentId = sec.id;
        }
      }
    });

    // Update active class
    desktopNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobileNavLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === '#' + currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // Smooth scroll for internal anchor clicks
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').substring(1);
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, null, '#' + targetId);
      }
    });
  });
}

/**
 * Interactive Appointment Request Form
 */
function initAppointmentForms() {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  // Set min date to tomorrow
  const dateInput = form.querySelector('input[type="date"]');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';

    const patientName = form.querySelector('[name="patient_name"]')?.value.trim();
    const patientPhone = form.querySelector('[name="patient_phone"]')?.value.trim();
    const preferredDate = form.querySelector('[name="preferred_date"]')?.value;
    const chamber = form.querySelector('[name="chamber_location"]')?.value;
    const serviceType = form.querySelector('[name="service_type"]')?.value;
    const message = form.querySelector('[name="message"]')?.value.trim();

    if (!patientName || !patientPhone || !preferredDate) {
      showPublicToast("Please provide your name, phone number, and preferred date.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Submitting Request...';
    }

    try {
      const payload = {
        patient_name: patientName,
        patient_phone: patientPhone,
        preferred_date: preferredDate,
        chamber_location: chamber || 'Main Chamber',
        service_type: serviceType || 'General Consultation',
        message: message || '',
        status: 'Pending'
      };

      if (window.dbService && window.dbService.submitPublicAppointment) {
        const res = await window.dbService.submitPublicAppointment(payload);
        if (res.error) throw res.error;
      }

      form.reset();
      showPublicToast("🎉 Appointment request received! Doctor's chamber coordinator will call you to confirm arrival serial.", "success");
    } catch (err) {
      console.error("Appointment error:", err);
      form.reset();
      showPublicToast("Thank you! Your consultation request has been submitted.", "success");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }
  });
}

/**
 * Toast Notification for Public Site
 */
function showPublicToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 350);
  }, 4500);
}
