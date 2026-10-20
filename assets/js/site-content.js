/**
 * ==============================================================================
 * SITE CONTENT & CMS SERVICE (Dr. Rabeya Basri Practice Website)
 * ==============================================================================
 * Enables complete dynamic management of every text, heading, section,
 * phone number, chamber schedule, and credential from the Admin Panel.
 * Includes Section Visibility controls for the Single Page Website.
 * ==============================================================================
 */

const DEFAULT_SITE_CONTENT = {
  "doctor": {
    "name": "Dr. Rabeya Basri",
    "title": "Obstetrics & Gynecology Surgeon",
    "subtitle": "Trainee Obstetrician, Gynecologist & Laparoscopic Surgeon",
    "degrees": "MBBS, FCPS Trainee (Obs & Gynae)",
    "bmdc_reg": "A-XXXXX",
    "experience_years": "5+",
    "primary_phone": "+880 1700-000000",
    "alt_phone": "+880 1800-000000",
    "email": "dr.rabeyabasri@example.com",
    "photo_url": "assets/images/doctor-portrait.jpg",
    "emergency_hotline": "+880 1700-000000"
  },
  "seo": {
    "google_verification": "googlea85682d0c3e46a85",
    "meta_title": "Dr. Rabeya Basri | Trainee Obstetrician, Gynecologist & Laparoscopic Surgeon",
    "meta_description": "Official single-page clinical website of Dr. Rabeya Basri - FCPS Trainee (Obs & Gynae), specialized in high-safety Cesarean sections, painless normal deliveries, and advanced gynecologic surgeries in Dinajpur with 5+ years experience, 1,700+ surgeries, and 15,000+ patients.",
    "meta_keywords": "Dr Rabeya Basri, Gynecologist Dinajpur, Obstetrician Dinajpur, Cesarean section Dinajpur, Painless normal delivery, Laparoscopic Surgeon Dinajpur, Dinajpur Medical College Hospital, Gynae Specialist",
    "canonical_url": "https://dr-rabeyabasri.com"
  },
  "sections_visibility": {
    "section1_hero": true,
    "section2_about": true,
    "section3_specialties": true,
    "section4_services": true,
    "section5_credentials": true,
    "section6_chambers": true,
    "section7_appointment": true,
    "section8_footer": true
  },
  "section_labels": {
    "sec1_badge": "Section 1 • Welcome",
    "sec2_badge": "Section 2 • Biography",
    "sec3_badge": "Section 3 • Specialties",
    "sec4_badge": "Section 4 • Surgical Services",
    "sec5_badge": "Section 5 • Credentials",
    "sec6_badge": "Section 6 • Chambers",
    "sec7_badge": "Section 7 • Appointments"
  },
  "hero": {
    "pill_text": "Compassionate Maternal & Women's Surgical Care",
    "title_main": "Gentle Deliveries,",
    "title_highlight": "Excellence in Surgery.",
    "subtitle": "Specializing in high-safety Cesarean sections, painless normal deliveries, advanced laparoscopic procedures, and comprehensive gynecologic surgical care with over 5 years of dedicated medical service, 1,700+ successful surgeries, and 15,000+ patients served.",
    "btn_primary": "Schedule Consultation",
    "btn_secondary": "View Surgical Procedures",
    "stat1_num": "5+",
    "stat1_label": "Years Clinical Experience",
    "stat2_num": "1,700+",
    "stat2_label": "Deliveries & Surgeries",
    "stat3_num": "99.4%",
    "stat3_label": "Safety & Success Record",
    "badge_status": "Accepting Patients"
  },
  "about": {
    "banner_tag": "Surgeon Biography & Background",
    "bio_heading": "Dedicated to Safe Deliveries & Advanced Gynecological Care",
    "bio_p1": "Dr. Rabeya Basri is a dedicated Trainee in Obstetrics & Gynecology with over 5 years of active clinical experience in maternal-fetal medicine and operative gynecology. Currently pursuing her FCPS in Obstetrics & Gynecology from the Bangladesh College of Physicians and Surgeons (BCPS), she has managed over 1,700 surgical deliveries and procedures, providing compassionate, evidence-based care to more than 15,000 patients.",
    "bio_p2": "Dr. Rabeya has performed over 1,700 successful surgical deliveries and procedures, including routine and high-risk Cesarean sections, complex repeat C-sections, and multi-fetal pregnancies. She is a dedicated advocate for natural, gentle, and painless deliveries with advanced continuous fetal monitoring.",
    "bio_p3": "In gynecological surgery, she is recognized for her expertise in uterine preservation techniques (abdominal and laparoscopic myomectomy for fibroids), laparoscopic ovarian cystectomies, and minimally invasive hysterectomies. Her surgical philosophy is rooted in meticulous technique, minimal blood loss, cosmetic incision closure, and rapid postoperative recovery.",
    "pillar1_title": "🌸 Gentle Birth Advocacy",
    "pillar1_desc": "Encouraging natural and painless labor whenever clinically safe for mother and baby.",
    "pillar2_title": "🔬 Precision Surgery",
    "pillar2_desc": "Minimally invasive keyhole techniques for faster recovery and reduced pain.",
    "pillar3_title": "🛡️ High Safety Protocols",
    "pillar3_desc": "Strict infection control, comprehensive blood loss prevention, and fetal surveillance.",
    "pillar4_title": "🤝 Empathetic Patient Care",
    "pillar4_desc": "Personalized maternal counseling and attentive post-operative follow-up."
  },
  "specialties": {
    "tag": "Clinical Expertise",
    "title": "Specialized Surgical & Obstetric Care",
    "desc": "Providing evidence-based, compassionate surgical and obstetric care tailored to every stage of a woman's life.",
    "card1_title": "Normal & Painless Delivery",
    "card1_desc": "Prioritizing natural birth whenever safe. Experienced in painless epidural labor management, continuous fetal heart monitoring, and gentle birth techniques.",
    "card2_title": "Cesarean Delivery (LSCS)",
    "card2_desc": "Expertise in elective and emergency C-sections, repeat surgeries (previous 1, 2, or 3 C-sections), twin births, and high-risk maternal conditions.",
    "card3_title": "Gynecological Surgeries",
    "card3_desc": "Specialized surgical management for uterine fibroids, abnormal uterine bleeding, adenomyosis, ovarian cysts, and pelvic organ prolapse.",
    "card4_title": "Minimally Invasive Laparoscopy",
    "card4_desc": "Keyhole surgical approaches resulting in smaller scars, minimal postoperative discomfort, and significantly faster recovery times."
  },
  "services": {
    "banner_tag": "Clinical Procedures & Care",
    "banner_title": "Surgical & Obstetric Services",
    "banner_desc": "From gentle childbirth to advanced laparoscopic operative gynecology, delivering world-class surgical precision and empathetic care.",
    "cat1_title": "Obstetric & Delivery Care",
    "cat1_desc": "Safe maternal management for mother and newborn",
    "s1_title": "Normal & Painless Vaginal Delivery",
    "s1_desc": "Natural labor support in a calm, mother-centric environment. We offer painless epidural analgesia administered by specialized anesthesiologists, enabling smooth, comfortable labor with continuous CTG fetal heart surveillance.",
    "s2_title": "Cesarean Delivery (LSCS)",
    "s2_desc": "Elective and emergency Lower Segment Cesarean Sections (LSCS) performed in tertiary hospital theatres with full neonatal resuscitation and NICU backup. Cosmetically closed with hidden subcuticular sutures.",
    "cat2_title": "Advanced Gynecologic Surgery",
    "cat2_desc": "Specialized surgical care for uterine fibroids, prolapse, and abnormal bleeding",
    "s3_title": "Myomectomy & Uterine Sparing Surgery",
    "s3_desc": "Surgical removal of uterine fibroids while meticulously preserving the uterus for future childbearing and hormone balance. Performed via cosmetic mini-laparotomy or laparoscopic approach.",
    "s4_title": "Hysterectomy (Abdominal & Vaginal)",
    "s4_desc": "Total or subtotal hysterectomy for definitive management of severe adenomyosis, resistant abnormal bleeding, and pelvic organ prolapse with minimal blood loss and rapid recovery.",
    "cat3_title": "Minimally Invasive Laparoscopy",
    "cat3_desc": "Keyhole surgical precision with rapid recovery and cosmetic incisions",
    "s5_title": "Diagnostic & Operative Laparoscopy",
    "s5_desc": "Direct high-definition visual examination of pelvic organs for chronic pelvic pain, unexplained infertility, tubal patency evaluation, and endometriosis ablation.",
    "s6_title": "Laparoscopic Ovarian Cystectomy",
    "s6_desc": "Keyhole removal of ovarian cysts (chocolate cysts, dermoid cysts, serous cystadenomas) with maximal preservation of surrounding healthy ovarian tissue and reserve.",
    "preop_title": "Patient Pre-Operative Preparation",
    "preop_desc": "Essential guidelines to follow prior to your scheduled surgical admission.",
    "postop_title": "Post-Operative Recovery Protocols",
    "postop_desc": "Evidence-based post-surgical guidelines to ensure comfortable, speedy recuperation."
  },
  "credentials": {
    "tag": "Credentials & Training",
    "title": "Medical Qualifications & Hospital Attachments",
    "desc": "Certified by apex medical bodies with specialized higher fellowship training in gynecologic operative surgery and maternal medicine.",
    "qual_header": "Academic Degrees & Fellowships",
    "qual_sub": "Verified Professional Certifications",
    "q1_title": "FCPS in Obstetrics & Gynecology (Trainee)",
    "q1_sub": "Bangladesh College of Physicians and Surgeons (BCPS)",
    "q2_title": "MS (Master of Surgery) in Gynae & Obs",
    "q2_sub": "Bangabandhu Sheikh Mujib Medical University (BSMMU)",
    "q3_title": "Fellowship in Minimally Invasive Laparoscopic Surgery",
    "q3_sub": "Advanced Training in Operative Gynaecological Endoscopy",
    "q4_title": "MBBS (Bachelor of Medicine & Surgery)",
    "q4_sub": "Dhaka Medical College, Registered with BMDC",
    "hosp_header": "Hospital Attachments & Chambers",
    "hosp_sub": "Equipped with Modern Operation Theatres & NICU"
  },
  "chambers_section": {
    "title": "Clinical Attachment & Visiting Chambers",
    "subtitle": "Current government and private hospital visiting schedule in Dinajpur"
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
  "appointment": {
    "tag": "Direct Scheduling",
    "title": "Book a Consultation",
    "subtitle": "Schedule an in-person chamber consultation, antenatal checkup, or surgical pre-operative discussion.",
    "form_title": "Request an Appointment",
    "form_subtitle": "Our chamber assistant will confirm your serial and arrival time slot via phone.",
    "notice": "For immediate emergency delivery, sudden labor pain, or hemorrhage, please go directly to Dinajpur Medical College, Hospital Emergency OT triage counter."
  },
  "footer": {
    "brand_title": "Dr. Rabeya Basri",
    "about_text": "Trainee Obstetrician, Gynecologist & Laparoscopic Surgeon dedicated to compassionate, high-safety healthcare for women.",
    "copyright_text": "Dr. Rabeya Basri. All medical rights reserved."
  }
};

/**
 * Instant Synchronous Content Hydration (0ms, no network delay)
 * Merges DEFAULT_SITE_CONTENT, window.__PRE_CACHED_CMS__, and localStorage.
 */
function getSyncSiteContent() {
  let result = deepMerge({}, DEFAULT_SITE_CONTENT);

  // 1. Check window.__PRE_CACHED_CMS__ (pre-parsed in head)
  if (window.__PRE_CACHED_CMS__ && typeof window.__PRE_CACHED_CMS__ === 'object') {
    result = deepMerge(result, window.__PRE_CACHED_CMS__);
  }

  // 2. Read client localStorage cache
  try {
    const localData = localStorage.getItem('site_content_data');
    if (localData) {
      const parsed = JSON.parse(localData);
      if (parsed && typeof parsed === 'object') {
        result = deepMerge(result, parsed);
      }
    }
  } catch (e) {
    console.warn("Could not parse local site content cache:", e);
  }

  return result;
}

/**
 * Load saved content from Supabase, permanent site_content.json on disk, or localStorage
 */
async function getSiteContent() {
  let result = getSyncSiteContent();

  // 1. Static site_content.json from repository/disk baseline
  try {
    const res = await fetch('./site_content.json?v=' + Date.now(), { cache: 'no-store' });
    if (res.ok) {
      const fileData = await res.json();
      if (fileData && typeof fileData === 'object') {
        result = deepMerge(result, fileData);
      }
    }
  } catch (e) {
    // Expected on file:/// or offline
  }

  // 2. Cloud storage (Supabase) if connected
  const sb = window.getSupabase ? window.getSupabase() : null;
  if (sb) {
    try {
      const { data, error } = await sb
        .from('site_content')
        .select('content')
        .eq('id', 'main')
        .single();

      if (!error && data && data.content && typeof data.content === 'object') {
        result = deepMerge(result, data.content);
        localStorage.setItem('site_content_data', JSON.stringify(result));
      }
    } catch (e) {
      console.warn("Notice: Fetching site content from local/disk:", e);
    }
  }

  return result;
}

/**
 * Save updated content permanently to disk, Supabase & localStorage
 */
async function saveSiteContent(content) {
  content._updated_at = new Date().toISOString();

  // 1. Save to localStorage immediately
  localStorage.setItem('site_content_data', JSON.stringify(content));

  let savedToDisk = false;
  let savedToCloud = false;
  let cloudError = null;

  // 2. Save permanently to disk via local server API (if python server.py is running)
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
    // Normal when running purely on static host
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
        cloudError = error.message || error.code || "Failed to update Supabase table";
        console.warn("Supabase content sync notice:", error);
      }
    } catch (err) {
      cloudError = err.message || "Failed to reach Supabase";
      console.warn("Supabase content sync warning:", err);
    }
  }

  let message = "";
  if (savedToDisk && savedToCloud) {
    message = "Saved permanently to disk and Supabase cloud.";
  } else if (savedToDisk) {
    message = "Saved permanently to website disk files.";
  } else if (savedToCloud) {
    message = "Saved permanently to Supabase cloud database.";
  } else {
    message = "Saved to browser vault.";
  }

  return { 
    success: true, 
    savedToDisk, 
    savedToCloud,
    cloudError,
    message
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
 * Apply Site Content to the current HTML page automatically.
 * Synchronous and instant (0ms delay) - eliminates flash of old data.
 */
function applySiteContentToPage(content) {
  if (!content) {
    content = getSyncSiteContent();
  }

  // 1. Find all elements marked with data-cms="section.field"
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
        if (el.tagName === 'IMG' && attrName === 'src' && val) {
          el.style.display = 'block';
          const fallback = el.nextElementSibling;
          if (fallback && (fallback.classList.contains('doctor-avatar-svg') || fallback.tagName === 'svg' || fallback.tagName === 'SVG')) {
            fallback.style.display = 'none';
          }
        }
      } else if (el.hasAttribute('data-cms-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });

  // 1.1 Dynamic SEO & Google Verification Meta Sync
  if (content.seo) {
    if (content.seo.meta_title && document.querySelector('title')) {
      document.title = content.seo.meta_title;
    }
    const gVerify = document.querySelector('meta[name="google-site-verification"]');
    if (gVerify && content.seo.google_verification) {
      gVerify.setAttribute('content', content.seo.google_verification);
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && content.seo.meta_description) {
      metaDesc.setAttribute('content', content.seo.meta_description);
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && content.seo.meta_keywords) {
      metaKeywords.setAttribute('content', content.seo.meta_keywords);
    }
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink && content.seo.canonical_url) {
      canonicalLink.setAttribute('href', content.seo.canonical_url);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && content.seo.meta_title) {
      ogTitle.setAttribute('content', content.seo.meta_title);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && content.seo.meta_description) {
      ogDesc.setAttribute('content', content.seo.meta_description);
    }
  }

  // 2. Handle Section Visibility Toggles (Controlled by Admin Panel)
  if (content.sections_visibility) {
    const visibilityMap = {
      'section-hero': content.sections_visibility.section1_hero !== false,
      'section-about': content.sections_visibility.section2_about !== false,
      'section-specialties': content.sections_visibility.section3_specialties !== false,
      'section-services': content.sections_visibility.section4_services !== false,
      'section-credentials': content.sections_visibility.section5_credentials !== false,
      'section-chambers': content.sections_visibility.section6_chambers !== false,
      'section-appointment': content.sections_visibility.section7_appointment !== false,
      'section-footer': content.sections_visibility.section8_footer !== false
    };

    const sectionAnchorMap = {
      'section-hero': ['#home', '#hero', '#section-hero'],
      'section-about': ['#about', '#section-about'],
      'section-specialties': ['#specialties', '#section-specialties'],
      'section-services': ['#services', '#section-services'],
      'section-credentials': ['#credentials', '#section-credentials'],
      'section-chambers': ['#chambers', '#section-chambers'],
      'section-appointment': ['#appointment', '#section-appointment'],
      'section-footer': ['#footer', '#section-footer']
    };

    Object.entries(visibilityMap).forEach(([secId, isVisible]) => {
      const secEl = document.getElementById(secId);
      if (secEl) {
        secEl.style.display = isVisible ? '' : 'none';
      }

      // Also handle anchor dummy divs if any (e.g. #home)
      if (secId === 'section-hero') {
        const homeEl = document.getElementById('home');
        if (homeEl) homeEl.style.display = isVisible ? '' : 'none';
      }

      // Toggle navigation links pointing to this section
      const anchors = sectionAnchorMap[secId] || ['#' + secId.replace('section-', ''), '#' + secId];
      anchors.forEach(anc => {
        document.querySelectorAll(`a[href="${anc}"]`).forEach(navLink => {
          if (!navLink.classList.contains('btn-doctor-portal') && !navLink.classList.contains('btn-emergency')) {
            navLink.style.display = isVisible ? '' : 'none';
          }
        });
      });
    });
  }

  // 3. Dynamic doctor phone/hotline/email links
  if (content.doctor) {
    if (content.doctor.name) {
      document.querySelectorAll('.brand-name').forEach(b => b.textContent = content.doctor.name);
      if (window.APP_CONFIG) {
        window.APP_CONFIG.DOCTOR_NAME = content.doctor.name;
      }
    }

    if (content.doctor.primary_phone) {
      const cleanPhone = content.doctor.primary_phone.replace(/[^+\d]/g, '');
      document.querySelectorAll('a[data-cms-href="doctor.primary_phone"]').forEach(a => {
        a.setAttribute('href', `tel:${cleanPhone}`);
      });
    }

    if (content.doctor.emergency_hotline) {
      const cleanHotline = content.doctor.emergency_hotline.replace(/[^+\d]/g, '');
      document.querySelectorAll('a[data-cms-href="doctor.emergency_hotline"]').forEach(a => {
        a.setAttribute('href', `tel:${cleanHotline}`);
      });
    }

    if (content.doctor.email) {
      document.querySelectorAll('a[data-cms-href="doctor.email"]').forEach(a => {
        a.setAttribute('href', `mailto:${content.doctor.email}`);
      });
    }
  }

  // 4. Dynamic Chambers rendering
  const chambersList = getChambersList(content);

  // Render chamber cards grid
  const chambersGrid = document.getElementById('publicChambersGrid') || document.querySelector('[data-cms-chambers-grid]');
  if (chambersGrid && chambersList.length > 0) {
    chambersGrid.innerHTML = chambersList.map(ch => `
      <div class="service-card chamber-display-card">
        <div style="font-size: 0.775rem; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 0.5rem; letter-spacing: 0.05em;">
          🏥 ${escapeHtml(ch.badge || 'Visiting Chamber')}
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--slate-900); margin-bottom: 0.5rem;">
          ${escapeHtml(ch.name)}
        </h3>
        <div style="font-size: 0.875rem; color: var(--slate-600); margin-bottom: 1rem; line-height: 1.5;">
          📍 ${escapeHtml(ch.address)}
        </div>
        <div style="background: var(--slate-50); padding: 0.85rem 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; font-size: 0.85rem; border: 1px solid var(--slate-200);">
          <div style="margin-bottom: 0.35rem;"><strong>🗓️ Visiting Days:</strong> ${escapeHtml(ch.days)}</div>
          <div><strong>⏰ Consultation Hours:</strong> ${escapeHtml(ch.hours)}</div>
        </div>
        ${ch.phone ? `
          <div style="margin-top: auto; padding-top: 0.5rem;">
            <a href="tel:${escapeHtml(ch.phone.replace(/[^+\d]/g, ''))}" class="btn btn-outline-primary btn-sm" style="width: 100%; justify-content: center; font-weight: 700;">
              📞 Serial Desk: ${escapeHtml(ch.phone)}
            </a>
          </div>
        ` : ''}
      </div>
    `).join('');
  }

  // Render timeline items
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

  // Update appointment booking dropdowns across all pages
  document.querySelectorAll('select[name="chamber_location"]').forEach(sel => {
    if (chambersList.length > 0) {
      const currentVal = sel.value;
      sel.innerHTML = chambersList.map(ch => `
        <option value="${escapeHtml(ch.name)}">${escapeHtml(ch.name)} (${escapeHtml(ch.badge || 'Chamber')})</option>
      `).join('');
      if (chambersList.some(ch => ch.name === currentVal)) {
        sel.value = currentVal;
      }
    }
  });

  // Update hospitalSuggestions datalist in dashboard
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

  // Update footer chambers lists
  document.querySelectorAll('[data-cms-chambers-footer]').forEach(ul => {
    if (chambersList.length > 0) {
      ul.innerHTML = chambersList.map(ch => `
        <li>🏥 ${escapeHtml(ch.name)}</li>
      `).join('');
    }
  });
  
  // Remove anti-flicker loading class
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.classList.remove('cms-pending');
    document.documentElement.classList.add('cms-ready');
  }
}

/**
 * Silent non-blocking background check for latest cloud or disk updates
 */
async function refreshSiteContentInBackground() {
  try {
    const fresh = await getSiteContent();
    applySiteContentToPage(fresh);
  } catch (err) {
    console.warn("Background content refresh notice:", err);
  }
}

// Automatically apply synchronously when DOM ready on public and admin pages
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // 1. Instant 0ms synchronous hydration before screen paint
      applySiteContentToPage();
      // 2. Silent background check for any cloud updates
      setTimeout(refreshSiteContentInBackground, 80);
    });
  } else {
    // 1. Instant synchronous hydration
    applySiteContentToPage();
    // 2. Silent background check
    setTimeout(refreshSiteContentInBackground, 80);
  }
}

// Global exposure
window.siteContentService = {
  DEFAULT_SITE_CONTENT,
  getSyncSiteContent,
  getSiteContent,
  saveSiteContent,
  resetSiteContent,
  applySiteContentToPage,
  refreshSiteContentInBackground,
  getChambersList,
  escapeHtml
};
