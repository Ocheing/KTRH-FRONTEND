// ===========================================
// CAREERS PAGE - STRAPI INTEGRATION WITH EMAIL TO KTRH
// ===========================================

// Strapi API Configuration
const STRAPI_API_URL = 'https://better-friend-c539968cc5.strapiapp.com/api';
const STRAPI_IMAGE_URL = 'https://better-friend-c539968cc5.strapiapp.com';
const KTRH_HR_EMAIL = 'careers@ktrh.or.ke';
const KTRH_HR_PHONE = '+254 758 721 997';

// DOM Elements for Careers
let jobsContainer;
let jobsSearch;
let jobFilterBtns;
let jobsModal;
let jobModalBody;
let jobModalClose;
let generalApplicationForm;

// Global State
let allJobs = [];
let displayedJobs = [];

// Function to fetch jobs from Strapi
async function fetchJobs() {
    try {
        console.log('Fetching jobs from Strapi...');
        
        // Filter only active jobs
        const response = await fetch(
            `${STRAPI_API_URL}/jobs?populate=*&filters[isActive][$eq]=true&sort[0]=postedDate:desc`
        );
        
        if (!response.ok) {
            console.error('API response not ok:', response.status, response.statusText);
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle Strapi v4 response structure
        if (data.data && Array.isArray(data.data)) {
            console.log(`Fetched ${data.data.length} active jobs from API`);
            return data.data;
        } else if (Array.isArray(data)) {
            console.log(`Fetched ${data.length} active jobs from API`);
            return data;
        } else {
            console.error('Unexpected API response structure:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

// Helper function to extract text from Rich Text
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
        });
        return text.trim();
    }
    
    return 'Job description available.';
}

// Helper function to get job data
function getJobData(job) {
    return job.attributes !== undefined ? job.attributes : job;
}

// Function to format date
function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Function to calculate days remaining
function getDaysRemaining(deadline) {
    if (!deadline) return 0;
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
}

// Function to calculate time ago
function getTimeAgo(dateString) {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Function to parse JSON fields
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

// Function to render job card
function renderJobCard(job) {
    if (!job) {
        return '<div class="job-card error">Error: Job data missing</div>';
    }
    
    const attrs = getJobData(job);
    const jobId = job.id || '';
    
    const title = attrs.title || 'Job Position';
    const department = attrs.department || 'other';
    const jobType = attrs.jobType || 'full-time';
    const location = attrs.location || 'Kisii, Kenya';
    const description = extractTextFromRichText(attrs.description);
    const deadline = attrs.deadline ? formatDate(attrs.deadline) : 'Not specified';
    const postedDate = attrs.postedDate ? getTimeAgo(attrs.postedDate) : 'Recently';
    const daysRemaining = getDaysRemaining(attrs.deadline);
    const salaryRange = attrs.salaryRange || 'Competitive';
    const experienceLevel = attrs.experienceLevel || 'mid';
    
    // Parse JSON fields
    const requirements = parseJSONField(attrs.requirements, []);
    
    // Department mapping for display
    const departmentMap = {
        'medical': 'Medical',
        'nursing': 'Nursing',
        'admin': 'Administrative',
        'technical': 'Technical',
        'other': 'Other'
    };
    
    // Job type mapping for classes
    const jobTypeClass = {
        'full-time': 'full-time',
        'part-time': 'part-time',
        'contract': 'contract',
        'internship': 'internship'
    };
    
    // Experience level mapping
    const experienceMap = {
        'entry': 'Entry Level',
        'mid': 'Mid Level',
        'senior': 'Senior Level'
    };
    
    // Get display values
    const departmentDisplay = departmentMap[department] || 'Other';
    const jobTypeDisplay = jobType.charAt(0).toUpperCase() + jobType.slice(1).replace('-', ' ');
    const experienceDisplay = experienceMap[experienceLevel] || 'Mid Level';
    
    // Create urgency badge for near deadlines
    let urgencyBadge = '';
    if (daysRemaining > 0 && daysRemaining <= 7) {
        urgencyBadge = `<span class="urgency-badge">Closing Soon</span>`;
    }
    
    // Limit description preview
    const shortDescription = description.length > 150 
        ? description.substring(0, 150) + '...' 
        : description;
    
    // Limit requirements preview
    const previewRequirements = requirements.slice(0, 3);
    
    return `
        <div class="job-card" data-category="${department}" data-job-id="${jobId}">
            <div class="job-header">
                <h3>${title}</h3>
                <div class="job-badges">
                    <span class="job-badge ${department}">${departmentDisplay}</span>
                    <span class="job-type ${jobTypeClass[jobType]}">${jobTypeDisplay}</span>
                    ${urgencyBadge}
                </div>
            </div>
            
            <div class="job-details">
                <p><i class="fas fa-map-marker-alt"></i> ${location}</p>
                <p><i class="fas fa-calendar-alt"></i> Posted: ${postedDate}</p>
                <p><i class="fas fa-clock"></i> Deadline: ${deadline}</p>
                <p><i class="fas fa-money-bill-wave"></i> ${salaryRange}</p>
                <p><i class="fas fa-chart-line"></i> ${experienceDisplay}</p>
                ${daysRemaining > 0 ? `<p class="days-remaining"><i class="fas fa-hourglass-half"></i> ${daysRemaining} days remaining</p>` : ''}
            </div>
            
            <div class="job-description">
                <p>${shortDescription}</p>
            </div>
            
            ${previewRequirements.length > 0 ? `
                <div class="job-requirements-preview">
                    <h4>Key Requirements:</h4>
                    <ul>
                        ${previewRequirements.map(req => `<li>${req}</li>`).join('')}
                        ${requirements.length > 3 ? `<li>+ ${requirements.length - 3} more requirements...</li>` : ''}
                    </ul>
                </div>
            ` : ''}
            
            <div class="job-actions">
                <button class="btn-view-details" data-job-id="${jobId}">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn-apply" data-job-id="${jobId}" data-job-title="${title}">
                    <i class="fas fa-paper-plane"></i> Apply Now
                </button>
            </div>
        </div>
    `;
}

// Function to render jobs grid
function renderJobsGrid(jobs) {
    if (!jobsContainer) {
        console.error('Jobs container not found');
        return;
    }
    
    // Remove loading spinner if it exists
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    if (!Array.isArray(jobs) || jobs.length === 0) {
        jobsContainer.innerHTML = '';
        document.getElementById('noJobsMessage').style.display = 'block';
        return;
    }
    
    // Hide no jobs message
    document.getElementById('noJobsMessage').style.display = 'none';
    
    jobsContainer.innerHTML = jobs.map(job => renderJobCard(job)).join('');
    
    // Re-attach event listeners
    attachJobViewListeners();
    attachJobApplyListeners();
}

// Function to filter jobs by category
function filterJobsByCategory(category) {
    console.log('Filtering jobs by category:', category);
    
    if (category === 'all') {
        displayedJobs = allJobs;
    } else {
        displayedJobs = allJobs.filter(job => {
            const attrs = getJobData(job);
            return attrs.department === category;
        });
    }
    
    renderJobsGrid(displayedJobs);
    console.log(`Displaying ${displayedJobs.length} jobs in ${category} category`);
}

// Function to show job details modal
async function showJobDetails(jobId) {
    try {
        const response = await fetch(`${STRAPI_API_URL}/jobs/${jobId}?populate=*`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch job: ${response.status}`);
        }
        
        const data = await response.json();
        const job = data.data || data;
        
        if (!job) {
            jobModalBody.innerHTML = '<p>Job details not found.</p>';
            return;
        }
        
        const attrs = getJobData(job);
        const title = attrs.title || 'Job Position';
        const department = attrs.department || 'other';
        const jobType = attrs.jobType || 'full-time';
        const location = attrs.location || 'Kisii, Kenya';
        const description = extractTextFromRichText(attrs.description);
        const deadline = attrs.deadline ? formatDate(attrs.deadline) : 'Not specified';
        const postedDate = attrs.postedDate ? formatDate(attrs.postedDate) : formatDate(new Date());
        const salaryRange = attrs.salaryRange || 'Competitive';
        const experienceLevel = attrs.experienceLevel || 'mid';
        const applicationLink = attrs.applicationLink || null;
        
        // Parse JSON fields
        const requirements = parseJSONField(attrs.requirements, []);
        const responsibilities = parseJSONField(attrs.responsibilities, []);
        const qualifications = parseJSONField(attrs.qualifications, []);
        const benefits = parseJSONField(attrs.benefits, []);
        
        // Department mapping
        const departmentMap = {
            'medical': 'Medical',
            'nursing': 'Nursing',
            'admin': 'Administrative',
            'technical': 'Technical',
            'other': 'Other'
        };
        
        // Experience level mapping
        const experienceMap = {
            'entry': 'Entry Level',
            'mid': 'Mid Level',
            'senior': 'Senior Level'
        };
        
        const departmentDisplay = departmentMap[department] || 'Other';
        const experienceDisplay = experienceMap[experienceLevel] || 'Mid Level';
        
        let modalHTML = `
            <div class="modal-header">
                <div class="modal-icon">
                    <i class="fas fa-briefcase"></i>
                </div>
                <h2>${title}</h2>
                <div class="modal-subtitle">
                    <span class="job-badge ${department}">${departmentDisplay}</span>
                    <span class="job-type ${jobType}">${jobType}</span>
                </div>
            </div>
            
            <div class="modal-details-grid">
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <strong>Location:</strong>
                        <p>${location}</p>
                    </div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-calendar-alt"></i>
                    <div>
                        <strong>Posted Date:</strong>
                        <p>${postedDate}</p>
                    </div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <div>
                        <strong>Deadline:</strong>
                        <p>${deadline}</p>
                    </div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-money-bill-wave"></i>
                    <div>
                        <strong>Salary:</strong>
                        <p>${salaryRange}</p>
                    </div>
                </div>
                
                <div class="detail-item">
                    <i class="fas fa-chart-line"></i>
                    <div>
                        <strong>Experience Level:</strong>
                        <p>${experienceDisplay}</p>
                    </div>
                </div>
            </div>
            
            <div class="modal-section">
                <h3><i class="fas fa-align-left"></i> Job Description</h3>
                <div class="job-description-full">
                    ${description}
                </div>
            </div>
        `;
        
        // Responsibilities
        if (responsibilities.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-tasks"></i> Key Responsibilities</h3>
                    <ul class="modal-list">
                        ${responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Requirements
        if (requirements.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-check-circle"></i> Requirements</h3>
                    <ul class="modal-list">
                        ${requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Qualifications
        if (qualifications.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-graduation-cap"></i> Qualifications</h3>
                    <ul class="modal-list">
                        ${qualifications.map(qual => `<li>${qual}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Benefits
        if (benefits.length > 0) {
            modalHTML += `
                <div class="modal-section">
                    <h3><i class="fas fa-hand-holding-heart"></i> Benefits</h3>
                    <ul class="modal-list">
                        ${benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Application buttons
        modalHTML += `
            <div class="modal-actions">
        `;
        
        if (applicationLink) {
            modalHTML += `
                <a href="${applicationLink}" target="_blank" class="btn btn-primary">
                    <i class="fas fa-external-link-alt"></i> Apply on External Portal
                </a>
            `;
        } else {
            modalHTML += `
                <button class="btn btn-primary" id="applyFromModal" data-job-id="${jobId}" data-job-title="${title}">
                    <i class="fas fa-paper-plane"></i> Apply Now
                </button>
            `;
        }
        
        modalHTML += `
                <button class="btn btn-secondary" onclick="closeJobModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        
        jobModalBody.innerHTML = modalHTML;
        jobsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Attach apply listener for modal button
        const applyBtn = document.getElementById('applyFromModal');
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                closeJobModal();
                showApplicationModal(this.dataset.jobId, this.dataset.jobTitle);
            });
        }
        
    } catch (error) {
        console.error('Error fetching job details:', error);
        jobModalBody.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f39c12; margin-bottom: 1rem;"></i>
                <h3>Error Loading Details</h3>
                <p>Unable to load job details. Please try again later.</p>
                <button class="btn btn-secondary" onclick="closeJobModal()" style="margin-top: 1rem;">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        `;
        jobsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Function to show application modal
function showApplicationModal(jobId, jobTitle) {
    const applicationModal = document.getElementById('applicationModal');
    const modalJobTitle = document.getElementById('modalJobTitle');
    const selectedJobInput = document.getElementById('selectedJob');
    const selectedJobIdInput = document.getElementById('selectedJobId');
    
    if (modalJobTitle && selectedJobInput) {
        modalJobTitle.textContent = `Apply for: ${jobTitle}`;
        selectedJobInput.value = jobTitle;
        if (selectedJobIdInput) {
            selectedJobIdInput.value = jobId;
        }
        localStorage.setItem('selectedJobId', jobId);
    }
    
    if (applicationModal) {
        applicationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        const form = document.getElementById('jobApplicationForm');
        if (form) form.reset();
    }
}

// Function to close job modal
function closeJobModal() {
    if (jobsModal) {
        jobsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Function to attach job view listeners
function attachJobViewListeners() {
    document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            if (jobId) {
                showJobDetails(jobId);
            }
        });
    });
}

// Function to attach job apply listeners
function attachJobApplyListeners() {
    document.querySelectorAll('.btn-apply').forEach(btn => {
        btn.addEventListener('click', function() {
            const jobId = this.getAttribute('data-job-id');
            const jobTitle = this.getAttribute('data-job-title');
            if (jobId && jobTitle) {
                showApplicationModal(jobId, jobTitle);
            }
        });
    });
}

// Function to initialize careers page
async function initializeCareersPage() {
    console.log('Careers page loaded, initializing...');
    
    // Get DOM elements
    jobsContainer = document.getElementById('jobsContainer');
    jobFilterBtns = document.querySelectorAll('.job-filters .filter-btn');
    jobsModal = document.getElementById('jobsModal');
    jobModalBody = document.getElementById('jobModalBody');
    jobModalClose = document.getElementById('jobModalClose');
    generalApplicationForm = document.getElementById('generalApplicationForm');
    
    // Ensure modals exist
    if (!jobsModal) {
        const modalHTML = `
            <div class="modal" id="jobsModal" style="display: none;">
                <div class="modal-content modal-large">
                    <button class="modal-close" id="jobModalClose">&times;</button>
                    <div id="jobModalBody"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Re-get references
        jobsModal = document.getElementById('jobsModal');
        jobModalBody = document.getElementById('jobModalBody');
        jobModalClose = document.getElementById('jobModalClose');
    }
    
    // Fetch jobs from Strapi
    console.log('Fetching jobs from API...');
    allJobs = await fetchJobs();
    console.log(`Fetched ${allJobs.length} active jobs`);
    
    if (allJobs.length === 0) {
        console.warn('No jobs fetched from API');
        // Hide loading spinner and show no jobs message
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        document.getElementById('noJobsMessage').style.display = 'block';
    } else {
        // Initial display
        displayedJobs = allJobs;
        renderJobsGrid(displayedJobs);
    }
    
    // Set up filter functionality
    if (jobFilterBtns) {
        jobFilterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Update active button
                jobFilterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter jobs
                filterJobsByCategory(filter);
            });
        });
    }
    
    // Set up modal functionality
    if (jobModalClose) {
        jobModalClose.addEventListener('click', closeJobModal);
    }
    
    if (jobsModal) {
        jobsModal.addEventListener('click', function(e) {
            if (e.target === jobsModal) {
                closeJobModal();
            }
        });
    }
    
    // Setup application modal
    const applicationModal = document.getElementById('applicationModal');
    const modalCloseBtn = document.getElementById('modalClose');
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', function() {
            applicationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    if (applicationModal) {
        applicationModal.addEventListener('click', function(e) {
            if (e.target === applicationModal) {
                applicationModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Initialize application forms
    initApplicationForms();
    
    // Setup chat options for careers page
    setupChatOptions();
    
    console.log('Careers page initialized successfully');
}

// Function to initialize application forms
function initApplicationForms() {
    // Job Application Form
    const jobApplicationForm = document.getElementById('jobApplicationForm');
    if (jobApplicationForm) {
        jobApplicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateJobApplication()) {
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            const formData = collectJobApplicationData();
            
            // Submit button state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            try {
                // Submit to KTRH email via EmailJS
                await sendApplicationToKTRHEmail(formData);
                
                // Also submit to Strapi for record keeping
                try {
                    await submitJobApplicationToStrapi(formData);
                } catch (strapiError) {
                    console.warn('Failed to save to Strapi, but email was sent:', strapiError);
                }
                
                // Success message
                showNotification(`Thank you! Your application for "${formData.jobTitle}" has been submitted to KTRH HR Department.`, 'success');
                
                // Reset form
                jobApplicationForm.reset();
                
                // Close modal
                document.getElementById('applicationModal').style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Show follow-up instructions
                setTimeout(() => {
                    showNotification('Application sent to careers@ktrh.or.ke. You will receive a confirmation email shortly.', 'info');
                }, 2000);
                
            } catch (error) {
                showNotification('Sorry, there was an error submitting your application. Please try again or contact HR directly at ' + KTRH_HR_EMAIL, 'error');
                console.error('Application error:', error);
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // General Application Form
    if (generalApplicationForm) {
        generalApplicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateGeneralApplication()) {
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            const formData = collectGeneralApplicationData();
            
            // Submit button state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            try {
                // Submit to KTRH email via EmailJS
                await sendGeneralApplicationToKTRHEmail(formData);
                
                // Also submit to Strapi for record keeping
                try {
                    await submitGeneralApplicationToStrapi(formData);
                } catch (strapiError) {
                    console.warn('Failed to save to Strapi, but email was sent:', strapiError);
                }
                
                // Success
                showNotification('Thank you! Your general application has been submitted to KTRH HR Department. We will contact you if a matching position becomes available.', 'success');
                
                // Reset form
                generalApplicationForm.reset();
                
                // Show follow-up instructions
                setTimeout(() => {
                    showNotification('Application sent to careers@ktrh.or.ke. Keep this reference for follow-up: ' + new Date().getTime(), 'info');
                }, 2000);
                
            } catch (error) {
                showNotification('Sorry, there was an error submitting your application. Please try again or contact HR directly at ' + KTRH_HR_EMAIL, 'error');
                console.error('General application error:', error);
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Function to collect job application data
function collectJobApplicationData() {
    const cvFile = document.getElementById('modalCV')?.files[0];
    const certificatesFile = document.getElementById('modalCertificates')?.files[0];
    
    return {
        jobTitle: document.getElementById('selectedJob')?.value || '',
        jobId: document.getElementById('selectedJobId')?.value || '',
        name: document.getElementById('modalName')?.value.trim() || '',
        email: document.getElementById('modalEmail')?.value.trim() || '',
        phone: document.getElementById('modalPhone')?.value.trim() || '',
        qualification: document.getElementById('modalQualification')?.value.trim() || '',
        coverLetter: document.getElementById('modalCoverLetter')?.value.trim() || '',
        cvFile: cvFile,
        certificatesFile: certificatesFile,
        cvFileName: cvFile ? cvFile.name : 'Not provided',
        certificatesFileName: certificatesFile ? certificatesFile.name : 'Not provided',
        submissionDate: new Date().toLocaleString('en-KE', { 
            timeZone: 'Africa/Nairobi',
            dateStyle: 'full',
            timeStyle: 'medium'
        }),
        applicationId: 'KTRH-APP-' + Date.now()
    };
}

// Function to collect general application data
function collectGeneralApplicationData() {
    const cvFile = document.getElementById('appCV')?.files[0];
    
    return {
        name: document.getElementById('appName')?.value.trim() || '',
        email: document.getElementById('appEmail')?.value.trim() || '',
        phone: document.getElementById('appPhone')?.value.trim() || '',
        category: document.getElementById('appCategory')?.value || '',
        position: document.getElementById('appPosition')?.value.trim() || '',
        experience: document.getElementById('appExperience')?.value.trim() || '',
        cvFile: cvFile,
        cvFileName: cvFile ? cvFile.name : 'Not provided',
        submissionDate: new Date().toLocaleString('en-KE', { 
            timeZone: 'Africa/Nairobi',
            dateStyle: 'full',
            timeStyle: 'medium'
        }),
        applicationId: 'KTRH-GEN-APP-' + Date.now()
    };
}

// Function to send application email to KTRH using EmailJS
async function sendApplicationToKTRHEmail(formData) {
    // First method: Try EmailJS (requires setup)
    try {
        await sendEmailViaEmailJS(formData, 'job');
        console.log('Email sent via EmailJS');
        return;
    } catch (emailJSError) {
        console.log('EmailJS failed, trying alternative method:', emailJSError);
    }
    
    // Second method: Fallback to mailto link
    await sendEmailViaMailTo(formData, 'job');
}

// Function to send general application email to KTRH
async function sendGeneralApplicationToKTRHEmail(formData) {
    // First method: Try EmailJS
    try {
        await sendEmailViaEmailJS(formData, 'general');
        console.log('General application email sent via EmailJS');
        return;
    } catch (emailJSError) {
        console.log('EmailJS failed, trying alternative method:', emailJSError);
    }
    
    // Second method: Fallback to mailto link
    await sendEmailViaMailTo(formData, 'general');
}

// EmailJS Integration
async function sendEmailViaEmailJS(formData, type) {
    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS not loaded');
    }
    
    // Initialize EmailJS with your User ID
    // Replace 'YOUR_USER_ID' with your actual EmailJS User ID
    emailjs.init('YOUR_EMAILJS_USER_ID'); // You need to sign up at https://www.emailjs.com/
    
    const templateParams = {
        to_email: KTRH_HR_EMAIL,
        to_name: 'KTRH HR Department',
        from_name: formData.name,
        from_email: formData.email,
        reply_to: formData.email,
        subject: type === 'job' 
            ? `Job Application: ${formData.jobTitle} - ${formData.name}`
            : `General Application: ${formData.name} - ${formData.category}`,
        
        // Application details
        applicant_name: formData.name,
        applicant_email: formData.email,
        applicant_phone: formData.phone,
        job_title: formData.jobTitle || 'General Application',
        job_id: formData.jobId || 'N/A',
        qualifications: formData.qualification || 'Not specified',
        cover_letter: formData.coverLetter || 'No cover letter provided',
        preferred_position: formData.position || 'Not specified',
        preferred_department: formData.category || 'Not specified',
        experience_summary: formData.experience || 'Not provided',
        cv_filename: formData.cvFileName,
        certificates_filename: formData.certificatesFileName,
        submission_date: formData.submissionDate,
        application_id: formData.applicationId,
        
        // Hospital info
        hospital_name: 'Kisii Teaching & Referral Hospital',
        hospital_email: KTRH_HR_EMAIL,
        hospital_phone: KTRH_HR_PHONE
    };
    
    // Use appropriate template based on type
    const templateId = type === 'job' 
        ? 'YOUR_JOB_APPLICATION_TEMPLATE_ID'  // Replace with your template ID
        : 'YOUR_GENERAL_APPLICATION_TEMPLATE_ID'; // Replace with your template ID
    
    const serviceId = 'YOUR_EMAILJS_SERVICE_ID'; // Replace with your service ID
    
    try {
        const response = await emailjs.send(serviceId, templateId, templateParams);
        console.log('EmailJS response:', response);
        return response;
    } catch (error) {
        console.error('EmailJS error:', error);
        throw error;
    }
}

// Fallback method using mailto
async function sendEmailViaMailTo(formData, type) {
    const subject = type === 'job'
        ? `Job Application: ${formData.jobTitle} - ${formData.name}`
        : `General Application: ${formData.name} - ${formData.category}`;
    
    const body = `
Job Application Details:
========================

Applicant Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone}

${type === 'job' ? `
Job Details:
- Position: ${formData.jobTitle}
- Job ID: ${formData.jobId}
` : `
General Application:
- Preferred Department: ${formData.category}
- Desired Position: ${formData.position}
`}

Qualifications:
- Highest Qualification: ${formData.qualification}

${formData.coverLetter ? `
Cover Letter:
${formData.coverLetter}
` : ''}

${formData.experience ? `
Experience Summary:
${formData.experience}
` : ''}

Attachments:
- CV: ${formData.cvFileName}
${type === 'job' ? `- Certificates: ${formData.certificatesFileName}` : ''}

Submission Details:
- Application ID: ${formData.applicationId}
- Submission Date: ${formData.submissionDate}

This application was submitted via the KTRH Careers Portal.
Please save this email for your records.

---
Kisii Teaching & Referral Hospital
HR Department
Email: ${KTRH_HR_EMAIL}
Phone: ${KTRH_HR_PHONE}
Website: www.ktrh.or.ke
    `.trim();
    
    // Create mailto link
    const mailtoLink = `mailto:${KTRH_HR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.open(mailtoLink, '_blank');
    
    // Return promise that resolves when email client opens
    return new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });
}

// Function to submit to Strapi (for record keeping)
async function submitJobApplicationToStrapi(formData) {
    // Create FormData for file uploads
    const formDataToSend = new FormData();
    
    // Append text fields
    const textFields = {
        jobTitle: formData.jobTitle,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        qualification: formData.qualification,
        coverLetter: formData.coverLetter,
        applicationId: formData.applicationId,
        submissionDate: formData.submissionDate,
        status: 'pending'
    };
    
    Object.keys(textFields).forEach(key => {
        formDataToSend.append(key, textFields[key]);
    });
    
    // Append files if they exist
    if (formData.cvFile) {
        formDataToSend.append('cv', formData.cvFile);
    }
    
    if (formData.certificatesFile) {
        formDataToSend.append('certificates', formData.certificatesFile);
    }
    
    // Send to Strapi applications endpoint
    const response = await fetch(`${STRAPI_API_URL}/applications`, {
        method: 'POST',
        body: formDataToSend
    });
    
    if (!response.ok) {
        throw new Error(`Failed to submit to Strapi: ${response.status}`);
    }
    
    return response.json();
}

// Function to submit general application to Strapi
async function submitGeneralApplicationToStrapi(formData) {
    // Create FormData for file uploads
    const formDataToSend = new FormData();
    
    // Append text fields
    const textFields = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        category: formData.category,
        position: formData.position,
        experience: formData.experience,
        applicationId: formData.applicationId,
        submissionDate: formData.submissionDate,
        status: 'pending'
    };
    
    Object.keys(textFields).forEach(key => {
        formDataToSend.append(key, textFields[key]);
    });
    
    // Append CV file if it exists
    if (formData.cvFile) {
        formDataToSend.append('cv', formData.cvFile);
    }
    
    // Send to Strapi general-applications endpoint
    const response = await fetch(`${STRAPI_API_URL}/general-applications`, {
        method: 'POST',
        body: formDataToSend
    });
    
    if (!response.ok) {
        throw new Error(`Failed to submit to Strapi: ${response.status}`);
    }
    
    return response.json();
}

// Validation functions
function validateJobApplication() {
    const requiredFields = ['modalName', 'modalEmail', 'modalPhone', 'modalQualification', 'modalCV'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const value = field.type === 'file' 
            ? (field.files.length > 0)
            : field.value.trim();
        
        if (!value) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
            
            // Email validation
            if (fieldId === 'modalEmail' && !isValidEmail(field.value)) {
                showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Phone validation
            if (fieldId === 'modalPhone' && !isValidPhone(field.value)) {
                showFieldError(field, 'Please enter a valid phone number');
                isValid = false;
            }
        }
    });
    
    // Validate file size (max 5MB)
    const cvInput = document.getElementById('modalCV');
    if (cvInput && cvInput.files.length > 0) {
        const fileSize = cvInput.files[0].size;
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (fileSize > maxSize) {
            showNotification('CV file size must be less than 5MB.', 'error');
            isValid = false;
        }
    }
    
    return isValid;
}

function validateGeneralApplication() {
    const requiredFields = ['appName', 'appEmail', 'appPhone', 'appCategory'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const value = field.value.trim();
        
        if (!value) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(field);
            
            if (fieldId === 'appEmail' && !isValidEmail(field.value)) {
                showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            }
            
            if (fieldId === 'appPhone' && !isValidPhone(field.value)) {
                showFieldError(field, 'Please enter a valid phone number');
                isValid = false;
            }
        }
    });
    
    // Validate file size (max 5MB)
    const cvInput = document.getElementById('appCV');
    if (cvInput && cvInput.files.length > 0) {
        const fileSize = cvInput.files[0].size;
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (fileSize > maxSize) {
            showNotification('CV file size must be less than 5MB.', 'error');
            isValid = false;
        }
    }
    
    return isValid;
}

// Helper functions for validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhone(phone) {
    const re = /^[\d\s\+\-\(\)]{10,}$/;
    return re.test(phone);
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after appropriate time
    const duration = type === 'error' ? 7000 : 5000;
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Add CSS animations for notifications
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: #28a745;
            color: white;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .notification.error {
            background: #dc3545;
        }
        
        .notification.info {
            background: #17a2b8;
        }
    `;
    document.head.appendChild(style);
}

// Setup chat options for careers page
function setupChatOptions() {
    document.querySelectorAll('.chat-option').forEach(option => {
        option.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            switch(action) {
                case 'careers':
                    document.querySelector('.careers-why-us').scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    break;
                case 'application':
                    // Show application modal for general application
                    document.getElementById('generalApplicationForm').scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    break;
                case 'contact':
                    // Open email to HR
                    window.location.href = `mailto:${KTRH_HR_EMAIL}?subject=Career Inquiry`;
                    break;
            }
            
            // Close chat widget
            document.getElementById('chatWidget').style.display = 'none';
        });
    });
}

// Add EmailJS script dynamically if not already loaded
function loadEmailJSScript() {
    if (typeof emailjs === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = function() {
            console.log('EmailJS script loaded');
            // Initialize with your User ID when needed
        };
        document.head.appendChild(script);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the careers page
    if (document.querySelector('.careers-why-us')) {
        // Load EmailJS script
        loadEmailJSScript();
        
        // Initialize careers page
        initializeCareersPage();
    }
});

// Export functions for global access
window.closeJobModal = closeJobModal;
window.showApplicationModal = showApplicationModal;
