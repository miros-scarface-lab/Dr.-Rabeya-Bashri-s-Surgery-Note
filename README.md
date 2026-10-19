# 🏥 Dr. Rabeya Basri — Surgeon's Admin Panel & Personal Data Reservation Suite

A complete, production-ready, trustworthy website and personal clinical data reservation system for **Dr. Rabeya Basri**, Consultant Obstetrician & Gynecologic Surgeon. Designed for personal clinical data reservation, patient volume tracking, procedure archiving, and chamber administration. Ready for one-click deployment on **Netlify** with a **Supabase** backend for authentication and database management.

---

## 📁 Project Folder Structure

```text
├── index.html                  # Public: Homepage with hero, specialties, credentials, & booking
├── about.html                  # Public: Doctor qualifications, career timeline, surgical philosophy
├── services.html               # Public: Detailed breakdown of procedures & pre/post-op guides
├── contact.html                # Public: Chamber schedules, emergency hotline, & appointment form
├── login.html                  # Private: Doctor login with Supabase email/password auth
├── dashboard.html              # Private: Doctor's surgical logbook, analytics charts, & records table
├── supabase_schema.sql         # Supabase PostgreSQL schema, RLS policies, & auto-case ID function
├── netlify.toml                # Netlify deployment configuration & security headers
├── README.md                   # Complete step-by-step setup and deployment documentation
└── assets/
    ├── css/
    │   └── styles.css          # Curated medical design system (soft rose, clinical teal, slate)
    ├── js/
    │   ├── supabase-config.js  # Supabase project URL & public anon key configuration
    │   ├── auth.js             # Authentication service & dashboard route guards
    │   ├── db.js               # Database CRUD, search/filtering, KPI stats, & Excel CSV export
    │   ├── dashboard.js        # Dashboard controller (Chart.js charts, modal forms, delivery toggle)
    │   └── main.js             # Public site interactive logic (mobile menu, appointment submit)
    └── images/
        └── doctor-portrait.jpg # Doctor portrait placeholder (Replace with doctor's real photo)
```

---

## 🔒 Strict Patient Privacy Rules (HIPAA / GDPR Compliant)

- **No Patient Identifiers:** In accordance with strict medical confidentiality, the system **never** collects or stores patient names, telephone numbers, home addresses, or national identity numbers.
- **Anonymous Case IDs:** Every surgical note is registered strictly under an anonymous Case ID (e.g. `2026-0001`, `2026-0002`).
- **Doctor-Only Access:** Database tables are locked with **Row Level Security (RLS)** in PostgreSQL. No public user or external party can read, query, or modify surgical records.
- **Clear Privacy Reminders:** Displayed prominently on the Add Surgery form and dashboard header to prevent inadvertent entry of patient personal identifiable information (PII).

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Create Your Supabase Project (Database & Auth)

1. Go to [https://supabase.com](https://supabase.com) and sign in (or sign up for free).
2. Click **"New Project"**.
3. Choose an organization, enter a project name (e.g., `doctor-surgical-logbook`), select a strong database password, and choose the closest region.
4. Wait 1–2 minutes for the database to provision.

---

### Step 2: Run the SQL Schema Script

1. In your Supabase dashboard, click the **SQL Editor** tab on the left sidebar (icon with `>_`).
2. Click **"New query"**.
3. Open [`supabase_schema.sql`](supabase_schema.sql) from this project, copy its entire contents, and paste it into the Supabase SQL Editor.
4. Click **"Run"** (or press `Ctrl+Enter`).
5. This automatically creates:
   - The `surgeries` table with all clinical and delivery fields.
   - Performance indexes on `surgery_date`, `case_id`, `category`, and `outcome`.
   - **Row Level Security (RLS)** policies ensuring only the logged-in doctor can view/insert/update/delete their records.
   - The `get_next_case_id()` PostgreSQL function for auto-generating sequential IDs (`2026-0001`, `2026-0002`).
   - The `appointments` table for public patient booking requests.

---

### Step 3: Create the Doctor's User Account

1. In your Supabase dashboard, click **Authentication** on the left menu (icon with two users).
2. Click the **"Users"** tab, then click **"Add user"** &rarr; **"Create user"**.
3. Enter the doctor's email (e.g., `dr.rabeya@hospital.com`) and choose a secure password.
4. Turn **"Auto Confirm User"** **ON** so you can log in immediately without waiting for email confirmation.
5. Click **"Create user"**.

---

### Step 4: Add Your Supabase API Keys to the Website

1. In your Supabase dashboard, go to **Project Settings** (gear icon at the bottom left) &rarr; **API**.
2. Copy two values:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API Keys** &rarr; `anon` `public` key (e.g. `eyJhbGci...`)
3. Open [`assets/js/supabase-config.js`](assets/js/supabase-config.js) in your text editor and update:
   ```javascript
   window.APP_CONFIG = {
     SUPABASE_URL: "https://YOUR_ACTUAL_PROJECT_ID.supabase.co",
     SUPABASE_ANON_KEY: "YOUR_ACTUAL_ANON_PUBLIC_KEY",
     ...
   };
   ```
4. *Tip:* You can also test the website immediately right out of the box in **Demo Mode**, or click the **"Connect Supabase Keys"** button directly in the dashboard UI!

---

### Step 5: Deploy to Netlify (No Build Step Required)

Because this website uses vanilla HTML, CSS, and JavaScript, it requires **zero build commands** and deploys in seconds.

#### Method A: Netlify Drag-and-Drop (Easiest)
1. Go to [https://app.netlify.com](https://app.netlify.com) and log in.
2. Go to the **"Sites"** tab.
3. Drag the folder `Rabeya's Sergery Note` from your computer and drop it directly onto the Netlify dashboard upload area.
4. Netlify will deploy your site instantly and provide you with a live HTTPS URL (e.g., `https://dr-rabeya-surgery.netlify.app`).

#### Method B: Netlify via GitHub / Git
1. Push this folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Dr. Rabeya surgery note website"
   git remote add origin https://github.com/your-username/dr-rabeya-surgery.git
   git push -u origin main
   ```
2. In Netlify, click **"Add new site"** &rarr; **"Import an existing project"** &rarr; choose your GitHub repository.
3. Leave **Build command** empty and set **Publish directory** to `.` (or leave default, as configured in [`netlify.toml`](netlify.toml)).
4. Click **"Deploy site"**.

---

## 🎨 Live Admin Panel Website Content Editor (CMS)

You can now change **every single text, heading, statistic, credential, phone number, and chamber schedule directly from the Admin Panel** without touching a single line of code!

1. Log into your Doctor Admin Portal at `login.html`.
2. Click the **"🎨 Website Content Editor"** tab on the navigation bar.
3. You will find intuitive editable sections for:
   - **Section 1: Doctor Profile & Contact:** Name, designation, degrees, BMDC registration, appointment hotlines, and clinic email.
   - **Section 2: Homepage Hero Banner & Statistics:** Hero tag, main headings, highlighted text, subtitles, and all 4 credential counters.
   - **Section 3: About Page Biography & Philosophy:** Biography heading, 3 full narrative bio paragraphs, and philosophy pillars (Gentle birth advocacy & precision surgery).
   - **Section 4: Clinical Specialties & Services:** Section titles, tags, and descriptive overviews.
   - **Section 5: Chamber Locations & Visiting Hours:** Full details for Chamber 1 (Central Women's), Chamber 2 (Square Care), and Chamber 3 (City Mother & Child Care) including addresses, consultation days, hours, and serial phones.
   - **Section 6: Footer & Copyright Notice:** Brand summary text and legal copyright line.
4. Click **"💾 Save & Publish All Website Changes"** — changes take effect immediately across all public pages (`index.html`, `about.html`, `services.html`, `contact.html`).
5. **How Permanent Persistence Works:**
   - **Local Development:** Running `python server.py` serves the site with the `/api/save-content` endpoint. When you click "Save & Publish", it writes changes directly to `site_content.json` on disk and synchronizes `assets/js/site-content.js`.
   - **Production (Netlify / Internet):** Connect your Supabase project (Step 1 & 2). When connected, every save writes directly to the `public.site_content` table in your Supabase PostgreSQL cloud database, making updates immediately visible to all visitors worldwide.
   - **Instant Backup:** Click **"📥 Download Backup (JSON)"** in the Admin Panel to export your full configuration file anytime.
6. A **"🔄 Reset to Defaults"** button is also available at any time to restore the original medical defaults.

---

## ✏️ Manual Code Customization Reference

If you prefer editing files directly:

| Item | Where to change | Notes |
| :--- | :--- | :--- |
| **Doctor's Name & Degrees** | [`assets/js/site-content.js`](assets/js/site-content.js) or Admin Panel CMS | Changes default name, titles, phone, and affiliated hospitals across the app. |
| **Doctor's Photo** | Replace [`assets/images/doctor-portrait.jpg`](assets/images/doctor-portrait.jpg) | Simply overwrite with the doctor's professional vertical portrait photo (aspect ratio ~ 3:4). |
| **BMDC Registration No.** | Admin Panel CMS &rarr; Doctor Profile | Sets registration number across all pages dynamically. |
| **Chamber Addresses & Times** | Admin Panel CMS &rarr; Chamber Locations | Update Room numbers, visiting days, and phone numbers in real-time. |
| **Emergency Hotline** | Admin Panel CMS &rarr; Section 1 & 5 | Updates all call buttons and emergency notices across the site. |

---

## 🩺 Private Dashboard Feature Walkthrough

### 1. Authentication & Route Guard
- Visiting `dashboard.html` without being logged in automatically redirects the user to `login.html`.
- Logging in via `login.html` verifies credentials against Supabase Auth (or provides instant Demo Access).

### 2. Live Surgical Stat Cards
- **Today's Surgeries:** Procedures logged for the current calendar date.
- **This Week:** Monday-to-Sunday surgical volume.
- **This Month:** Current calendar month volume.
- **This Year:** Cumulative surgeries performed this year.
- **Complication Rate:** Real-time calculated percentage of cases with recorded complications.

### 3. Interactive Chart.js Visualizations
1. **Surgical Volume Trend:** 12-month timeline line chart showing surgical workload.
2. **Procedure Breakdown:** Doughnut chart detailing procedures (LSCS, Normal Delivery, Hysterectomy, Laparoscopy, etc.).
3. **Urgency Ratio:** Elective vs. Emergency distribution.
4. **Clinical Outcomes:** Successful vs. Complication vs. Referred cases.

### 4. "Add Surgery" Form
- **Auto-generated Case ID:** Automatically computes next sequential ID (e.g. `2026-0008`) with a manual refresh button.
- **Conditional Delivery Section:** Automatically opens when selecting an Obstetric procedure or delivery (LSCS, NVD), presenting:
  - Number of babies (Single, Twins, Triplets)
  - Baby gender
  - Birth weight (in kg)
  - Apgar score (1 min / 5 min)
  - Mother's age group
  - Previous C-sections count (0, 1, 2, 3+)
- **Conditional Complication Field:** Expands if outcome is marked as "Complication".
- **Hospital Name Autocomplete:** Common hospital facility suggestions.

### 5. Surgical Records Table & Filters
- **Real-time Search:** Instant search across Case ID, procedure, hospital, baby gender, and surgeon's notes.
- **Filters:** By Category, Procedure Type, Urgency, Outcome, and Custom Date Range.
- **Quick Filters:** "Today", "This Month", and "Reset".
- **Actions:** View full Operative Note Modal (with print support), Edit Record, Delete Record with confirmation.
- **Excel CSV Export:** One-click download of all or filtered records in UTF-8 BOM CSV format (compatible with Microsoft Excel, Google Sheets, and LibreOffice).

---

## 💻 Tech Stack
- **Frontend:** Pure HTML5, CSS3 (Vanilla design system), JavaScript ES6+ (No build step, no bundler needed).
- **Database & Auth:** [Supabase](https://supabase.com) (PostgreSQL 15+, Row Level Security, Supabase Auth JS SDK v2).
- **Charts:** [Chart.js](https://www.chartjs.org/) (via CDN).
- **Hosting:** [Netlify](https://www.netlify.com).
