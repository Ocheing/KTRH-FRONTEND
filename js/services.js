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

// Function to fetch services from Strapi
async function fetchServices() {
    try {
        console.log('Fetching services from Strapi...');
        const response = await fetch(`${STRAPI_API_URL}/services?populate=*`);
        
        if (!response.ok) {
            console.error('API response not ok:', response.status, response.statusText);
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle Strapi v4 response structure
        if (data.data && Array.isArray(data.data)) {
            console.log(`Fetched ${data.data.length} services from API`);
            return data.data;
        } else if (Array.isArray(data)) {
            console.log(`Fetched ${data.length} services from API`);
            return data;
        } else {
            console.error('Unexpected API response structure:', data);
            return [];
        }
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
            if (block.type === 'paragraph' && Array.isArray(block.children)) {
                block.children.forEach(child => {
                    if (child.text) {
                        text += child.text + ' ';
                    }
                });
            }
            text += ' ';
        });
        
        return text.trim();
    }
    
    if (typeof richText === 'object') {
        if (richText.text) return richText.text;
        if (richText.content) return richText.content;
        if (richText.description) return richText.description;
        
        try {
            const jsonString = JSON.stringify(richText);
            return jsonString.replace(/<[^>]*>/g, '').substring(0, 150);
        } catch (e) {
            return 'Service details available.';
        }
    }
    
    return 'Service details available.';
}

// Helper function to get service data
function getServiceData(service) {
    const hasAttributes = service.attributes !== undefined;
    return hasAttributes ? service.attributes : service;
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

// Function to parse JSON fields safely
function parseJSONField(field, defaultValue = []) {
    if (!field) return defaultValue;
    
    try {
        if (typeof field === 'string') {
            return JSON.parse(field);
        }
        return field;
    } catch (e) {
        console.warn('Error parsing JSON field:', e);
        return defaultValue;
    }
}

// Function to render service card
function renderServiceCard(service) {
    if (!service) {
        return '<div class="service-card error">Error: Service data missing</div>';
    }
    
    const attrs = getServiceData(service);
    const serviceId = service.id || '';
    
    const name = getServiceName(service);
    const category = getServiceCategory(service);
    const icon = getServiceIcon(service);
    const description = attrs.short_description || extractTextFromRichText(attrs.description);
    const imageUrl = getServiceImageUrl(service);
    
    // Parse features if available
    let features = [];
    try {
        if (attrs.features) {
            if (typeof attrs.features === 'string') {
                features = JSON.parse(attrs.features);
            } else {
                features = attrs.features;
            }
        }
    } catch (e) {
        console.warn('Error parsing features:', e);
        features = ['Comprehensive Service', 'Expert Staff', 'Advanced Equipment', 'Quality Care'];
    }
    
    // Ensure features is an array
    features = Array.isArray(features) ? features : [];
    
    // Limit features display
    const displayFeatures = features.slice(0, 4);
    
    // Get service details
    const operatingHours = attrs.operating_hours || 'Mon-Fri: 8AM-6PM';
    const isEmergency = attrs.is_emergency_service || false;
    const emergencyAvailable = attrs.emergency_available || false;
    
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
                
                <div class="service-features">
                    ${displayFeatures.map(feature => `
                        <div class="feature">
                            <i class="fas fa-check-circle"></i>
                            <span>${feature.length > 30 ? feature.substring(0, 30) + '...' : feature}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="service-details">
                    <div class="detail">
                        <i class="fas fa-clock"></i>
                        <span>${operatingHours}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-user-md"></i>
                        <span>${category === 'specialized' ? 'Specialists' : 'Expert Staff'}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-star"></i>
                        <span>${category === 'diagnostic' ? 'Advanced Technology' : 'Quality Care'}</span>
                    </div>
                </div>
                
                <div class="service-actions">
                    <a href="appointment.html?service=${attrs.slug || serviceId}" class="btn-book ${isEmergency ? 'emergency' : ''}">
                        <i class="fas ${isEmergency ? 'fa-phone' : 'fa-calendar-check'}"></i> ${isEmergency ? 'Emergency Call' : 'Book Now'}
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
    if (!servicesContainer) {
        console.error('Services container not found');
        return;
    }
    
    // Remove loading spinner if it exists
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    if (!Array.isArray(services) || services.length === 0) {
        servicesContainer.innerHTML = `
            <div class="no-services-message">
                <i class="fas fa-stethoscope no-services-icon"></i>
                <h3>No services available</h3>
                <p>Please check your Strapi connection or add services in the admin panel.</p>
                <button onclick="location.reload()" class="refresh-button">
                    <i class="fas fa-sync-alt"></i> Refresh Page
                </button>
            </div>
        `;
        return;
    }
    
    servicesContainer.innerHTML = services.map(service => renderServiceCard(service)).join('');
    
    // Re-attach event listeners to new buttons
    attachLearnMoreListeners();
    attachBookAppointmentListeners();
}

// Function to filter services by category
function filterServicesByCategory(category) {
    console.log('Filtering services by category:', category);
    
    if (category === 'all') {
        displayedServices = allServices;
    } else {
        displayedServices = allServices.filter(service => {
            const serviceCategory = getServiceCategory(service);
            return serviceCategory === category;
        });
    }
    
    renderServicesGrid(displayedServices);
    console.log(`Displaying ${displayedServices.length} services in ${category} category`);
}

// Function to search services
function searchServices(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        displayedServices = allServices;
    } else {
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
    }
    
    renderServicesGrid(displayedServices);
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
            modalBody.innerHTML = '<p>Service data not found.</p>';
            return;
        }
        
        const attrs = getServiceData(service);
        const name = getServiceName(service);
        const icon = getServiceIcon(service);
        const description = extractTextFromRichText(attrs.description);
        const imageUrl = getServiceImageUrl(service);
        
        // Parse JSON fields
        const features = parseJSONField(attrs.features, []);
        const equipment = parseJSONField(attrs.equipment, []);
        const procedures = parseJSONField(attrs.procedures, []);
        const specialists = parseJSONField(attrs.specialists, []);
        const contact = parseJSONField(attrs.contact, {});
        
        // Default contact info
        const defaultContact = {
            phone: '+254 758 721 997',
            email: 'services@ktrh.or.ke',
            location: 'Main Hospital Building',
            hours: attrs.operating_hours || 'Mon-Fri: 8:00 AM - 5:00 PM'
        };
        
        const finalContact = { ...defaultContact, ...contact };
        
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
            
            <div class="modal-details">
        `;
        
        // Features Section
        if (features.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-stethoscope"></i> Services & Features</h3>
                    <ul>
                        ${features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Equipment Section
        if (equipment.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-cogs"></i> Equipment & Technology</h3>
                    <ul>
                        ${equipment.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Procedures Section
        if (procedures.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-procedures"></i> Procedures Offered</h3>
                    <ul>
                        ${procedures.map(procedure => `<li>${procedure}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Specialists Section
        if (specialists.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-user-md"></i> Our Specialists</h3>
                    <div class="staff-grid">
                        ${specialists.map(specialist => `
                            <div class="staff-card">
                                <h4>${specialist.name || 'Medical Specialist'}</h4>
                                <p><strong>${specialist.specialty || 'Specialist'}</strong></p>
                                ${specialist.qualification ? `<p>${specialist.qualification}</p>` : ''}
                                ${specialist.experience ? `<p>Experience: ${specialist.experience}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        modalHTML += `
            </div>
            
            <div class="modal-contact">
                <h3><i class="fas fa-address-card"></i> Contact Information</h3>
                <div class="contact-info">
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="contact-details">
                            <h4>Phone</h4>
                            <p>${finalContact.phone}</p>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="contact-details">
                            <h4>Email</h4>
                            <p>${finalContact.email}</p>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <div class="contact-details">
                            <h4>Location</h4>
                            <p>${finalContact.location}</p>
                        </div>
                    </div>
                    
                    <div class="contact-item">
                        <div class="contact-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="contact-details">
                            <h4>Operating Hours</h4>
                            <p>${finalContact.hours}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="appointment.html?service=${attrs.slug || serviceId}" class="btn-book" style="display: inline-flex;">
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
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f39c12; margin-bottom: 1rem;"></i>
                <h3>Error Loading Details</h3>
                <p>Unable to load service details. Please try again later.</p>
                <button class="refresh-button" onclick="closeModal()" style="margin-top: 1rem;">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        serviceModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Function to update summary statistics
function updateSummaryStats() {
    if (!summaryGrid) return;
    
    // Calculate stats from services
    const totalServices = allServices.length;
    const specializedServices = allServices.filter(s => getServiceCategory(s) === 'specialized').length;
    const diagnosticServices = allServices.filter(s => getServiceCategory(s) === 'diagnostic').length;
    const emergencyServices = allServices.filter(s => {
        const attrs = getServiceData(s);
        return attrs.is_emergency_service || attrs.emergency_available;
    }).length;
    
    // Default fallback if no services
    if (totalServices === 0) {
        summaryGrid.innerHTML = `
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-user-md"></i>
                </div>
                <h3>Expert Doctors</h3>
                <p>300+ qualified medical specialists across various departments</p>
            </div>
            
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-hospital"></i>
                </div>
                <h3>Modern Facilities</h3>
                <p>State-of-the-art equipment and advanced medical technology</p>
            </div>
            
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <h3>24/7 Services</h3>
                <p>Round-the-clock emergency and critical care services</p>
            </div>
            
            <div class="summary-card">
                <div class="summary-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3>50,000+ Patients</h3>
                <p>Annual patient trust with high satisfaction rates</p>
            </div>
        `;
        return;
    }
    
    summaryGrid.innerHTML = `
        <div class="summary-card">
            <div class="summary-icon">
                <i class="fas fa-user-md"></i>
            </div>
            <h3>${specializedServices}+ Specialized Services</h3>
            <p>Expert medical services across various departments</p>
        </div>
        
        <div class="summary-card">
            <div class="summary-icon">
                <i class="fas fa-hospital"></i>
            </div>
            <h3>Modern Facilities</h3>
            <p>State-of-the-art equipment and advanced medical technology</p>
        </div>
        
        <div class="summary-card">
            <div class="summary-icon">
                <i class="fas fa-clock"></i>
            </div>
            <h3>${emergencyServices}+ 24/7 Services</h3>
            <p>Round-the-clock emergency and critical care services</p>
        </div>
        
        <div class="summary-card">
            <div class="summary-icon">
                <i class="fas fa-users"></i>
            </div>
            <h3>${totalServices}+ Total Services</h3>
            <p>Comprehensive healthcare solutions for all medical needs</p>
        </div>
    `;
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

// Function to attach book appointment listeners
function attachBookAppointmentListeners() {
    document.querySelectorAll('.btn-book').forEach(btn => {
        if (!btn.classList.contains('emergency')) {
            btn.addEventListener('click', function(e) {
                const serviceCard = this.closest('.service-card');
                const serviceId = serviceCard.id;
                localStorage.setItem('selectedService', serviceId);
            });
        }
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
    console.log('Services page loaded, initializing...');
    
    // Get DOM elements
    servicesContainer = document.getElementById('servicesContainer');
    servicesSearch = document.getElementById('servicesSearch');
    filterBtns = document.querySelectorAll('.filter-btn');
    serviceModal = document.getElementById('serviceModal');
    modalCloseBtn = document.getElementById('modalClose');
    modalBody = document.getElementById('modalBody');
    chatWidget = document.getElementById('chatWidget');
    chatCloseBtn = document.getElementById('chatClose');
    backToTopBtn = document.getElementById('backToTop');
    summaryGrid = document.getElementById('summaryGrid');
    
    // Fetch services from Strapi
    console.log('Fetching services from API...');
    allServices = await fetchServices();
    console.log(`Fetched ${allServices.length} services`);
    
    if (allServices.length === 0) {
        console.warn('No services fetched from API');
    } else {
        // Initial display
        displayedServices = allServices;
        renderServicesGrid(displayedServices);
    }
    
    // Always update summary stats
    updateSummaryStats();
    
    // Set up filter functionality
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter services
                filterServicesByCategory(filter);
            });
        });
    }
    
    // Set up search functionality
    if (servicesSearch) {
        servicesSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value;
            searchServices(searchTerm);
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
    
    // Chat Widget
    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', function() {
            chatWidget.style.display = 'none';
        });
    }
    
    // Chat options functionality
    document.querySelectorAll('.chat-option').forEach(option => {
        option.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            switch(action) {
                case 'appointment':
                    window.location.href = 'appointment.html';
                    break;
                case 'directions':
                    window.open('https://www.google.com/maps/search/?api=1&query=Kisii+Teaching+Referral+Hospital', '_blank');
                    break;
                case 'emergency':
                    window.location.href = 'tel:+254758721997';
                    break;
            }
        });
    });
    
    // Back to Top
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    console.log('Services page initialized successfully');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);
