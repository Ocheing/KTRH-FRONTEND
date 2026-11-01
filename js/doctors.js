// ==========================================================================
// DOCTORS DIRECTORY — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

// DOM Elements
let doctorsGrid;
let departmentButtons;
let searchInput;
let loadMoreBtn;
let doctorModal;
let modalCloseBtn;
let modalBody;

// Global State
let allDoctors = [];
let displayedDoctors = [];
let currentDepartment = 'all';
let currentSearchTerm = '';
let visibleCount = 9;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initDoctorsPage();
});

// Listen for live updates from Admin Portal
window.addEventListener('ktrh_data_updated', function(e) {
    if (!e.detail?.collection || e.detail.collection === 'doctors') {
        loadDoctorsFromStore();
    }
});

function initDoctorsPage() {
    doctorsGrid = document.getElementById('doctorsGrid');
    departmentButtons = document.querySelectorAll('.doctors-filters .filter-btn');
    searchInput = document.getElementById('doctorsSearch');
    loadMoreBtn = document.getElementById('loadMore');
    doctorModal = document.getElementById('doctorModal');
    modalCloseBtn = document.getElementById('modalClose');
    modalBody = document.getElementById('modalBody');

    setupEventListeners();
    loadDoctorsFromStore();
}

function loadDoctorsFromStore() {
    if (window.KTRHStore) {
        allDoctors = window.KTRHStore.getDoctors();
    } else {
        allDoctors = [];
    }

    displayedDoctors = [...allDoctors];
    updateStats();
    filterDoctors();
}

function setupEventListeners() {
    // Department Filter Buttons
    if (departmentButtons) {
        departmentButtons.forEach(button => {
            button.addEventListener('click', function() {
                departmentButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentDepartment = this.getAttribute('data-filter') || 'all';
                filterDoctors();
            });
        });
    }

    // Search Input
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearchTerm = this.value.trim().toLowerCase();
            filterDoctors();
        });

        const searchBtn = searchInput.nextElementSibling;
        if (searchBtn && searchBtn.tagName === 'BUTTON') {
            searchBtn.addEventListener('click', () => {
                currentSearchTerm = searchInput.value.trim().toLowerCase();
                filterDoctors();
            });
        }
    }

    // Load More Button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            visibleCount += 6;
            renderDoctorsGrid();
            updateLoadMoreButton();
        });
    }

    // Modal Close
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (doctorModal) {
        window.addEventListener('click', function(e) {
            if (e.target === doctorModal) {
                closeModal();
            }
        });
    }
}

function filterDoctors() {
    displayedDoctors = allDoctors.filter(doc => {
        const matchesDept = currentDepartment === 'all' || 
            (doc.department && doc.department.toLowerCase() === currentDepartment.toLowerCase());

        const matchesSearch = !currentSearchTerm || 
            (doc.name && doc.name.toLowerCase().includes(currentSearchTerm)) ||
            (doc.specialty && doc.specialty.toLowerCase().includes(currentSearchTerm)) ||
            (doc.title && doc.title.toLowerCase().includes(currentSearchTerm));

        return matchesDept && matchesSearch;
    });

    renderDoctorsGrid();
    updateLoadMoreButton();
}

function renderDoctorsGrid() {
    if (!doctorsGrid) return;

    if (displayedDoctors.length === 0) {
        doctorsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-user-md" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 15px;"></i>
                <h3 style="color: #2c4964; margin-bottom: 8px;">No Doctors Found</h3>
                <p>No medical specialists match your search criteria. Try a different filter or search term.</p>
            </div>
        `;
        return;
    }

    const itemsToRender = displayedDoctors.slice(0, visibleCount);

    doctorsGrid.innerHTML = itemsToRender.map(doc => {
        const deptTag = doc.department ? doc.department.charAt(0).toUpperCase() + doc.department.slice(1) : 'General';
        const quals = Array.isArray(doc.qualifications) 
            ? doc.qualifications.map(q => `<div class="qualification"><i class="fas fa-graduation-cap"></i><span>${q}</span></div>`).join('')
            : `<div class="qualification"><i class="fas fa-graduation-cap"></i><span>${doc.qualifications || 'Certified Medical Practitioner'}</span></div>`;

        return `
            <div class="doctor-card ${doc.department || 'general'}" data-name="${doc.name}">
                <div class="doctor-image">
                    <img src="${doc.image || 'img/drondari.png'}" alt="${doc.name}" loading="lazy" onerror="this.src='img/drondari.png'">
                    <div class="doctor-overlay">
                        <div class="overlay-content">
                            <span class="doctor-department">${deptTag}</span>
                            <h3>${doc.name}</h3>
                            <p>${doc.title || doc.specialty}</p>
                        </div>
                    </div>
                </div>
                <div class="doctor-content">
                    <div class="doctor-header">
                        <h2>${doc.name}</h2>
                        <span class="doctor-specialty">${doc.specialty || deptTag}</span>
                    </div>
                    <div class="doctor-qualifications">
                        ${quals}
                    </div>
                    <p class="doctor-bio">${doc.bio || 'Consultant specialist providing medical care and clinical leadership at KTRH.'}</p>
                    <div class="doctor-details">
                        <div class="detail">
                            <i class="fas fa-clock"></i>
                            <div>
                                <strong>Consultation Hours</strong>
                                <span>${doc.consultationHours || 'Mon - Fri: 9:00 AM - 4:00 PM'}</span>
                            </div>
                        </div>
                        <div class="detail">
                            <i class="fas fa-star"></i>
                            <div>
                                <strong>Experience</strong>
                                <span>${doc.experience || '10+ Years'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="doctor-actions">
                        <a href="appointment.html?doctor=${encodeURIComponent(doc.id)}" class="btn-book">
                            <i class="fas fa-calendar-check"></i> Book Appointment
                        </a>
                        <button class="btn-profile" onclick="openDoctorModal('${doc.id}')">
                            <i class="fas fa-user-md"></i> View Profile
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateLoadMoreButton() {
    if (!loadMoreBtn) return;
    if (displayedDoctors.length > visibleCount) {
        loadMoreBtn.style.display = 'inline-block';
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> View More Doctors';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

function updateStats() {
    const totalDoctors = allDoctors.length;
    const specialists = allDoctors.filter(d => d.specialty && d.specialty !== 'General Medicine').length;
    
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 1) statCards[0].querySelector('h3').textContent = `${totalDoctors}`;
    if (statCards.length >= 2) statCards[1].querySelector('h3').textContent = `${specialists}`;
    if (statCards.length >= 3) statCards[2].querySelector('h3').textContent = '15+';
    if (statCards.length >= 4) statCards[3].querySelector('h3').textContent = `${Math.max(12, totalDoctors)}`;
}

window.openDoctorModal = function(id) {
    const doc = allDoctors.find(d => String(d.id) === String(id));
    if (!doc || !doctorModal || !modalBody) return;

    const quals = Array.isArray(doc.qualifications) 
        ? doc.qualifications.map(q => `<li><i class="fas fa-check-circle" style="color: #1977cc; margin-right: 8px;"></i>${q}</li>`).join('')
        : `<li>${doc.qualifications || 'Medical Degree and Specialist Certification'}</li>`;

    modalBody.innerHTML = `
        <div style="display: flex; gap: 30px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 250px; max-width: 300px;">
                <img src="${doc.image || 'img/drondari.png'}" alt="${doc.name}" style="width: 100%; height: 320px; object-fit: cover; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);" onerror="this.src='img/drondari.png'">
                <div style="margin-top: 15px; padding: 15px; background: #f8fafc; border-radius: 8px;">
                    <p style="margin: 6px 0;"><strong><i class="fas fa-envelope"></i> Email:</strong> ${doc.email || 'info@ktrh.or.ke'}</p>
                    <p style="margin: 6px 0;"><strong><i class="fas fa-phone"></i> Direct:</strong> ${doc.phone || '+254 758 721 997'}</p>
                    <p style="margin: 6px 0;"><strong><i class="fas fa-clock"></i> Hours:</strong> ${doc.consultationHours || 'Mon-Fri'}</p>
                </div>
            </div>
            <div style="flex: 2; min-width: 300px;">
                <h2 style="color: #2c4964; margin-bottom: 5px; font-size: 1.8rem;">${doc.name}</h2>
                <h4 style="color: #1977cc; margin-bottom: 15px; font-weight: 500;">${doc.title || doc.specialty}</h4>
                <p style="line-height: 1.7; color: #475569; margin-bottom: 20px;">${doc.bio || 'Consultant specialist providing medical care and clinical leadership at KTRH.'}</p>
                
                <h4 style="color: #2c4964; margin-bottom: 10px;"><i class="fas fa-graduation-cap"></i> Qualifications & Certifications</h4>
                <ul style="list-style: none; padding-left: 0; margin-bottom: 25px; line-height: 2;">
                    ${quals}
                </ul>

                <a href="appointment.html?doctor=${encodeURIComponent(doc.id)}" class="btn-book" style="display: inline-block; padding: 12px 28px; background: #1977cc; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    <i class="fas fa-calendar-check"></i> Book Consultation
                </a>
            </div>
        </div>
    `;

    doctorModal.style.display = 'flex';
};

function closeModal() {
    if (doctorModal) {
        doctorModal.style.display = 'none';
    }
}
