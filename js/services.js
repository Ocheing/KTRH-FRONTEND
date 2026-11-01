// ==========================================================================
// MEDICAL SERVICES — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

// DOM Elements
let servicesContainer;
let servicesSearch;
let filterBtns;
let serviceModal;
let modalCloseBtn;
let modalBody;

// State Management
let allServices = [];
let displayedServices = [];
let currentCategory = 'all';
let currentSearchTerm = '';

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
    servicesContainer = document.getElementById('servicesContainer') || document.querySelector('.services-grid');
    servicesSearch = document.getElementById('servicesSearch');
    filterBtns = document.querySelectorAll('.service-filter-btn') || document.querySelectorAll('.filter-btn');
    serviceModal = document.getElementById('serviceModal');
    modalBody = document.getElementById('modalBody');
    modalCloseBtn = document.getElementById('modalClose');

    setupEventListeners();
    loadServicesFromStore();
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

function setupEventListeners() {
    // Filter Buttons
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.getAttribute('data-filter') || 'all';
                filterServices();
            });
        });
    }

    // Search Input
    if (servicesSearch) {
        servicesSearch.addEventListener('input', function() {
            currentSearchTerm = this.value.trim().toLowerCase();
            filterServices();
        });
    }

    // Modal Close
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeServiceModal);
    }

    if (serviceModal) {
        window.addEventListener('click', function(e) {
            if (e.target === serviceModal) {
                closeServiceModal();
            }
        });
    }
}

function filterServices() {
    displayedServices = allServices.filter(service => {
        const matchesCategory = currentCategory === 'all' || 
            (service.category && service.category.toLowerCase() === currentCategory.toLowerCase());

        const matchesSearch = !currentSearchTerm || 
            (service.title && service.title.toLowerCase().includes(currentSearchTerm)) ||
            (service.short_description && service.short_description.toLowerCase().includes(currentSearchTerm)) ||
            (service.description && service.description.toLowerCase().includes(currentSearchTerm));

        return matchesCategory && matchesSearch;
    });

    renderServicesGrid();
}

function renderServicesGrid() {
    if (!servicesContainer) return;

    if (displayedServices.length === 0) {
        servicesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-stethoscope" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 15px;"></i>
                <h3 style="color: #2c4964; margin-bottom: 8px;">No Medical Services Found</h3>
                <p>Try searching for a different clinical specialty or clear your filter.</p>
            </div>
        `;
        return;
    }

    servicesContainer.innerHTML = displayedServices.map(service => {
        const catTag = service.category ? service.category.charAt(0).toUpperCase() + service.category.slice(1) : 'Clinical';

        return `
            <div class="service-card ${service.category || 'clinical'}" id="${service.slug || service.id}">
                <div class="service-image">
                    <img src="${service.image || 'img/imagestheatre.jpg'}" alt="${service.title}" loading="lazy" onerror="this.src='img/about.jpg'">
                    <div class="service-overlay">
                        <span class="service-tag">${catTag}</span>
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

window.openServiceModal = function(id) {
    const service = allServices.find(s => String(s.id) === String(id));
    if (!service || !serviceModal || !modalBody) return;

    const featuresList = Array.isArray(service.features)
        ? service.features.map(f => `<li><i class="fas fa-check-circle" style="color: #1977cc; margin-right: 8px;"></i>${f}</li>`).join('')
        : `<li>${service.features || 'Advanced clinical diagnostics and specialist care'}</li>`;

    modalBody.innerHTML = `
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
};

function closeServiceModal() {
    if (serviceModal) {
        serviceModal.style.display = 'none';
    }
}
