/**
 * ==============================================================================
 * SUPABASE CONFIGURATION & CLIENT INITIALIZATION
 * ==============================================================================
 * Replace the placeholder values below with your actual Supabase project keys:
 * 1. SUPABASE_URL: Found in Supabase Dashboard -> Project Settings -> API -> Project URL
 * 2. SUPABASE_ANON_KEY: Found in Supabase Dashboard -> Project Settings -> API -> Project API Keys (anon / public)
 * ==============================================================================
 */

// Global configuration object
window.APP_CONFIG = {
  // Replace these strings with your Supabase credentials
  SUPABASE_URL: "https://YOUR_SUPABASE_PROJECT_ID.supabase.co",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_PUBLIC_KEY",

  // Doctor Practice Metadata (Change these to match your practice)
  DOCTOR_NAME: "Dr. Rabeya Basri",
  DOCTOR_TITLE: "Consultant Obstetrician & Gynecologist, Laparoscopic Surgeon",
  DOCTOR_DEGREES: "MBBS, FCPS(Obstetrics & Gynaecology) ",
  CLINIC_PHONE: "+880 1700-000000",
  CLINIC_EMAIL: "dr.rabeya.chamber@example.com",
  HOSPITALS: [
    "Dinajpur Medical College, Hospital",
  ]
};

// Check if developer has overridden keys in localStorage (for quick zero-code setup in browser)
const storedUrl = localStorage.getItem('supabase_url');
const storedKey = localStorage.getItem('supabase_anon_key');
if (storedUrl && storedKey) {
  window.APP_CONFIG.SUPABASE_URL = storedUrl;
  window.APP_CONFIG.SUPABASE_ANON_KEY = storedKey;
}

/**
 * Checks if the credentials are still the default placeholders
 */
function isSupabaseConfigured() {
  const url = window.APP_CONFIG.SUPABASE_URL;
  const key = window.APP_CONFIG.SUPABASE_ANON_KEY;
  return (
    url &&
    key &&
    !url.includes("YOUR_SUPABASE_PROJECT_ID") &&
    !key.includes("YOUR_SUPABASE_ANON_PUBLIC_KEY")
  );
}

// Initialize Supabase Client instance (via official CDN script)
let supabaseClient = null;

function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (typeof window.supabase !== 'undefined' && isSupabaseConfigured()) {
    try {
      supabaseClient = window.supabase.createClient(
        window.APP_CONFIG.SUPABASE_URL,
        window.APP_CONFIG.SUPABASE_ANON_KEY
      );
      return supabaseClient;
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
      return null;
    }
  }
  return null;
}

// Make globally accessible
window.getSupabase = getSupabase;
window.isSupabaseConfigured = isSupabaseConfigured;
