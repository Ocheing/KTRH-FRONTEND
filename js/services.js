// ==========================================================================
// MEDICAL SERVICES — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

// DOM Elements
let servicesContainer;
let servicesSearch;
let svcFilterBtns;
let serviceModal;
let svcModalCloseBtn;
let svcModalBody;

// State Management
let allServices = [];
let displayedServices = [];
let currentServiceCategory = 'all';
let currentServiceSearchTerm = '';

document.addEventListener('DOMContentLoaded', function() {
    initServicesPage();
});

// Live update listener from Admin Portal
window.addEventListener('ktrh_data_updated', function(e) {
    if (!e.detail?.collection || e.detail.collection === 'services') {
        loadServicesFromStore();
    }
});

function initServicesPage() {
    servicesContainer = document.getElementById('servicesContainer');
    servicesSearch = document.getElementById('servicesSearch');
    // Use the actual class in HTML — .filter-btn inside .services-filters
    svcFilterBtns = document.querySelectorAll('.services-filters .filter-btn');
    serviceModal = document.getElementById('serviceModal');
    svcModalBody = document.getElementById('modalBody');
    svcModalCloseBtn = document.getElementById('modalClose');

    setupServiceEventListeners();
    loadServicesFromStore();
    renderServicesSummary();
}

function loadServicesFromStore() {
    if (window.KTRHStore) {
        allServices = window.KTRHStore.getServices();
    } else {
        allServices = [];
    }

    displayedServices = [...allServices];
    filterServices();
}

function setupServiceEventListeners() {
    // Filter Buttons
    if (svcFilterBtns && svcFilterBtns.length > 0) {
        svcFilterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                svcFilterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentServiceCategory = this.getAttribute('data-filter') || 'all';
                filterServices();
            });
        });
    }

    // Search Input — real-time filtering
    if (servicesSearch) {
        servicesSearch.addEventListener('input', function() {
            currentServiceSearchTerm = this.value.trim().toLowerCase();
            filterServices();
        });

        // Also handle the search button click
        const searchBtn = servicesSearch.nextElementSibling;
        if (searchBtn && searchBtn.tagName === 'BUTTON') {
            searchBtn.addEventListener('click', function() {
                currentServiceSearchTerm = servicesSearch.value.trim().toLowerCase();
                filterServices();
            });
        }
    }

    // Modal Close
    if (svcModalCloseBtn) {
        svcModalCloseBtn.addEventListener('click', closeServiceModal);
    }

    if (serviceModal) {
        serviceModal.addEventListener('click', function(e) {
            if (e.target === serviceModal) {
                closeServiceModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && serviceModal && serviceModal.style.display === 'flex') {
            closeServiceModal();
        }
    });
}

// ---- Category mapping ----
// The HTML filter buttons use: all, specialized, diagnostic, surgical, support
// The data store uses:        emergency, clinical, diagnostic
// Map data-store categories to the button filter values so filtering works both ways.
const SERVICE_CATEGORY_MAP = {
    'emergency':  'specialized',
    'clinical':   'specialized',
    'diagnostic': 'diagnostic',
    'surgical':   'surgical',
    'support':    'support'
};

function getDisplayCategory(storeCategory) {
    if (!storeCategory) return 'specialized';
    return SERVICE_CATEGORY_MAP[storeCategory.toLowerCase()] || storeCategory.toLowerCase();
}

function filterServices() {
    displayedServices = allServices.filter(service => {
        // Map the stored category to the filter-button category
        const mappedCat = getDisplayCategory(service.category);

        const matchesCategory = currentServiceCategory === 'all' || mappedCat === currentServiceCategory;

        const matchesSearch = !currentServiceSearchTerm ||
            (service.title && service.title.toLowerCase().includes(currentServiceSearchTerm)) ||
            (service.short_description && service.short_description.toLowerCase().includes(currentServiceSearchTerm)) ||
            (service.description && service.description.toLowerCase().includes(currentServiceSearchTerm));

        return matchesCategory && matchesSearch;
    });

    renderServicesGrid();
}

function renderServicesGrid() {
    if (!servicesContainer) return;

    if (displayedServices.length === 0) {
        const catName = currentServiceCategory === 'all' ? '' : currentServiceCategory.charAt(0).toUpperCase() + currentServiceCategory.slice(1) + ' ';
        servicesContainer.innerHTML = `
            <div class="no-services-message">
                <div class="no-services-icon">
                    <i class="fas fa-stethoscope"></i>
                </div>
                <h3>No ${catName}Services Found</h3>
                <p>There are no services matching your current filter${currentServiceSearchTerm ? ' and search term "' + currentServiceSearchTerm + '"' : ''}. Try a different category or clear your search.</p>
                <button class="refresh-button" onclick="resetServiceFilters()">
                    <i class="fas fa-sync-alt"></i> Show All Services
                </button>
            </div>
        `;
        return;
    }

    servicesContainer.innerHTML = displayedServices.map((service, index) => {
        const displayCat = getDisplayCategory(service.category);
        const catLabel = displayCat.charAt(0).toUpperCase() + displayCat.slice(1);

        return `
            <div class="service-card ${displayCat}" id="${service.slug || service.id}" style="animation-delay: ${index * 0.1}s">
                <div class="service-image">
                    <img src="${service.image || 'img/imagestheatre.jpg'}" alt="${service.title}" loading="lazy" onerror="this.src='img/about.jpg'">
                    <div class="service-overlay">
                        <span class="service-tag">${catLabel}</span>
                        <h3>${service.title}</h3>
                    </div>
                </div>
                <div class="service-content">
                    <div class="service-icon">
                        <i class="${service.icon || 'fas fa-hospital'}"></i>
                    </div>
                    <h2>${service.title}</h2>
                    <p class="service-description">${service.short_description || service.description || 'Specialized clinical services provided by KTRH.'}</p>
                    
                    <div class="service-actions">
                        <a href="appointment.html?service=${encodeURIComponent(service.id)}" class="btn-book">
                            <i class="fas fa-calendar-check"></i> Book Now
                        </a>
                        <button class="btn-learn" onclick="openServiceModal('${service.id}')">
                            <i class="fas fa-info-circle"></i> Learn More
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Reset filters helper (used by "Show All Services" button in empty state)
window.resetServiceFilters = function() {
    currentServiceCategory = 'all';
    currentServiceSearchTerm = '';
    if (servicesSearch) servicesSearch.value = '';
    if (svcFilterBtns && svcFilterBtns.length > 0) {
        svcFilterBtns.forEach(b => b.classList.remove('active'));
        svcFilterBtns[0].classList.add('active'); // "All Services" button
    }
    filterServices();
};

window.openServiceModal = function(id) {
    const service = allServices.find(s => String(s.id) === String(id));
    if (!service || !serviceModal || !svcModalBody) return;

    const featuresList = Array.isArray(service.features)
        ? service.features.map(f => `<li><i class="fas fa-check-circle" style="color: #1977cc; margin-right: 8px;"></i>${f}</li>`).join('')
        : `<li>${service.features || 'Advanced clinical diagnostics and specialist care'}</li>`;

    svcModalBody.innerHTML = `
        <div style="padding: 10px;">
            <div style="height: 240px; overflow: hidden; border-radius: 8px; margin-bottom: 20px;">
                <img src="${service.image || 'img/imagestheatre.jpg'}" alt="${service.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='img/about.jpg'">
            </div>
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                <i class="${service.icon || 'fas fa-hospital'}" style="font-size: 2rem; color: #1977cc;"></i>
                <h2 style="color: #2c4964; margin: 0;">${service.title}</h2>
            </div>
            <p style="color: #475569; line-height: 1.7; font-size: 1.05rem; margin-bottom: 20px;">${service.description || service.short_description}</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0;"><strong><i class="fas fa-clock"></i> Service Operating Hours:</strong> ${service.hours || '24/7 or Outpatient Clinic Hours'}</p>
            </div>

            <h4 style="color: #2c4964; margin-bottom: 10px;"><i class="fas fa-list-check"></i> Key Capabilities & Procedures</h4>
            <ul style="list-style: none; padding-left: 0; line-height: 2; margin-bottom: 25px;">
                ${featuresList}
            </ul>

            <a href="appointment.html?service=${encodeURIComponent(service.id)}" class="btn-book" style="display: inline-block; padding: 12px 28px; background: #1977cc; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">
                <i class="fas fa-calendar-check"></i> Schedule an Appointment
            </a>
        </div>
    `;

    serviceModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
};

function closeServiceModal() {
    if (serviceModal) {
        serviceModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
    }
}

// ---- Services Summary Section ----
function renderServicesSummary() {
    const summaryGrid = document.getElementById('summaryGrid');
    if (!summaryGrid) return;

    const totalServices = allServices.length;
    const stats = window.KTRHStore ? window.KTRHStore.getStats() : {};

    summaryGrid.innerHTML = `
        <div class="summary-card">
            <div class="summary-icon"><i class="fas fa-stethoscope"></i></div>
            <h3>${totalServices || '6'}+</h3>
            <p>Medical Service Lines</p>
        </div>
        <div class="summary-card">
            <div class="summary-icon"><i class="fas fa-user-md"></i></div>
            <h3>${stats.specialistDoctors || '45+'}</h3>
            <p>Specialist Doctors</p>
        </div>
        <div class="summary-card">
            <div class="summary-icon"><i class="fas fa-hospital"></i></div>
            <h3>${stats.departments || '28+'}</h3>
            <p>Departments</p>
        </div>
        <div class="summary-card">
            <div class="summary-icon"><i class="fas fa-clock"></i></div>
            <h3>24/7</h3>
            <p>Emergency Services Available</p>
        </div>
    `;
}
