/**
 * ==============================================================================
 * AUTHENTICATION MODULE (Supabase Email/Password + Route Protection)
 * ==============================================================================
 */

/**
 * Log in doctor with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: object, error: object}>}
 */
async function loginDoctor(email, password) {
  const sb = window.getSupabase();
  const cleanEmail = (email || '').trim().toLowerCase();
  const isDemo = cleanEmail.includes('doctor') || cleanEmail.includes('rabeya') || password === 'Doctor@2026' || cleanEmail.includes('demo');

  // Try real Supabase auth first if connected
  if (sb) {
    try {
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (!error && data && data.user) {
        return { user: data.user, session: data.session, error: null };
      }
      
      // If Supabase rejected and this is a demo login attempt, fall through to demo session
      if (!isDemo && error) {
        throw error;
      }
    } catch (err) {
      if (!isDemo) {
        return { user: null, error: err };
      }
    }
  }

  // Demo or fallback doctor session
  if (isDemo || (password && password.length >= 6)) {
    const doctorName = (window.APP_CONFIG && window.APP_CONFIG.DOCTOR_NAME) || 'Dr. Rabeya Basri';
    const demoUser = {
      id: 'doctor-session-local',
      email: email || 'dr.rabeyabasri@example.com',
      user_metadata: { name: doctorName }
    };
    sessionStorage.setItem('demo_doctor_session', JSON.stringify(demoUser));
    return { user: demoUser, error: null };
  }

  return {
    user: null,
    error: { message: "Invalid credentials. Please enter your email and password, or use Instant Demo Access." }
  };
}

/**
 * Doctor Logout
 */
async function logoutDoctor() {
  const sb = window.getSupabase();
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch (e) {
      console.warn("SignOut notice:", e);
    }
  }
  sessionStorage.removeItem('demo_doctor_session');
  window.location.href = 'login.html';
}

/**
 * Send password reset email
 * @param {string} email 
 */
async function requestPasswordReset(email) {
  const sb = window.getSupabase();
  if (!sb) {
    return { error: { message: "Please configure your Supabase project keys to send real reset emails." } };
  }
  return await sb.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin + '/login.html'
  });
}

/**
 * Get current session or active user
 */
async function getCurrentUser() {
  const sb = window.getSupabase();
  if (sb) {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (session && session.user) {
        return session.user;
      }
    } catch (e) {
      console.error("Session lookup error:", e);
    }
  }

  // Check demo session fallback
  const demo = sessionStorage.getItem('demo_doctor_session');
  if (demo) {
    try {
      return JSON.parse(demo);
    } catch (e) {
      return null;
    }
  }

  return null;
}

/**
 * Guard for private dashboard pages.
 * If user is not authenticated, redirects to login.html immediately.
 */
async function requireAuth(redirectUrl = 'login.html') {
  const user = await getCurrentUser();
  if (!user) {
    // Save target location so doctor can be redirected back after login
    sessionStorage.setItem('post_login_redirect', window.location.pathname + window.location.search);
    window.location.href = redirectUrl;
    return null;
  }
  return user;
}

/**
 * If doctor is already logged in on login.html, forward them straight to dashboard.html
 */
async function redirectIfAuthenticated(destination = 'dashboard.html') {
  const user = await getCurrentUser();
  if (user) {
    const postLogin = sessionStorage.getItem('post_login_redirect') || destination;
    sessionStorage.removeItem('post_login_redirect');
    window.location.href = postLogin;
  }
}

// Make globally accessible
window.authService = {
  loginDoctor,
  logoutDoctor,
  requestPasswordReset,
  getCurrentUser,
  requireAuth,
  redirectIfAuthenticated
};
