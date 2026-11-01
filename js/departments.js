// ==========================================================================
// HOSPITAL DEPARTMENTS — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

// DOM Elements
let departmentsContainer;
let deptSearch;
let filterBtns;
let deptModal;
let modalCloseBtn;
let modalBody;

// State Management
let allDepartments = [];
let displayedDepartments = [];
let currentCategory = 'all';
let currentSearchTerm = '';

document.addEventListener('DOMContentLoaded', function() {
    initDepartmentsPage();
});

// Real-time update listener from Admin Portal
window.addEventListener('ktrh_data_updated', function(e) {
    if (!e.detail?.collection || e.detail.collection === 'departments') {
        loadDepartmentsFromStore();
    }
});

function initDepartmentsPage() {
    departmentsContainer = document.getElementById('departmentsContainer') || document.querySelector('.departments-grid');
    deptSearch = document.getElementById('deptSearch');
    filterBtns = document.querySelectorAll('.dept-filter-btn') || document.querySelectorAll('.filter-btn');
    deptModal = document.getElementById('deptModal');
    modalCloseBtn = document.getElementById('modalClose');
    modalBody = document.getElementById('modalBody');

    setupEventListeners();
    loadDepartmentsFromStore();
}

function loadDepartmentsFromStore() {
    if (window.KTRHStore) {
        allDepartments = window.KTRHStore.getDepartments();
    } else {
        allDepartments = [];
    }

    displayedDepartments = [...allDepartments];
    filterDepartments();
}

function setupEventListeners() {
    // Filter Buttons
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.getAttribute('data-filter') || 'all';
                filterDepartments();
            });
        });
    }

    // Search Input
    if (deptSearch) {
        deptSearch.addEventListener('input', function() {
            currentSearchTerm = this.value.trim().toLowerCase();
            filterDepartments();
        });
    }

    // Modal Close
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeDeptModal);
    }

    if (deptModal) {
        window.addEventListener('click', function(e) {
            if (e.target === deptModal) {
                closeDeptModal();
            }
        });
    }
}

function filterDepartments() {
    displayedDepartments = allDepartments.filter(dept => {
        const matchesCategory = currentCategory === 'all' || 
            (dept.category && dept.category.toLowerCase() === currentCategory.toLowerCase());

        const matchesSearch = !currentSearchTerm || 
            (dept.name && dept.name.toLowerCase().includes(currentSearchTerm)) ||
            (dept.head_of_department && dept.head_of_department.toLowerCase().includes(currentSearchTerm)) ||
            (dept.description && dept.description.toLowerCase().includes(currentSearchTerm));

        return matchesCategory && matchesSearch;
    });

    renderDepartmentsGrid();
}

function renderDepartmentsGrid() {
    if (!departmentsContainer) return;

    if (displayedDepartments.length === 0) {
        departmentsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-hospital" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 15px;"></i>
                <h3 style="color: #2c4964; margin-bottom: 8px;">No Departments Found</h3>
                <p>No hospital departments match your search criteria.</p>
            </div>
        `;
        return;
    }

    departmentsContainer.innerHTML = displayedDepartments.map(dept => {
        const servicesList = Array.isArray(dept.services)
            ? dept.services.slice(0, 4).map(s => `<li>${s}</li>`).join('')
            : `<li>Specialized Clinical Care</li>`;

        const categoryTag = dept.category ? dept.category.charAt(0).toUpperCase() + dept.category.slice(1) : 'Clinical';

        return `
            <div class="department-card ${dept.category || 'clinical'}" id="${dept.slug || dept.id}">
                <div class="dept-header">
                    <div class="dept-icon">
                        <i class="${dept.icon || 'fas fa-hospital'}"></i>
                    </div>
                    <h2>${dept.name}</h2>
                    <span class="dept-tag">${categoryTag}</span>
                </div>
                <div class="dept-content">
                    <div class="dept-image">
                        <img src="${dept.image || 'img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg'}" alt="${dept.name}" loading="lazy" onerror="this.src='img/about.jpg'">
                    </div>
                    <div class="dept-info">
                        <h3>${dept.title || dept.name}</h3>
                        <p class="dept-description">${dept.description || 'Specialized healthcare department at Kisii Teaching & Referral Hospital.'}</p>
                        
                        <div class="dept-services">
                            <h4><i class="fas fa-stethoscope"></i> Services Offered:</h4>
                            <ul>
                                ${servicesList}
                                ${dept.services && dept.services.length > 4 ? '<li>... and more</li>' : ''}
                            </ul>
                        </div>
                        
                        <div class="dept-staff">
                            <h4><i class="fas fa-user-md"></i> Head of Department:</h4>
                            <p><strong>${dept.head_of_department || 'Department Leadership'}</strong>${dept.head_qualification ? ` - ${dept.head_qualification}` : ''}</p>
                        </div>
                        
                        <div class="dept-contact">
                            <h4><i class="fas fa-phone"></i> Contact:</h4>
                            <p>Ext: ${dept.extension || '1000'} | Email: ${dept.email || 'info@ktrh.or.ke'}</p>
                        </div>
                        
                        <div class="dept-actions">
                            <a href="appointment.html?dept=${encodeURIComponent(dept.slug || dept.id)}" class="btn-appointment">
                                <i class="fas fa-calendar-check"></i> Book Appointment
                            </a>
                            <button class="btn-details" onclick="openDeptModal('${dept.id}')">
                                <i class="fas fa-info-circle"></i> View Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.openDeptModal = function(id) {
    const dept = allDepartments.find(d => String(d.id) === String(id));
    if (!dept || !deptModal || !modalBody) return;

    const allServices = Array.isArray(dept.services)
        ? dept.services.map(s => `<li><i class="fas fa-check" style="color: #1977cc; margin-right: 8px;"></i>${s}</li>`).join('')
        : `<li>${dept.services || 'Comprehensive tertiary care services'}</li>`;

    modalBody.innerHTML = `
        <div style="padding: 10px;">
            <div style="height: 240px; overflow: hidden; border-radius: 8px; margin-bottom: 20px;">
                <img src="${dept.image || 'img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg'}" alt="${dept.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='img/about.jpg'">
            </div>
            <h2 style="color: #2c4964; margin-bottom: 10px;">${dept.name}</h2>
            <p style="color: #475569; line-height: 1.7; font-size: 1.05rem; margin-bottom: 20px;">${dept.description || ''}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div><strong>Head of Department:</strong><br>${dept.head_of_department || 'Assigned'}</div>
                <div><strong>Location:</strong><br>${dept.location || 'KTRH Main Complex'}</div>
                <div><strong>Phone Extension:</strong><br>${dept.extension || 'N/A'}</div>
                <div><strong>Email:</strong><br>${dept.email || 'info@ktrh.or.ke'}</div>
            </div>

            <h4 style="color: #2c4964; margin-bottom: 10px;"><i class="fas fa-stethoscope"></i> Complete List of Services</h4>
            <ul style="list-style: none; padding-left: 0; line-height: 2; margin-bottom: 25px;">
                ${allServices}
            </ul>

            <a href="appointment.html?dept=${encodeURIComponent(dept.slug || dept.id)}" class="btn-appointment" style="display: inline-block; padding: 12px 28px; background: #2c4964; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">
                <i class="fas fa-calendar-check"></i> Book Appointment in this Department
            </a>
        </div>
    `;

    deptModal.style.display = 'flex';
};

function closeDeptModal() {
    if (deptModal) {
        deptModal.style.display = 'none';
    }
}
