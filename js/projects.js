// ===========================================
// PROJECTS PAGE - STRAPI INTEGRATION - FIXED VERSION
// ===========================================

// Shared Strapi API Configuration (same as doctors page)
const STRAPI_API_URL = 'http://localhost:1337/api';
const STRAPI_IMAGE_URL = 'http://localhost:1337';

// DOM Elements
let projectsGrid;
let categoryButtons;
let projectsSearch;
let loadMoreBtn;
let projectModal;
let modalBody;
let modalCloseBtn;
let searchButton;

// State Management
let currentCategory = 'all';
let currentPage = 1;
const projectsPerPage = 6;
let allProjects = [];
let filteredProjects = [];
let visibleCount = 6;

// Helper function to get attributes from Strapi response
function getAttributes(data) {
    if (!data) return null;
    
    // Handle Strapi v4 response structure
    if (data.attributes !== undefined) {
        return data.attributes;
    }
    
    // Handle nested data structure
    if (data.data && data.data.attributes) {
        return data.data.attributes;
    }
    
    // Handle direct attributes
    if (typeof data === 'object' && !Array.isArray(data)) {
        return data;
    }
    
    console.warn('Unable to extract attributes from:', data);
    return {};
}

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return 'Ongoing';
    
    try {
        const date = new Date(dateString);
        // Handle invalid dates
        if (isNaN(date.getTime())) {
            return dateString;
        }
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.warn('Error formatting date:', error);
        return dateString || 'Ongoing';
    }
}

// Helper function to get image URL (consistent with doctors page)
function getImageUrl(imageData) {
    if (!imageData) {
        // Return a default project image
        return 'https://images.unsplash.com/photo-1516549655669-df6654e435de?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
    }
    
    let imageUrl = '';
    
    // Handle different Strapi image structures
    if (imageData.data?.attributes?.url) {
        imageUrl = imageData.data.attributes.url;
    } else if (imageData.attributes?.url) {
        imageUrl = imageData.attributes.url;
    } else if (imageData.url) {
        imageUrl = imageData.url;
    } else if (typeof imageData === 'string') {
        imageUrl = imageData;
    }
    
    // Add base URL if needed
    if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${STRAPI_IMAGE_URL}${imageUrl}`;
    }
    
    return imageUrl || 'https://images.unsplash.com/photo-1516549655669-df6654e435de?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
}

// Function to fetch projects from Strapi
async function fetchProjects() {
    try {
        console.log('Fetching projects from Strapi...');
        
        // Use same structure as doctors page
        const response = await fetch(`${STRAPI_API_URL}/projects?populate=*`);
        
        if (!response.ok) {
            console.error('API response not ok:', response.status, response.statusText);
            return getFallbackProjects();
        }
        
        const data = await response.json();
        
        // Handle Strapi v4 response structure (same as doctors page)
        let projects = [];
        if (data.data && Array.isArray(data.data)) {
            console.log(`Fetched ${data.data.length} projects from API`);
            projects = data.data;
        } else if (Array.isArray(data)) {
            console.log(`Fetched ${data.length} projects from API`);
            projects = data;
        } else {
            console.error('Unexpected API response structure:', data);
            return getFallbackProjects();
        }
        
        return projects;
        
    } catch (error) {
        console.error('Error fetching projects:', error);
        return getFallbackProjects();
    }
}

// Function to calculate project statistics from the projects data
function calculateProjectStats(projects) {
    console.log('Calculating project statistics...');
    
    // Initialize counters
    let activeProjects = 0;
    let completedProjects = 0;
    let upcomingProjects = 0;
    let totalInvestment = 0;
    let partnerOrganizations = new Set();
    
    // Calculate from projects
    projects.forEach(project => {
        const attributes = getAttributes(project);
        const category = attributes?.category || 'ongoing';
        
        // Count by category
        if (category === 'ongoing') activeProjects++;
        if (category === 'completed') completedProjects++;
        if (category === 'upcoming') upcomingProjects++;
        
        // Extract investment value (try to parse budget string)
        if (attributes?.budget) {
            const budgetStr = attributes.budget.toString();
            // Try to extract numeric value (e.g., "KES 850M" -> 850)
            const match = budgetStr.match(/[\d.]+/);
            if (match) {
                const value = parseFloat(match[0]);
                // Handle multipliers (M for million, B for billion)
                if (budgetStr.includes('B')) {
                    totalInvestment += value * 1000; // Convert billion to million
                } else if (budgetStr.includes('M')) {
                    totalInvestment += value;
                } else {
                    totalInvestment += value / 1000000; // Assume it's in regular units
                }
            }
        }
        
        // Add partners to set (unique)
        if (attributes?.partner) {
            partnerOrganizations.add(attributes.partner);
        }
        if (attributes?.contractor) {
            partnerOrganizations.add(attributes.contractor);
        }
    });
    
    // Format total investment
    let formattedInvestment;
    if (totalInvestment >= 1000) {
        formattedInvestment = `KES ${(totalInvestment / 1000).toFixed(1)}B`;
    } else {
        formattedInvestment = `KES ${totalInvestment.toFixed(1)}M`;
    }
    
    return {
        totalProjects: projects.length,
        activeProjects: activeProjects,
        completedProjects: completedProjects,
        upcomingProjects: upcomingProjects,
        totalInvestment: formattedInvestment,
        partnerOrganizations: partnerOrganizations.size
    };
}

// Fallback project data
function getFallbackProjects() {
    console.log('Using fallback project data');
    return [
        {
            id: 1,
            attributes: {
                title: "New Cardiac Center",
                shortDescription: "State-of-the-art cardiac care facility with 50 beds",
                category: "ongoing",
                status: "75% Complete",
                progress: 75,
                startDate: "2024-01-01",
                endDate: "2024-12-31",
                budget: "KES 850M",
                contractor: "BuildRight Constructions",
                image: {
                    data: {
                        attributes: {
                            url: "/uploads/cardiac_center_12345.jpg"
                        }
                    }
                },
                impact: [
                    "50-bed facility with 5 cath labs",
                    "Regional cardiac care hub",
                    "200+ permanent jobs created"
                ]
            }
        },
        {
            id: 2,
            attributes: {
                title: "MRI & CT Scan Center",
                shortDescription: "Advanced diagnostic imaging facility serving 100+ patients daily",
                category: "completed",
                status: "Completed",
                progress: 100,
                startDate: "2023-01-01",
                endDate: "2023-12-15",
                budget: "KES 450M",
                partner: "GE Healthcare",
                image: {
                    data: {
                        attributes: {
                            url: "/uploads/mri_center_12345.jpg"
                        }
                    }
                },
                impact: [
                    "Reduced waiting time for scans by 70%",
                    "Serving 100+ patients daily",
                    "Regional referral center"
                ]
            }
        },
        {
            id: 3,
            attributes: {
                title: "Cancer Research Program",
                shortDescription: "Regional cancer treatment and research program",
                category: "ongoing",
                status: "60% Complete",
                progress: 60,
                startDate: "2023-01-01",
                endDate: "2025-12-31",
                budget: "KES 320M",
                partner: "WHO, Kisii University",
                image: {
                    data: {
                        attributes: {
                            url: "/uploads/cancer_research_12345.jpg"
                        }
                    }
                },
                impact: [
                    "Advanced cancer treatment",
                    "Research collaboration",
                    "Training for medical staff"
                ]
            }
        },
        {
            id: 4,
            attributes: {
                title: "Children's Wing Expansion",
                shortDescription: "Expansion of pediatric services with 30 new beds",
                category: "upcoming",
                status: "Planning Phase",
                progress: 10,
                startDate: "2024-06-01",
                endDate: "2025-05-31",
                budget: "KES 280M",
                image: {
                    data: {
                        attributes: {
                            url: "/uploads/children_wing_12345.jpg"
                        }
                    }
                }
            }
        }
    ];
}

// Function to animate counting numbers
function animateCount(element, target, duration = 2000) {
    if (!element) return;
    
    const start = 0;
    const increment = target / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format number with + if it's a whole number
        if (current === target && target >= 10) {
            element.textContent = target + '+';
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Function to render project card
function renderProjectCard(project) {
    const attributes = getAttributes(project);
    if (!attributes) {
        return '<div class="project-card error">Error: Project data missing</div>';
    }
    
    const category = attributes.category || 'ongoing';
    const status = attributes.status || 'In Progress';
    const progress = attributes.progress || 0;
    const title = attributes.title || 'Project Title';
    const shortDescription = attributes.shortDescription || 'Project description';
    const imageUrl = getImageUrl(attributes.image);
    const projectId = project.id || '';
    
    // Determine badge class based on category
    let badgeClass = category;
    if (category === 'ongoing') badgeClass = 'ongoing';
    if (category === 'completed') badgeClass = 'completed';
    if (category === 'upcoming') badgeClass = 'upcoming';
    
    // Format timeline
    const timeline = `${formatDate(attributes.startDate)} - ${formatDate(attributes.endDate)}`;
    
    return `
        <div class="project-card ${category}" 
             data-title="${title}" 
             data-id="${projectId}"
             data-category="${category}">
            
            <div class="project-image">
                <img src="${imageUrl}" alt="${title}" loading="lazy">
                <div class="project-badge ${badgeClass}">${status}</div>
                <div class="project-overlay">
                    <div class="overlay-content">
                        <span class="project-category">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <h3>${title}</h3>
                        <p>${shortDescription.substring(0, 100)}${shortDescription.length > 100 ? '...' : ''}</p>
                    </div>
                </div>
            </div>
            
            <div class="project-content">
                <div class="project-header">
                    <h2>${title}</h2>
                    <span class="project-status ${badgeClass}">${status}</span>
                </div>
                
                <p class="project-description">
                    ${shortDescription}
                </p>
                
                <div class="project-details">
                    <div class="detail">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <strong>Timeline</strong>
                            <span>${timeline}</span>
                        </div>
                    </div>
                    <div class="detail">
                        <i class="fas fa-money-bill-wave"></i>
                        <div>
                            <strong>Budget</strong>
                            <span>${attributes.budget || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
                
                ${progress > 0 ? `
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%;"></div>
                    </div>
                    <span class="progress-text">${progress}% Complete</span>
                </div>
                ` : ''}
                
                <div class="project-actions">
                    <button class="action-btn details-btn" data-id="${projectId}">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                    ${attributes.partner || attributes.contractor ? `
                    <button class="action-btn partner-btn" data-id="${projectId}">
                        <i class="fas fa-handshake"></i> Partners
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Function to render statistics with animation
function renderStatistics(stats) {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    console.log('Rendering statistics:', stats);
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-hard-hat"></i>
            </div>
            <div class="stat-content">
                <h3 class="stat-number" id="total-projects-count">0</h3>
                <p class="stat-label">Total Projects</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-tools"></i>
            </div>
            <div class="stat-content">
                <h3 class="stat-number" id="active-projects-count">0</h3>
                <p class="stat-label">Active Projects</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
                <h3 class="stat-number" id="completed-projects-count">0</h3>
                <p class="stat-label">Completed</p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-hand-holding-usd"></i>
            </div>
            <div class="stat-content">
                <h3 class="stat-number" id="total-investment-count">KES 0</h3>
                <p class="stat-label">Total Investment</p>
            </div>
        </div>
    `;
    
    // Animate the counts
    setTimeout(() => {
        const totalEl = document.getElementById('total-projects-count');
        const activeEl = document.getElementById('active-projects-count');
        const completedEl = document.getElementById('completed-projects-count');
        const investmentEl = document.getElementById('total-investment-count');
        
        if (totalEl) animateCount(totalEl, stats.totalProjects, 1500);
        if (activeEl) animateCount(activeEl, stats.activeProjects, 1500);
        if (completedEl) animateCount(completedEl, stats.completedProjects, 1500);
        
        // Special handling for investment (text, not number)
        if (investmentEl) {
            investmentEl.textContent = stats.totalInvestment;
        }
    }, 500);
}

// Function to filter projects by category
function filterProjectsByCategory(category) {
    console.log('Filtering projects by category:', category);
    
    currentCategory = category;
    currentPage = 1;
    visibleCount = 6;
    
    // Update active button
    if (categoryButtons) {
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-category') === category) {
                btn.classList.add('active');
            }
        });
    }
    
    if (category === 'all') {
        filteredProjects = [...allProjects];
    } else {
        filteredProjects = allProjects.filter(project => {
            const attributes = getAttributes(project);
            return attributes.category === category;
        });
    }
    
    console.log(`Found ${filteredProjects.length} projects in "${category}" category`);
    renderProjectsGrid();
    updateLoadMoreButton();
}

// Function to search projects
function searchProjects(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    currentPage = 1;
    visibleCount = 6;
    
    if (!term) {
        filteredProjects = currentCategory === 'all' 
            ? [...allProjects] 
            : allProjects.filter(p => getAttributes(p).category === currentCategory);
    } else {
        filteredProjects = allProjects.filter(project => {
            const attributes = getAttributes(project);
            const title = (attributes.title || '').toLowerCase();
            const description = (attributes.shortDescription || '').toLowerCase();
            const category = (attributes.category || '').toLowerCase();
            const status = (attributes.status || '').toLowerCase();
            
            return title.includes(term) || 
                   description.includes(term) || 
                   category.includes(term) ||
                   status.includes(term);
        });
    }
    
    renderProjectsGrid();
    updateLoadMoreButton();
}

// Function to render projects grid
function renderProjectsGrid() {
    if (!projectsGrid) {
        console.error('Projects grid element not found');
        return;
    }
    
    // Check if no projects
    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-projects-message">
                <i class="fas fa-hard-hat" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No Projects Found</h3>
                <p>${currentCategory !== 'all' ? 'No projects in this category.' : 'No projects match your search criteria.'}</p>
                ${currentCategory !== 'all' ? `<p>Try selecting "All Projects" to see all available projects.</p>` : ''}
            </div>
        `;
        return;
    }
    
    // Calculate which projects to show
    const startIndex = 0;
    const endIndex = Math.min(visibleCount, filteredProjects.length);
    const projectsToShow = filteredProjects.slice(startIndex, endIndex);
    
    projectsGrid.innerHTML = projectsToShow.map(project => renderProjectCard(project)).join('');
    
    // Re-attach event listeners
    attachProjectEventListeners();
}

// Function to update load more button visibility
function updateLoadMoreButton() {
    if (loadMoreBtn) {
        if (filteredProjects.length > visibleCount) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Projects';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
}

// Function to load more projects
function loadMoreProjects() {
    if (!loadMoreBtn) return;
    
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    // Increase visible count
    visibleCount += 6;
    
    setTimeout(() => {
        renderProjectsGrid();
        updateLoadMoreButton();
        
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Projects';
    }, 500);
}

// Function to attach event listeners to project cards
function attachProjectEventListeners() {
    // Details buttons
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = this.getAttribute('data-id');
            console.log('View Details clicked for project ID:', projectId);
            showProjectDetails(projectId);
        });
    });
    
    // Partner buttons
    document.querySelectorAll('.partner-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = this.getAttribute('data-id');
            showProjectPartners(projectId);
        });
    });
}

// Function to show project details - FIXED VERSION
async function showProjectDetails(projectId) {
    console.log('Showing project details for ID:', projectId);
    
    try {
        // First, try to fetch detailed project data from Strapi
        const response = await fetch(`${STRAPI_API_URL}/projects/${projectId}?populate=*`);
        
        if (!response.ok) {
            console.warn('Failed to fetch project details from API, using cached data');
            // Fallback to project from local data
            const project = allProjects.find(p => p.id == projectId);
            if (project) {
                showProjectModal(project);
            } else {
                throw new Error('Project not found in local data');
            }
            return;
        }
        
        const data = await response.json();
        const project = data.data || data;
        
        if (!project) {
            throw new Error('Project data not found in response');
        }
        
        showProjectModal(project);
        
    } catch (error) {
        console.error('Error in showProjectDetails:', error);
        
        // Create a simple modal if none exists
        createFallbackModal(projectId);
    }
}

// Function to create a fallback modal if the main modal doesn't exist
function createFallbackModal(projectId) {
    const project = allProjects.find(p => p.id == projectId);
    if (!project) {
        alert('Project details not available.');
        return;
    }
    
    const attributes = getAttributes(project);
    const title = attributes.title || 'Project';
    
    // Create modal HTML dynamically
    const modalHTML = `
        <div class="modal" id="dynamicProjectModal" style="display: flex; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); align-items: center; justify-content: center;">
            <div class="modal-content" style="background-color: #fefefe; margin: auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 800px; border-radius: 10px; max-height: 90vh; overflow-y: auto;">
                <span class="close" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
                <h2>${title}</h2>
                <div id="dynamicModalBody">
                    Loading project details...
                </div>
            </div>
        </div>
    `;
    
    // Remove any existing dynamic modal
    const existingModal = document.getElementById('dynamicProjectModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add content to modal
    const modalBody = document.getElementById('dynamicModalBody');
    if (modalBody) {
        const imageUrl = getImageUrl(attributes.image);
        modalBody.innerHTML = `
            <div style="margin-top: 20px;">
                <img src="${imageUrl}" alt="${title}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;">
                <p><strong>Description:</strong> ${attributes.shortDescription || 'No description available.'}</p>
                <p><strong>Status:</strong> ${attributes.status || 'In Progress'}</p>
                <p><strong>Category:</strong> ${attributes.category || 'ongoing'}</p>
                <p><strong>Timeline:</strong> ${formatDate(attributes.startDate)} - ${formatDate(attributes.endDate)}</p>
                <p><strong>Budget:</strong> ${attributes.budget || 'Not specified'}</p>
                ${attributes.progress ? `<p><strong>Progress:</strong> ${attributes.progress}%</p>` : ''}
                <div style="margin-top: 20px;">
                    <a href="contact.html?project=${encodeURIComponent(title)}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Inquire About Project</a>
                </div>
            </div>
        `;
    }
    
    // Add close functionality
    const modal = document.getElementById('dynamicProjectModal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.onclick = function() {
        modal.remove();
        document.body.style.overflow = 'auto';
    };
    
    // Close when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.remove();
            document.body.style.overflow = 'auto';
        }
    };
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

// Function to show project modal - SIMPLIFIED VERSION
function showProjectModal(project) {
    console.log('Showing project modal for:', getAttributes(project)?.title);
    
    // Try to use existing modal first
    const existingModal = document.getElementById('projectModal') || document.getElementById('doctorModal');
    const existingModalBody = document.getElementById('modalBody') || document.getElementById('doctorModalBody');
    
    if (existingModal && existingModalBody) {
        // Use existing modal
        const attributes = getAttributes(project);
        const title = attributes.title || 'Project';
        const imageUrl = getImageUrl(attributes.image);
        
        existingModalBody.innerHTML = `
            <div class="modal-header">
                <div class="modal-header-content">
                    <h2>${title}</h2>
                    <span class="modal-category ${attributes.category || 'ongoing'}">${attributes.category || 'Ongoing'}</span>
                </div>
            </div>
            
            <div class="modal-image">
                <img src="${imageUrl}" alt="${title}">
            </div>
            
            <div class="modal-details">
                <p><strong>Description:</strong> ${attributes.shortDescription || 'No description available.'}</p>
                <p><strong>Status:</strong> ${attributes.status || 'In Progress'}</p>
                <p><strong>Timeline:</strong> ${formatDate(attributes.startDate)} - ${formatDate(attributes.endDate)}</p>
                <p><strong>Budget:</strong> ${attributes.budget || 'Not specified'}</p>
                ${attributes.progress ? `<p><strong>Progress:</strong> ${attributes.progress}%</p>` : ''}
                
                ${attributes.impact ? `
                <div style="margin-top: 15px;">
                    <h4>Impact:</h4>
                    <ul>
                        ${Array.isArray(attributes.impact) ? 
                          attributes.impact.map(item => `<li>${item}</li>`).join('') : 
                          `<li>${attributes.impact}</li>`}
                    </ul>
                </div>
                ` : ''}
                
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button onclick="closeProjectModal()" style="padding: 10px 20px; background: #f0f0f0; border: none; border-radius: 5px; cursor: pointer;">Close</button>
                    <a href="contact.html?project=${encodeURIComponent(title)}" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Inquire About Project</a>
                </div>
            </div>
        `;
        
        existingModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        // Create fallback modal
        createFallbackModal(project.id);
    }
}

// Function to show project partners
function showProjectPartners(projectId) {
    const project = allProjects.find(p => p.id == projectId);
    if (!project) return;
    
    const attributes = getAttributes(project);
    
    // Use the same modal approach
    const existingModal = document.getElementById('projectModal') || document.getElementById('doctorModal');
    const existingModalBody = document.getElementById('modalBody') || document.getElementById('doctorModalBody');
    
    if (existingModal && existingModalBody) {
        existingModalBody.innerHTML = `
            <div style="padding: 20px;">
                <h2>${attributes.title || 'Project'} - Partners</h2>
                <div style="margin-top: 20px;">
                    ${attributes.contractor ? `
                    <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong>Main Contractor:</strong>
                        <p>${attributes.contractor}</p>
                    </div>
                    ` : ''}
                    
                    ${attributes.partner ? `
                    <div style="margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                        <strong>Project Partner:</strong>
                        <p>${attributes.partner}</p>
                    </div>
                    ` : ''}
                </div>
                <button onclick="closeProjectModal()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        `;
        
        existingModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Function to close project modal - UNIVERSAL FUNCTION
function closeProjectModal() {
    // Try all possible modal IDs
    const modals = [
        document.getElementById('projectModal'),
        document.getElementById('doctorModal'),
        document.getElementById('dynamicProjectModal')
    ];
    
    modals.forEach(modal => {
        if (modal) {
            modal.style.display = 'none';
        }
    });
    
    // Restore body scrolling
    document.body.style.overflow = 'auto';
}

// Function to setup event listeners
function setupEventListeners() {
    // Category filter buttons
    if (categoryButtons) {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                filterProjectsByCategory(category);
            });
        });
    }
    
    // Search functionality
    if (projectsSearch) {
        projectsSearch.addEventListener('input', function(e) {
            const searchTerm = e.target.value;
            searchProjects(searchTerm);
        });
    }
    
    // Search button
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            searchProjects(projectsSearch.value);
        });
    }
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProjects);
    }
    
    // Modal close buttons (try multiple selectors)
    const closeButtons = [
        document.getElementById('modalClose'),
        document.getElementById('doctorModalClose'),
        document.querySelector('.modal .close')
    ];
    
    closeButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', closeProjectModal);
        }
    });
    
    // Close modal when clicking outside (for all modals)
    document.addEventListener('click', function(event) {
        const modals = [
            document.getElementById('projectModal'),
            document.getElementById('doctorModal'),
            document.getElementById('dynamicProjectModal')
        ];
        
        modals.forEach(modal => {
            if (modal && event.target === modal) {
                closeProjectModal();
            }
        });
    });
    
    // Handle escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
}

// Function to initialize page
async function initializeProjectsPage() {
    console.log('Initializing projects page...');
    
    // Get DOM elements - with fallbacks
    projectsGrid = document.getElementById('projectsGrid');
    categoryButtons = document.querySelectorAll('.category-btn');
    projectsSearch = document.getElementById('projectsSearch');
    loadMoreBtn = document.getElementById('loadMore');
    searchButton = document.getElementById('searchButton');
    
    // Try to get modal elements with different possible IDs
    projectModal = document.getElementById('projectModal') || document.getElementById('doctorModal');
    modalBody = document.getElementById('modalBody') || document.getElementById('doctorModalBody');
    modalCloseBtn = document.getElementById('modalClose') || document.getElementById('doctorModalClose');
    
    console.log('DOM elements found:', {
        projectsGrid: !!projectsGrid,
        categoryButtons: categoryButtons?.length || 0,
        projectsSearch: !!projectsSearch,
        loadMoreBtn: !!loadMoreBtn,
        projectModal: !!projectModal,
        modalBody: !!modalBody,
        modalCloseBtn: !!modalCloseBtn
    });
    
    try {
        // Fetch projects data
        console.log('Fetching projects data...');
        const projectsData = await fetchProjects();
        
        console.log(`Loaded ${projectsData.length} projects from Strapi`);
        allProjects = projectsData;
        filteredProjects = [...allProjects];
        
        // Calculate statistics from projects
        const projectStats = calculateProjectStats(allProjects);
        console.log('Calculated project stats:', projectStats);
        
        // Render content
        renderProjectsGrid();
        renderStatistics(projectStats);
        
        // Setup event listeners
        setupEventListeners();
        
        // Update load more button
        updateLoadMoreButton();
        
        console.log('Projects page initialized successfully');
        
    } catch (error) {
        console.error('Error initializing projects page:', error);
        
        // Fallback to default data
        allProjects = getFallbackProjects();
        filteredProjects = [...allProjects];
        
        // Calculate statistics from fallback projects
        const projectStats = calculateProjectStats(allProjects);
        
        renderProjectsGrid();
        renderStatistics(projectStats);
        setupEventListeners();
        updateLoadMoreButton();
    }
}

// Make closeProjectModal globally available
window.closeProjectModal = closeProjectModal;

// Initialize when DOM is loaded
if (document.querySelector('.projects-grid-section') || document.getElementById('projectsGrid')) {
    document.addEventListener('DOMContentLoaded', initializeProjectsPage);
}

// Set current year in footer
document.addEventListener('DOMContentLoaded', function() {
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
});