/**
 * ==============================================================================
 * SITE CONTENT & CMS SERVICE (Dr. Rabeya Basri Practice Website)
 * ==============================================================================
 * Enables complete dynamic management of every text, heading, section,
 * phone number, chamber schedule, and credential from the Admin Panel.
 * ==============================================================================
 */

const DEFAULT_SITE_CONTENT = {
  "doctor": {
    "name": "Dr. Rabeya Basri",
    "title": "Obstetrics & Gynecology Surgeon",
    "subtitle": "Consultant Obstetrician, Gynecologist & Laparoscopic Surgeon",
    "degrees": "MBBS, FCPS (OBGYN), MS (Gynae & Obs), Fellowship in Laparoscopy",
    "bmdc_reg": "A-XXXXX",
    "experience_years": "15+",
    "primary_phone": "+880 1700-000000",
    "alt_phone": "+880 1800-000000",
    "email": "dr.rabeyabasri@example.com",
    "photo_url": "assets/images/doctor-portrait.jpg",
    "emergency_hotline": "+880 1700-000000"
  },
  "hero": {
    "pill_text": "Compassionate Maternal & Women's Surgical Care",
    "title_main": "Gentle Deliveries,",
    "title_highlight": "Excellence in Surgery.",
    "subtitle": "Specializing in high-safety Cesarean sections, painless normal deliveries, advanced laparoscopic procedures, and comprehensive gynecologic surgical care with over 15 years of dedicated medical service.",
    "stat1_num": "15+",
    "stat1_label": "Years Clinical Experience",
    "stat2_num": "4,500+",
    "stat2_label": "Deliveries & Surgeries",
    "stat3_num": "99.4%",
    "stat3_label": "Safety & Success Record",
    "stat4_num": "1",
    "stat4_label": "Dinajpur Medical College, Hospital",
    "badge_status": "Accepting Patients"
  },
  "specialties": {
    "tag": "Clinical Expertise",
    "title": "Specialized Surgical & Obstetric Care",
    "desc": "Providing evidence-based, compassionate surgical and obstetric care tailored to every stage of a woman's life."
  },
  "credentials": {
    "tag": "Credentials & Training",
    "title": "Medical Qualifications & Hospital Attachments",
    "desc": "Certified by apex medical bodies with specialized higher fellowship training in gynecologic operative surgery and maternal medicine."
  },
  "about": {
    "banner_tag": "Surgeon Biography & Background",
    "page_title": "Dr. Rabeya Basri",
    "page_subtitle": "MBBS, FCPS (Obstetrics & Gynecology), MS (Gynae & Obs)\nFellowship in Minimally Invasive Laparoscopic Surgery",
    "bio_heading": "Dedicated to Safe Deliveries & Advanced Gynecological Care",
    "bio_p1": "Dr. Rabeya Basri is an experienced Consultant Obstetrician and Gynecologist with over 15 years of surgical excellence in maternal-fetal medicine and operative gynecology. Having completed her FCPS from the Bangladesh College of Physicians and Surgeons (BCPS) and Master of Surgery (MS), she has dedicated her career to providing compassionate, evidence-based care to women across all stages of life.",
    "bio_p2": "Dr. Rabeya has performed thousands of successful surgical deliveries, including routine and high-risk Cesarean sections, complex repeat C-sections (previous 2 and 3 scars), and multi-fetal pregnancies. She is a strong advocate for natural and painless delivery, ensuring mothers receive the highest standard of labor support, epidural analgesia, and fetal monitoring.",
    "bio_p3": "In gynecological surgery, she is recognized for her expertise in uterine preservation techniques (abdominal and laparoscopic myomectomy for fibroids), laparoscopic ovarian cystectomies, and minimally invasive hysterectomies. Her surgical philosophy is rooted in meticulous technique, minimal blood loss, cosmetic incision closure, and rapid postoperative recovery.",
    "pillar1_title": "🌸 Gentle Birth Advocacy",
    "pillar1_desc": "Encouraging natural and painless labor whenever clinically safe for mother and baby.",
    "pillar2_title": "🔬 Precision Surgery",
    "pillar2_desc": "Minimally invasive keyhole techniques for faster recovery and reduced pain."
  },
  "services": {
    "banner_tag": "Clinical Procedures & Care",
    "banner_title": "Surgical & Obstetric Services",
    "banner_desc": "From gentle childbirth to advanced laparoscopic operative gynecology, delivering world-class surgical precision and empathetic care."
  },
  "appointment": {
    "tag": "Direct Scheduling",
    "title": "Request an Appointment",
    "subtitle": "Schedule an in-person chamber consultation, antenatal checkup, or surgical pre-operative discussion."
  },
  "chambers_page": {
    "banner_tag": "Appointments & Locations",
    "banner_title": "Chamber Schedule & Contact",
    "banner_desc": "Find chamber visiting hours or request an appointment online."
  },
  "chambersList": [
    {
      "id": "chamber-1",
      "name": "Dinajpur Medical College, Hospital",
      "badge": "Primary Hospital & Chamber",
      "address": "Department of Obstetrics & Gynecology, Dinajpur Medical College, Hospital, Dinajpur",
      "days": "Saturday – Thursday",
      "hours": "9:00 AM – 2:30 PM & Evening Chamber",
      "phone": "+880 1700-000000"
    }
  ],
  "chambers": {
    "chamber1_name": "Dinajpur Medical College, Hospital",
    "chamber1_badge": "Primary Hospital & Chamber",
    "chamber1_address": "Department of Obstetrics & Gynecology, Dinajpur Medical College, Hospital, Dinajpur",
    "chamber1_days": "Saturday – Thursday",
    "chamber1_hours": "9:00 AM – 2:30 PM & Evening Chamber",
    "chamber1_phone": "+880 1700-000000"
  },
  "footer": {
    "brand_title": "Dr. Rabeya Basri",
    "about_text": "Consultant Obstetrician, Gynecologist & Laparoscopic Surgeon dedicated to compassionate, high-safety healthcare for women.",
    "copyright_text": "Dr. Rabeya Basri. All medical rights reserved."
  }
};

/**
 * Load saved content from Supabase, permanent site_content.json on disk, or localStorage
 */
async function getSiteContent() {
  // 1. Cloud storage (Supabase) if connected
  const sb = window.getSupabase ? window.getSupabase() : null;
  if (sb) {
    try {
      const { data, error } = await sb
        .from('site_content')
        .select('content')
        .eq('id', 'main')
        .single();

      if (!error && data && data.content) {
        return deepMerge(DEFAULT_SITE_CONTENT, data.content);
      }
    } catch (e) {
      console.warn("Notice: Fetching site content from local vault:", e);
    }
  }

  // 2. Permanent disk file (site_content.json) - works on localhost server & Netlify production
  try {
    const res = await fetch('./site_content.json?v=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      const fileData = await res.json();
      if (fileData && typeof fileData === 'object') {
        // Cache to localStorage for instantaneous offline loading
        localStorage.setItem('site_content_data', JSON.stringify(fileData));
        return deepMerge(DEFAULT_SITE_CONTENT, fileData);
      }
    }
  } catch (e) {
    // If opening via file:/// protocol or offline, proceed to localStorage
  }

  // 3. Browser localStorage cache
  const localData = localStorage.getItem('site_content_data');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (parsed.chambers && parsed.chambers.chamber1_name && (parsed.chambers.chamber1_name.includes("Central Women") || parsed.chambers.chamber1_name.includes("Square"))) {
        parsed.chambers = { ...DEFAULT_SITE_CONTENT.chambers };
        parsed.hero = { ...parsed.hero, stat4_num: "1", stat4_label: "Dinajpur Medical College, Hospital" };
        localStorage.setItem('site_content_data', JSON.stringify(parsed));
      }
      return deepMerge(DEFAULT_SITE_CONTENT, parsed);
    } catch (e) {
      return { ...DEFAULT_SITE_CONTENT };
    }
  }

  return { ...DEFAULT_SITE_CONTENT };
}

/**
 * Save updated content permanently to disk, Supabase & localStorage
 */
async function saveSiteContent(content) {
  // 1. Save to localStorage immediately
  localStorage.setItem('site_content_data', JSON.stringify(content));

  let savedToDisk = false;
  let savedToCloud = false;

  // 2. Save permanently to disk via local server API (updates site_content.json & site-content.js)
  try {
    const apiRes = await fetch('/api/save-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
    if (apiRes.ok) {
      const result = await apiRes.json();
      if (result.success) {
        savedToDisk = true;
      }
    }
  } catch (e) {
    // Expected when running on pure static host without backend
  }

  // 3. Save to Supabase cloud database if connected
  const sb = window.getSupabase ? window.getSupabase() : null;
  if (sb) {
    try {
      const { error } = await sb
        .from('site_content')
        .upsert({
          id: 'main',
          content: content,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        savedToCloud = true;
      } else {
        console.warn("Supabase content sync notice:", error);
      }
    } catch (err) {
      console.warn("Supabase content sync warning:", err);
    }
  }

  return { 
    success: true, 
    savedToDisk, 
    savedToCloud,
    message: savedToDisk 
      ? "Saved permanently to disk and website files." 
      : (savedToCloud ? "Saved permanently to Supabase cloud database." : "Saved to browser vault. Connect Supabase for cloud sync.")
  };
}

/**
 * Reset content back to original defaults
 */
async function resetSiteContent() {
  localStorage.removeItem('site_content_data');
  return await saveSiteContent(DEFAULT_SITE_CONTENT);
}

/**
 * Helper: Deep merge objects
 */
function deepMerge(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Helper: Extract canonical chambers list from content
 */
function getChambersList(content) {
  if (Array.isArray(content.chambersList) && content.chambersList.length > 0) {
    return content.chambersList;
  }
  // Fallback to legacy chambers object
  const list = [];
  if (content.chambers) {
    ['chamber1', 'chamber2', 'chamber3'].forEach((prefix, i) => {
      const name = content.chambers[`${prefix}_name`];
      if (name) {
        list.push({
          id: `chamber-${i + 1}`,
          name: name,
          badge: content.chambers[`${prefix}_badge`] || `Chamber ${i + 1}`,
          address: content.chambers[`${prefix}_address`] || '',
          days: content.chambers[`${prefix}_days`] || '',
          hours: content.chambers[`${prefix}_hours`] || '',
          phone: content.chambers[`${prefix}_phone`] || ''
        });
      }
    });
  }
  if (list.length === 0) {
    list.push({
      id: 'chamber-1',
      name: 'Dinajpur Medical College, Hospital',
      badge: 'Primary Hospital & Chamber',
      address: 'Department of Obstetrics & Gynecology, Dinajpur Medical College, Hospital, Dinajpur',
      days: 'Saturday – Thursday',
      hours: '9:00 AM – 2:30 PM & Evening Chamber',
      phone: '+880 1700-000000'
    });
  }
  return list;
}

/**
 * Apply Site Content to the current HTML page automatically
 */
async function applySiteContentToPage() {
  const content = await getSiteContent();

  // Find all elements marked with data-cms="section.field"
  document.querySelectorAll('[data-cms]').forEach(el => {
    const path = el.getAttribute('data-cms');
    if (!path) return;

    const parts = path.split('.');
    let val = content;
    for (const p of parts) {
      if (val && val[p] !== undefined) {
        val = val[p];
      } else {
        val = null;
        break;
      }
    }

    if (val !== null && val !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.value = val;
      } else if (el.hasAttribute('data-cms-attr')) {
        const attrName = el.getAttribute('data-cms-attr');
        el.setAttribute(attrName, val);
      } else if (el.hasAttribute('data-cms-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });

  // Dynamic doctor name replacement in brand and meta
  if (content.doctor && content.doctor.name) {
    document.querySelectorAll('.brand-name').forEach(b => b.textContent = content.doctor.name);
    if (window.APP_CONFIG) {
      window.APP_CONFIG.DOCTOR_NAME = content.doctor.name;
    }
  }

  // Dynamic Chambers rendering
  const chambersList = getChambersList(content);

  // 1. Render chamber cards on contact.html
  const chambersGrid = document.getElementById('publicChambersGrid') || document.querySelector('[data-cms-chambers-grid]');
  if (chambersGrid && chambersList.length > 0) {
    chambersGrid.innerHTML = chambersList.map(ch => `
      <div class="service-card">
        <div style="font-size: 0.775rem; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 0.5rem;">
          ${escapeHtml(ch.badge || 'Chamber')}
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.5rem;">
          ${escapeHtml(ch.name)}
        </h3>
        <div style="font-size: 0.875rem; color: var(--slate-600); margin-bottom: 1rem;">
          📍 ${escapeHtml(ch.address)}
        </div>
        <div style="background: var(--slate-50); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.85rem;">
          <div><strong>Visiting Days:</strong> ${escapeHtml(ch.days)}</div>
          <div><strong>Consultation Hours:</strong> ${escapeHtml(ch.hours)}</div>
        </div>
        ${ch.phone ? `
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--secondary);">
            📞 Serial Desk: ${escapeHtml(ch.phone)}
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // 2. Render timeline items on index.html
  const timeline = document.getElementById('homepageChambersTimeline') || document.querySelector('[data-cms-chambers-timeline]');
  if (timeline && chambersList.length > 0) {
    timeline.innerHTML = chambersList.map((ch, idx) => `
      <div class="timeline-item">
        <div class="timeline-year">${escapeHtml(ch.badge || 'Chamber ' + (idx + 1))}</div>
        <div class="timeline-title">${escapeHtml(ch.name)}</div>
        <div class="timeline-sub">${escapeHtml(ch.address)} • ${escapeHtml(ch.days)} (${escapeHtml(ch.hours)})</div>
      </div>
    `).join('');
  }

  // 3. Update appointment booking dropdowns across all pages
  document.querySelectorAll('select[name="chamber_location"]').forEach(sel => {
    if (chambersList.length > 0) {
      const currentVal = sel.value;
      sel.innerHTML = chambersList.map(ch => `
        <option value="${escapeHtml(ch.name)}">${escapeHtml(ch.name)}</option>
      `).join('');
      if (chambersList.some(ch => ch.name === currentVal)) {
        sel.value = currentVal;
      }
    }
  });

  // 4. Update hospitalSuggestions datalist in dashboard
  const datalist = document.getElementById('hospitalSuggestions');
  if (datalist && chambersList.length > 0) {
    datalist.innerHTML = chambersList.map(ch => `
      <option value="${escapeHtml(ch.name)}">
    `).join('');
    const hospInput = document.getElementById('formHospitalName');
    if (hospInput && !hospInput.value) {
      hospInput.value = chambersList[0].name;
    }
  }

  // 5. Update footer chambers lists
  document.querySelectorAll('[data-cms-chambers-footer]').forEach(ul => {
    if (chambersList.length > 0) {
      ul.innerHTML = chambersList.map(ch => `
        <li>🏥 ${escapeHtml(ch.name)}</li>
      `).join('');
    }
  });
}

// Automatically apply when DOM ready on public and admin pages
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applySiteContentToPage();
  });
} else {
  // Document is already interactive or complete
  applySiteContentToPage();
}

// Global exposure
window.siteContentService = {
  DEFAULT_SITE_CONTENT,
  getSiteContent,
  saveSiteContent,
  resetSiteContent,
  applySiteContentToPage,
  getChambersList,
  escapeHtml
};
