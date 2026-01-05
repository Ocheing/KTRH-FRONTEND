// Strapi API Configuration
const STRAPI_API_URL = 'https://better-friend-c539968cc5.strapiapp.com/api';
const STRAPI_IMAGE_URL = 'https://better-friend-c539968cc5.strapiapp.com';

// DOM Elements
let servicesContainer;
let servicesSearch;
let filterBtns;
let serviceModal;
let modalCloseBtn;
let modalBody;
let chatWidget;
let chatCloseBtn;
let backToTopBtn;
let summaryGrid;

// Global State
let allServices = [];
let displayedServices = [];

// Function to show no services message
function showNoServicesMessage() {
    if (!servicesContainer) return;
    
    servicesContainer.innerHTML = `
        <div class="no-services-message" style="text-align: center; padding: 4rem; color: #666;">
            <i class="fas fa-hospital" style="font-size: 4rem; color: #95a5a6; margin-bottom: 1.5rem;"></i>
            <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">No medical services found</h3>
            <p style="color: #7f8c8d; font-size: 0.9rem;">Please check back later or contact the hospital for more information</p>
        </div>
    `;
}

// Function to fetch services from Strapi
async function fetchServices() {
    try {
        console.log('Fetching services from Strapi...');
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${STRAPI_API_URL}/services?populate=*`, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle Strapi v4 response structure
        let services = [];
        if (data.data && Array.isArray(data.data)) {
            services = data.data;
        } else if (Array.isArray(data)) {
            services = data;
        } else {
            return [];
        }
        
        return services;
        
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

// Helper function to extract text from Strapi Rich Text format
function extractTextFromRichText(richText) {
    if (!richText) return '';
    
    if (typeof richText === 'string') {
        return richText;
    }
    
    if (Array.isArray(richText)) {
        let text = '';
        richText.forEach(block => {
            if (block.type === 'paragraph' && block.children) {
                block.children.forEach(child => {
                    if (child.text) {
                        text += child.text + ' ';
                    }
                });
            }
        });
        return text.trim();
    }
    
    if (typeof richText === 'object') {
        if (richText.text) return richText.text;
        if (richText.content) return richText.content;
        return '';
    }
    
    return '';
}

// Helper function to get service data
function getServiceData(service) {
    return service.attributes || service;
}

// Helper function to get service name
function getServiceName(service) {
    const attrs = getServiceData(service);
    return attrs?.name || 'Unknown Service';
}

// Helper function to get service category
function getServiceCategory(service) {
    const attrs = getServiceData(service);
    return attrs?.category || 'specialized';
}

// Helper function to get service icon
function getServiceIcon(service) {
    const attrs = getServiceData(service);
    return attrs?.icon_class || 'fas fa-stethoscope';
}

// Helper function to get image URL
function getServiceImageUrl(service) {
    const attrs = getServiceData(service);
    
    let imageUrl = 'https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70';
    
    try {
        if (service.attributes?.image?.data?.attributes?.url) {
            imageUrl = `${STRAPI_IMAGE_URL}${service.attributes.image.data.attributes.url}`;
        } else if (service.image?.data?.attributes?.url) {
            imageUrl = `${STRAPI_IMAGE_URL}${service.image.data.attributes.url}`;
        } else if (attrs.image?.url) {
            imageUrl = attrs.image.url.startsWith('http') 
                ? attrs.image.url 
                : `${STRAPI_IMAGE_URL}${attrs.image.url}`;
        }
    } catch (imageError) {
        console.warn('Error getting image URL:', imageError);
    }
    
    return imageUrl;
}

// Function to render service card
function renderServiceCard(service) {
    if (!service) return '';
    
    const attrs = getServiceData(service);
    const serviceId = service.id || '';
    
    const name = getServiceName(service);
    const category = getServiceCategory(service);
    const icon = getServiceIcon(service);
    const description = attrs.short_description || extractTextFromRichText(attrs.description);
    const imageUrl = getServiceImageUrl(service);
    
    return `
        <div class="service-card ${category}" id="${attrs.slug || serviceId}">
            <div class="service-image">
                <img src="${imageUrl}" alt="${name}" loading="lazy">
                <div class="service-overlay">
                    <span class="service-tag">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <h3>${name}</h3>
                </div>
            </div>
            <div class="service-content">
                <div class="service-icon">
                    <i class="${icon}"></i>
                </div>
                <h2>${name}</h2>
                <p class="service-description">${description.substring(0, 120)}${description.length > 120 ? '...' : ''}</p>
                
                <div class="service-actions">
                    <a href="appointment.html?service=${attrs.slug || serviceId}" class="btn-book">
                        <i class="fas fa-calendar-check"></i> Book Now
                    </a>
                    <a href="#${attrs.slug || serviceId}-details" class="btn-learn" data-service="${serviceId}">
                        <i class="fas fa-info-circle"></i> Learn More
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Function to render services grid
function renderServicesGrid(services) {
    if (!servicesContainer) return;
    
    if (!Array.isArray(services) || services.length === 0) {
        showNoServicesMessage();
        return;
    }
    
    servicesContainer.innerHTML = services.map(service => renderServiceCard(service)).join('');
    
    // Re-attach event listeners
    attachLearnMoreListeners();
}

// Function to filter services by category
function filterServicesByCategory(category) {
    if (category === 'all') {
        displayedServices = allServices;
    } else {
        displayedServices = allServices.filter(service => {
            const serviceCategory = getServiceCategory(service);
            return serviceCategory === category;
        });
    }
    
    if (displayedServices.length === 0) {
        servicesContainer.innerHTML = `
            <div class="no-services-message" style="text-align: center; padding: 4rem; color: #666;">
                <i class="fas fa-search" style="font-size: 4rem; color: #95a5a6; margin-bottom: 1.5rem;"></i>
                <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">No medical services found</h3>
                <p style="color: #7f8c8d; font-size: 0.9rem;">Try a different category or search term</p>
            </div>
        `;
    } else {
        renderServicesGrid(displayedServices);
    }
}

// Function to search services
function searchServices(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        displayedServices = allServices;
        renderServicesGrid(displayedServices);
        return;
    }
    
    displayedServices = allServices.filter(service => {
        const attrs = getServiceData(service);
        const name = getServiceName(service).toLowerCase();
        const description = extractTextFromRichText(attrs.description).toLowerCase();
        const shortDesc = (attrs.short_description || '').toLowerCase();
        const category = getServiceCategory(service).toLowerCase();
        
        return name.includes(term) ||
               description.includes(term) ||
               shortDesc.includes(term) ||
               category.includes(term);
    });
    
    if (displayedServices.length === 0) {
        servicesContainer.innerHTML = `
            <div class="no-services-message" style="text-align: center; padding: 4rem; color: #666;">
                <i class="fas fa-search-minus" style="font-size: 4rem; color: #95a5a6; margin-bottom: 1.5rem;"></i>
                <h3 style="color: #2c3e50; margin-bottom: 0.5rem;">No medical services found</h3>
                <p style="color: #7f8c8d; font-size: 0.9rem;">No results for "${searchTerm}"</p>
            </div>
        `;
    } else {
        renderServicesGrid(displayedServices);
    }
}

// Function to show service modal
async function showServiceModal(serviceId) {
    try {
        const response = await fetch(`${STRAPI_API_URL}/services/${serviceId}?populate=*`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch service: ${response.status}`);
        }
        
        const data = await response.json();
        const service = data.data || data;
        
        if (!service) {
            modalBody.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #f39c12; margin-bottom: 1rem;"></i>
                    <p>Service data not found.</p>
                </div>
            `;
            return;
        }
        
        const attrs = getServiceData(service);
        const name = getServiceName(service);
        const icon = getServiceIcon(service);
        const description = extractTextFromRichText(attrs.description);
        const imageUrl = getServiceImageUrl(service);
        
        let modalHTML = `
            <div class="modal-header">
                <div class="modal-icon">
                    <i class="${icon}"></i>
                </div>
                <h2>${name} Services</h2>
            </div>
            
            <div class="modal-image">
                <img src="${imageUrl}" alt="${name}" loading="lazy">
            </div>
            
            <p class="modal-description">${description}</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="appointment.html?service=${attrs.slug || serviceId}" class="btn-book">
                    <i class="fas fa-calendar-check"></i> Book Appointment Now
                </a>
            </div>
        `;
        
        modalBody.innerHTML = modalHTML;
        serviceModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error fetching service details:', error);
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                <p>Unable to load service details.</p>
            </div>
        `;
        serviceModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Function to attach learn more listeners
function attachLearnMoreListeners() {
    document.querySelectorAll('.btn-learn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const serviceId = this.getAttribute('data-service');
            if (serviceId) {
                showServiceModal(serviceId);
            }
        });
    });
}

// Close modal function
function closeModal() {
    if (serviceModal) {
        serviceModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize the page
async function initializePage() {
    // Get DOM elements
    servicesContainer = document.getElementById('servicesContainer');
    servicesSearch = document.getElementById('servicesSearch');
    filterBtns = document.querySelectorAll('.filter-btn');
    serviceModal = document.getElementById('serviceModal');
    modalCloseBtn = document.getElementById('modalClose');
    modalBody = document.getElementById('modalBody');
    
    // Fetch services from Strapi
    allServices = await fetchServices();
    
    if (allServices.length === 0) {
        showNoServicesMessage();
    } else {
        displayedServices = allServices;
        renderServicesGrid(displayedServices);
    }
    
    // Set up filter functionality
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filterServicesByCategory(filter);
            });
        });
    }
    
    // Set up search functionality
    if (servicesSearch) {
        servicesSearch.addEventListener('input', function(e) {
            searchServices(e.target.value);
        });
    }
    
    // Set up modal functionality
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    if (serviceModal) {
        serviceModal.addEventListener('click', function(e) {
            if (e.target === serviceModal) {
                closeModal();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);