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
  if (!sb) {
    // If Supabase credentials are not configured yet, handle demo mode login
    if (!window.isSupabaseConfigured()) {
      if (email.toLowerCase().includes('doctor') || email.toLowerCase().includes('rabeya') || password.length >= 6) {
        const demoUser = {
          id: 'demo-doctor-uuid-001',
          email: email || 'dr.rabeya@hospital.com',
          user_metadata: { name: window.APP_CONFIG.DOCTOR_NAME }
        };
        sessionStorage.setItem('demo_doctor_session', JSON.stringify(demoUser));
        return { user: demoUser, error: null };
      }
    }
    return {
      user: null,
      error: { message: "Supabase is not configured. Please add your SUPABASE_URL and SUPABASE_ANON_KEY in assets/js/supabase-config.js" }
    };
  }

  try {
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) throw error;
    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
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
