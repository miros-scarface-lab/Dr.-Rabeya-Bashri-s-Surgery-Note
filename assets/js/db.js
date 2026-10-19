/**
 * ==============================================================================
 * DATABASE & SURGICAL LOGBOOK SERVICE
 * ==============================================================================
 * Interacts with Supabase 'surgeries' table with strict Row Level Security (RLS).
 * Implements strict medical de-identification (Case IDs only, NO patient names).
 * ==============================================================================
 */

// Initial clinical demo dataset for instant zero-config evaluation
const INITIAL_DEMO_SURGERIES = [
  {
    id: "demo-surg-01",
    case_id: "2026-0001",
    surgery_date: "2026-10-18",
    surgery_time: "09:30",
    procedure_type: "Cesarean Section (LSCS)",
    category: "Obstetric",
    urgency: "Emergency",
    anesthesia_type: "Spinal",
    duration_minutes: 45,
    outcome: "Successful",
    complication_details: "",
    hospital_name: "Dinajpur Medical College, Hospital",
    notes: "Fetal distress in active labor. Healthy baby delivered. Clear liquor.",
    baby_count: 1,
    baby_gender: "Female",
    birth_weight_kg: 3.25,
    apgar_score: "8/9",
    mother_age_group: "26-30",
    previous_c_sections: 0,
    created_at: "2026-10-18T09:30:00Z"
  },
  {
    id: "demo-surg-02",
    case_id: "2026-0002",
    surgery_date: "2026-10-17",
    surgery_time: "11:15",
    procedure_type: "Total Abdominal Hysterectomy (TAH)",
    category: "Gynecologic",
    urgency: "Elective",
    anesthesia_type: "General",
    duration_minutes: 90,
    outcome: "Successful",
    complication_details: "",
    hospital_name: "Dinajpur Medical College, Hospital",
    notes: "Multiple symptomatic fibroids with severe menorrhagia. Ovaries conserved.",
    baby_count: null,
    baby_gender: "",
    birth_weight_kg: null,
    apgar_score: "",
    mother_age_group: "36-40",
    previous_c_sections: 2,
    created_at: "2026-10-17T11:15:00Z"
  },
  {
    id: "demo-surg-03",
    case_id: "2026-0003",
    surgery_date: "2026-10-16",
    surgery_time: "14:00",
    procedure_type: "Normal Vaginal Delivery (NVD)",
    category: "Obstetric",
    urgency: "Elective",
    anesthesia_type: "Epidural",
    duration_minutes: 30,
    outcome: "Successful",
    complication_details: "",
    hospital_name: "Dinajpur Medical College, Hospital",
    notes: "Smooth spontaneous vertex delivery with painless epidural analgesia.",
    baby_count: 1,
    baby_gender: "Male",
    birth_weight_kg: 3.10,
    apgar_score: "9/10",
    mother_age_group: "20-25",
    previous_c_sections: 0,
    created_at: "2026-10-16T14:00:00Z"
  },
  {
    id: "demo-surg-04",
    case_id: "2026-0004",
    surgery_date: "2026-10-14",
    surgery_time: "16:45",
    procedure_type: "Laparoscopic Ovarian Cystectomy",
    category: "Gynecologic",
    urgency: "Elective",
    anesthesia_type: "General",
    duration_minutes: 60,
    outcome: "Successful",
    complication_details: "",
    hospital_name: "Dinajpur Medical College, Hospital",
    notes: "Right endometriotic chocolate cyst 6cm removed intact. Minimal blood loss.",
    baby_count: null,
    baby_gender: "",
    birth_weight_kg: null,
    apgar_score: "",
    mother_age_group: "26-30",
    previous_c_sections: 0,
    created_at: "2026-10-14T16:45:00Z"
  },
  {
    id: "demo-surg-05",
    case_id: "2026-0005",
    surgery_date: "2026-10-12",
    surgery_time: "20:10",
    procedure_type: "Ectopic Pregnancy Salpingectomy",
    category: "Obstetric",
    urgency: "Emergency",
    anesthesia_type: "General",
    duration_minutes: 50,
    outcome: "Successful",
    complication_details: "",
    hospital_name: "Dinajpur Medical College, Hospital",
    notes: "Ruptured left tubal ectopic with hemoperitoneum 800ml. Immediate resuscitation and left salpingectomy performed.",
    baby_count: null,
    baby_gender: "",
    birth_weight_kg: null,
    apgar_score: "",
    mother_age_group: "26-30",
    previous_c_sections: 0,
    created_at: "2026-10-12T20:10:00Z"
  },
  {
    id: "demo-surg-06",
    case_id: "2026-0006",
    surgery_date: "2026-10-10",
    surgery_time: "10:30",
    procedure_type: "Cesarean Section (LSCS) - Twins",
    category: "Obstetric",
    urgency: "Elective",
    anesthesia_type: "Spinal",
    duration_minutes: 55,
    outcome: "Successful",
    complication_details: "",
    hospital_name: "Dinajpur Medical College, Hospital",
    notes: "DCDA twin pregnancy at 37 weeks. Both presentations cephalic. Well-contracted uterus.",
    baby_count: 2,
    baby_gender: "Male & Female (Twins)",
    birth_weight_kg: 2.65,
    apgar_score: "8/9, 8/9",
    mother_age_group: "31-35",
    previous_c_sections: 1,
    created_at: "2026-10-10T10:30:00Z"
  },
  {
    id: "demo-surg-07",
    case_id: "2026-0007",
    surgery_date: "2026-10-05",
    surgery_time: "13:00",
    procedure_type: "Abdominal Myomectomy",
    category: "Gynecologic",
    urgency: "Elective",
    anesthesia_type: "General",
    duration_minutes: 75,
    outcome: "Complication",
    complication_details: "Intraoperative primary PPH controlled with tranexamic acid and Foley balloon tamponade.",
    hospital_name: "Dinajpur Medical College, Hospital",
    notes: "3 intramural fibroids enucleated. Uterine cavity not breached.",
    baby_count: null,
    baby_gender: "",
    birth_weight_kg: null,
    apgar_score: "",
    mother_age_group: "31-35",
    previous_c_sections: 0,
    created_at: "2026-10-05T13:00:00Z"
  }
];

/**
 * Storage helpers for demo mode
 */
function getDemoStore() {
  const data = localStorage.getItem('demo_surgeries_data');
  if (!data) {
    localStorage.setItem('demo_surgeries_data', JSON.stringify(INITIAL_DEMO_SURGERIES));
    return [...INITIAL_DEMO_SURGERIES];
  }
  try {
    const list = JSON.parse(data);
    let modified = false;
    list.forEach(item => {
      if (!item.hospital_name || item.hospital_name.includes("Central") || item.hospital_name.includes("Square") || item.hospital_name.includes("City Mother") || item.hospital_name.includes("Parkview")) {
        item.hospital_name = "Dinajpur Medical College, Hospital";
        modified = true;
      }
    });
    if (modified) {
      localStorage.setItem('demo_surgeries_data', JSON.stringify(list));
    }
    return list;
  } catch (e) {
    return [...INITIAL_DEMO_SURGERIES];
  }
}

function saveDemoStore(list) {
  localStorage.setItem('demo_surgeries_data', JSON.stringify(list));
}

/**
 * Fetch surgery records from Supabase (or demo fallback)
 * @returns {Promise<Array>}
 */
async function fetchSurgeries() {
  const sb = window.getSupabase();
  if (!sb) {
    // Return sorted demo records
    const list = getDemoStore();
    return list.sort((a, b) => new Date(b.surgery_date) - new Date(a.surgery_date));
  }

  try {
    const { data, error } = await sb
      .from('surgeries')
      .select('*')
      .order('surgery_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase fetchSurgeries error:", error);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.warn("Falling back to local data due to error:", err);
    return getDemoStore();
  }
}

/**
 * Add a new surgery record
 * @param {object} surgeryData 
 */
async function addSurgery(surgeryData) {
  // STRICT PRIVACY AUDIT: Ensure NO patient personal identifiers exist
  const cleanData = {
    case_id: surgeryData.case_id ? String(surgeryData.case_id).trim() : null,
    surgery_date: surgeryData.surgery_date || new Date().toISOString().split('T')[0],
    surgery_time: surgeryData.surgery_time || null,
    procedure_type: String(surgeryData.procedure_type).trim(),
    category: surgeryData.category,
    urgency: surgeryData.urgency,
    anesthesia_type: surgeryData.anesthesia_type || 'Spinal',
    duration_minutes: surgeryData.duration_minutes ? parseInt(surgeryData.duration_minutes, 10) : null,
    outcome: surgeryData.outcome || 'Successful',
    complication_details: surgeryData.outcome === 'Complication' ? (surgeryData.complication_details || '') : '',
    hospital_name: String(surgeryData.hospital_name).trim(),
    notes: surgeryData.notes ? String(surgeryData.notes).trim() : '',

    // Obstetric fields
    baby_count: surgeryData.baby_count ? parseInt(surgeryData.baby_count, 10) : 1,
    baby_gender: surgeryData.baby_gender || null,
    birth_weight_kg: surgeryData.birth_weight_kg ? parseFloat(surgeryData.birth_weight_kg) : null,
    apgar_score: surgeryData.apgar_score || null,
    mother_age_group: surgeryData.mother_age_group || null,
    previous_c_sections: surgeryData.previous_c_sections ? parseInt(surgeryData.previous_c_sections, 10) : 0
  };

  const sb = window.getSupabase();
  if (!sb) {
    // Save to demo store
    const list = getDemoStore();
    const newRecord = {
      ...cleanData,
      id: 'demo-surg-' + Date.now(),
      created_at: new Date().toISOString()
    };
    list.unshift(newRecord);
    saveDemoStore(list);
    return { data: newRecord, error: null };
  }

  try {
    const user = await window.authService.getCurrentUser();
    if (!user) throw new Error("Doctor is not signed in.");

    cleanData.user_id = user.id;

    const { data, error } = await sb
      .from('surgeries')
      .insert([cleanData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update an existing surgery record
 * @param {string} id 
 * @param {object} updates 
 */
async function updateSurgery(id, updates) {
  const sb = window.getSupabase();
  if (!sb) {
    const list = getDemoStore();
    const idx = list.findIndex(item => item.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
      saveDemoStore(list);
      return { data: list[idx], error: null };
    }
    return { data: null, error: { message: "Record not found" } };
  }

  try {
    const { data, error } = await sb
      .from('surgeries')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Delete a surgery record
 * @param {string} id 
 */
async function deleteSurgery(id) {
  const sb = window.getSupabase();
  if (!sb) {
    let list = getDemoStore();
    list = list.filter(item => item.id !== id);
    saveDemoStore(list);
    return { error: null };
  }

  try {
    const { error } = await sb
      .from('surgeries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Generate sequential Case ID (e.g. 2026-0008)
 * Checks current year's existing records
 */
function generateNextCaseId(existingList = []) {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `${currentYear}-`;

  // Find all case IDs starting with currentYear-
  const seqNumbers = existingList
    .filter(item => item.case_id && item.case_id.startsWith(yearPrefix))
    .map(item => {
      const parts = item.case_id.split('-');
      return parseInt(parts[1], 10) || 0;
    });

  const nextSeq = seqNumbers.length > 0 ? Math.max(...seqNumbers) + 1 : 1;
  return `${currentYear}-${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Calculate KPI Stats for dashboard counters & Chart.js data
 * Includes Total Patients Served, Deliveries, Babies Count, Date metrics, & Surgery Breakdown
 */
function calculateSurgeryStats(surgeries = [], appointments = []) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Helper for Start of Week (Monday)
  const d = new Date(now);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(d.setDate(diffToMonday));
  startOfWeek.setHours(0, 0, 0, 0);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let countToday = 0;
  let countWeek = 0;
  let countMonth = 0;
  let countYear = 0;

  let totalBabiesDelivered = 0;
  let totalCSections = 0;
  let totalNormalDeliveries = 0;
  let totalGynecologicSurgeries = 0;
  let totalLaparoscopicSurgeries = 0;

  const procedureBreakdown = {};
  const categoryBreakdown = { Obstetric: 0, Gynecologic: 0, General: 0 };
  const urgencyBreakdown = { Elective: 0, Emergency: 0 };
  const outcomeBreakdown = { Successful: 0, Complication: 0, Referred: 0 };

  // Monthly trend for current year: 12 months array
  const monthlyVolume = new Array(12).fill(0);

  surgeries.forEach(surg => {
    const surgDate = new Date(surg.surgery_date + 'T00:00:00');
    const isToday = surg.surgery_date === todayStr;
    const isThisWeek = surgDate >= startOfWeek && surgDate <= now;
    const isThisMonth = surgDate.getFullYear() === currentYear && surgDate.getMonth() === currentMonth;
    const isThisYear = surgDate.getFullYear() === currentYear;

    if (isToday) countToday++;
    if (isThisWeek) countWeek++;
    if (isThisMonth) countMonth++;
    if (isThisYear) {
      countYear++;
      const m = surgDate.getMonth();
      monthlyVolume[m] = (monthlyVolume[m] || 0) + 1;
    }

    // Category
    if (surg.category && categoryBreakdown[surg.category] !== undefined) {
      categoryBreakdown[surg.category]++;
    }

    // Urgency
    if (surg.urgency && urgencyBreakdown[surg.urgency] !== undefined) {
      urgencyBreakdown[surg.urgency]++;
    }

    // Outcome
    if (surg.outcome && outcomeBreakdown[surg.outcome] !== undefined) {
      outcomeBreakdown[surg.outcome]++;
    }

    // Specific procedure categories
    const proc = surg.procedure_type || 'Other';
    procedureBreakdown[proc] = (procedureBreakdown[proc] || 0) + 1;

    if (proc.includes('Cesarean') || proc.includes('LSCS')) {
      totalCSections++;
    }
    if (proc.includes('Normal') || proc.includes('Vaginal Delivery') || proc.includes('NVD')) {
      totalNormalDeliveries++;
    }
    if (surg.category === 'Gynecologic') {
      totalGynecologicSurgeries++;
    }
    if (proc.includes('Laparoscop')) {
      totalLaparoscopicSurgeries++;
    }

    // Babies count
    if (surg.baby_count) {
      totalBabiesDelivered += parseInt(surg.baby_count, 10) || 1;
    } else if (proc.includes('Delivery') || proc.includes('LSCS') || proc.includes('Cesarean')) {
      totalBabiesDelivered += 1;
    }
  });

  const total = surgeries.length;
  const complicationCount = outcomeBreakdown.Complication || 0;
  const complicationRate = total > 0 ? ((complicationCount / total) * 100).toFixed(1) : "0.0";

  // Career baseline counter (defaults to 4500 if configured) + live database surgeries + appointments
  const storedBase = localStorage.getItem('career_patients_base_count');
  const baseCount = storedBase !== null ? parseInt(storedBase, 10) : (window.APP_CONFIG.CAREER_PATIENTS_BASE_COUNT || 4500);
  const totalPatientsServed = baseCount + total + (appointments ? appointments.length : 0);

  return {
    totalPatientsServed,
    baseCount,
    countToday,
    countWeek,
    countMonth,
    countYear,
    total,
    totalBabiesDelivered,
    totalCSections,
    totalNormalDeliveries,
    totalGynecologicSurgeries,
    totalLaparoscopicSurgeries,
    complicationCount,
    complicationRate,
    procedureBreakdown,
    categoryBreakdown,
    urgencyBreakdown,
    outcomeBreakdown,
    monthlyVolume
  };
}

/**
 * Export surgery records to CSV (Excel-compatible with UTF-8 BOM)
 */
function exportSurgeriesToCsv(records = [], filename = "surgical_logbook_export.csv") {
  if (!records || records.length === 0) {
    alert("No records to export.");
    return;
  }

  const headers = [
    "Case ID",
    "Surgery Date",
    "Time",
    "Procedure Type",
    "Category",
    "Urgency",
    "Anesthesia Type",
    "Duration (Mins)",
    "Clinical Outcome",
    "Complication Details",
    "Hospital / Facility",
    "Baby Count",
    "Baby Gender",
    "Birth Weight (kg)",
    "Apgar Score",
    "Mother Age Group",
    "Previous C-Sections",
    "Surgical Notes & Remarks"
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map(r => [
    escapeCsv(r.case_id),
    escapeCsv(r.surgery_date),
    escapeCsv(r.surgery_time || ''),
    escapeCsv(r.procedure_type),
    escapeCsv(r.category),
    escapeCsv(r.urgency),
    escapeCsv(r.anesthesia_type || ''),
    escapeCsv(r.duration_minutes || ''),
    escapeCsv(r.outcome),
    escapeCsv(r.complication_details || ''),
    escapeCsv(r.hospital_name),
    escapeCsv(r.baby_count || ''),
    escapeCsv(r.baby_gender || ''),
    escapeCsv(r.birth_weight_kg || ''),
    escapeCsv(r.apgar_score || ''),
    escapeCsv(r.mother_age_group || ''),
    escapeCsv(r.previous_c_sections !== undefined ? r.previous_c_sections : ''),
    escapeCsv(r.notes || '')
  ]);

  const csvContent = "\uFEFF" + [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Entire Data Reservation to JSON (Complete Offline Backup Vault)
 */
async function exportDataToJson() {
  const surgeries = await fetchSurgeries();
  const appointments = await fetchAppointments();

  const backupPayload = {
    vault_version: "2.0",
    doctor: window.APP_CONFIG.DOCTOR_NAME,
    exported_at: new Date().toISOString(),
    total_surgeries_preserved: surgeries.length,
    total_appointments: appointments.length,
    surgeries: surgeries,
    appointments: appointments
  };

  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `Dr_Rabeya_Basri_Surgical_Vault_Backup_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import and Restore Data from JSON Backup File
 */
async function importDataFromJson(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.surgeries)) {
      throw new Error("Invalid backup format. Must contain a 'surgeries' array.");
    }

    const sb = window.getSupabase();
    if (!sb) {
      saveDemoStore(parsed.surgeries);
      if (Array.isArray(parsed.appointments)) {
        localStorage.setItem('demo_appointments', JSON.stringify(parsed.appointments));
      }
      return { count: parsed.surgeries.length, error: null };
    }

    // In Supabase mode, insert missing records
    const user = await window.authService.getCurrentUser();
    if (!user) throw new Error("Doctor is not signed in.");

    for (const item of parsed.surgeries) {
      delete item.id; // Allow new UUID generation if needed or check existing
      item.user_id = user.id;
      await sb.from('surgeries').upsert(item, { onConflict: 'case_id' });
    }

    return { count: parsed.surgeries.length, error: null };
  } catch (err) {
    return { count: 0, error: err };
  }
}

/**
 * Fetch Public Appointment Requests
 */
async function fetchAppointments() {
  const sb = window.getSupabase();
  if (!sb) {
    return JSON.parse(localStorage.getItem('demo_appointments') || '[]');
  }

  try {
    const { data, error } = await sb
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Fetch appointments fallback:", err);
    return JSON.parse(localStorage.getItem('demo_appointments') || '[]');
  }
}

/**
 * Update Appointment Status (Confirmed, Completed, Cancelled)
 */
async function updateAppointmentStatus(id, newStatus) {
  const sb = window.getSupabase();
  if (!sb) {
    const list = JSON.parse(localStorage.getItem('demo_appointments') || '[]');
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx].status = newStatus;
      localStorage.setItem('demo_appointments', JSON.stringify(list));
      return { error: null };
    }
    return { error: { message: "Appointment not found" } };
  }

  try {
    const { error } = await sb
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Delete Appointment Request
 */
async function deleteAppointment(id) {
  const sb = window.getSupabase();
  if (!sb) {
    let list = JSON.parse(localStorage.getItem('demo_appointments') || '[]');
    list = list.filter(a => a.id !== id);
    localStorage.setItem('demo_appointments', JSON.stringify(list));
    return { error: null };
  }

  try {
    const { error } = await sb
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Public Appointment Request Submission
 */
async function submitPublicAppointment(appointmentData) {
  const sb = window.getSupabase();
  if (!sb) {
    const appts = JSON.parse(localStorage.getItem('demo_appointments') || '[]');
    appts.unshift({ ...appointmentData, id: 'appt-' + Date.now(), created_at: new Date().toISOString() });
    localStorage.setItem('demo_appointments', JSON.stringify(appts));
    return { data: { success: true }, error: null };
  }

  try {
    const { data, error } = await sb
      .from('appointments')
      .insert([appointmentData])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

// Global exposure
window.dbService = {
  fetchSurgeries,
  addSurgery,
  updateSurgery,
  deleteSurgery,
  generateNextCaseId,
  calculateSurgeryStats,
  exportSurgeriesToCsv,
  exportDataToJson,
  importDataFromJson,
  fetchAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  submitPublicAppointment
};

