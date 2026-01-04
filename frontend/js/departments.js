// Strapi API Configuration
const STRAPI_API_URL = 'http://localhost:1337/api';
const STRAPI_IMAGE_URL = 'http://localhost:1337';

// DOM Elements
let departmentsContainer;
let deptSearch;
let filterBtns;
let deptModal;
let modalCloseBtn;
let modalBody;
let chatWidget;
let chatCloseBtn;
let backToTopBtn;
let viewDetailsBtns;

// Global State
let allDepartments = [];
let displayedDepartments = [];

// Function to fetch departments from Strapi
async function fetchDepartments() {
    try {
        console.log('Fetching departments from Strapi...');
        const response = await fetch(`${STRAPI_API_URL}/departments?populate=*`);
        
        if (!response.ok) {
            console.error('API response not ok:', response.status, response.statusText);
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle Strapi v4 response structure
        if (data.data && Array.isArray(data.data)) {
            console.log(`Fetched ${data.data.length} departments from API`);
            return data.data;
        } else if (Array.isArray(data)) {
            console.log(`Fetched ${data.length} departments from API`);
            return data;
        } else {
            console.error('Unexpected API response structure:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
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
            return 'Department details available.';
        }
    }
    
    return 'Department details available.';
}

// Helper function to get department data
function getDepartmentData(department) {
    const hasAttributes = department.attributes !== undefined;
    return hasAttributes ? department.attributes : department;
}

// Helper function to get department name
function getDepartmentName(department) {
    const attrs = getDepartmentData(department);
    return attrs?.name || 'Unknown Department';
}

// Helper function to get department category
function getDepartmentCategory(department) {
    const attrs = getDepartmentData(department);
    return attrs?.category || 'clinical';
}

// Helper function to get department icon
function getDepartmentIcon(department) {
    const attrs = getDepartmentData(department);
    return attrs?.icon_class || 'fas fa-hospital';
}

// Helper function to get image URL
function getDepartmentImageUrl(department) {
    const attrs = getDepartmentData(department);
    
    let imageUrl = 'https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70';
    
    try {
        if (department.attributes?.image?.data?.attributes?.url) {
            imageUrl = `${STRAPI_IMAGE_URL}${department.attributes.image.data.attributes.url}`;
        } else if (department.image?.data?.attributes?.url) {
            imageUrl = `${STRAPI_IMAGE_URL}${department.image.data.attributes.url}`;
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

// Function to render department card
function renderDepartmentCard(department) {
    if (!department) {
        return '<div class="department-card error">Error: Department data missing</div>';
    }
    
    const attrs = getDepartmentData(department);
    const departmentId = department.id || '';
    
    const name = getDepartmentName(department);
    const category = getDepartmentCategory(department);
    const icon = getDepartmentIcon(department);
    const description = extractTextFromRichText(attrs.description);
    const imageUrl = getDepartmentImageUrl(department);
    
    // Parse services if available
    let services = [];
    try {
        if (attrs.services) {
            if (typeof attrs.services === 'string') {
                services = JSON.parse(attrs.services);
            } else {
                services = attrs.services;
            }
        }
    } catch (e) {
        console.warn('Error parsing services:', e);
        services = ['Service 1', 'Service 2', 'Service 3'];
    }
    
    // Ensure services is an array
    services = Array.isArray(services) ? services : [];
    
    // Limit services display
    const displayServices = services.slice(0, 5);
    
    // Get contact information
    const headOfDepartment = attrs.head_of_department || 'To be assigned';
    const headQualification = attrs.head_qualification || '';
    const headExperience = attrs.head_experience || '';
    const extension = attrs.extension || 'N/A';
    const email = attrs.email || 'info@ktrh.or.ke';
    const location = attrs.location || 'Main Hospital Building';
    
    return `
        <div class="department-card ${category}" id="${attrs.slug || departmentId}">
            <div class="dept-header">
                <div class="dept-icon">
                    <i class="${icon}"></i>
                </div>
                <h2>${name}</h2>
                <span class="dept-tag">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </div>
            <div class="dept-content">
                <div class="dept-image">
                    <img src="${imageUrl}" alt="${name}" loading="lazy">
                </div>
                <div class="dept-info">
                    <h3>${attrs.title || `${name} Department`}</h3>
                    <p class="dept-description">${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</p>
                    
                    <div class="dept-services">
                        <h4><i class="fas fa-stethoscope"></i> Services Offered:</h4>
                        <ul>
                            ${displayServices.map(service => `<li>${service}</li>`).join('')}
                            ${services.length > 5 ? '<li>... and more</li>' : ''}
                        </ul>
                    </div>
                    
                    <div class="dept-staff">
                        <h4><i class="fas fa-user-md"></i> Head of Department:</h4>
                        <p><strong>${headOfDepartment}</strong>${headQualification ? ` - ${headQualification}` : ''}${headExperience ? `, ${headExperience}` : ''}</p>
                    </div>
                    
                    <div class="dept-contact">
                        <h4><i class="fas fa-phone"></i> Contact:</h4>
                        <p>Extension: ${extension} | Email: ${email}</p>
                    </div>
                    
                    <div class="dept-actions">
                        <a href="appointment.html" class="btn-appointment">
                            <i class="fas fa-calendar-check"></i> Book Appointment
                        </a>
                        <a href="#${attrs.slug || departmentId}-details" class="btn-details" data-dept="${departmentId}">
                            <i class="fas fa-info-circle"></i> View Details
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to render departments grid
function renderDepartmentsGrid(departments) {
    if (!departmentsContainer) {
        console.error('Departments container not found');
        return;
    }
    
    if (!Array.isArray(departments) || departments.length === 0) {
        departmentsContainer.innerHTML = `
            <div class="no-departments-message">
                <i class="fas fa-hospital" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No departments available</h3>
                <p>Please check your Strapi connection or add departments in the admin panel.</p>
                <button onclick="location.reload()" class="btn-appointment" style="margin-top: 1rem;">
                    <i class="fas fa-sync-alt"></i> Refresh Page
                </button>
            </div>
        `;
        return;
    }
    
    departmentsContainer.innerHTML = departments.map(dept => renderDepartmentCard(dept)).join('');
    
    // Re-attach event listeners to new buttons
    attachViewDetailsListeners();
}

// Function to filter departments by category
function filterDepartmentsByCategory(category) {
    console.log('Filtering departments by category:', category);
    
    if (category === 'all') {
        displayedDepartments = allDepartments;
    } else {
        displayedDepartments = allDepartments.filter(department => {
            const deptCategory = getDepartmentCategory(department);
            return deptCategory === category;
        });
    }
    
    renderDepartmentsGrid(displayedDepartments);
    console.log(`Displaying ${displayedDepartments.length} departments in ${category} category`);
}

// Function to search departments
function searchDepartments(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        displayedDepartments = allDepartments;
    } else {
        displayedDepartments = allDepartments.filter(department => {
            const attrs = getDepartmentData(department);
            const name = getDepartmentName(department).toLowerCase();
            const description = extractTextFromRichText(attrs.description).toLowerCase();
            const category = getDepartmentCategory(department).toLowerCase();
            
            return name.includes(term) ||
                   description.includes(term) ||
                   category.includes(term);
        });
    }
    
    renderDepartmentsGrid(displayedDepartments);
}

// Function to show department modal
async function showDepartmentModal(departmentId) {
    try {
        const response = await fetch(`${STRAPI_API_URL}/departments/${departmentId}?populate=*`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch department: ${response.status}`);
        }
        
        const data = await response.json();
        const department = data.data || data;
        
        if (!department) {
            modalBody.innerHTML = '<p>Department data not found.</p>';
            return;
        }
        
        const attrs = getDepartmentData(department);
        const name = getDepartmentName(department);
        const icon = getDepartmentIcon(department);
        const description = extractTextFromRichText(attrs.description);
        const imageUrl = getDepartmentImageUrl(department);
        
        // Parse JSON fields
        const services = parseJSONField(attrs.services, []);
        const equipment = parseJSONField(attrs.equipment, []);
        const staff = parseJSONField(attrs.staff, []);
        const stats = parseJSONField(attrs.stats, {});
        const contact = parseJSONField(attrs.contact, {});
        
        // Default contact info
        const defaultContact = {
            phone: attrs.extension ? `+254 758 721 997 (Ext: ${attrs.extension})` : '+254 758 721 997',
            email: attrs.email || `${attrs.slug || 'info'}@ktrh.or.ke`,
            location: attrs.location || 'Main Hospital Building',
            hours: attrs.operating_hours || 'Mon-Fri: 8:00 AM - 5:00 PM, Emergency: 24/7'
        };
        
        const finalContact = { ...defaultContact, ...contact };
        
        // Default stats
        const defaultStats = {
            patients: '1000+ annually',
            procedures: '500+ procedures yearly',
            successRate: '95%'
        };
        
        const finalStats = { ...defaultStats, ...stats };
        
        let modalHTML = `
            <div class="modal-header">
                <div class="modal-icon">
                    <i class="${icon}"></i>
                </div>
                <h2>${name} Department</h2>
            </div>
            
            <div class="modal-image">
                <img src="${imageUrl}" alt="${name}" loading="lazy">
            </div>
            
            <p class="modal-description">${description}</p>
            
            <div class="modal-details">
        `;
        
        // Services Section
        if (services.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-stethoscope"></i> Services</h3>
                    <ul>
                        ${services.map(service => `<li>${service}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Equipment Section
        if (equipment.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-cogs"></i> Equipment</h3>
                    <ul>
                        ${equipment.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Staff Section
        if (staff.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-user-md"></i> Medical Team</h3>
                    <div class="staff-grid">
                        ${staff.map(member => `
                            <div class="staff-card">
                                <h4>${member.name || 'Staff Member'}</h4>
                                <p><strong>${member.role || 'Medical Staff'}</strong></p>
                                ${member.qualification ? `<p>${member.qualification}</p>` : ''}
                                ${member.experience ? `<p>Experience: ${member.experience}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (attrs.head_of_department) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-user-md"></i> Department Head</h3>
                    <div class="staff-card">
                        <h4>${attrs.head_of_department}</h4>
                        <p><strong>Head of Department</strong></p>
                        ${attrs.head_qualification ? `<p>${attrs.head_qualification}</p>` : ''}
                        ${attrs.head_experience ? `<p>Experience: ${attrs.head_experience}</p>` : ''}
                    </div>
                </div>
            `;
        }
        
        // Statistics Section
        modalHTML += `
            <div class="modal-section">
                <h3><i class="fas fa-chart-line"></i> Statistics</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <h4>${finalStats.patients}</h4>
                        <p>Patients Treated</p>
                    </div>
                    <div class="stat-item">
                        <h4>${finalStats.procedures}</h4>
                        <p>Procedures</p>
                    </div>
                    <div class="stat-item">
                        <h4>${finalStats.successRate}</h4>
                        <p>Success Rate</p>
                    </div>
                </div>
            </div>
        `;
        
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
            
            <div class="modal-actions">
                <a href="appointment.html" class="modal-action-btn primary">
                    <i class="fas fa-calendar-check"></i> Book Appointment
                </a>
                <button class="modal-action-btn secondary" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Details
                </button>
            </div>
        `;
        
        modalBody.innerHTML = modalHTML;
        deptModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error fetching department details:', error);
        modalBody.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f39c12; margin-bottom: 1rem;"></i>
                <h3>Error Loading Details</h3>
                <p>Unable to load department details. Please try again later.</p>
                <button class="btn-appointment" onclick="closeModal()" style="margin-top: 1rem;">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        deptModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Function to attach view details listeners
function attachViewDetailsListeners() {
    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const departmentId = this.getAttribute('data-dept');
            if (departmentId) {
                showDepartmentModal(departmentId);
            }
        });
    });
}

// Close modal function
function closeModal() {
    if (deptModal) {
        deptModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize the page
async function initializePage() {
    console.log('Departments page loaded, initializing...');
    
    // Get DOM elements
    departmentsContainer = document.getElementById('departmentsContainer');
    deptSearch = document.getElementById('deptSearch');
    filterBtns = document.querySelectorAll('.filter-btn');
    deptModal = document.getElementById('deptModal');
    modalCloseBtn = document.getElementById('modalClose');
    modalBody = document.getElementById('modalBody');
    chatWidget = document.getElementById('chatWidget');
    chatCloseBtn = document.getElementById('chatClose');
    backToTopBtn = document.getElementById('backToTop');
    
    // Fetch departments from Strapi
    console.log('Fetching departments from API...');
    allDepartments = await fetchDepartments();
    console.log(`Fetched ${allDepartments.length} departments`);
    
    if (allDepartments.length === 0) {
        console.warn('No departments fetched from API');
        if (departmentsContainer) {
            departmentsContainer.innerHTML = `
                <div class="no-departments-message">
                    <i class="fas fa-hospital" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>No departments available</h3>
                    <p>Please check your Strapi connection or add departments in the admin panel.</p>
                    <button onclick="location.reload()" class="btn-appointment" style="margin-top: 1rem;">
                        <i class="fas fa-sync-alt"></i> Refresh Page
                    </button>
                </div>
            `;
        }
    } else {
        // Remove loading spinner
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        // Initial display
        displayedDepartments = allDepartments;
        renderDepartmentsGrid(displayedDepartments);
    }
    
    // Set up filter functionality
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter departments
                filterDepartmentsByCategory(filter);
            });
        });
    }
    
    // Set up search functionality
    if (deptSearch) {
        deptSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value;
            searchDepartments(searchTerm);
        });
    }
    
    // Set up modal functionality
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    if (deptModal) {
        deptModal.addEventListener('click', function(e) {
            if (e.target === deptModal) {
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
    
    console.log('Departments page initialized successfully');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);