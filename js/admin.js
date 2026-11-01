// ==========================================================================
// KISII TEACHING & REFERRAL HOSPITAL (KTRH) — ADMIN DASHBOARD CONTROLLER
// ==========================================================================

const ADMIN_PASSCODE_KEY = 'ktrh_admin_passcode';
const ADMIN_SESSION_KEY = 'ktrh_admin_authenticated';
const DEFAULT_PASSCODE = 'ktrh2026';

let currentTab = 'overview';

document.addEventListener('DOMContentLoaded', function() {
    initAdminAuth();
    initTabNavigation();
    setupFormListeners();
    setupSearchListeners();
});

// Real-time update listener from Central Store
window.addEventListener('ktrh_data_updated', function(e) {
    updateOverviewCounters();
    renderCurrentTab();
});

// --------------------------------------------------------------------------
// 1. AUTHENTICATION & SESSION
// --------------------------------------------------------------------------
function initAdminAuth() {
    const authOverlay = document.getElementById('authOverlay');
    const adminLayout = document.getElementById('adminLayout');
    const loginForm = document.getElementById('adminLoginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    // Check if authenticated in current browser session
    const isAuth = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (isAuth === 'true') {
        authOverlay.style.display = 'none';
        adminLayout.style.display = 'flex';
        loadDashboardData();
    } else {
        authOverlay.style.display = 'flex';
        adminLayout.style.display = 'none';
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const inputPass = document.getElementById('adminPassword').value;
        const validPass = localStorage.getItem(ADMIN_PASSCODE_KEY) || DEFAULT_PASSCODE;

        if (inputPass === validPass) {
            sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
            authOverlay.style.display = 'none';
            adminLayout.style.display = 'flex';
            loginError.style.display = 'none';
            loadDashboardData();
            showToast('Welcome to KTRH Hospital Administration Center', 'success');
        } else {
            loginError.style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to log out of KTRH Admin Portal?')) {
            sessionStorage.removeItem(ADMIN_SESSION_KEY);
            location.reload();
        }
    });
}

// --------------------------------------------------------------------------
// 2. TAB NAVIGATION
// --------------------------------------------------------------------------
function initTabNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

window.switchTab = function(tabName) {
    currentTab = tabName;

    // Update active nav item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });

    // Update active pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `pane-${tabName}`);
    });

    // Update Header Title
    const titles = {
        'overview': ['Dashboard Overview', 'Real-time control center for Kisii Teaching & Referral Hospital portal'],
        'doctors': ['Doctors & Specialists', 'Manage hospital physicians, clinical qualifications, and consultation schedules'],
        'projects': ['Projects & Modernization', 'Track hospital infrastructure developments, progress milestones, and budgets'],
        'services': ['Clinical Services Catalog', 'Manage specialized clinics, diagnostics, and patient treatment offerings'],
        'departments': ['Hospital Departments', 'Manage clinical, diagnostic, and administrative divisions and heads of departments'],
        'careers': ['Careers & Recruitment', 'Post job vacancies, specify requirements, and review incoming applications'],
        'gallery': ['Media & Photo Gallery', 'Upload facility photos, outreach pictures, and video walk-throughs'],
        'appointments': ['Patient Appointments', 'Review and process incoming patient scheduling requests'],
        'inquiries': ['Patient Messages & Feedback', 'View and respond to inquiries received from public contact forms'],
        'backup': ['Data Backup & Settings', 'Export database snapshots, restore from JSON, or reset default data']
    };

    if (titles[tabName]) {
        document.getElementById('pageTitle').textContent = titles[tabName][0];
        document.getElementById('pageSubtitle').textContent = titles[tabName][1];
    }

    renderCurrentTab();
};

function renderCurrentTab() {
    switch (currentTab) {
        case 'overview':
            renderOverview();
            break;
        case 'doctors':
            renderDoctorsTable();
            break;
        case 'projects':
            renderProjectsTable();
            break;
        case 'services':
            renderServicesTable();
            break;
        case 'departments':
            renderDepartmentsTable();
            break;
        case 'careers':
            renderJobsTable();
            break;
        case 'gallery':
            renderGalleryGrid();
            break;
        case 'appointments':
            renderAppointmentsTable();
            break;
        case 'inquiries':
            renderInquiriesTable();
            break;
    }
}

function loadDashboardData() {
    updateOverviewCounters();
    renderOverview();
}

// --------------------------------------------------------------------------
// 3. OVERVIEW TAB
// --------------------------------------------------------------------------
function updateOverviewCounters() {
    if (!window.KTRHStore) return;

    const doctors = window.KTRHStore.getDoctors();
    const projects = window.KTRHStore.getProjects();
    const jobs = window.KTRHStore.getJobs().filter(j => j.isActive !== false);
    const gallery = window.KTRHStore.getGallery();
    const appointments = window.KTRHStore.getAppointments();
    const inquiries = window.KTRHStore.getContactMessages();

    const pendingAppts = appointments.filter(a => a.status === 'Pending').length;
    const unreadMsgs = inquiries.filter(m => m.status === 'Unread').length;

    // Badges in sidebar
    const badgeAppt = document.getElementById('badgeAppointments');
    const badgeInq = document.getElementById('badgeInquiries');
    if (badgeAppt) {
        badgeAppt.textContent = pendingAppts;
        badgeAppt.style.display = pendingAppts > 0 ? 'inline-block' : 'none';
    }
    if (badgeInq) {
        badgeInq.textContent = unreadMsgs;
        badgeInq.style.display = unreadMsgs > 0 ? 'inline-block' : 'none';
    }

    // Stat cards in overview
    setElText('statDoctorsCount', doctors.length);
    setElText('statProjectsCount', projects.length);
    setElText('statJobsCount', jobs.length);
    setElText('statGalleryCount', gallery.length);
    setElText('statAppointmentsCount', appointments.length);
    setElText('statInquiriesCount', inquiries.length);
}

function renderOverview() {
    updateOverviewCounters();
    const appointments = window.KTRHStore ? window.KTRHStore.getAppointments() : [];
    const tbody = document.getElementById('overviewRecentAppointments');
    if (!tbody) return;

    if (appointments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:30px;">No patient bookings logged yet.</td></tr>`;
        return;
    }

    const recents = appointments.slice(0, 5);
    tbody.innerHTML = recents.map(a => {
        const statusClass = a.status ? a.status.toLowerCase() : 'pending';
        return `
            <tr>
                <td><strong>${a.refNumber || 'N/A'}</strong></td>
                <td>${a.fullName}</td>
                <td>${capitalize(a.department || 'General')}</td>
                <td>${a.date} at ${a.time}</td>
                <td><span class="status-pill status-${statusClass}">${a.status || 'Pending'}</span></td>
            </tr>
        `;
    }).join('');
}

// --------------------------------------------------------------------------
// 4. DOCTORS MANAGEMENT
// --------------------------------------------------------------------------
function renderDoctorsTable(searchTerm = '') {
    const tbody = document.getElementById('doctorsTableBody');
    if (!tbody || !window.KTRHStore) return;

    let doctors = window.KTRHStore.getDoctors();
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        doctors = doctors.filter(d => 
            (d.name && d.name.toLowerCase().includes(term)) ||
            (d.specialty && d.specialty.toLowerCase().includes(term)) ||
            (d.department && d.department.toLowerCase().includes(term))
        );
    }

    if (doctors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No doctors found. Click "Add New Doctor" to create one.</td></tr>`;
        return;
    }

    tbody.innerHTML = doctors.map(doc => {
        return `
            <tr>
                <td><img src="${doc.image || 'img/drondari.png'}" class="table-thumb" alt="${doc.name}" onerror="this.src='img/drondari.png'"></td>
                <td><strong>${doc.name}</strong><br><small style="color:#64748b;">${doc.title || ''}</small></td>
                <td>${capitalize(doc.department || 'General')}</td>
                <td>${doc.specialty || '-'}</td>
                <td>${doc.experience || '-'}</td>
                <td>${doc.is_featured ? '<span style="color:#10b981;"><i class="fas fa-check-circle"></i> Yes</span>' : '<span style="color:#94a3b8;">No</span>'}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-edit" onclick="openEditDoctorModal('${doc.id}')" title="Edit Doctor"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn btn-delete" onclick="confirmDeleteDoctor('${doc.id}')" title="Delete Doctor"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openAddDoctorModal = function() {
    document.getElementById('modalDoctorTitle').textContent = 'Add New Doctor Profile';
    document.getElementById('formDoctor').reset();
    document.getElementById('doctorId').value = '';
    document.getElementById('docImagePreview').innerHTML = '';
    openAdminModal('modalDoctor');
};

window.openEditDoctorModal = function(id) {
    const doc = window.KTRHStore.getById('doctors', id);
    if (!doc) return;

    document.getElementById('modalDoctorTitle').textContent = 'Edit Doctor Profile';
    document.getElementById('doctorId').value = doc.id;
    document.getElementById('docName').value = doc.name || '';
    document.getElementById('docTitle').value = doc.title || '';
    document.getElementById('docDepartment').value = (doc.department || 'cardiology').toLowerCase();
    document.getElementById('docSpecialty').value = doc.specialty || '';
    document.getElementById('docExperience').value = doc.experience || '';
    document.getElementById('docHours').value = doc.consultationHours || '';
    document.getElementById('docImage').value = doc.image || '';
    document.getElementById('docQualifications').value = Array.isArray(doc.qualifications) ? doc.qualifications.join(', ') : (doc.qualifications || '');
    document.getElementById('docBio').value = doc.bio || '';
    document.getElementById('docEmail').value = doc.email || '';
    document.getElementById('docPhone').value = doc.phone || '';
    document.getElementById('docFeatured').checked = !!doc.is_featured;

    if (doc.image) {
        document.getElementById('docImagePreview').innerHTML = `<img src="${doc.image}">`;
    } else {
        document.getElementById('docImagePreview').innerHTML = '';
    }

    openAdminModal('modalDoctor');
};

window.confirmDeleteDoctor = function(id) {
    const doc = window.KTRHStore.getById('doctors', id);
    if (!doc) return;
    if (confirm(`Are you sure you want to remove ${doc.name} from the medical directory?`)) {
        window.KTRHStore.delete('doctors', id);
        showToast(`Doctor ${doc.name} deleted successfully`, 'success');
        renderDoctorsTable();
    }
};

// --------------------------------------------------------------------------
// 5. PROJECTS MANAGEMENT
// --------------------------------------------------------------------------
function renderProjectsTable(searchTerm = '') {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody || !window.KTRHStore) return;

    let projects = window.KTRHStore.getProjects();
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        projects = projects.filter(p => 
            (p.title && p.title.toLowerCase().includes(term)) ||
            (p.category && p.category.toLowerCase().includes(term)) ||
            (p.contractor && p.contractor.toLowerCase().includes(term))
        );
    }

    if (projects.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No projects found. Click "Add New Project" to create one.</td></tr>`;
        return;
    }

    tbody.innerHTML = projects.map(proj => {
        const statusClass = (proj.status || 'ongoing').toLowerCase();
        return `
            <tr>
                <td><img src="${proj.image || 'img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg'}" class="table-thumb" alt="${proj.title}" onerror="this.src='img/about.jpg'"></td>
                <td><strong>${proj.title}</strong><br><small style="color:#64748b;">${proj.location || 'KTRH Main'}</small></td>
                <td>${capitalize(proj.category || 'Infrastructure')}</td>
                <td><span class="status-pill status-${statusClass}">${proj.status || 'Ongoing'}</span></td>
                <td><strong>${proj.progress || 0}%</strong></td>
                <td>${proj.budget || 'County Funded'}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-edit" onclick="openEditProjectModal('${proj.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn btn-delete" onclick="confirmDeleteProject('${proj.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openAddProjectModal = function() {
    document.getElementById('modalProjectTitle').textContent = 'Add Hospital Capital Project';
    document.getElementById('formProject').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('progressValue').textContent = '75';
    document.getElementById('projImagePreview').innerHTML = '';
    openAdminModal('modalProject');
};

window.openEditProjectModal = function(id) {
    const proj = window.KTRHStore.getById('projects', id);
    if (!proj) return;

    document.getElementById('modalProjectTitle').textContent = 'Edit Hospital Project';
    document.getElementById('projectId').value = proj.id;
    document.getElementById('projTitle').value = proj.title || '';
    document.getElementById('projCategory').value = proj.category || 'infrastructure';
    document.getElementById('projStatus').value = proj.status || 'Ongoing';
    document.getElementById('projProgress').value = proj.progress !== undefined ? proj.progress : 50;
    document.getElementById('progressValue').textContent = proj.progress !== undefined ? proj.progress : 50;
    document.getElementById('projBudget').value = proj.budget || '';
    document.getElementById('projStart').value = proj.startDate || '';
    document.getElementById('projEnd').value = proj.endDate || '';
    document.getElementById('projContractor').value = proj.contractor || '';
    document.getElementById('projImage').value = proj.image || '';
    document.getElementById('projDescription').value = proj.shortDescription || '';

    if (proj.image) {
        document.getElementById('projImagePreview').innerHTML = `<img src="${proj.image}">`;
    } else {
        document.getElementById('projImagePreview').innerHTML = '';
    }

    openAdminModal('modalProject');
};

window.confirmDeleteProject = function(id) {
    const proj = window.KTRHStore.getById('projects', id);
    if (!proj) return;
    if (confirm(`Are you sure you want to delete project: "${proj.title}"?`)) {
        window.KTRHStore.delete('projects', id);
        showToast('Project deleted successfully', 'success');
        renderProjectsTable();
    }
};

// --------------------------------------------------------------------------
// 6. SERVICES MANAGEMENT
// --------------------------------------------------------------------------
function renderServicesTable(searchTerm = '') {
    const tbody = document.getElementById('servicesTableBody');
    if (!tbody || !window.KTRHStore) return;

    let services = window.KTRHStore.getServices();
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        services = services.filter(s => 
            (s.title && s.title.toLowerCase().includes(term)) ||
            (s.category && s.category.toLowerCase().includes(term))
        );
    }

    tbody.innerHTML = services.map(srv => {
        return `
            <tr>
                <td><i class="${srv.icon || 'fas fa-hospital'}" style="font-size:1.5rem; color:#1977cc;"></i></td>
                <td><strong>${srv.title}</strong></td>
                <td>${capitalize(srv.category || 'Clinical')}</td>
                <td>${srv.hours || '24/7'}</td>
                <td><small style="color:#64748b;">${srv.short_description ? srv.short_description.slice(0, 80) + '...' : ''}</small></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-edit" onclick="openEditServiceModal('${srv.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn btn-delete" onclick="confirmDeleteService('${srv.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openAddServiceModal = function() {
    document.getElementById('modalServiceTitle').textContent = 'Add Clinical Service';
    document.getElementById('formService').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('srvImagePreview').innerHTML = '';
    openAdminModal('modalService');
};

window.openEditServiceModal = function(id) {
    const srv = window.KTRHStore.getById('services', id);
    if (!srv) return;

    document.getElementById('modalServiceTitle').textContent = 'Edit Clinical Service';
    document.getElementById('serviceId').value = srv.id;
    document.getElementById('srvTitle').value = srv.title || '';
    document.getElementById('srvCategory').value = srv.category || 'clinical';
    document.getElementById('srvIcon').value = srv.icon || 'fas fa-heartbeat';
    document.getElementById('srvHours').value = srv.hours || '';
    document.getElementById('srvImage').value = srv.image || '';
    document.getElementById('srvShortDesc').value = srv.short_description || '';
    document.getElementById('srvFullDesc').value = srv.description || '';

    if (srv.image) {
        document.getElementById('srvImagePreview').innerHTML = `<img src="${srv.image}">`;
    }

    openAdminModal('modalService');
};

window.confirmDeleteService = function(id) {
    const srv = window.KTRHStore.getById('services', id);
    if (!srv) return;
    if (confirm(`Delete service "${srv.title}"?`)) {
        window.KTRHStore.delete('services', id);
        showToast('Service deleted successfully', 'success');
        renderServicesTable();
    }
};

// --------------------------------------------------------------------------
// 7. DEPARTMENTS MANAGEMENT
// --------------------------------------------------------------------------
function renderDepartmentsTable(searchTerm = '') {
    const tbody = document.getElementById('departmentsTableBody');
    if (!tbody || !window.KTRHStore) return;

    let depts = window.KTRHStore.getDepartments();
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        depts = depts.filter(d => 
            (d.name && d.name.toLowerCase().includes(term)) ||
            (d.head_of_department && d.head_of_department.toLowerCase().includes(term))
        );
    }

    tbody.innerHTML = depts.map(dept => {
        return `
            <tr>
                <td><strong>${dept.name}</strong><br><small style="color:#64748b;">${capitalize(dept.category || 'Clinical')}</small></td>
                <td>${dept.head_of_department || 'Assigned'}<br><small style="color:#64748b;">${dept.head_qualification || ''}</small></td>
                <td>Ext: ${dept.extension || '-'}</td>
                <td>${dept.email || 'info@ktrh.or.ke'}</td>
                <td>${dept.location || 'Main Hospital'}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-edit" onclick="openEditDeptModal('${dept.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn btn-delete" onclick="confirmDeleteDept('${dept.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openAddDeptModal = function() {
    document.getElementById('modalDeptTitle').textContent = 'Add Hospital Department';
    document.getElementById('formDept').reset();
    document.getElementById('deptId').value = '';
    document.getElementById('deptImagePreview').innerHTML = '';
    openAdminModal('modalDept');
};

window.openEditDeptModal = function(id) {
    const dept = window.KTRHStore.getById('departments', id);
    if (!dept) return;

    document.getElementById('modalDeptTitle').textContent = 'Edit Hospital Department';
    document.getElementById('deptId').value = dept.id;
    document.getElementById('deptName').value = dept.name || '';
    document.getElementById('deptCategory').value = dept.category || 'clinical';
    document.getElementById('deptHead').value = dept.head_of_department || '';
    document.getElementById('deptQualification').value = dept.head_qualification || '';
    document.getElementById('deptExtension').value = dept.extension || '';
    document.getElementById('deptEmail').value = dept.email || '';
    document.getElementById('deptLocation').value = dept.location || '';
    document.getElementById('deptImage').value = dept.image || '';
    document.getElementById('deptDescription').value = dept.description || '';

    if (dept.image) {
        document.getElementById('deptImagePreview').innerHTML = `<img src="${dept.image}">`;
    }

    openAdminModal('modalDept');
};

window.confirmDeleteDept = function(id) {
    const dept = window.KTRHStore.getById('departments', id);
    if (!dept) return;
    if (confirm(`Delete department "${dept.name}"?`)) {
        window.KTRHStore.delete('departments', id);
        showToast('Department deleted successfully', 'success');
        renderDepartmentsTable();
    }
};

// --------------------------------------------------------------------------
// 8. CAREERS & RECRUITMENT
// --------------------------------------------------------------------------
function renderJobsTable(searchTerm = '') {
    const tbody = document.getElementById('jobsTableBody');
    if (!tbody || !window.KTRHStore) return;

    let jobs = window.KTRHStore.getJobs();
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        jobs = jobs.filter(j => 
            (j.title && j.title.toLowerCase().includes(term)) ||
            (j.department && j.department.toLowerCase().includes(term))
        );
    }

    if (jobs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#94a3b8;">No jobs posted yet. Click "Post New Job Opening" to add vacancies.</td></tr>`;
        return;
    }

    tbody.innerHTML = jobs.map(job => {
        const statusClass = job.isActive !== false ? 'active' : 'closed';
        return `
            <tr>
                <td><strong>${job.title}</strong></td>
                <td>${job.department}</td>
                <td>${job.type || 'Full-Time'}</td>
                <td>${job.deadline || 'Open'}</td>
                <td><span class="status-pill status-${statusClass}">${job.isActive !== false ? 'Active' : 'Closed'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-status" onclick="toggleJobActive('${job.id}')" title="Toggle Active">
                            <i class="fas ${job.isActive !== false ? 'fa-pause' : 'fa-play'}"></i>
                        </button>
                        <button class="action-btn btn-edit" onclick="openEditJobModal('${job.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn btn-delete" onclick="confirmDeleteJob('${job.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.openAddJobModal = function() {
    document.getElementById('modalJobTitle').textContent = 'Post New Job Vacancy';
    document.getElementById('formJob').reset();
    document.getElementById('jobId').value = '';
    openAdminModal('modalJob');
};

window.openEditJobModal = function(id) {
    const job = window.KTRHStore.getById('jobs', id);
    if (!job) return;

    document.getElementById('modalJobTitle').textContent = 'Edit Job Vacancy';
    document.getElementById('jobId').value = job.id;
    document.getElementById('jobTitle').value = job.title || '';
    document.getElementById('jobDepartment').value = job.department || '';
    document.getElementById('jobType').value = job.type || 'Full-Time';
    document.getElementById('jobDeadline').value = job.deadline || '';
    document.getElementById('jobLocation').value = job.location || 'Main Hospital - Kisii';
    document.getElementById('jobDescription').value = job.description || '';
    document.getElementById('jobRequirements').value = Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || '');
    document.getElementById('jobActive').checked = job.isActive !== false;

    openAdminModal('modalJob');
};

window.toggleJobActive = function(id) {
    const job = window.KTRHStore.getById('jobs', id);
    if (!job) return;
    const newState = !(job.isActive !== false);
    window.KTRHStore.update('jobs', id, { isActive: newState });
    showToast(`Vacancy "${job.title}" is now ${newState ? 'Active' : 'Paused'}`, 'success');
    renderJobsTable();
};

window.confirmDeleteJob = function(id) {
    const job = window.KTRHStore.getById('jobs', id);
    if (!job) return;
    if (confirm(`Delete vacancy "${job.title}"?`)) {
        window.KTRHStore.delete('jobs', id);
        showToast('Job opening removed', 'success');
        renderJobsTable();
    }
};

// --------------------------------------------------------------------------
// 9. GALLERY & MEDIA
// --------------------------------------------------------------------------
function renderGalleryGrid(searchTerm = '') {
    const container = document.getElementById('galleryAdminGrid');
    if (!container || !window.KTRHStore) return;

    let items = window.KTRHStore.getGallery();
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        items = items.filter(i => 
            (i.title && i.title.toLowerCase().includes(term)) ||
            (i.category && i.category.toLowerCase().includes(term))
        );
    }

    if (items.length === 0) {
        container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:#94a3b8;">No media items found. Click "Add Media Item" to upload photos.</div>`;
        return;
    }

    container.innerHTML = items.map(item => {
        const isVideo = item.mediaType === 'video';
        const thumb = isVideo ? 'img/about.jpg' : (item.url || 'img/about.jpg');

        return `
            <div class="admin-gallery-card">
                <img src="${thumb}" alt="${item.title}" onerror="this.src='img/about.jpg'">
                <div class="admin-gallery-info">
                    <span class="status-pill status-ongoing">${capitalize(item.category || 'facilities')}</span>
                    <h4 style="margin-top:8px;">${item.title}</h4>
                    <p>${item.description ? item.description.slice(0, 70) + '...' : ''}</p>
                    <div class="admin-gallery-footer">
                        <small style="color:#64748b;"><i class="fas fa-eye"></i> ${item.views || 0} views</small>
                        <button class="action-btn btn-delete" onclick="confirmDeleteGallery('${item.id}')"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.openAddGalleryModal = function() {
    document.getElementById('modalGalleryTitle').textContent = 'Add Media to Hospital Gallery';
    document.getElementById('formGallery').reset();
    document.getElementById('galleryId').value = '';
    document.getElementById('galImagePreview').innerHTML = '';
    openAdminModal('modalGallery');
};

window.toggleMediaTypeInputs = function(type) {
    const label = document.getElementById('labelMediaUrl');
    const fileInput = document.getElementById('galImageFile');
    if (type === 'video') {
        label.textContent = 'YouTube Video Embed / Watch URL';
        if (fileInput) fileInput.style.display = 'none';
    } else {
        label.textContent = 'Image URL / Upload File';
        if (fileInput) fileInput.style.display = 'block';
    }
};

window.confirmDeleteGallery = function(id) {
    const item = window.KTRHStore.getById('gallery', id);
    if (!item) return;
    if (confirm(`Delete media item "${item.title}"?`)) {
        window.KTRHStore.delete('gallery', id);
        showToast('Media item deleted', 'success');
        renderGalleryGrid();
    }
};

// --------------------------------------------------------------------------
// 10. APPOINTMENTS MANAGEMENT
// --------------------------------------------------------------------------
function renderAppointmentsTable(searchTerm = '') {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody || !window.KTRHStore) return;

    let appts = window.KTRHStore.getAppointments();
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        appts = appts.filter(a => 
            (a.fullName && a.fullName.toLowerCase().includes(term)) ||
            (a.phone && a.phone.includes(term)) ||
            (a.refNumber && a.refNumber.toLowerCase().includes(term)) ||
            (a.department && a.department.toLowerCase().includes(term))
        );
    }

    if (appts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#94a3b8;">No appointments submitted yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = appts.map(a => {
        const statusClass = (a.status || 'pending').toLowerCase();

        return `
            <tr>
                <td><strong>${a.refNumber || 'KTRH-N/A'}</strong></td>
                <td><strong>${a.fullName}</strong><br><small style="color:#64748b;">${a.email || ''}</small></td>
                <td><a href="tel:${a.phone}" style="color:#1977cc; font-weight:600;"><i class="fas fa-phone"></i> ${a.phone}</a></td>
                <td>${a.date} <br><small>${a.time}</small></td>
                <td>${capitalize(a.department || 'General')}<br><small style="color:#64748b;">Dr: ${a.doctor || 'Next Available'}</small></td>
                <td><small>${a.symptoms ? a.symptoms.slice(0, 60) + '...' : '-'}</small></td>
                <td><span class="status-pill status-${statusClass}">${a.status || 'Pending'}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn btn-edit" onclick="setAppointmentStatus('${a.id}', 'Confirmed')" title="Confirm Booking"><i class="fas fa-check"></i></button>
                        <button class="action-btn btn-status" onclick="setAppointmentStatus('${a.id}', 'Completed')" title="Mark Completed"><i class="fas fa-check-double"></i></button>
                        <button class="action-btn btn-delete" onclick="setAppointmentStatus('${a.id}', 'Cancelled')" title="Cancel Booking"><i class="fas fa-times"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.setAppointmentStatus = function(id, newStatus) {
    window.KTRHStore.update('appointments', id, { status: newStatus });
    showToast(`Appointment status updated to: ${newStatus}`, 'success');
    renderAppointmentsTable();
    updateOverviewCounters();
};

// --------------------------------------------------------------------------
// 11. INQUIRIES & MESSAGES
// --------------------------------------------------------------------------
function renderInquiriesTable(searchTerm = '') {
    const tbody = document.getElementById('inquiriesTableBody');
    if (!tbody || !window.KTRHStore) return;

    let msgs = window.KTRHStore.getContactMessages();
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        msgs = msgs.filter(m => 
            (m.name && m.name.toLowerCase().includes(term)) ||
            (m.subject && m.subject.toLowerCase().includes(term)) ||
            (m.message && m.message.toLowerCase().includes(term))
        );
    }

    if (msgs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No patient inquiries or messages received.</td></tr>`;
        return;
    }

    tbody.innerHTML = msgs.map(m => {
        const dateStr = m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent';
        const isUnread = m.status === 'Unread';

        return `
            <tr style="${isUnread ? 'font-weight:600; background:#f0fdf4;' : ''}">
                <td>${dateStr}</td>
                <td>${m.name}</td>
                <td>${m.email}<br><small>${m.phone || ''}</small></td>
                <td><strong>${m.subject || 'General'}</strong><br><small style="color:#64748b;">${m.department || ''}</small></td>
                <td><p style="max-width:320px; font-size:0.85rem; line-height:1.4;">${m.message}</p></td>
                <td><span class="status-pill status-${isUnread ? 'pending' : 'read'}">${m.status || 'Read'}</span></td>
                <td>
                    <div class="table-actions">
                        ${isUnread ? `<button class="action-btn btn-edit" onclick="markInquiryRead('${m.id}')" title="Mark as Read"><i class="fas fa-envelope-open"></i></button>` : ''}
                        <button class="action-btn btn-delete" onclick="deleteInquiry('${m.id}')" title="Delete Message"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.markInquiryRead = function(id) {
    window.KTRHStore.update('contactMessages', id, { status: 'Read' });
    showToast('Message marked as read', 'success');
    renderInquiriesTable();
    updateOverviewCounters();
};

window.deleteInquiry = function(id) {
    if (confirm('Delete this message?')) {
        window.KTRHStore.delete('contactMessages', id);
        showToast('Message deleted', 'success');
        renderInquiriesTable();
        updateOverviewCounters();
    }
};

// --------------------------------------------------------------------------
// 12. MODAL FORM SUBMISSIONS (CRUD SAVE HANDLERS)
// --------------------------------------------------------------------------
function setupFormListeners() {
    // 1. Doctor Form
    const formDoc = document.getElementById('formDoctor');
    if (formDoc) {
        formDoc.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('doctorId').value;
            const fileInput = document.getElementById('docImageFile');
            let imgUrl = document.getElementById('docImage').value;

            if (fileInput && fileInput.files[0]) {
                imgUrl = await KTRHDataStore.fileToBase64(fileInput.files[0]);
            }

            const qualStr = document.getElementById('docQualifications').value;
            const qualifications = qualStr ? qualStr.split(',').map(s => s.trim()).filter(Boolean) : [];

            const docData = {
                name: document.getElementById('docName').value,
                title: document.getElementById('docTitle').value,
                department: document.getElementById('docDepartment').value,
                specialty: document.getElementById('docSpecialty').value,
                experience: document.getElementById('docExperience').value,
                consultationHours: document.getElementById('docHours').value,
                image: imgUrl || 'img/drondari.png',
                qualifications: qualifications,
                bio: document.getElementById('docBio').value,
                email: document.getElementById('docEmail').value,
                phone: document.getElementById('docPhone').value,
                is_featured: document.getElementById('docFeatured').checked
            };

            if (id) {
                window.KTRHStore.update('doctors', id, docData);
                showToast('Doctor profile updated in real time!', 'success');
            } else {
                window.KTRHStore.add('doctors', docData);
                showToast('New doctor added successfully!', 'success');
            }

            closeAdminModal('modalDoctor');
            renderDoctorsTable();
        });

        // Doctor Image File Preview
        document.getElementById('docImageFile')?.addEventListener('change', async function() {
            if (this.files[0]) {
                const b64 = await KTRHDataStore.fileToBase64(this.files[0]);
                document.getElementById('docImagePreview').innerHTML = `<img src="${b64}">`;
            }
        });
    }

    // 2. Project Form
    const formProj = document.getElementById('formProject');
    if (formProj) {
        formProj.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('projectId').value;
            const fileInput = document.getElementById('projImageFile');
            let imgUrl = document.getElementById('projImage').value;

            if (fileInput && fileInput.files[0]) {
                imgUrl = await KTRHDataStore.fileToBase64(fileInput.files[0]);
            }

            const projData = {
                title: document.getElementById('projTitle').value,
                category: document.getElementById('projCategory').value,
                status: document.getElementById('projStatus').value,
                progress: parseInt(document.getElementById('projProgress').value) || 0,
                budget: document.getElementById('projBudget').value,
                startDate: document.getElementById('projStart').value,
                endDate: document.getElementById('projEnd').value,
                contractor: document.getElementById('projContractor').value,
                image: imgUrl || 'img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg',
                shortDescription: document.getElementById('projDescription').value
            };

            if (id) {
                window.KTRHStore.update('projects', id, projData);
                showToast('Project updated successfully!', 'success');
            } else {
                window.KTRHStore.add('projects', projData);
                showToast('New capital project registered!', 'success');
            }

            closeAdminModal('modalProject');
            renderProjectsTable();
        });

        document.getElementById('projImageFile')?.addEventListener('change', async function() {
            if (this.files[0]) {
                const b64 = await KTRHDataStore.fileToBase64(this.files[0]);
                document.getElementById('projImagePreview').innerHTML = `<img src="${b64}">`;
            }
        });
    }

    // 3. Job Form
    const formJob = document.getElementById('formJob');
    if (formJob) {
        formJob.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('jobId').value;
            const reqStr = document.getElementById('jobRequirements').value;
            const requirements = reqStr ? reqStr.split('\n').map(s => s.trim()).filter(Boolean) : [];

            const jobData = {
                title: document.getElementById('jobTitle').value,
                department: document.getElementById('jobDepartment').value,
                type: document.getElementById('jobType').value,
                deadline: document.getElementById('jobDeadline').value,
                location: document.getElementById('jobLocation').value,
                description: document.getElementById('jobDescription').value,
                requirements: requirements,
                isActive: document.getElementById('jobActive').checked,
                postedDate: new Date().toISOString().split('T')[0]
            };

            if (id) {
                window.KTRHStore.update('jobs', id, jobData);
                showToast('Vacancy updated!', 'success');
            } else {
                window.KTRHStore.add('jobs', jobData);
                showToast('New job opening published live on portal!', 'success');
            }

            closeAdminModal('modalJob');
            renderJobsTable();
        });
    }

    // 4. Gallery Form
    const formGal = document.getElementById('formGallery');
    if (formGal) {
        formGal.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('galleryId').value;
            const fileInput = document.getElementById('galImageFile');
            let mediaUrl = document.getElementById('galUrl').value;

            if (fileInput && fileInput.files[0]) {
                mediaUrl = await KTRHDataStore.fileToBase64(fileInput.files[0]);
            }

            const galData = {
                title: document.getElementById('galTitle').value,
                category: document.getElementById('galCategory').value,
                mediaType: document.getElementById('galMediaType').value,
                url: mediaUrl || 'img/about.jpg',
                description: document.getElementById('galDescription').value,
                date: new Date().toISOString().split('T')[0],
                views: 0
            };

            if (id) {
                window.KTRHStore.update('gallery', id, galData);
                showToast('Media item updated!', 'success');
            } else {
                window.KTRHStore.add('gallery', galData);
                showToast('Media added to public gallery!', 'success');
            }

            closeAdminModal('modalGallery');
            renderGalleryGrid();
        });

        document.getElementById('galImageFile')?.addEventListener('change', async function() {
            if (this.files[0]) {
                const b64 = await KTRHDataStore.fileToBase64(this.files[0]);
                document.getElementById('galImagePreview').innerHTML = `<img src="${b64}">`;
            }
        });
    }

    // 5. Service Form
    const formSrv = document.getElementById('formService');
    if (formSrv) {
        formSrv.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('serviceId').value;
            const fileInput = document.getElementById('srvImageFile');
            let imgUrl = document.getElementById('srvImage').value;

            if (fileInput && fileInput.files[0]) {
                imgUrl = await KTRHDataStore.fileToBase64(fileInput.files[0]);
            }

            const srvData = {
                title: document.getElementById('srvTitle').value,
                category: document.getElementById('srvCategory').value,
                icon: document.getElementById('srvIcon').value || 'fas fa-hospital',
                hours: document.getElementById('srvHours').value || '24/7',
                image: imgUrl || 'img/imagestheatre.jpg',
                short_description: document.getElementById('srvShortDesc').value,
                description: document.getElementById('srvFullDesc').value || document.getElementById('srvShortDesc').value
            };

            if (id) {
                window.KTRHStore.update('services', id, srvData);
                showToast('Clinical service updated!', 'success');
            } else {
                window.KTRHStore.add('services', srvData);
                showToast('New clinical service added!', 'success');
            }

            closeAdminModal('modalService');
            renderServicesTable();
        });

        document.getElementById('srvImageFile')?.addEventListener('change', async function() {
            if (this.files[0]) {
                const b64 = await KTRHDataStore.fileToBase64(this.files[0]);
                document.getElementById('srvImagePreview').innerHTML = `<img src="${b64}">`;
            }
        });
    }

    // 6. Department Form
    const formDept = document.getElementById('formDept');
    if (formDept) {
        formDept.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = document.getElementById('deptId').value;
            const fileInput = document.getElementById('deptImageFile');
            let imgUrl = document.getElementById('deptImage').value;

            if (fileInput && fileInput.files[0]) {
                imgUrl = await KTRHDataStore.fileToBase64(fileInput.files[0]);
            }

            const deptData = {
                name: document.getElementById('deptName').value,
                category: document.getElementById('deptCategory').value,
                head_of_department: document.getElementById('deptHead').value,
                head_qualification: document.getElementById('deptQualification').value,
                extension: document.getElementById('deptExtension').value,
                email: document.getElementById('deptEmail').value,
                location: document.getElementById('deptLocation').value,
                image: imgUrl || 'img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg',
                description: document.getElementById('deptDescription').value
            };

            if (id) {
                window.KTRHStore.update('departments', id, deptData);
                showToast('Department updated!', 'success');
            } else {
                window.KTRHStore.add('departments', deptData);
                showToast('New hospital department created!', 'success');
            }

            closeAdminModal('modalDept');
            renderDepartmentsTable();
        });

        document.getElementById('deptImageFile')?.addEventListener('change', async function() {
            if (this.files[0]) {
                const b64 = await KTRHDataStore.fileToBase64(this.files[0]);
                document.getElementById('deptImagePreview').innerHTML = `<img src="${b64}">`;
            }
        });
    }

    // Change Password Form
    const changePassForm = document.getElementById('changePasswordForm');
    if (changePassForm) {
        changePassForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newPass = document.getElementById('newAdminPassword').value.trim();
            if (newPass.length < 4) {
                alert('Passcode must be at least 4 characters');
                return;
            }
            localStorage.setItem(ADMIN_PASSCODE_KEY, newPass);
            showToast('Admin passcode updated successfully!', 'success');
            changePassForm.reset();
        });
    }
}

// --------------------------------------------------------------------------
// 13. SEARCH BARS IN ADMIN SECTIONS
// --------------------------------------------------------------------------
function setupSearchListeners() {
    document.getElementById('adminDoctorSearch')?.addEventListener('input', function() {
        renderDoctorsTable(this.value.trim());
    });
    document.getElementById('adminProjectSearch')?.addEventListener('input', function() {
        renderProjectsTable(this.value.trim());
    });
    document.getElementById('adminServiceSearch')?.addEventListener('input', function() {
        renderServicesTable(this.value.trim());
    });
    document.getElementById('adminDeptSearch')?.addEventListener('input', function() {
        renderDepartmentsTable(this.value.trim());
    });
    document.getElementById('adminJobSearch')?.addEventListener('input', function() {
        renderJobsTable(this.value.trim());
    });
    document.getElementById('adminGallerySearch')?.addEventListener('input', function() {
        renderGalleryGrid(this.value.trim());
    });
    document.getElementById('adminApptSearch')?.addEventListener('input', function() {
        renderAppointmentsTable(this.value.trim());
    });
    document.getElementById('adminInquirySearch')?.addEventListener('input', function() {
        renderInquiriesTable(this.value.trim());
    });
}

// --------------------------------------------------------------------------
// 14. DATA BACKUP & RESTORE
// --------------------------------------------------------------------------
window.handleImportJSON = function() {
    const fileInput = document.getElementById('importJsonFileInput');
    if (!fileInput || !fileInput.files[0]) {
        alert('Please choose a .json backup file to upload.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const res = window.KTRHStore.importJSON(content);
        if (res.success) {
            showToast('Hospital database restored successfully from file!', 'success');
            loadDashboardData();
        } else {
            alert('Failed to import JSON: ' + res.error);
        }
    };
    reader.readAsText(file);
};

window.confirmResetDefaults = function() {
    if (confirm('Are you sure you want to restore factory default data? Any custom items added will be replaced by the default hospital dataset.')) {
        window.KTRHStore.resetDefaults();
        showToast('Database reset to official default hospital records', 'success');
        loadDashboardData();
        renderCurrentTab();
    }
};

// --------------------------------------------------------------------------
// 15. UI HELPERS & MODAL CONTROLLERS
// --------------------------------------------------------------------------
window.openAdminModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
};

window.closeAdminModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
};

window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

