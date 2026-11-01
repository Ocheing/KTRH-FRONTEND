// ==========================================================================
// CAREERS & RECRUITMENT — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

const KTRH_HR_EMAIL = 'careers@ktrh.or.ke';
const KTRH_HR_PHONE = '+254 758 721 997 Ext. 234';

// DOM Elements
let jobsContainer;
let jobsSearch;
let jobFilterBtns;
let jobsModal;
let jobModalBody;
let jobModalClose;
let applicationModal;
let modalClose;
let jobApplicationForm;
let generalApplicationForm;

// State Management
let allJobs = [];
let displayedJobs = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let activeJobForApplication = null;

document.addEventListener('DOMContentLoaded', function() {
    initCareersPage();
});

// Live update listener from Admin Portal
window.addEventListener('ktrh_data_updated', function(e) {
    if (!e.detail?.collection || e.detail.collection === 'jobs') {
        loadJobsFromStore();
    }
});

function initCareersPage() {
    jobsContainer = document.getElementById('jobsContainer');
    jobsSearch = document.getElementById('jobsSearch');
    jobFilterBtns = document.querySelectorAll('.jobs-filter .filter-btn');
    jobsModal = document.getElementById('jobsModal');
    jobModalBody = document.getElementById('jobModalBody');
    jobModalClose = document.getElementById('jobModalClose');
    applicationModal = document.getElementById('applicationModal');
    modalClose = document.getElementById('modalClose');
    jobApplicationForm = document.getElementById('jobApplicationForm');
    generalApplicationForm = document.getElementById('generalApplicationForm');

    setupEventListeners();
    loadJobsFromStore();
}

function loadJobsFromStore() {
    if (window.KTRHStore) {
        allJobs = window.KTRHStore.getJobs().filter(j => j.isActive !== false);
    } else {
        allJobs = [];
    }

    displayedJobs = [...allJobs];
    filterJobs();
}

function setupEventListeners() {
    // Filter Buttons
    if (jobFilterBtns) {
        jobFilterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                jobFilterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.getAttribute('data-filter') || 'all';
                filterJobs();
            });
        });
    }

    // Search Input
    if (jobsSearch) {
        jobsSearch.addEventListener('input', function() {
            currentSearchTerm = this.value.trim().toLowerCase();
            filterJobs();
        });
    }

    // Modal Closes
    if (jobModalClose && jobsModal) {
        jobModalClose.addEventListener('click', () => { jobsModal.style.display = 'none'; });
    }
    if (modalClose && applicationModal) {
        modalClose.addEventListener('click', () => { applicationModal.style.display = 'none'; });
    }

    window.addEventListener('click', function(e) {
        if (e.target === jobsModal) jobsModal.style.display = 'none';
        if (e.target === applicationModal) applicationModal.style.display = 'none';
    });

    // Specific Job Application Form Submission
    if (jobApplicationForm) {
        jobApplicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('modalName')?.value;
            const email = document.getElementById('modalEmail')?.value;
            const phone = document.getElementById('modalPhone')?.value;
            const qualification = document.getElementById('modalQualification')?.value;
            const coverLetter = document.getElementById('modalCoverLetter')?.value;
            const cvFileInput = document.getElementById('modalCV');
            const certFileInput = document.getElementById('modalCertificates');

            let cvFileName = cvFileInput?.files[0]?.name || 'Not provided';
            let certFileName = certFileInput?.files[0]?.name || 'Not provided';

            const applicationRecord = {
                id: `app-${Date.now()}`,
                jobId: activeJobForApplication?.id || 'General',
                jobTitle: activeJobForApplication?.title || 'Open Application',
                applicantName: name,
                applicantEmail: email,
                applicantPhone: phone,
                qualification: qualification,
                coverLetter: coverLetter,
                cvFileName: cvFileName,
                certFileName: certFileName,
                submittedAt: new Date().toISOString(),
                status: 'Under Review'
            };

            if (window.KTRHStore) {
                window.KTRHStore.add('jobApplications', applicationRecord);
            }

            alert(`Thank you, ${name}! Your application for "${applicationRecord.jobTitle}" has been received and logged with the KTRH HR Recruitment Office.`);
            jobApplicationForm.reset();
            if (applicationModal) applicationModal.style.display = 'none';
        });
    }

    // General Application Form Submission
    if (generalApplicationForm) {
        generalApplicationForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('generalName')?.value;
            const email = document.getElementById('generalEmail')?.value;
            const phone = document.getElementById('generalPhone')?.value;
            const profession = document.getElementById('generalProfession')?.value;
            const department = document.getElementById('generalDepartment')?.value;
            const message = document.getElementById('generalMessage')?.value;

            const generalRecord = {
                id: `gen-app-${Date.now()}`,
                jobId: 'general-talent-pool',
                jobTitle: `General Application (${profession || 'Healthcare'})`,
                applicantName: name,
                applicantEmail: email,
                applicantPhone: phone,
                department: department,
                qualification: profession,
                coverLetter: message,
                submittedAt: new Date().toISOString(),
                status: 'Talent Pool'
            };

            if (window.KTRHStore) {
                window.KTRHStore.add('jobApplications', generalRecord);
            }

            alert(`Thank you, ${name}! Your profile has been added to the KTRH talent database.`);
            generalApplicationForm.reset();
        });
    }
}

function filterJobs() {
    displayedJobs = allJobs.filter(job => {
        const matchesCategory = currentCategory === 'all' || 
            (job.department && job.department.toLowerCase().includes(currentCategory.toLowerCase())) ||
            (job.type && job.type.toLowerCase().includes(currentCategory.toLowerCase()));

        const matchesSearch = !currentSearchTerm || 
            (job.title && job.title.toLowerCase().includes(currentSearchTerm)) ||
            (job.department && job.department.toLowerCase().includes(currentSearchTerm)) ||
            (job.description && job.description.toLowerCase().includes(currentSearchTerm));

        return matchesCategory && matchesSearch;
    });

    renderJobsGrid();
}

function renderJobsGrid() {
    if (!jobsContainer) return;

    if (displayedJobs.length === 0) {
        jobsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-briefcase" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 15px;"></i>
                <h3 style="color: #2c4964; margin-bottom: 8px;">No Current Vacancies</h3>
                <p>There are no active openings matching your selection. You can submit a General Application below.</p>
            </div>
        `;
        return;
    }

    jobsContainer.innerHTML = displayedJobs.map(job => {
        const daysLeft = calculateDaysLeft(job.deadline);

        return `
            <div class="job-card">
                <div class="job-card-header">
                    <span class="job-type-tag">${job.type || 'Full-Time'}</span>
                    <span class="job-deadline-tag"><i class="fas fa-clock"></i> ${daysLeft}</span>
                </div>
                <h3>${job.title}</h3>
                <p class="job-department"><i class="fas fa-hospital"></i> ${job.department || 'Hospital Administration'}</p>
                <p class="job-summary">${job.description ? job.description.slice(0, 140) + '...' : 'Exciting career opportunity at Kisii Teaching & Referral Hospital.'}</p>
                
                <div class="job-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${job.location || 'Kisii, Kenya'}</span>
                    <span><i class="fas fa-calendar-alt"></i> Deadline: ${job.deadline || 'Open'}</span>
                </div>

                <div class="job-card-actions">
                    <button class="btn-job-details" onclick="openJobDetailsModal('${job.id}')">
                        <i class="fas fa-info-circle"></i> View Role
                    </button>
                    <button class="btn-job-apply" onclick="openApplyModal('${job.id}')">
                        <i class="fas fa-paper-plane"></i> Apply Online
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function calculateDaysLeft(deadlineStr) {
    if (!deadlineStr) return 'Active';
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diff = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Closed';
    if (diff === 0) return 'Closes Today';
    return `${diff} Days Left`;
}

window.openJobDetailsModal = function(id) {
    const job = allJobs.find(j => String(j.id) === String(id));
    if (!job || !jobsModal || !jobModalBody) return;

    const reqs = Array.isArray(job.requirements)
        ? job.requirements.map(r => `<li><i class="fas fa-check-circle" style="color: #1977cc; margin-right: 8px;"></i>${r}</li>`).join('')
        : `<li>${job.requirements || 'Relevant medical or administrative qualifications'}</li>`;

    const resps = Array.isArray(job.responsibilities)
        ? job.responsibilities.map(r => `<li><i class="fas fa-arrow-right" style="color: #2c4964; margin-right: 8px;"></i>${r}</li>`).join('')
        : `<li>${job.responsibilities || 'Execute assigned duties according to KTRH clinical protocols'}</li>`;

    jobModalBody.innerHTML = `
        <div style="padding: 10px;">
            <span style="display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0284c7; border-radius: 4px; font-weight: 600; margin-bottom: 10px;">${job.type || 'Full-Time'}</span>
            <h2 style="color: #2c4964; margin-bottom: 5px;">${job.title}</h2>
            <p style="color: #1977cc; font-weight: 500; margin-bottom: 15px;"><i class="fas fa-hospital"></i> Department: ${job.department}</p>
            
            <p style="color: #475569; line-height: 1.7; font-size: 1.05rem; margin-bottom: 20px;">${job.description}</p>

            <h4 style="color: #2c4964; margin-bottom: 10px;"><i class="fas fa-clipboard-list"></i> Key Responsibilities</h4>
            <ul style="list-style: none; padding-left: 0; line-height: 1.9; margin-bottom: 20px;">
                ${resps}
            </ul>

            <h4 style="color: #2c4964; margin-bottom: 10px;"><i class="fas fa-user-check"></i> Minimum Qualifications & Requirements</h4>
            <ul style="list-style: none; padding-left: 0; line-height: 1.9; margin-bottom: 25px;">
                ${reqs}
            </ul>

            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                <p style="margin: 4px 0;"><strong>Application Deadline:</strong> ${job.deadline}</p>
                <p style="margin: 4px 0;"><strong>Duty Station:</strong> ${job.location || 'Kisii Teaching & Referral Hospital'}</p>
            </div>

            <button onclick="jobsModal.style.display='none'; openApplyModal('${job.id}');" class="btn-job-apply" style="padding: 12px 28px; background: #1977cc; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">
                <i class="fas fa-paper-plane"></i> Apply for this Position
            </button>
        </div>
    `;

    jobsModal.style.display = 'flex';
};

window.openApplyModal = function(id) {
    const job = allJobs.find(j => String(j.id) === String(id));
    if (!job || !applicationModal) return;

    activeJobForApplication = job;
    const modalTitle = document.getElementById('modalJobTitle');
    if (modalTitle) {
        modalTitle.textContent = `Apply for: ${job.title}`;
    }

    applicationModal.style.display = 'flex';
};
