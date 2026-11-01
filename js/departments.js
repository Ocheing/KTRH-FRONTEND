// ==========================================================================
// HOSPITAL DEPARTMENTS — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

// DOM Elements
let departmentsContainer;
let deptSearchInput;
let deptFilterBtns;
let deptModal;
let deptModalCloseBtn;
let deptModalBody;

// State Management
let allDepartments = [];
let displayedDepartments = [];
let currentDeptCategory = 'all';
let currentDeptSearchTerm = '';

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
    departmentsContainer = document.getElementById('departmentsContainer');
    deptSearchInput = document.getElementById('deptSearch');
    // Use the actual class in HTML — .filter-btn inside .dept-filters
    deptFilterBtns = document.querySelectorAll('.dept-filters .filter-btn');
    deptModal = document.getElementById('deptModal');
    deptModalCloseBtn = document.getElementById('modalClose');
    deptModalBody = document.getElementById('modalBody');

    setupDeptEventListeners();
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

function setupDeptEventListeners() {
    // Filter Buttons
    if (deptFilterBtns && deptFilterBtns.length > 0) {
        deptFilterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                deptFilterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentDeptCategory = this.getAttribute('data-filter') || 'all';
                filterDepartments();
            });
        });
    }

    // Search Input — real-time filtering
    if (deptSearchInput) {
        deptSearchInput.addEventListener('input', function() {
            currentDeptSearchTerm = this.value.trim().toLowerCase();
            filterDepartments();
        });

        // Also handle the search button click
        const searchBtn = deptSearchInput.nextElementSibling;
        if (searchBtn && searchBtn.tagName === 'BUTTON') {
            searchBtn.addEventListener('click', function() {
                currentDeptSearchTerm = deptSearchInput.value.trim().toLowerCase();
                filterDepartments();
            });
        }
    }

    // Modal Close
    if (deptModalCloseBtn) {
        deptModalCloseBtn.addEventListener('click', closeDeptModal);
    }

    if (deptModal) {
        deptModal.addEventListener('click', function(e) {
            if (e.target === deptModal) {
                closeDeptModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && deptModal && deptModal.style.display === 'flex') {
            closeDeptModal();
        }
    });
}

// ---- Category mapping ----
// HTML filter buttons: all, clinical, surgical, diagnostic, support
// Data store uses:     clinical, diagnostic
// Map stored categories to button values
const DEPT_CATEGORY_MAP = {
    'clinical':   'clinical',
    'diagnostic': 'diagnostic',
    'surgical':   'surgical',
    'support':    'support'
};

function getDeptDisplayCategory(storeCategory) {
    if (!storeCategory) return 'clinical';
    return DEPT_CATEGORY_MAP[storeCategory.toLowerCase()] || storeCategory.toLowerCase();
}

function filterDepartments() {
    displayedDepartments = allDepartments.filter(dept => {
        const mappedCat = getDeptDisplayCategory(dept.category);

        const matchesCategory = currentDeptCategory === 'all' || mappedCat === currentDeptCategory;

        const matchesSearch = !currentDeptSearchTerm ||
            (dept.name && dept.name.toLowerCase().includes(currentDeptSearchTerm)) ||
            (dept.head_of_department && dept.head_of_department.toLowerCase().includes(currentDeptSearchTerm)) ||
            (dept.description && dept.description.toLowerCase().includes(currentDeptSearchTerm)) ||
            (dept.title && dept.title.toLowerCase().includes(currentDeptSearchTerm));

        return matchesCategory && matchesSearch;
    });

    renderDepartmentsGrid();
}

function renderDepartmentsGrid() {
    if (!departmentsContainer) return;

    if (displayedDepartments.length === 0) {
        const catName = currentDeptCategory === 'all' ? '' : currentDeptCategory.charAt(0).toUpperCase() + currentDeptCategory.slice(1) + ' ';
        departmentsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #666; background: #f8f9fa; border-radius: 10px; border: 2px dashed #dee2e6;">
                <i class="fas fa-hospital" style="font-size: 4rem; color: #ccc; margin-bottom: 1.5rem; display: block;"></i>
                <h3 style="color: #2c4964; margin-bottom: 8px;">No ${catName}Departments Found</h3>
                <p style="max-width: 500px; margin: 0 auto 1.5rem; line-height: 1.6;">There are no departments matching your current filter${currentDeptSearchTerm ? ' and search term "' + currentDeptSearchTerm + '"' : ''}. Try a different category or clear your search.</p>
                <button onclick="resetDeptFilters()" style="padding: 13px 30px; background: #1977cc; color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: 600; font-size: 0.95rem; font-family: 'Poppins', sans-serif; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 14px rgba(25, 119, 204, 0.3); transition: all 0.3s ease;">
                    <i class="fas fa-sync-alt"></i> Show All Departments
                </button>
            </div>
        `;
        return;
    }

    departmentsContainer.innerHTML = displayedDepartments.map((dept, index) => {
        const displayCat = getDeptDisplayCategory(dept.category);
        const servicesList = Array.isArray(dept.services)
            ? dept.services.slice(0, 4).map(s => `<li>${s}</li>`).join('')
            : `<li>Specialized Clinical Care</li>`;

        const categoryTag = displayCat.charAt(0).toUpperCase() + displayCat.slice(1);

        return `
            <div class="department-card ${displayCat}" id="${dept.slug || dept.id}" style="animation-delay: ${index * 0.1}s">
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

// Reset filters helper (used by "Show All Departments" button in empty state)
window.resetDeptFilters = function() {
    currentDeptCategory = 'all';
    currentDeptSearchTerm = '';
    if (deptSearchInput) deptSearchInput.value = '';
    if (deptFilterBtns && deptFilterBtns.length > 0) {
        deptFilterBtns.forEach(b => b.classList.remove('active'));
        deptFilterBtns[0].classList.add('active'); // "All Departments" button
    }
    filterDepartments();
};

window.openDeptModal = function(id) {
    const dept = allDepartments.find(d => String(d.id) === String(id));
    if (!dept || !deptModal || !deptModalBody) return;

    const allServicesList = Array.isArray(dept.services)
        ? dept.services.map(s => `<li><i class="fas fa-check" style="color: #1977cc; margin-right: 8px;"></i>${s}</li>`).join('')
        : `<li>${dept.services || 'Comprehensive tertiary care services'}</li>`;

    deptModalBody.innerHTML = `
        <div style="padding: 10px;">
            <div style="height: 240px; overflow: hidden; border-radius: 8px; margin-bottom: 20px;">
                <img src="${dept.image || 'img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg'}" alt="${dept.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='img/about.jpg'">
            </div>
            <h2 style="color: #2c4964; margin-bottom: 10px;">${dept.name}</h2>
            <p style="color: #475569; line-height: 1.7; font-size: 1.05rem; margin-bottom: 20px;">${dept.description || ''}</p>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div><strong>Head of Department:</strong><br>${dept.head_of_department || 'Assigned'}${dept.head_qualification ? '<br><small style="color: #666;">' + dept.head_qualification + '</small>' : ''}</div>
                <div><strong>Location:</strong><br>${dept.location || 'KTRH Main Complex'}</div>
                <div><strong>Phone Extension:</strong><br>${dept.extension || 'N/A'}</div>
                <div><strong>Email:</strong><br>${dept.email || 'info@ktrh.or.ke'}</div>
            </div>

            <h4 style="color: #2c4964; margin-bottom: 10px;"><i class="fas fa-stethoscope"></i> Complete List of Services</h4>
            <ul style="list-style: none; padding-left: 0; line-height: 2; margin-bottom: 25px;">
                ${allServicesList}
            </ul>

            <a href="appointment.html?dept=${encodeURIComponent(dept.slug || dept.id)}" class="btn-appointment" style="display: inline-block; padding: 12px 28px; background: #2c4964; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">
                <i class="fas fa-calendar-check"></i> Book Appointment in this Department
            </a>
        </div>
    `;

    deptModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
};

function closeDeptModal() {
    if (deptModal) {
        deptModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
    }
}
