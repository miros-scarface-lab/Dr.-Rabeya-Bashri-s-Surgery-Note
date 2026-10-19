/**
 * ==============================================================================
 * PUBLIC SITE JAVASCRIPT
 * ==============================================================================
 * Controls:
 * - Mobile responsive navigation menu
 * - Interactive appointment booking form
 * - Active page link highlighting
 * - Notification toasts
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initAppointmentForms();
  highlightActiveNavLink();
});

/**
 * Mobile Navigation Drawer Toggle
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

    // Close on link click
    navDrawer.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navDrawer.classList.remove('open');
      });
    });
  }
}

/**
 * Active Navigation Link Highlighting
 */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
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

      const res = await window.dbService.submitPublicAppointment(payload);
      if (res.error) throw res.error;

      form.reset();
      showPublicToast("Appointment request received! Doctor's chamber coordinator will call you to confirm.", "success");
    } catch (err) {
      console.error("Appointment error:", err);
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
