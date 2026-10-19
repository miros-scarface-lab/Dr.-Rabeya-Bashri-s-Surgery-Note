/**
 * ==============================================================================
 * DR. RABEYA BASRI - ADMIN PANEL & SURGICAL DATA RESERVATION CONTROLLER
 * ==============================================================================
 * Controls:
 * - Admin Tab Switching (Overview, Registry, Appointments, Data Vault, Settings)
 * - Hero Lifetime Patients Counter & Real-Time Date Metrics
 * - 4 Chart.js Clinical Visualizations
 * - Full Search & Multi-criteria Filter Registry
 * - Add / Edit Surgery Modal with dynamic Delivery & Neonatal fields
 * - Patient Appointments / Inquiries Management
 * - Data Reservation Vault (JSON Backup & Restore, Excel CSV Export)
 * - Admin Practice Settings & Counter Calibration
 * ==============================================================================
 */

// Global State
let allSurgeries = [];
let filteredSurgeries = [];
let allAppointments = [];
let editingRecordId = null;
let deletingRecordId = null;

// Chart Instances
let volumeChartInstance = null;
let procedureChartInstance = null;
let urgencyChartInstance = null;
let outcomeChartInstance = null;

// Auto-procedure to category mapping
const PROCEDURE_CATEGORY_MAP = {
  "Cesarean Section (LSCS)": "Obstetric",
  "Normal Vaginal Delivery (NVD)": "Obstetric",
  "Assisted Vaginal Delivery (Ventouse/Forceps)": "Obstetric",
  "Ectopic Pregnancy Salpingectomy": "Obstetric",
  "Cervical Encirclage (McDonald Stitch)": "Obstetric",
  "Cesarean Section (LSCS) - Twins": "Obstetric",
  "Other Obstetric Surgery": "Obstetric",
  "Total Abdominal Hysterectomy (TAH)": "Gynecologic",
  "Vaginal Hysterectomy (VH / Pelvic Floor Repair)": "Gynecologic",
  "Laparoscopic Assisted Vaginal Hysterectomy (LAVH)": "Gynecologic",
  "Laparoscopic Total Hysterectomy (TLH)": "Gynecologic",
  "Abdominal Myomectomy": "Gynecologic",
  "Laparoscopic Myomectomy": "Gynecologic",
  "Laparoscopic Ovarian Cystectomy": "Gynecologic",
  "Laparotomy / Ovarian Mass Excision": "Gynecologic",
  "Diagnostic Laparoscopy & Chromopertubation": "Gynecologic",
  "Dilatation and Curettage (D&C / MVA)": "Gynecologic",
  "Tubal Ligation / Sterilization": "Gynecologic",
  "Other Gynecologic Surgery": "Gynecologic",
  "Exploratory Laparotomy (General/Gynae)": "General",
  "Appendectomy in Pregnancy": "General",
  "Other General Surgery": "General"
};

// Initialize Dashboard upon DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Enforce Authentication Guard (Redirects to login.html if not logged in)
  const doctorUser = await window.authService.requireAuth();
  if (!doctorUser) return;

  // 2. Setup Doctor Profile UI
  setupDoctorHeader(doctorUser);

  // 3. Initialize Modals, Tabs, and Event Listeners
  initAdminTabs();
  initEventListeners();

  // 4. Load Surgical Data & Appointments
  await loadDashboardData();
});

/**
 * Configure Doctor Header and Welcome Text
 */
function setupDoctorHeader(user) {
  const doctorNameEl = document.getElementById('doctorHeaderName');
  const doctorEmailEl = document.getElementById('doctorHeaderEmail');
  const doctorAvatarEl = document.getElementById('doctorHeaderAvatar');
  const noticeBannerEl = document.getElementById('configNoticeBanner');

  const customName = localStorage.getItem('doctor_custom_name');
  const doctorName = customName || (user.user_metadata && user.user_metadata.name) || window.APP_CONFIG.DOCTOR_NAME;

  if (doctorNameEl) doctorNameEl.textContent = doctorName;
  if (doctorEmailEl) doctorEmailEl.textContent = user.email || 'dr.rabeyabasri@example.com';
  
  if (doctorAvatarEl) {
    const initials = doctorName.split(' ').map(n => n[0]).slice(0, 2).join('');
    doctorAvatarEl.textContent = initials || 'RB';
  }

  // Display notice if Supabase is in demo/local mode
  if (noticeBannerEl && !window.isSupabaseConfigured()) {
    noticeBannerEl.style.display = 'block';
  }
}

/**
 * Initialize Admin Tabs Navigation
 */
function initAdminTabs() {
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      if (!targetTabId) return;

      // Update button active state
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update pane active state
      document.querySelectorAll('.admin-tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });

      const targetPane = document.getElementById(targetTabId);
      if (targetPane) {
        targetPane.classList.add('active');
      }

      // Re-render charts when overview is clicked to ensure correct canvas sizing
      if (targetTabId === 'tab-overview') {
        setTimeout(renderCharts, 50);
      }
    });
  });
}

/**
 * Fetch data and refresh dashboard view
 */
async function loadDashboardData() {
  showLoadingSpinner(true);
  try {
    allSurgeries = await window.dbService.fetchSurgeries();
    filteredSurgeries = [...allSurgeries];
    allAppointments = await window.dbService.fetchAppointments();

    // Populate procedure dropdown in filters
    populateProcedureFilterDropdown();

    // Render Hero Counters & Stats
    updateStatsCards();

    // Render Charts
    renderCharts();

    // Render Tables
    renderSurgeriesTable();
    renderAppointmentsTable();

    // Update Tab Badges
    const surgBadge = document.getElementById('tabBadgeSurgeriesCount');
    const apptBadge = document.getElementById('tabBadgeApptsCount');
    if (surgBadge) surgBadge.textContent = allSurgeries.length;
    if (apptBadge) apptBadge.textContent = allAppointments.length;

    // Populate CMS Content Editor fields
    await populateCmsEditorForm();

  } catch (err) {
    console.error("Error loading dashboard data:", err);
    showToast("Error loading records: " + err.message, "error");
  } finally {
    showLoadingSpinner(false);
  }
}

/**
 * Update the Top KPI Stats Cards & Hero Patients Counter
 */
function updateStatsCards() {
  const stats = window.dbService.calculateSurgeryStats(allSurgeries, allAppointments);

  // Hero Counters
  const heroTotal = document.getElementById('statHeroTotalPatients');
  const heroSurgeries = document.getElementById('statHeroSurgeriesCount');
  const heroBabies = document.getElementById('statHeroBabiesCount');
  const heroGynae = document.getElementById('statHeroGynaeCount');
  const heroSafety = document.getElementById('statHeroSafetyRate');

  if (heroTotal) heroTotal.textContent = stats.totalPatientsServed.toLocaleString();
  if (heroSurgeries) heroSurgeries.textContent = stats.total.toLocaleString();
  if (heroBabies) heroBabies.textContent = stats.totalBabiesDelivered.toLocaleString();
  if (heroGynae) heroGynae.textContent = stats.totalGynecologicSurgeries.toLocaleString();
  if (heroSafety) {
    const safetyRate = (100 - parseFloat(stats.complicationRate)).toFixed(1);
    heroSafety.textContent = safetyRate + '%';
  }

  // Date Metric Cards
  const todayEl = document.getElementById('statToday');
  const weekEl = document.getElementById('statWeek');
  const monthEl = document.getElementById('statMonth');
  const yearEl = document.getElementById('statYear');
  const compRateEl = document.getElementById('statComplicationRate');

  if (todayEl) todayEl.textContent = stats.countToday;
  if (weekEl) weekEl.textContent = stats.countWeek;
  if (monthEl) monthEl.textContent = stats.countMonth;
  if (yearEl) yearEl.textContent = stats.countYear;
  if (compRateEl) compRateEl.textContent = stats.complicationRate + '%';

  // Fill Admin Settings input defaults
  const settingName = document.getElementById('settingDoctorName');
  const settingBase = document.getElementById('settingCareerPatientsBase');
  if (settingName && !settingName.value) settingName.value = window.APP_CONFIG.DOCTOR_NAME;
  if (settingBase && !settingBase.value) settingBase.value = stats.baseCount;
}

/**
 * Render Chart.js Analytics
 */
function renderCharts() {
  if (typeof Chart === 'undefined') return;

  const stats = window.dbService.calculateSurgeryStats(allSurgeries, allAppointments);

  // 1. Surgical Volume Trend Chart
  const volumeCtx = document.getElementById('volumeTrendChart');
  if (volumeCtx) {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (volumeChartInstance) volumeChartInstance.destroy();

    volumeChartInstance = new Chart(volumeCtx, {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [{
          label: 'Surgeries in ' + new Date().getFullYear(),
          data: stats.monthlyVolume,
          borderColor: '#D85A7F',
          backgroundColor: 'rgba(216, 90, 127, 0.12)',
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#D85A7F',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, stepSize: 1 },
            grid: { color: 'rgba(226, 232, 240, 0.6)' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // 2. Procedure Type Breakdown Chart (Doughnut)
  const procCtx = document.getElementById('procedureBreakdownChart');
  if (procCtx) {
    if (procedureChartInstance) procedureChartInstance.destroy();

    const procKeys = Object.keys(stats.procedureBreakdown);
    const procValues = Object.values(stats.procedureBreakdown);

    const palette = [
      '#D85A7F', '#0E7490', '#10B981', '#8B5CF6', 
      '#F59E0B', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6'
    ];

    procedureChartInstance = new Chart(procCtx, {
      type: 'doughnut',
      data: {
        labels: procKeys.length > 0 ? procKeys : ['No Surgeries Logged'],
        datasets: [{
          data: procValues.length > 0 ? procValues : [1],
          backgroundColor: procKeys.length > 0 ? palette.slice(0, procKeys.length) : ['#E2E8F0'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        },
        cutout: '65%'
      }
    });
  }

  // 3. Emergency vs. Elective Ratio Chart (Doughnut)
  const urgencyCtx = document.getElementById('urgencyChart');
  if (urgencyCtx) {
    if (urgencyChartInstance) urgencyChartInstance.destroy();

    urgencyChartInstance = new Chart(urgencyCtx, {
      type: 'doughnut',
      data: {
        labels: ['Elective', 'Emergency'],
        datasets: [{
          data: [stats.urgencyBreakdown.Elective, stats.urgencyBreakdown.Emergency],
          backgroundColor: ['#0E7490', '#EF4444'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        cutout: '60%'
      }
    });
  }

  // 4. Outcomes Chart (Successful / Complication / Referred)
  const outcomeCtx = document.getElementById('outcomeChart');
  if (outcomeCtx) {
    if (outcomeChartInstance) outcomeChartInstance.destroy();

    outcomeChartInstance = new Chart(outcomeCtx, {
      type: 'doughnut',
      data: {
        labels: ['Successful', 'Complication', 'Referred'],
        datasets: [{
          data: [
            stats.outcomeBreakdown.Successful,
            stats.outcomeBreakdown.Complication,
            stats.outcomeBreakdown.Referred
          ],
          backgroundColor: ['#10B981', '#F59E0B', '#6366F1'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        cutout: '60%'
      }
    });
  }
}

/**
 * Render the Surgeries Data Table
 */
function renderSurgeriesTable() {
  const tbody = document.getElementById('surgeriesTableBody');
  const countEl = document.getElementById('filteredRecordsCount');
  if (!tbody) return;

  if (countEl) countEl.textContent = `${filteredSurgeries.length} of ${allSurgeries.length} records preserved`;

  if (filteredSurgeries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="table-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h4 style="font-size: 1.1rem; color: var(--slate-800); margin-bottom: 0.25rem;">No surgical records found</h4>
            <p style="font-size: 0.875rem;">Try adjusting your filters or click "Add Surgery / Case" to reserve a new procedure.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredSurgeries.map(item => {
    const categoryBadgeClass = item.category === 'Obstetric' ? 'badge-primary' : (item.category === 'Gynecologic' ? 'badge-secondary' : 'badge-purple');
    const urgencyBadgeClass = item.urgency === 'Emergency' ? 'badge-danger' : 'badge-success';
    
    let outcomeBadgeClass = 'badge-success';
    if (item.outcome === 'Complication') outcomeBadgeClass = 'badge-warning';
    if (item.outcome === 'Referred') outcomeBadgeClass = 'badge-purple';

    const isDelivery = item.procedure_type.includes('Delivery') || 
                       item.procedure_type.includes('LSCS') || 
                       item.procedure_type.includes('Cesarean') || 
                       (item.baby_count && item.baby_count > 0);

    return `
      <tr>
        <td>
          <span class="case-id-badge">${escapeHtml(item.case_id)}</span>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--slate-900);">${formatDate(item.surgery_date)}</div>
          <div style="font-size: 0.775rem; color: var(--slate-500);">${item.surgery_time ? formatTime(item.surgery_time) : '-'}</div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(item.procedure_type)}</div>
          <div style="font-size: 0.775rem; color: var(--slate-500);">
            ${item.duration_minutes ? item.duration_minutes + ' mins' : ''} 
            ${item.anesthesia_type ? '• ' + escapeHtml(item.anesthesia_type) : ''}
          </div>
        </td>
        <td>
          <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
            <span class="badge ${categoryBadgeClass}">${escapeHtml(item.category)}</span>
            <span class="badge ${urgencyBadgeClass}">${escapeHtml(item.urgency)}</span>
          </div>
          ${isDelivery && item.baby_gender ? `
            <div style="margin-top: 0.35rem; font-size: 0.75rem; color: var(--primary); font-weight: 600;">
              👶 ${escapeHtml(item.baby_gender)} ${item.birth_weight_kg ? '(' + item.birth_weight_kg + 'kg)' : ''}
            </div>
          ` : ''}
        </td>
        <td>
          <div style="font-weight: 600; color: var(--slate-800); max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(item.hospital_name)}">
            ${escapeHtml(item.hospital_name)}
          </div>
        </td>
        <td>
          <span class="badge ${outcomeBadgeClass}">${escapeHtml(item.outcome)}</span>
          ${item.outcome === 'Complication' && item.complication_details ? `
            <div style="font-size: 0.725rem; color: #B45309; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(item.complication_details)}">
              ⚠️ ${escapeHtml(item.complication_details)}
            </div>
          ` : ''}
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" onclick="viewSurgeryDetails('${item.id}')" title="View Surgical Note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-icon" onclick="openEditSurgeryModal('${item.id}')" title="Edit Record">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="btn-icon btn-icon-danger" onclick="confirmDeleteSurgery('${item.id}')" title="Delete Record">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Render Public Appointments Table
 */
function renderAppointmentsTable() {
  const tbody = document.getElementById('appointmentsTableBody');
  if (!tbody) return;

  if (allAppointments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="table-empty-state">
            <h4 style="font-size: 1.05rem; color: var(--slate-800);">No patient appointments yet</h4>
            <p style="font-size: 0.85rem;">Patient requests submitted from your contact & chamber pages will appear here.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = allAppointments.map(a => {
    let statusClass = 'badge-warning';
    if (a.status === 'Confirmed') statusClass = 'badge-primary';
    if (a.status === 'Completed') statusClass = 'badge-success';
    if (a.status === 'Cancelled') statusClass = 'badge-danger';

    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(a.patient_name)}</div>
          <div style="font-size: 0.775rem; color: var(--slate-500);">${a.created_at ? formatDate(a.created_at.split('T')[0]) : ''}</div>
        </td>
        <td>
          <a href="tel:${escapeHtml(a.patient_phone)}" style="color: var(--secondary); font-weight: 600;">
            📞 ${escapeHtml(a.patient_phone)}
          </a>
        </td>
        <td>
          <div style="font-weight: 600;">${formatDate(a.preferred_date)}</div>
        </td>
        <td>
          <div style="font-size: 0.85rem; color: var(--slate-700);">${escapeHtml(a.chamber_location || 'Main Chamber')}</div>
        </td>
        <td>
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--slate-800);">${escapeHtml(a.service_type || 'Consultation')}</div>
          ${a.message ? `<div style="font-size: 0.75rem; color: var(--slate-500); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(a.message)}">${escapeHtml(a.message)}</div>` : ''}
        </td>
        <td>
          <span class="badge ${statusClass}">${escapeHtml(a.status || 'Pending')}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-ghost" onclick="updateAppointmentStatusAction('${a.id}', 'Confirmed')" title="Confirm Appointment">
              ✅ Confirm
            </button>
            <button class="btn btn-sm btn-ghost" onclick="updateAppointmentStatusAction('${a.id}', 'Completed')" title="Mark Completed">
              🎉 Complete
            </button>
            <button class="btn-icon btn-icon-danger" onclick="deleteAppointmentAction('${a.id}')" title="Delete Appointment">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Filter Records on Search or Criteria Change
 */
function applyFilters() {
  const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
  const procedureFilter = document.getElementById('procedureFilter')?.value || 'all';
  const urgencyFilter = document.getElementById('urgencyFilter')?.value || 'all';
  const outcomeFilter = document.getElementById('outcomeFilter')?.value || 'all';
  const startDate = document.getElementById('startDateFilter')?.value || '';
  const endDate = document.getElementById('endDateFilter')?.value || '';

  filteredSurgeries = allSurgeries.filter(item => {
    if (searchTerm) {
      const matchSearch = (
        (item.case_id && item.case_id.toLowerCase().includes(searchTerm)) ||
        (item.procedure_type && item.procedure_type.toLowerCase().includes(searchTerm)) ||
        (item.hospital_name && item.hospital_name.toLowerCase().includes(searchTerm)) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm)) ||
        (item.baby_gender && item.baby_gender.toLowerCase().includes(searchTerm))
      );
      if (!matchSearch) return false;
    }

    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (procedureFilter !== 'all' && item.procedure_type !== procedureFilter) return false;
    if (urgencyFilter !== 'all' && item.urgency !== urgencyFilter) return false;
    if (outcomeFilter !== 'all' && item.outcome !== outcomeFilter) return false;
    if (startDate && item.surgery_date < startDate) return false;
    if (endDate && item.surgery_date > endDate) return false;

    return true;
  });

  renderSurgeriesTable();
}

/**
 * Populate Procedure Dropdown in Filter Bar
 */
function populateProcedureFilterDropdown() {
  const select = document.getElementById('procedureFilter');
  if (!select) return;

  const currentVal = select.value;
  const procedures = Array.from(new Set(allSurgeries.map(s => s.procedure_type))).sort();

  select.innerHTML = '<option value="all">All Procedures</option>' + 
    procedures.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');

  if (procedures.includes(currentVal)) {
    select.value = currentVal;
  }
}

/**
 * Setup All Event Listeners
 */
function initEventListeners() {
  // Search and Filter Events
  document.getElementById('searchInput')?.addEventListener('input', applyFilters);
  document.getElementById('categoryFilter')?.addEventListener('change', applyFilters);
  document.getElementById('procedureFilter')?.addEventListener('change', applyFilters);
  document.getElementById('urgencyFilter')?.addEventListener('change', applyFilters);
  document.getElementById('outcomeFilter')?.addEventListener('change', applyFilters);
  document.getElementById('startDateFilter')?.addEventListener('change', applyFilters);
  document.getElementById('endDateFilter')?.addEventListener('change', applyFilters);

  // Quick Date Range Filter Buttons
  document.getElementById('btnFilterToday')?.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDateFilter').value = today;
    document.getElementById('endDateFilter').value = today;
    applyFilters();
  });

  document.getElementById('btnFilterThisMonth')?.addEventListener('click', () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    document.getElementById('startDateFilter').value = firstDay;
    document.getElementById('endDateFilter').value = lastDay;
    applyFilters();
  });

  document.getElementById('btnFilterClear')?.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('procedureFilter').value = 'all';
    document.getElementById('urgencyFilter').value = 'all';
    document.getElementById('outcomeFilter').value = 'all';
    document.getElementById('startDateFilter').value = '';
    document.getElementById('endDateFilter').value = '';
    applyFilters();
  });

  // Action Buttons
  document.getElementById('btnOpenAddSurgery')?.addEventListener('click', openAddSurgeryModal);
  document.getElementById('btnExportCsv')?.addEventListener('click', () => {
    const filename = `Dr_Rabeya_Basri_Surgical_Records_${new Date().toISOString().split('T')[0]}.csv`;
    window.dbService.exportSurgeriesToCsv(filteredSurgeries, filename);
  });
  document.getElementById('btnLogoutDoctor')?.addEventListener('click', () => {
    if (confirm("Are you sure you want to sign out of Dr. Rabeya Basri's Admin Panel?")) {
      window.authService.logoutDoctor();
    }
  });

  // Data Vault JSON Export & Import
  document.getElementById('btnDownloadJsonBackup')?.addEventListener('click', async () => {
    showToast("Generating secure JSON vault backup...", "info");
    await window.dbService.exportDataToJson();
    showToast("JSON Vault backup downloaded successfully!", "success");
  });

  const fileInput = document.getElementById('importJsonFileInput');
  document.getElementById('btnTriggerJsonImport')?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const res = await window.dbService.importDataFromJson(text);
        if (res.error) throw res.error;

        showToast(`Successfully restored ${res.count} surgical cases from backup!`, "success");
        await loadDashboardData();
      } catch (err) {
        showToast("Restore failed: " + err.message, "error");
      }
    };
    reader.readAsText(file);
    fileInput.value = ''; // Reset
  });

  // Admin Practice Settings Form
  document.getElementById('adminSettingsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const docName = document.getElementById('settingDoctorName').value.trim();
    const baseCount = parseInt(document.getElementById('settingCareerPatientsBase').value, 10) || 0;
    const email = document.getElementById('settingClinicEmail').value.trim();

    if (docName) {
      localStorage.setItem('doctor_custom_name', docName);
      window.APP_CONFIG.DOCTOR_NAME = docName;
      document.getElementById('doctorHeaderName').textContent = docName;
    }

    localStorage.setItem('career_patients_base_count', baseCount);
    updateStatsCards();
    showToast("Admin settings and patient baseline updated successfully!", "success");
  });

  // Refresh Appointments Button
  document.getElementById('btnRefreshAppointments')?.addEventListener('click', async () => {
    allAppointments = await window.dbService.fetchAppointments();
    renderAppointmentsTable();
    updateStatsCards();
    showToast("Appointments refreshed.", "info");
  });

  // Surgery Form: Procedure dropdown change -> Auto categorize and toggle delivery fields
  const procSelect = document.getElementById('formProcedureType');
  procSelect?.addEventListener('change', (e) => {
    const selectedProc = e.target.value;
    const catSelect = document.getElementById('formCategory');
    if (catSelect && PROCEDURE_CATEGORY_MAP[selectedProc]) {
      catSelect.value = PROCEDURE_CATEGORY_MAP[selectedProc];
    }
    toggleDeliveryFields();
  });

  document.getElementById('formCategory')?.addEventListener('change', toggleDeliveryFields);
  document.getElementById('formOutcome')?.addEventListener('change', toggleComplicationField);
  document.getElementById('surgeryForm')?.addEventListener('submit', handleSurgeryFormSubmit);

  // Refresh Case ID Button
  document.getElementById('btnRefreshCaseId')?.addEventListener('click', () => {
    const caseIdInput = document.getElementById('formCaseId');
    if (caseIdInput) {
      caseIdInput.value = window.dbService.generateNextCaseId(allSurgeries);
    }
  });

  // Modal Closers
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  document.getElementById('btnExecuteDelete')?.addEventListener('click', executeDeleteSurgery);
  document.getElementById('btnConfigureSupabase')?.addEventListener('click', openSupabaseConfigModal);
  document.getElementById('supabaseConfigForm')?.addEventListener('submit', handleSupabaseConfigSubmit);

  // Dynamic Add Chamber buttons
  document.getElementById('btnAddChamberRow')?.addEventListener('click', () => addCmsChamberCard());
  document.getElementById('btnAddChamberRowBottom')?.addEventListener('click', () => addCmsChamberCard());

  // CMS Content Form Submission
  document.getElementById('cmsContentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!window.siteContentService) return;

    const saveBtn = document.getElementById('btnSaveCmsContent');
    const originalBtnText = saveBtn ? saveBtn.innerHTML : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '⏳ Saving &amp; Publishing...';
    }

    try {
      const currentContent = await window.siteContentService.getSiteContent();

      // Extract dynamic chambers list from the UI cards
      const chamberCards = document.querySelectorAll('#cmsChambersContainer .cms-chamber-card');
      const newChambersList = [];
      chamberCards.forEach((card, idx) => {
        const name = card.querySelector('.chamber-name-input')?.value.trim() || '';
        if (name) {
          newChambersList.push({
            id: `chamber-${idx + 1}`,
            name: name,
            badge: card.querySelector('.chamber-badge-input')?.value.trim() || (idx === 0 ? 'Primary Hospital & Chamber' : `Visiting Chamber ${idx + 1}`),
            phone: card.querySelector('.chamber-phone-input')?.value.trim() || '',
            address: card.querySelector('.chamber-address-input')?.value.trim() || '',
            days: card.querySelector('.chamber-days-input')?.value.trim() || '',
            hours: card.querySelector('.chamber-hours-input')?.value.trim() || ''
          });
        }
      });

      if (newChambersList.length === 0) {
        newChambersList.push({
          id: 'chamber-1',
          name: 'Dinajpur Medical College, Hospital',
          badge: 'Primary Hospital & Chamber',
          address: 'Department of Obstetrics & Gynecology, Dinajpur Medical College, Hospital, Dinajpur',
          days: 'Saturday – Thursday',
          hours: '9:00 AM – 2:30 PM & Evening Chamber',
          phone: '+880 1700-000000'
        });
      }

      // Populate legacy format for full backward compatibility
      const legacyChambers = {};
      newChambersList.forEach((ch, idx) => {
        const key = `chamber${idx + 1}`;
        legacyChambers[`${key}_name`] = ch.name;
        legacyChambers[`${key}_badge`] = ch.badge;
        legacyChambers[`${key}_phone`] = ch.phone;
        legacyChambers[`${key}_address`] = ch.address;
        legacyChambers[`${key}_days`] = ch.days;
        legacyChambers[`${key}_hours`] = ch.hours;
      });

      const updatedContent = {
        ...currentContent,
        doctor: {
          ...currentContent.doctor,
          name: getVal('cms_doctor_name') || currentContent.doctor?.name,
          title: getVal('cms_doctor_title') || currentContent.doctor?.title,
          degrees: getVal('cms_doctor_degrees') || currentContent.doctor?.degrees,
          bmdc_reg: getVal('cms_doctor_bmdc_reg') || currentContent.doctor?.bmdc_reg,
          primary_phone: getVal('cms_doctor_primary_phone') || currentContent.doctor?.primary_phone,
          alt_phone: getVal('cms_doctor_alt_phone') || currentContent.doctor?.alt_phone,
          email: getVal('cms_doctor_email') || currentContent.doctor?.email,
          emergency_hotline: getVal('cms_doctor_emergency_hotline') || currentContent.doctor?.emergency_hotline
        },
        hero: {
          ...currentContent.hero,
          pill_text: getVal('cms_hero_pill_text'),
          title_main: getVal('cms_hero_title_main'),
          title_highlight: getVal('cms_hero_title_highlight'),
          subtitle: getVal('cms_hero_subtitle'),
          stat1_num: getVal('cms_hero_stat1_num'),
          stat1_label: getVal('cms_hero_stat1_label'),
          stat2_num: getVal('cms_hero_stat2_num'),
          stat2_label: getVal('cms_hero_stat2_label'),
          stat3_num: getVal('cms_hero_stat3_num'),
          stat3_label: getVal('cms_hero_stat3_label'),
          stat4_num: getVal('cms_hero_stat4_num'),
          stat4_label: getVal('cms_hero_stat4_label')
        },
        about: {
          ...currentContent.about,
          banner_tag: getVal('cms_about_banner_tag'),
          bio_heading: getVal('cms_about_bio_heading'),
          bio_p1: getVal('cms_about_bio_p1'),
          bio_p2: getVal('cms_about_bio_p2'),
          bio_p3: getVal('cms_about_bio_p3'),
          pillar1_title: getVal('cms_about_pillar1_title'),
          pillar1_desc: getVal('cms_about_pillar1_desc'),
          pillar2_title: getVal('cms_about_pillar2_title'),
          pillar2_desc: getVal('cms_about_pillar2_desc')
        },
        specialties: {
          ...currentContent.specialties,
          title: getVal('cms_specialties_title'),
          tag: getVal('cms_specialties_tag'),
          desc: getVal('cms_specialties_desc')
        },
        credentials: {
          ...currentContent.credentials,
          title: getVal('cms_credentials_title'),
          tag: getVal('cms_credentials_tag'),
          desc: getVal('cms_credentials_desc')
        },
        appointment: {
          ...currentContent.appointment,
          title: getVal('cms_appointment_title'),
          tag: getVal('cms_appointment_tag'),
          subtitle: getVal('cms_appointment_subtitle')
        },
        services: {
          ...currentContent.services,
          banner_title: getVal('cms_services_banner_title'),
          banner_tag: getVal('cms_services_banner_tag'),
          banner_desc: getVal('cms_services_banner_desc')
        },
        chambers_page: {
          ...currentContent.chambers_page,
          banner_title: getVal('cms_chambers_banner_title'),
          banner_tag: getVal('cms_chambers_banner_tag'),
          banner_desc: getVal('cms_chambers_banner_desc')
        },
        chambersList: newChambersList,
        chambers: {
          ...currentContent.chambers,
          ...legacyChambers
        },
        footer: {
          ...currentContent.footer,
          about_text: getVal('cms_footer_about_text'),
          copyright_text: getVal('cms_footer_copyright_text')
        }
      };

      const res = await window.siteContentService.saveSiteContent(updatedContent);
      if (res.error) throw res.error;

      // Update doctor name across current session if modified
      if (updatedContent.doctor.name) {
        localStorage.setItem('doctor_custom_name', updatedContent.doctor.name);
        window.APP_CONFIG.DOCTOR_NAME = updatedContent.doctor.name;
        const nameHeader = document.getElementById('doctorHeaderName');
        if (nameHeader) nameHeader.textContent = updatedContent.doctor.name;
      }

      // Re-apply to the active page immediately (updates datalist, dropdowns, etc.)
      if (window.siteContentService.applySiteContentToPage) {
        window.siteContentService.applySiteContentToPage();
      }

      let toastMsg = "";
      let toastType = "success";

      if (res.savedToDisk && res.savedToCloud) {
        toastMsg = "🎉 Website content published! Saved permanently to disk and Supabase cloud.";
      } else if (res.savedToCloud) {
        toastMsg = "🎉 Website content published! Saved permanently to Supabase cloud database.";
      } else if (res.savedToDisk) {
        toastMsg = "🎉 Website content published! Saved permanently to website files.";
      } else if (res.cloudError) {
        toastMsg = "⚠️ Saved in this browser, but cloud sync is pending: Run supabase_schema.sql in Supabase to sync across all devices.";
        toastType = "warning";
      } else {
        toastMsg = "🎉 Website content published! Changes are active in this browser.";
      }
      showToast(toastMsg, toastType);
    } catch (err) {
      console.error("Error saving CMS content:", err);
      showToast("Failed to save content: " + err.message, "error");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalBtnText;
      }
    }
  });

  // Download Permanent Backup JSON file
  document.getElementById('btnExportCmsJson')?.addEventListener('click', async () => {
    if (!window.siteContentService) return;
    const content = await window.siteContentService.getSiteContent();
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site_content.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded site_content.json backup file.", "info");
  });

  // Reset CMS Defaults
  document.getElementById('btnResetCmsDefaults')?.addEventListener('click', async () => {
    if (!confirm("Are you sure you want to reset all website sections and text back to original medical defaults?")) {
      return;
    }
    if (!window.siteContentService) return;

    try {
      await window.siteContentService.resetSiteContent();
      await populateCmsEditorForm();
      showToast("All website content has been restored to defaults.", "info");
    } catch (err) {
      showToast("Reset failed: " + err.message, "error");
    }
  });

  // Copy Supabase SQL Schema to Clipboard
  document.getElementById('btnCopySqlSchema')?.addEventListener('click', async () => {
    try {
      const res = await fetch('./supabase_schema.sql');
      if (res.ok) {
        const sqlText = await res.text();
        await navigator.clipboard.writeText(sqlText);
        showToast("📋 supabase_schema.sql copied to clipboard! Paste it in Supabase SQL editor.", "success");
      } else {
        throw new Error("Could not load supabase_schema.sql");
      }
    } catch (e) {
      showToast("Please copy supabase_schema.sql from your project folder: " + e.message, "info");
    }
  });
}

/**
 * Populate CMS Content Editor Form with Current Site Content
 */
async function populateCmsEditorForm() {
  if (!window.siteContentService) return;
  const content = await window.siteContentService.getSiteContent();

  // Check Supabase site_content table status and show notice banner if needed
  const sb = window.getSupabase ? window.getSupabase() : null;
  const pendingBanner = document.getElementById('cmsCloudPendingBanner');
  if (sb && pendingBanner) {
    try {
      const { error } = await sb.from('site_content').select('id').limit(1);
      if (error && (error.code === 'PGRST205' || (error.message && error.message.includes('not find')))) {
        pendingBanner.style.display = 'flex';
      } else {
        pendingBanner.style.display = 'none';
      }
    } catch (e) {
      pendingBanner.style.display = 'flex';
    }
  } else if (pendingBanner) {
    pendingBanner.style.display = 'none';
  }

  // Section 1: Doctor Profile & Contact
  setVal('cms_doctor_name', content.doctor?.name);
  setVal('cms_doctor_title', content.doctor?.title);
  setVal('cms_doctor_degrees', content.doctor?.degrees);
  setVal('cms_doctor_bmdc_reg', content.doctor?.bmdc_reg);
  setVal('cms_doctor_primary_phone', content.doctor?.primary_phone);
  setVal('cms_doctor_alt_phone', content.doctor?.alt_phone);
  setVal('cms_doctor_email', content.doctor?.email);
  setVal('cms_doctor_emergency_hotline', content.doctor?.emergency_hotline);

  // Section 2: Homepage Hero
  setVal('cms_hero_pill_text', content.hero?.pill_text);
  setVal('cms_hero_title_main', content.hero?.title_main);
  setVal('cms_hero_title_highlight', content.hero?.title_highlight);
  setVal('cms_hero_subtitle', content.hero?.subtitle);
  setVal('cms_hero_stat1_num', content.hero?.stat1_num);
  setVal('cms_hero_stat1_label', content.hero?.stat1_label);
  setVal('cms_hero_stat2_num', content.hero?.stat2_num);
  setVal('cms_hero_stat2_label', content.hero?.stat2_label);
  setVal('cms_hero_stat3_num', content.hero?.stat3_num);
  setVal('cms_hero_stat3_label', content.hero?.stat3_label);
  setVal('cms_hero_stat4_num', content.hero?.stat4_num);
  setVal('cms_hero_stat4_label', content.hero?.stat4_label);

  // Section 3: About Page
  setVal('cms_about_banner_tag', content.about?.banner_tag);
  setVal('cms_about_bio_heading', content.about?.bio_heading);
  setVal('cms_about_bio_p1', content.about?.bio_p1);
  setVal('cms_about_bio_p2', content.about?.bio_p2);
  setVal('cms_about_bio_p3', content.about?.bio_p3);
  setVal('cms_about_pillar1_title', content.about?.pillar1_title);
  setVal('cms_about_pillar1_desc', content.about?.pillar1_desc);
  setVal('cms_about_pillar2_title', content.about?.pillar2_title);
  setVal('cms_about_pillar2_desc', content.about?.pillar2_desc);

  // Section 4: Main Headlines & Page Banners
  setVal('cms_specialties_title', content.specialties?.title);
  setVal('cms_specialties_tag', content.specialties?.tag);
  setVal('cms_specialties_desc', content.specialties?.desc);

  setVal('cms_credentials_title', content.credentials?.title);
  setVal('cms_credentials_tag', content.credentials?.tag);
  setVal('cms_credentials_desc', content.credentials?.desc);

  setVal('cms_appointment_title', content.appointment?.title);
  setVal('cms_appointment_tag', content.appointment?.tag);
  setVal('cms_appointment_subtitle', content.appointment?.subtitle);

  setVal('cms_services_banner_title', content.services?.banner_title);
  setVal('cms_services_banner_tag', content.services?.banner_tag);
  setVal('cms_services_banner_desc', content.services?.banner_desc);

  setVal('cms_chambers_banner_title', content.chambers_page?.banner_title);
  setVal('cms_chambers_banner_tag', content.chambers_page?.banner_tag);
  setVal('cms_chambers_banner_desc', content.chambers_page?.banner_desc);

  // Section 5: Dynamic Chambers List (Add / Remove)
  renderCmsChambersList(window.siteContentService.getChambersList(content));

  // Section 6: Footer
  setVal('cms_footer_about_text', content.footer?.about_text);
  setVal('cms_footer_copyright_text', content.footer?.copyright_text);
}

/**
 * Render all chambers dynamically into Section 5
 */
function renderCmsChambersList(chambersList) {
  const container = document.getElementById('cmsChambersContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(chambersList) || chambersList.length === 0) {
    chambersList = [{
      name: 'Dinajpur Medical College, Hospital',
      badge: 'Primary Hospital & Chamber',
      phone: '+880 1700-000000',
      address: 'Department of Obstetrics & Gynecology, Dinajpur Medical College, Hospital, Dinajpur',
      days: 'Saturday – Thursday',
      hours: '9:00 AM – 2:30 PM & Evening Chamber'
    }];
  }

  chambersList.forEach((ch, idx) => {
    const cardEl = createCmsChamberCardElement(ch, idx, chambersList.length);
    container.appendChild(cardEl);
  });
}

/**
 * Create a single chamber card DOM element with inputs and Remove button
 */
function createCmsChamberCardElement(ch, idx, totalCount) {
  const card = document.createElement('div');
  card.className = 'cms-chamber-card';
  card.setAttribute('data-chamber-index', idx);
  card.style.cssText = 'background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-sm); transition: all 0.2s ease;';

  const escapeFn = window.siteContentService ? window.siteContentService.escapeHtml : (str => str || '');

  card.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--slate-100); padding-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
      <div style="display: flex; align-items: center; gap: 0.65rem; flex: 1; min-width: 260px;">
        <span class="chamber-index-badge" style="font-weight: 700; color: var(--primary); font-size: 0.95rem; background: var(--primary-light); padding: 0.25rem 0.6rem; border-radius: var(--radius-sm);">
          Chamber ${idx + 1}
        </span>
        <input type="text" class="chamber-badge-input form-control form-control-sm" 
               value="${escapeFn(ch.badge || (idx === 0 ? 'Primary Hospital & Chamber' : 'Visiting Chamber'))}" 
               placeholder="Chamber Badge (e.g. Primary Chamber, Evening Clinic)" 
               style="font-size: 0.825rem; max-width: 250px; height: 32px; font-weight: 600;">
      </div>
      <button type="button" class="btn btn-ghost btn-sm btn-remove-chamber" 
              style="color: #EF4444; border: 1px solid #FEE2E2; background: #FEF2F2; padding: 0.35rem 0.75rem; font-size: 0.825rem; display: flex; align-items: center; gap: 0.35rem; border-radius: var(--radius-sm);" 
              title="Remove this chamber location">
        <span>🗑️</span> Remove Chamber
      </button>
    </div>

    <div class="form-row form-row-2">
      <div class="form-group">
        <label class="form-label" style="font-weight: 600;">Hospital / Center Name <span style="color: var(--primary);">*</span></label>
        <input type="text" class="chamber-name-input form-control" 
               value="${escapeFn(ch.name || '')}" 
               placeholder="e.g. Dinajpur Medical College, Hospital" required>
      </div>
      <div class="form-group">
        <label class="form-label">Serial Desk Phone</label>
        <input type="text" class="chamber-phone-input form-control" 
               value="${escapeFn(ch.phone || '')}" 
               placeholder="e.g. +880 1700-000000">
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Address &amp; Room Details</label>
      <input type="text" class="chamber-address-input form-control" 
             value="${escapeFn(ch.address || '')}" 
             placeholder="e.g. Department of Obstetrics &amp; Gynecology, Dinajpur Medical College, Hospital, Dinajpur">
    </div>

    <div class="form-row form-row-2">
      <div class="form-group">
        <label class="form-label">Visiting Days</label>
        <input type="text" class="chamber-days-input form-control" 
               value="${escapeFn(ch.days || '')}" 
               placeholder="e.g. Saturday – Thursday">
      </div>
      <div class="form-group">
        <label class="form-label">Consultation Hours</label>
        <input type="text" class="chamber-hours-input form-control" 
               value="${escapeFn(ch.hours || '')}" 
               placeholder="e.g. 9:00 AM – 2:30 PM &amp; Evening Chamber">
      </div>
    </div>
  `;

  // Attach remove handler
  const removeBtn = card.querySelector('.btn-remove-chamber');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      const allCards = document.querySelectorAll('#cmsChambersContainer .cms-chamber-card');
      if (allCards.length <= 1) {
        showToast("At least one chamber location is required for patient consultation scheduling.", "warning");
        return;
      }
      const hospName = card.querySelector('.chamber-name-input')?.value || 'this chamber';
      if (confirm(`Are you sure you want to remove "${hospName}" from chamber locations?`)) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.96)';
        setTimeout(() => {
          card.remove();
          renumberCmsChamberCards();
          showToast("Chamber location removed. Click 'Save & Publish' to update live site.", "info");
        }, 150);
      }
    });
  }

  return card;
}

/**
 * Renumber chamber badges sequentially
 */
function renumberCmsChamberCards() {
  const cards = document.querySelectorAll('#cmsChambersContainer .cms-chamber-card');
  cards.forEach((card, idx) => {
    card.setAttribute('data-chamber-index', idx);
    const badgeSpan = card.querySelector('.chamber-index-badge');
    if (badgeSpan) {
      badgeSpan.textContent = `Chamber ${idx + 1}`;
    }
  });
}

/**
 * Add a new chamber card
 */
function addCmsChamberCard() {
  const container = document.getElementById('cmsChambersContainer');
  if (!container) return;
  const currentCount = container.querySelectorAll('.cms-chamber-card').length;
  const newCardData = {
    name: '',
    badge: currentCount === 0 ? 'Primary Hospital & Chamber' : `Visiting Chamber ${currentCount + 1}`,
    phone: '',
    address: '',
    days: 'Saturday – Thursday',
    hours: '5:00 PM – 9:00 PM'
  };
  const cardEl = createCmsChamberCardElement(newCardData, currentCount, currentCount + 1);
  container.appendChild(cardEl);
  renumberCmsChamberCards();
  const nameInput = cardEl.querySelector('.chamber-name-input');
  if (nameInput) {
    nameInput.focus();
    cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) {
    el.value = val;
  }
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/**
 * Toggle Delivery & Neonatal Fields Visibility
 */
function toggleDeliveryFields() {
  const proc = document.getElementById('formProcedureType')?.value || '';
  const category = document.getElementById('formCategory')?.value || '';
  const deliverySection = document.getElementById('deliveryFieldsSection');

  const isDelivery = category === 'Obstetric' || 
                     proc.includes('Delivery') || 
                     proc.includes('Cesarean') || 
                     proc.includes('LSCS') || 
                     proc.includes('Birth');

  if (deliverySection) {
    deliverySection.style.display = isDelivery ? 'block' : 'none';
  }
}

/**
 * Toggle Complication Details field
 */
function toggleComplicationField() {
  const outcome = document.getElementById('formOutcome')?.value;
  const compBox = document.getElementById('complicationDetailsGroup');
  const compInput = document.getElementById('formComplicationDetails');

  if (compBox) {
    if (outcome === 'Complication') {
      compBox.style.display = 'block';
      if (compInput) compInput.setAttribute('required', 'required');
    } else {
      compBox.style.display = 'none';
      if (compInput) compInput.removeAttribute('required');
    }
  }
}

/**
 * Open Modal to Add a Surgery
 */
function openAddSurgeryModal() {
  editingRecordId = null;
  const form = document.getElementById('surgeryForm');
  form.reset();

  document.getElementById('surgeryModalTitle').textContent = 'Add Surgical Procedure Note';
  document.getElementById('surgeryModalSubmitBtn').textContent = 'Save Surgical Record';

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  document.getElementById('formSurgeryDate').value = today;
  document.getElementById('formSurgeryTime').value = timeStr;
  document.getElementById('formCaseId').value = window.dbService.generateNextCaseId(allSurgeries);
  document.getElementById('formCategory').value = 'Obstetric';
  document.getElementById('formProcedureType').value = 'Cesarean Section (LSCS)';
  document.getElementById('formUrgency').value = 'Elective';
  document.getElementById('formAnesthesia').value = 'Spinal';
  document.getElementById('formOutcome').value = 'Successful';
  document.getElementById('formHospitalName').value = 'Dinajpur Medical College, Hospital';

  toggleDeliveryFields();
  toggleComplicationField();

  openModal('surgeryModal');
}

/**
 * Open Modal to Edit an Existing Surgery
 */
function openEditSurgeryModal(id) {
  const record = allSurgeries.find(item => item.id === id);
  if (!record) return;

  editingRecordId = id;
  document.getElementById('surgeryModalTitle').textContent = 'Edit Surgical Procedure Note';
  document.getElementById('surgeryModalSubmitBtn').textContent = 'Update Surgical Record';

  document.getElementById('formCaseId').value = record.case_id || '';
  document.getElementById('formSurgeryDate').value = record.surgery_date || '';
  document.getElementById('formSurgeryTime').value = record.surgery_time ? record.surgery_time.substring(0, 5) : '';
  document.getElementById('formProcedureType').value = record.procedure_type || '';
  document.getElementById('formCategory').value = record.category || 'Obstetric';
  document.getElementById('formUrgency').value = record.urgency || 'Elective';
  document.getElementById('formAnesthesia').value = record.anesthesia_type || 'Spinal';
  document.getElementById('formDuration').value = record.duration_minutes || '';
  document.getElementById('formOutcome').value = record.outcome || 'Successful';
  document.getElementById('formComplicationDetails').value = record.complication_details || '';
  document.getElementById('formHospitalName').value = record.hospital_name || '';
  document.getElementById('formNotes').value = record.notes || '';

  document.getElementById('formBabyCount').value = record.baby_count || 1;
  document.getElementById('formBabyGender').value = record.baby_gender || '';
  document.getElementById('formBirthWeight').value = record.birth_weight_kg || '';
  document.getElementById('formApgarScore').value = record.apgar_score || '';
  document.getElementById('formMotherAgeGroup').value = record.mother_age_group || '';
  document.getElementById('formPreviousCSections').value = record.previous_c_sections !== undefined ? record.previous_c_sections : 0;

  toggleDeliveryFields();
  toggleComplicationField();

  openModal('surgeryModal');
}

/**
 * Handle Add/Edit Surgery Form Submission
 */
async function handleSurgeryFormSubmit(e) {
  e.preventDefault();

  const caseId = document.getElementById('formCaseId').value.trim();
  const surgeryDate = document.getElementById('formSurgeryDate').value;
  const surgeryTime = document.getElementById('formSurgeryTime').value;
  const procedureType = document.getElementById('formProcedureType').value;
  const category = document.getElementById('formCategory').value;
  const urgency = document.getElementById('formUrgency').value;
  const anesthesiaType = document.getElementById('formAnesthesia').value;
  const duration = document.getElementById('formDuration').value;
  const outcome = document.getElementById('formOutcome').value;
  const complicationDetails = document.getElementById('formComplicationDetails').value.trim();
  const hospitalName = document.getElementById('formHospitalName').value.trim();
  const notes = document.getElementById('formNotes').value.trim();

  const babyCount = document.getElementById('formBabyCount').value;
  const babyGender = document.getElementById('formBabyGender').value;
  const birthWeight = document.getElementById('formBirthWeight').value;
  const apgarScore = document.getElementById('formApgarScore').value.trim();
  const motherAgeGroup = document.getElementById('formMotherAgeGroup').value;
  const previousCSections = document.getElementById('formPreviousCSections').value;

  if (!caseId || !surgeryDate || !procedureType || !category || !urgency || !hospitalName) {
    showToast("Please fill in all mandatory fields.", "error");
    return;
  }

  const payload = {
    case_id: caseId,
    surgery_date: surgeryDate,
    surgery_time: surgeryTime || null,
    procedure_type: procedureType,
    category: category,
    urgency: urgency,
    anesthesia_type: anesthesiaType,
    duration_minutes: duration ? parseInt(duration, 10) : null,
    outcome: outcome,
    complication_details: outcome === 'Complication' ? complicationDetails : '',
    hospital_name: hospitalName,
    notes: notes,
    baby_count: babyCount ? parseInt(babyCount, 10) : null,
    baby_gender: babyGender || null,
    birth_weight_kg: birthWeight ? parseFloat(birthWeight) : null,
    apgar_score: apgarScore || null,
    mother_age_group: motherAgeGroup || null,
    previous_c_sections: previousCSections ? parseInt(previousCSections, 10) : 0
  };

  const submitBtn = document.getElementById('surgeryModalSubmitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    if (editingRecordId) {
      const res = await window.dbService.updateSurgery(editingRecordId, payload);
      if (res.error) throw res.error;
      showToast("Surgical note updated successfully.", "success");
    } else {
      const res = await window.dbService.addSurgery(payload);
      if (res.error) throw res.error;
      showToast("New surgical note reserved successfully.", "success");
    }

    closeModal('surgeryModal');
    await loadDashboardData();
  } catch (err) {
    console.error("Save surgery error:", err);
    showToast("Failed to save: " + err.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingRecordId ? 'Update Surgical Record' : 'Save Surgical Record';
  }
}

/**
 * View Surgical Note Details Modal
 */
function viewSurgeryDetails(id) {
  const record = allSurgeries.find(item => item.id === id);
  if (!record) return;

  const contentEl = document.getElementById('surgeryDetailsContent');
  if (!contentEl) return;

  const isDelivery = record.category === 'Obstetric' || 
                     record.procedure_type.includes('Delivery') || 
                     record.procedure_type.includes('LSCS') || 
                     record.procedure_type.includes('Cesarean');

  contentEl.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--slate-200);">
      <div>
        <span class="case-id-badge" style="font-size: 1rem; padding: 0.35rem 0.75rem;">${escapeHtml(record.case_id)}</span>
        <h3 style="font-size: 1.35rem; color: var(--slate-900); margin-top: 0.5rem; font-weight: 800;">
          ${escapeHtml(record.procedure_type)}
        </h3>
        <div style="font-size: 0.85rem; color: var(--slate-500); margin-top: 0.25rem;">
          🏥 ${escapeHtml(record.hospital_name)} • 📅 ${formatDate(record.surgery_date)} at ${record.surgery_time ? formatTime(record.surgery_time) : 'N/A'}
        </div>
      </div>
      <div>
        <span class="badge ${record.outcome === 'Successful' ? 'badge-success' : (record.outcome === 'Complication' ? 'badge-warning' : 'badge-purple')}" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
          ${escapeHtml(record.outcome)}
        </span>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
      <div style="background: var(--slate-50); padding: 0.85rem; border-radius: var(--radius-md);">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--slate-500); font-weight: 600;">Category</div>
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--slate-800); margin-top: 0.2rem;">${escapeHtml(record.category)}</div>
      </div>
      <div style="background: var(--slate-50); padding: 0.85rem; border-radius: var(--radius-md);">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--slate-500); font-weight: 600;">Urgency</div>
        <div style="font-size: 0.95rem; font-weight: 700; color: ${record.urgency === 'Emergency' ? '#DC2626' : '#0E7490'}; margin-top: 0.2rem;">${escapeHtml(record.urgency)}</div>
      </div>
      <div style="background: var(--slate-50); padding: 0.85rem; border-radius: var(--radius-md);">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--slate-500); font-weight: 600;">Anesthesia</div>
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--slate-800); margin-top: 0.2rem;">${escapeHtml(record.anesthesia_type || 'N/A')}</div>
      </div>
      <div style="background: var(--slate-50); padding: 0.85rem; border-radius: var(--radius-md);">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--slate-500); font-weight: 600;">Duration</div>
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--slate-800); margin-top: 0.2rem;">${record.duration_minutes ? record.duration_minutes + ' minutes' : 'N/A'}</div>
      </div>
    </div>

    ${record.outcome === 'Complication' && record.complication_details ? `
      <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem;">
        <div style="font-weight: 700; color: #B45309; font-size: 0.9rem; margin-bottom: 0.25rem;">⚠️ Complication Details & Management</div>
        <div style="font-size: 0.875rem; color: #92400E;">${escapeHtml(record.complication_details)}</div>
      </div>
    ` : ''}

    ${isDelivery ? `
      <div style="background: #FDF2F4; border: 1px solid var(--primary-subtle); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="font-weight: 700; color: var(--primary); font-size: 0.95rem; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.4rem;">
          👶 Delivery & Neonatal Clinical Metrics
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.85rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">Number of Babies</div>
            <div style="font-weight: 700; color: var(--slate-900);">${record.baby_count || 1}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">Baby Gender</div>
            <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(record.baby_gender || 'N/A')}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">Birth Weight</div>
            <div style="font-weight: 700; color: var(--slate-900);">${record.birth_weight_kg ? record.birth_weight_kg + ' kg' : 'N/A'}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">Apgar Score (1m / 5m)</div>
            <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(record.apgar_score || 'N/A')}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">Maternal Age Group</div>
            <div style="font-weight: 700; color: var(--slate-900);">${escapeHtml(record.mother_age_group || 'N/A')}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--slate-500); font-weight: 600;">Previous C-Sections</div>
            <div style="font-weight: 700; color: var(--slate-900);">${record.previous_c_sections !== undefined ? record.previous_c_sections : 0}</div>
          </div>
        </div>
      </div>
    ` : ''}

    <div style="margin-bottom: 1.5rem;">
      <div style="font-size: 0.85rem; font-weight: 700; color: var(--slate-800); margin-bottom: 0.5rem;">
        📝 Surgeon's Operative Notes & Findings
      </div>
      <div style="background: var(--white); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; font-size: 0.9rem; color: var(--slate-700); line-height: 1.6; white-space: pre-wrap;">
        ${record.notes ? escapeHtml(record.notes) : '<em style="color: var(--slate-400);">No specific operative notes recorded for this case.</em>'}
      </div>
    </div>

    <div style="font-size: 0.75rem; color: var(--slate-400); text-align: center; border-top: 1px dashed var(--slate-200); padding-top: 0.75rem;">
      🔒 Strictly De-identified Medical Record. Preserved in Dr. Rabeya Basri's Clinical Archive.
    </div>
  `;

  openModal('detailsModal');
}

/**
 * Confirm and Execute Surgery Deletion
 */
function confirmDeleteSurgery(id) {
  deletingRecordId = id;
  const record = allSurgeries.find(item => item.id === id);
  if (!record) return;

  const targetEl = document.getElementById('deleteTargetCaseId');
  if (targetEl) targetEl.textContent = `${record.case_id} (${record.procedure_type})`;

  openModal('deleteModal');
}

async function executeDeleteSurgery() {
  if (!deletingRecordId) return;

  const btn = document.getElementById('btnExecuteDelete');
  btn.disabled = true;
  btn.textContent = 'Deleting...';

  try {
    const res = await window.dbService.deleteSurgery(deletingRecordId);
    if (res.error) throw res.error;

    showToast("Surgery record deleted successfully.", "success");
    closeModal('deleteModal');
    await loadDashboardData();
  } catch (err) {
    console.error("Delete error:", err);
    showToast("Failed to delete record: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = 'Yes, Delete Record';
    deletingRecordId = null;
  }
}

/**
 * Appointment Actions
 */
async function updateAppointmentStatusAction(id, newStatus) {
  try {
    const res = await window.dbService.updateAppointmentStatus(id, newStatus);
    if (res.error) throw res.error;

    showToast(`Appointment marked as ${newStatus}.`, "success");
    allAppointments = await window.dbService.fetchAppointments();
    renderAppointmentsTable();
    updateStatsCards();
  } catch (err) {
    showToast("Error updating status: " + err.message, "error");
  }
}

async function deleteAppointmentAction(id) {
  if (!confirm("Are you sure you want to remove this appointment request?")) return;

  try {
    const res = await window.dbService.deleteAppointment(id);
    if (res.error) throw res.error;

    showToast("Appointment deleted.", "success");
    allAppointments = await window.dbService.fetchAppointments();
    renderAppointmentsTable();
    updateStatsCards();
  } catch (err) {
    showToast("Error deleting appointment: " + err.message, "error");
  }
}

/**
 * Supabase Config Modal
 */
function openSupabaseConfigModal() {
  document.getElementById('cfgSupabaseUrl').value = window.APP_CONFIG.SUPABASE_URL.includes('YOUR_SUPABASE') ? '' : window.APP_CONFIG.SUPABASE_URL;
  document.getElementById('cfgSupabaseAnonKey').value = window.APP_CONFIG.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE') ? '' : window.APP_CONFIG.SUPABASE_ANON_KEY;
  openModal('supabaseConfigModal');
}

function handleSupabaseConfigSubmit(e) {
  e.preventDefault();
  const url = document.getElementById('cfgSupabaseUrl').value.trim();
  const key = document.getElementById('cfgSupabaseAnonKey').value.trim();

  if (!url || !key) {
    showToast("Please provide both Supabase URL and Anon Key.", "error");
    return;
  }

  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_anon_key', key);
  window.APP_CONFIG.SUPABASE_URL = url;
  window.APP_CONFIG.SUPABASE_ANON_KEY = key;

  showToast("Supabase credentials saved in browser! Reloading...", "success");
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

/**
 * Modal Utilities
 */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * Toast Notifications Helper
 */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showLoadingSpinner(show) {
  const spinner = document.getElementById('tableLoadingIndicator');
  if (spinner) spinner.style.display = show ? 'block' : 'none';
}

/**
 * Format Helpers
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
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

// Global exposure for inline HTML event handlers
window.viewSurgeryDetails = viewSurgeryDetails;
window.openEditSurgeryModal = openEditSurgeryModal;
window.confirmDeleteSurgery = confirmDeleteSurgery;
window.updateAppointmentStatusAction = updateAppointmentStatusAction;
window.deleteAppointmentAction = deleteAppointmentAction;
