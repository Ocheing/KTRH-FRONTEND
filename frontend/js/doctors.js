// Strapi API Configuration
const STRAPI_API_URL = 'http://localhost:1337/api';
const STRAPI_IMAGE_URL = 'http://localhost:1337';

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
let visibleCount = 9; // Initial number of doctors to show

// Function to fetch doctors from Strapi
async function fetchDoctors() {
    try {
        console.log('Fetching doctors from Strapi...');
        const response = await fetch(`${STRAPI_API_URL}/doctors?populate=*`);
        if (!response.ok) {
            console.error('API response not ok:', response.status, response.statusText);
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle Strapi v4 response structure
        if (data.data && Array.isArray(data.data)) {
            console.log(`Fetched ${data.data.length} doctors from API`);
            return data.data;
        } else if (Array.isArray(data)) {
            console.log(`Fetched ${data.length} doctors from API`);
            return data;
        } else {
            console.error('Unexpected API response structure:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
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
            return 'Achievement details available.';
        }
    }
    
    return 'Achievement details available.';
}

// Helper function to get doctor department - IMPROVED
function getDoctorDepartment(doctor) {
    const hasAttributes = doctor.attributes !== undefined;
    const attrs = hasAttributes ? doctor.attributes : doctor;
    
    if (!attrs) return 'General Medicine';
    
    // Get department name
    let department = attrs.department || 'General Medicine';
    
    // If department is an object (relation), extract the name
    if (department && typeof department === 'object') {
        if (department.data) {
            // Handle Strapi v4 nested structure
            if (department.data.attributes && department.data.attributes.name) {
                department = department.data.attributes.name;
            } else if (department.data.name) {
                department = department.data.name;
            }
        } else if (department.attributes && department.attributes.name) {
            // Alternative Strapi structure
            department = department.attributes.name;
        } else if (department.name) {
            department = department.name;
        } else {
            // Try to extract from other properties
            department = JSON.stringify(department).replace(/[{"}]/g, '');
        }
    }
    
    // Clean up the department name
    if (typeof department === 'string') {
        return department.trim();
    }
    
    return 'General Medicine';
}

// Helper function to get doctor name
function getDoctorName(doctor) {
    const hasAttributes = doctor.attributes !== undefined;
    const attrs = hasAttributes ? doctor.attributes : doctor;
    return attrs?.name || 'Unknown Doctor';
}

// Function to render doctor cards
function renderDoctorCard(doctor) {
    if (!doctor) {
        return '<div class="doctor-card error">Error: Doctor data missing</div>';
    }
    
    const hasAttributes = doctor.attributes !== undefined;
    const attrs = hasAttributes ? doctor.attributes : doctor;
    
    if (!attrs) {
        return '<div class="doctor-card error">Error: Doctor attributes missing</div>';
    }
    
    // Get department
    const department = getDoctorDepartment(doctor);
    const name = getDoctorName(doctor);
    
    // Get image URL
    let imageUrl = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70';
    
    try {
        if (hasAttributes && doctor.attributes.image?.data?.attributes?.url) {
            imageUrl = `${STRAPI_IMAGE_URL}${doctor.attributes.image.data.attributes.url}`;
        } else if (doctor.image?.data?.attributes?.url) {
            imageUrl = `${STRAPI_IMAGE_URL}${doctor.image.data.attributes.url}`;
        } else if (attrs.image?.url) {
            imageUrl = attrs.image.url.startsWith('http') 
                ? attrs.image.url 
                : `${STRAPI_IMAGE_URL}${attrs.image.url}`;
        }
    } catch (imageError) {
        console.warn('Error getting image URL:', imageError);
    }
    
    // Extract other fields
    const title = attrs.title || 'Medical Doctor';
    const bio = attrs.bio || 'No biography available.';
    const experience = attrs.experience || 'Not specified';
    const consultation_hours = attrs.consultation_hours || attrs.consultationHours || 'To be announced';
    const slug = attrs.slug || doctor.id || '';
    const doctorId = doctor.id || '';
    
    // Parse JSON fields safely
    let qualifications = [];
    let expertise = [];
    
    try {
        if (attrs.qualifications) {
            qualifications = typeof attrs.qualifications === 'string' 
                ? JSON.parse(attrs.qualifications) 
                : attrs.qualifications;
        }
        
        if (attrs.expertise) {
            expertise = typeof attrs.expertise === 'string' 
                ? JSON.parse(attrs.expertise) 
                : attrs.expertise;
        }
    } catch (parseError) {
        console.warn('Error parsing JSON fields:', parseError);
        if (Array.isArray(attrs.qualifications)) qualifications = attrs.qualifications;
        if (Array.isArray(attrs.expertise)) expertise = attrs.expertise;
    }
    
    qualifications = Array.isArray(qualifications) ? qualifications : [];
    expertise = Array.isArray(expertise) ? expertise : [];
    
    return `
        <div class="doctor-card ${department.toLowerCase().replace(/\s+/g, '-')}" 
             data-name="${name}" 
             data-id="${doctorId}"
             data-department="${department}"
             data-experience="${experience}">
            <div class="doctor-image">
                <img src="${imageUrl}" alt="${name}" loading="lazy">
                <div class="doctor-overlay">
                    <div class="overlay-content">
                        <span class="doctor-department">${department}</span>
                        <h3>${name}</h3>
                        <p>${title}</p>
                    </div>
                </div>
            </div>
            <div class="doctor-content">
                <div class="doctor-header">
                    <h2>${name}</h2>
                    <span class="doctor-specialty">${department}</span>
                </div>
                
                <div class="doctor-qualifications">
                    ${qualifications.length > 0 ? qualifications.map(qual => `
                        <div class="qualification">
                            <i class="fas fa-graduation-cap"></i>
                            <span>${qual}</span>
                        </div>
                    `).join('') : '<div class="qualification"><i class="fas fa-graduation-cap"></i><span>Qualifications not specified</span></div>'}
                </div>
                
                <p class="doctor-bio">
                    ${bio}
                </p>
                
                <div class="doctor-details">
                    <div class="detail">
                        <i class="fas fa-clock"></i>
                        <div>
                            <strong>Consultation Hours</strong>
                            <span>${consultation_hours}</span>
                        </div>
                    </div>
                    <div class="detail">
                        <i class="fas fa-star"></i>
                        <div>
                            <strong>Experience</strong>
                            <span>${experience}</span>
                        </div>
                    </div>
                </div>
                
                <div class="doctor-expertise">
                    <h4><i class="fas fa-stethoscope"></i> Expertise:</h4>
                    <div class="expertise-tags">
                        ${expertise.length > 0 ? expertise.map(exp => `<span>${exp}</span>`).join('') : '<span>General Medicine</span>'}
                    </div>
                </div>
                
                <div class="doctor-actions">
                    <a href="appointment.html?doctor=${slug || doctorId}" class="btn-book">
                        <i class="fas fa-calendar-check"></i> Book Appointment
                    </a>
                    <button class="btn-profile" data-id="${doctorId}">
                        <i class="fas fa-user-md"></i> View Profile
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Function to filter doctors by department - FIXED
function filterDoctorsByDepartment(department) {
    console.log('Filtering by department:', department);
    
    currentDepartment = department;
    currentSearchTerm = ''; // Clear search when changing departments
    
    // Reset visible count when changing departments
    visibleCount = 9;
    
    // Clear search input
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (department === 'all') {
        displayedDoctors = allDoctors;
        console.log(`Showing all ${displayedDoctors.length} doctors`);
    } else {
        // Use exact case-insensitive matching
        const filterDept = department.toLowerCase().trim();
        
        displayedDoctors = allDoctors.filter(doctor => {
            const doctorDept = getDoctorDepartment(doctor).toLowerCase().trim();
            
            // Check for exact match
            return doctorDept === filterDept;
        });
        
        console.log(`Found ${displayedDoctors.length} doctors in "${department}" department`);
        
        // Debug: List the doctors found
        if (displayedDoctors.length > 0) {
            console.log('Doctors found in this department:');
            displayedDoctors.forEach(doctor => {
                console.log(`- ${getDoctorName(doctor)}: ${getDoctorDepartment(doctor)}`);
            });
        }
    }
    
    renderDoctorsGrid();
    updateStats();
    updateLoadMoreButton();
}

// Function to filter doctors by search term
function filterDoctorsBySearch(doctors, searchTerm) {
    currentSearchTerm = searchTerm.toLowerCase().trim();
    
    if (!currentSearchTerm) {
        return doctors;
    }
    
    return doctors.filter(doctor => {
        const name = getDoctorName(doctor).toLowerCase();
        const department = getDoctorDepartment(doctor).toLowerCase();
        const attrs = doctor.attributes || doctor;
        const title = (attrs.title || '').toLowerCase();
        const bio = (attrs.bio || '').toLowerCase();
        
        return name.includes(currentSearchTerm) ||
               department.includes(currentSearchTerm) ||
               title.includes(currentSearchTerm) ||
               bio.includes(currentSearchTerm);
    });
}

// Function to search doctors
function searchDoctors(searchTerm) {
    console.log('Searching for:', searchTerm);
    
    currentSearchTerm = searchTerm;
    
    // If there's a search term, search across all doctors
    if (searchTerm.trim() !== '') {
        displayedDoctors = filterDoctorsBySearch(allDoctors, searchTerm);
        currentDepartment = 'all'; // Reset department filter when searching
        
        // Update department buttons to show "All" as active
        if (departmentButtons) {
            departmentButtons.forEach(btn => {
                if (btn.dataset.filter === 'all') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    } else {
        // If search is cleared, go back to current department filter
        filterDoctorsByDepartment(currentDepartment);
    }
    
    // Reset visible count when searching
    visibleCount = 9;
    
    renderDoctorsGrid();
    updateStats();
    updateLoadMoreButton();
}

// Function to render doctors grid with pagination
function renderDoctorsGrid() {
    if (!doctorsGrid) {
        console.error('Doctors grid element not found');
        return;
    }
    
    if (!Array.isArray(displayedDoctors) || displayedDoctors.length === 0) {
        doctorsGrid.innerHTML = `
            <div class="no-doctors-message">
                <i class="fas fa-user-md" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No doctors found</h3>
                <p>${currentSearchTerm ? 'No doctors match your search. Try a different search term.' : 'No doctors available in this department.'}</p>
                ${currentDepartment !== 'all' ? `<p>Try selecting "All Doctors" to see all available doctors.</p>` : ''}
            </div>
        `;
        return;
    }
    
    // Show only limited number of doctors
    const doctorsToShow = displayedDoctors.slice(0, visibleCount);
    
    doctorsGrid.innerHTML = doctorsToShow.map(doctor => renderDoctorCard(doctor)).join('');
    
    // Re-attach event listeners to new buttons
    attachProfileButtonListeners();
}

// Function to update stats dynamically
function updateStats() {
    // Calculate stats from all doctors (not just displayed)
    const totalDoctors = allDoctors.length;
    
    // Calculate specialists (doctors in specific departments)
    const specialists = allDoctors.filter(doctor => {
        const department = getDoctorDepartment(doctor).toLowerCase();
        // Define what departments are considered "specialists"
        const specialistDepartments = [
            'cardiology', 'neurology', 'orthopedics', 'surgery',
            'pediatrics', 'dermatology', 'oncology', 'ophthalmology',
            'gastroenterology', 'endocrinology', 'nephrology'
        ];
        return specialistDepartments.some(specDept => 
            department.includes(specDept) || specDept.includes(department)
        );
    }).length;
    
    // Calculate average experience
    let totalExperience = 0;
    let doctorsWithExperience = 0;
    
    allDoctors.forEach(doctor => {
        const attrs = doctor.attributes || doctor;
        const experience = attrs.experience || '';
        
        // Try to extract number from experience string
        if (experience) {
            const match = experience.match(/\d+/);
            if (match) {
                totalExperience += parseInt(match[0]);
                doctorsWithExperience++;
            }
        }
    });
    
    const avgExperience = doctorsWithExperience > 0 
        ? Math.round(totalExperience / doctorsWithExperience)
        : 5; // Default if no experience data
    
    // Calculate international training
    const internationalTraining = allDoctors.filter(doctor => {
        const attrs = doctor.attributes || doctor;
        const qualifications = attrs.qualifications || '';
        const training = attrs.training || '';
        const bio = attrs.bio || '';
        
        // Check for international indicators
        const text = `${qualifications} ${training} ${bio}`.toLowerCase();
        return text.includes('international') || 
               text.includes('abroad') || 
               text.includes('foreign') ||
               text.includes('overseas') ||
               text.includes('global');
    }).length;
    
    // Update stats in the DOM
    const totalDoctorsElement = document.getElementById('total-doctors');
    const specialistsElement = document.getElementById('specialists');
    const avgExperienceElement = document.getElementById('avg-experience');
    const intlTrainingElement = document.getElementById('intl-training');
    
    // Alternative: Check for stat cards if elements by ID don't exist
    const statCards = document.querySelectorAll('.stat-card');
    
    if (totalDoctorsElement) {
        totalDoctorsElement.textContent = `${totalDoctors}+`;
    } else if (statCards.length >= 1) {
        statCards[0].querySelector('h3').textContent = `${totalDoctors}+`;
    }
    
    if (specialistsElement) {
        specialistsElement.textContent = `${specialists}+`;
    } else if (statCards.length >= 2) {
        statCards[1].querySelector('h3').textContent = `${specialists}+`;
    }
    
    if (avgExperienceElement) {
        avgExperienceElement.textContent = `${avgExperience}+`;
    } else if (statCards.length >= 3) {
        statCards[2].querySelector('h3').textContent = `${avgExperience}+`;
    }
    
    if (intlTrainingElement) {
        intlTrainingElement.textContent = `${internationalTraining}+`;
    } else if (statCards.length >= 4) {
        statCards[3].querySelector('h3').textContent = `${internationalTraining}+`;
    }
    
    console.log('Stats updated:', {
        totalDoctors,
        specialists,
        avgExperience,
        internationalTraining
    });
}

// Function to update load more button visibility
function updateLoadMoreButton() {
    if (loadMoreBtn) {
        if (displayedDoctors.length > visibleCount) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> View More Doctors';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// Function to load more doctors
function loadMoreDoctors() {
    if (!loadMoreBtn) return;
    
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    // Increase visible count
    visibleCount += 6;
    
    setTimeout(() => {
        renderDoctorsGrid();
        updateLoadMoreButton();
        
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> View More Doctors';
    }, 500);
}

// Function to attach profile button listeners
function attachProfileButtonListeners() {
    document.querySelectorAll('.btn-profile').forEach(btn => {
        btn.addEventListener('click', async function() {
            const doctorId = this.getAttribute('data-id');
            if (doctorId) {
                await showDoctorModal(doctorId);
            }
        });
    });
}

// Function to render featured doctor section
async function renderFeaturedDoctor() {
    try {
        const featuredContainer = document.querySelector('.featured-doctor');
        const sectionHeader = document.querySelector('.doctor-featured .section-header');
        
        if (!featuredContainer) {
            console.log('Featured doctor container not found');
            return;
        }
        
        // First, try to get featured doctor from Strapi
        const response = await fetch(`${STRAPI_API_URL}/doctors?filters[is_featured][$eq]=true&populate=*`);
        
        if (!response.ok) {
            console.error('Featured doctor API error:', response.status);
            hideFeaturedDoctorSection(featuredContainer, sectionHeader);
            return;
        }
        
        const data = await response.json();
        const doctors = data.data || data;
        
        if (Array.isArray(doctors) && doctors.length > 0) {
            // Found featured doctor(s) - use the first one
            const featuredDoctor = doctors[0];
            displayFeaturedDoctor(featuredDoctor);
        } else {
            // No featured doctor set - hide the entire section
            hideFeaturedDoctorSection(featuredContainer, sectionHeader);
        }
    } catch (error) {
        console.error('Error in renderFeaturedDoctor:', error);
        const featuredContainer = document.querySelector('.featured-doctor');
        const sectionHeader = document.querySelector('.doctor-featured .section-header');
        hideFeaturedDoctorSection(featuredContainer, sectionHeader);
    }
}

// Helper function to display featured doctor
function displayFeaturedDoctor(doctor) {
    const attrs = doctor.attributes || doctor;
    
    if (!attrs) {
        console.error('Invalid featured doctor data');
        return;
    }
    
    // Get image URL safely
    let imageUrl = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
    
    if (doctor.attributes?.image?.data?.attributes?.url) {
        imageUrl = `${STRAPI_IMAGE_URL}${doctor.attributes.image.data.attributes.url}`;
    } else if (doctor.image?.data?.attributes?.url) {
        imageUrl = `${STRAPI_IMAGE_URL}${doctor.image.data.attributes.url}`;
    } else if (attrs.image?.url) {
        imageUrl = attrs.image.url.startsWith('http') 
            ? attrs.image.url 
            : `${STRAPI_IMAGE_URL}${attrs.image.url}`;
    }
    
    const name = attrs.name || 'Featured Doctor';
    const title = attrs.title || 'Medical Specialist';
    const slug = attrs.slug || doctor.id || '';
    const lastName = name.split(' ').pop() || name;
    const department = getDoctorDepartment(doctor);
    
    // Handle achievements from Rich Text field using helper function
    let achievementsText = 'Recognized for excellence in patient care and outstanding contributions to our hospital.';
    if (attrs.achievements) {
        achievementsText = extractTextFromRichText(attrs.achievements);
        
        // Limit length for better display
        if (achievementsText.length > 250) {
            achievementsText = achievementsText.substring(0, 250) + '...';
        }
    }
    
    // Parse stats safely - IMPORTANT: Stats should be a JSON object in Strapi
    let stats = {};
    let procedures = '250+';
    let successRate = '99%';
    let patientSatisfaction = '98%';
    
    try {
        if (attrs.stats) {
            if (typeof attrs.stats === 'string') {
                stats = JSON.parse(attrs.stats);
            } else {
                stats = attrs.stats;
            }
            
            // Extract specific stats with fallbacks
            procedures = stats.procedures || stats.proceduresThisYear || '250+';
            successRate = stats.successRate || stats.success_rate || '99%';
            patientSatisfaction = stats.patientSatisfaction || stats.patient_satisfaction || '98%';
            
            // Ensure percentages have % sign
            if (successRate && !successRate.includes('%')) successRate += '%';
            if (patientSatisfaction && !patientSatisfaction.includes('%')) patientSatisfaction += '%';
        }
    } catch (e) {
        console.warn('Error parsing stats:', e);
        // Keep the default values if parsing fails
    }
    
    const experience = attrs.experience || '10+ Years';
    
    const featuredContainer = document.querySelector('.featured-doctor');
    if (featuredContainer) {
        featuredContainer.innerHTML = `
            <div class="featured-image">
                <img src="${imageUrl}" alt="${name}" loading="lazy">
                <div class="featured-badge">
                    <i class="fas fa-award"></i> Doctor of the Month
                </div>
                <div class="featured-department">${department}</div>
            </div>
            <div class="featured-content">
                <div class="featured-header">
                    <h3>${name}</h3>
                    <p class="featured-specialty">${title}</p>
                    <p class="featured-description">Honored for exceptional medical leadership and patient care excellence</p>
                </div>
                
                <div class="featured-achievement">
                    <h4><i class="fas fa-trophy"></i> This Month's Achievement</h4>
                    <p>${achievementsText}</p>
                </div>
                
                <div class="featured-stats">
                    <div class="stat">
                        <h4>${procedures}</h4>
                        <p>Procedures This Year</p>
                    </div>
                    <div class="stat">
                        <h4>${successRate}</h4>
                        <p>Success Rate</p>
                    </div>
                    <div class="stat">
                        <h4>${patientSatisfaction}</h4>
                        <p>Patient Satisfaction</p>
                    </div>
                    <div class="stat">
                        <h4>${experience}</h4>
                        <p>Experience</p>
                    </div>
                </div>
                
                <div class="featured-actions">
                    <a href="appointment.html?doctor=${slug}" class="featured-btn">
                        <i class="fas fa-calendar-check"></i> Book with Dr. ${lastName}
                    </a>
                </div>
                
                <div class="featured-info">
                    <p><i class="fas fa-info-circle"></i> The "Doctor of the Month" is selected based on exceptional patient care, medical achievements, and outstanding contributions.</p>
                </div>
            </div>
        `;
    }
}

// Hide the entire featured doctor section when no doctor is featured
function hideFeaturedDoctorSection(container, sectionHeader) {
    if (container) {
        container.style.display = 'none';
    }
    if (sectionHeader) {
        sectionHeader.style.display = 'none';
    }
}

// Function to show doctor modal
async function showDoctorModal(doctorId) {
    try {
        const response = await fetch(`${STRAPI_API_URL}/doctors/${doctorId}?populate=*`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch doctor: ${response.status}`);
        }
        
        const data = await response.json();
        const doctor = data.data || data;
        
        if (!doctor) {
            modalBody.innerHTML = '<p>Doctor data not found.</p>';
            return;
        }
        
        const attrs = doctor.attributes || doctor;
        const name = getDoctorName(doctor);
        const department = getDoctorDepartment(doctor);
        
        // Get image URL
        let imageUrl = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        
        if (doctor.attributes?.image?.data?.attributes?.url) {
            imageUrl = `${STRAPI_IMAGE_URL}${doctor.attributes.image.data.attributes.url}`;
        } else if (doctor.image?.data?.attributes?.url) {
            imageUrl = `${STRAPI_IMAGE_URL}${doctor.image.data.attributes.url}`;
        } else if (attrs.image?.url) {
            imageUrl = attrs.image.url.startsWith('http') 
                ? attrs.image.url 
                : `${STRAPI_IMAGE_URL}${attrs.image.url}`;
        }
        
        // Parse various fields
        let qualifications = [];
        let expertise = [];
        let availability = [];
        let stats = {};
        
        try {
            qualifications = attrs.qualifications ? 
                (typeof attrs.qualifications === 'string' ? JSON.parse(attrs.qualifications) : attrs.qualifications) : [];
            expertise = attrs.expertise ? 
                (typeof attrs.expertise === 'string' ? JSON.parse(attrs.expertise) : attrs.expertise) : [];
            availability = attrs.availability ? 
                (typeof attrs.availability === 'string' ? JSON.parse(attrs.availability) : attrs.availability) : [];
            stats = attrs.stats ? 
                (typeof attrs.stats === 'string' ? JSON.parse(attrs.stats) : attrs.stats) : {};
        } catch (e) {
            console.warn('Error parsing modal data:', e);
        }
        
        // Ensure arrays
        qualifications = Array.isArray(qualifications) ? qualifications : [];
        expertise = Array.isArray(expertise) ? expertise : [];
        availability = Array.isArray(availability) ? availability : [];
        
        // Extract achievements text for modal
        let achievementsText = '';
        if (attrs.achievements) {
            achievementsText = extractTextFromRichText(attrs.achievements);
            if (achievementsText.length > 300) {
                achievementsText = achievementsText.substring(0, 300) + '...';
            }
        }
        
        let modalHTML = `
            <div class="modal-header">
                <img src="${imageUrl}" alt="${name}" class="modal-header-image" loading="lazy">
                <div class="modal-header-content">
                    <h2>${name}</h2>
                    <p class="modal-specialty">${attrs.title || 'Medical Doctor'}</p>
                    <span class="modal-department">${department}</span>
                </div>
            </div>
            
            <div class="modal-details-grid">
                <div class="modal-section">
                    <h3><i class="fas fa-user-md"></i> Professional Profile</h3>
                    <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
                        ${attrs.bio || 'No biography available.'}
                    </p>
                    
                    <div class="stats-grid-modal">
                        <div class="stat-item-modal">
                            <h4>${attrs.experience || 'Not specified'}</h4>
                            <p>Experience</p>
                        </div>
                        <div class="stat-item-modal">
                            <h4>${stats.successRate || 'N/A'}</h4>
                            <p>Success Rate</p>
                        </div>
                        <div class="stat-item-modal">
                            <h4>${stats.patientSatisfaction || 'N/A'}</h4>
                            <p>Patient Satisfaction</p>
                        </div>
                        <div class="stat-item-modal">
                            <h4>${stats.researchPapers || 'N/A'}</h4>
                            <p>Research Papers</p>
                        </div>
                    </div>
                </div>
                
                ${qualifications.length > 0 ? `
                <div class="modal-section">
                    <h3><i class="fas fa-graduation-cap"></i> Qualifications</h3>
                    <ul>
                        ${qualifications.map(qual => `<li>${qual}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${expertise.length > 0 ? `
                <div class="modal-section">
                    <h3><i class="fas fa-stethoscope"></i> Areas of Expertise</h3>
                    <ul>
                        ${expertise.map(exp => `<li>${exp}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${achievementsText ? `
                <div class="modal-section">
                    <h3><i class="fas fa-trophy"></i> Key Achievements</h3>
                    <div style="color: #555; line-height: 1.6;">${achievementsText}</div>
                </div>
                ` : ''}
            </div>
        `;
        
        if (availability.length > 0) {
            modalHTML += `
                <div class="modal-availability">
                    <h3><i class="fas fa-calendar-alt"></i> Consultation Schedule</h3>
                    <div class="availability-schedule">
                        ${availability.map(slot => `
                            <div class="schedule-item">
                                <div class="day">${slot.day || ''}</div>
                                <div class="time">${slot.time || ''}</div>
                            </div>
                        `).join('')}
                    </div>
                    <p style="margin-top: 15px; color: #666; font-size: 0.9rem;">
                        <i class="fas fa-info-circle"></i> For emergency cases, doctors are available on call 24/7
                    </p>
                </div>
            `;
        }
        
        modalHTML += `
            <div class="modal-actions">
                <a href="appointment.html?doctor=${attrs.slug || doctorId}" class="modal-action-btn primary">
                    <i class="fas fa-calendar-check"></i> Book Appointment
                </a>
                <button class="modal-action-btn secondary" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Profile
                </button>
            </div>
        `;
        
        modalBody.innerHTML = modalHTML;
        doctorModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error fetching doctor details:', error);
        modalBody.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f39c12; margin-bottom: 1rem;"></i>
                <h3>Error Loading Profile</h3>
                <p>Unable to load doctor details. Please try again later.</p>
                <button class="btn-book" onclick="closeModal()" style="margin-top: 1rem;">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        doctorModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Close modal function
function closeModal() {
    if (doctorModal) {
        doctorModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialize the page
async function initializePage() {
    console.log('Doctors page loaded, initializing...');
    
    // Get DOM elements
    doctorsGrid = document.getElementById('doctorsGrid');
    departmentButtons = document.querySelectorAll('.filter-btn');
    searchInput = document.getElementById('doctorsSearch');
    loadMoreBtn = document.getElementById('loadMore');
    doctorModal = document.getElementById('doctorModal');
    modalCloseBtn = document.getElementById('modalClose');
    modalBody = document.getElementById('modalBody');
    
    // Fetch and display doctors
    console.log('Fetching doctors from API...');
    allDoctors = await fetchDoctors();
    console.log(`Fetched ${allDoctors.length} doctors`);
    
    // Debug: Log all departments from fetched doctors
    console.log('All doctor departments:');
    allDoctors.forEach(doctor => {
        const dept = getDoctorDepartment(doctor);
        console.log(`- ${getDoctorName(doctor)}: ${dept}`);
    });
    
    // Get unique departments
    const uniqueDepartments = [...new Set(allDoctors.map(doctor => getDoctorDepartment(doctor)))];
    console.log('Unique departments available:', uniqueDepartments);
    
    if (allDoctors.length === 0) {
        console.warn('No doctors fetched from API');
        if (doctorsGrid) {
            doctorsGrid.innerHTML = `
                <div class="no-doctors-message">
                    <i class="fas fa-user-md" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>No doctors available</h3>
                    <p>Please check your Strapi connection or add doctors in the admin panel.</p>
                    <button onclick="location.reload()" class="btn-book" style="margin-top: 1rem;">
                        <i class="fas fa-sync-alt"></i> Refresh Page
                    </button>
                </div>
            `;
        }
    } else {
        // Initial display
        displayedDoctors = allDoctors;
        renderDoctorsGrid();
        updateStats();
    }
    
    // Render featured doctor section
    await renderFeaturedDoctor();
    
    // Set up department filtering
    if (departmentButtons) {
        console.log(`Found ${departmentButtons.length} department buttons`);
        
        departmentButtons.forEach(btn => {
            const department = btn.dataset.filter;
            console.log(`Button: "${btn.textContent}" -> data-filter: "${department}"`);
            
            btn.addEventListener('click', function() {
                console.log(`Clicked department: ${department}`);
                
                // Update active button
                departmentButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter doctors by department
                filterDoctorsByDepartment(department);
            });
        });
    }
    
    // Set up search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value;
            searchDoctors(searchTerm);
        });
    }
    
    // Set up load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreDoctors);
    }
    
    // Set up modal functionality
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    if (doctorModal) {
        doctorModal.addEventListener('click', function(e) {
            if (e.target === doctorModal) {
                closeModal();
            }
        });
    }
    
    // Set current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    console.log('Doctors page initialized successfully');
}

// Make closeModal globally available
window.closeModal = closeModal;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);