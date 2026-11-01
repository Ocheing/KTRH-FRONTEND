// ==========================================================================
// PROJECTS & INFRASTRUCTURE — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

// DOM Elements
let projectsGrid;
let categoryButtons;
let projectsSearch;
let loadMoreBtn;
let projectModal;
let modalBody;
let modalCloseBtn;

// State Management
let currentCategory = 'all';
let currentSearchTerm = '';
let visibleCount = 6;
let allProjects = [];
let filteredProjects = [];

document.addEventListener('DOMContentLoaded', function() {
    initProjectsPage();
});

// Real-time update listener from Admin Portal
window.addEventListener('ktrh_data_updated', function(e) {
    if (!e.detail?.collection || e.detail.collection === 'projects') {
        loadProjectsFromStore();
    }
});

function initProjectsPage() {
    projectsGrid = document.getElementById('projectsGrid');
    categoryButtons = document.querySelectorAll('.project-categories .category-btn');
    projectsSearch = document.getElementById('projectsSearch');
    loadMoreBtn = document.getElementById('loadMoreProjects');
    projectModal = document.getElementById('projectModal');
    modalBody = document.getElementById('modalBody');
    modalCloseBtn = document.getElementById('modalClose');

    setupEventListeners();
    loadProjectsFromStore();
}

function loadProjectsFromStore() {
    if (window.KTRHStore) {
        allProjects = window.KTRHStore.getProjects();
    } else {
        allProjects = [];
    }

    filteredProjects = [...allProjects];
    updateProjectStats();
    filterProjects();
}

function setupEventListeners() {
    // Category Buttons
    if (categoryButtons) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.getAttribute('data-category') || 'all';
                filterProjects();
            });
        });
    }

    // Search Input
    if (projectsSearch) {
        projectsSearch.addEventListener('input', function() {
            currentSearchTerm = this.value.trim().toLowerCase();
            filterProjects();
        });

        const searchBtn = projectsSearch.nextElementSibling;
        if (searchBtn && searchBtn.tagName === 'BUTTON') {
            searchBtn.addEventListener('click', () => {
                currentSearchTerm = projectsSearch.value.trim().toLowerCase();
                filterProjects();
            });
        }
    }

    // Load More Button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            visibleCount += 4;
            renderProjectsGrid();
            updateLoadMoreButton();
        });
    }

    // Modal Close
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeProjectModal);
    }

    if (projectModal) {
        window.addEventListener('click', function(e) {
            if (e.target === projectModal) {
                closeProjectModal();
            }
        });
    }
}

function filterProjects() {
    filteredProjects = allProjects.filter(project => {
        const matchesCategory = currentCategory === 'all' || 
            (project.category && project.category.toLowerCase() === currentCategory.toLowerCase());

        const matchesSearch = !currentSearchTerm || 
            (project.title && project.title.toLowerCase().includes(currentSearchTerm)) ||
            (project.shortDescription && project.shortDescription.toLowerCase().includes(currentSearchTerm)) ||
            (project.location && project.location.toLowerCase().includes(currentSearchTerm));

        return matchesCategory && matchesSearch;
    });

    renderProjectsGrid();
    updateLoadMoreButton();
}

function renderProjectsGrid() {
    if (!projectsGrid) return;

    if (filteredProjects.length === 0) {
        projectsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-building" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 15px;"></i>
                <h3 style="color: #2c4964; margin-bottom: 8px;">No Projects Found</h3>
                <p>No development projects match your current filters. Please select a different category.</p>
            </div>
        `;
        return;
    }

    const itemsToRender = filteredProjects.slice(0, visibleCount);

    projectsGrid.innerHTML = itemsToRender.map(project => {
        const progress = project.progress !== undefined ? project.progress : 50;
        const statusClass = project.status ? project.status.toLowerCase() : 'ongoing';

        return `
            <div class="project-card ${project.category || 'infrastructure'}">
                <div class="project-image">
                    <img src="${project.image || 'img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg'}" alt="${project.title}" loading="lazy" onerror="this.src='img/about.jpg'">
                    <span class="project-status status-${statusClass}">${project.status || 'Ongoing'}</span>
                </div>
                <div class="project-content">
                    <div class="project-header">
                        <span class="project-category-tag">${(project.category || 'Infrastructure').toUpperCase()}</span>
                        <h3>${project.title}</h3>
                    </div>
                    <p class="project-description">${project.shortDescription || 'Key hospital modernization initiative at KTRH.'}</p>
                    
                    <div class="project-progress-container">
                        <div class="progress-info">
                            <span>Progress</span>
                            <span><strong>${progress}%</strong></span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%;"></div>
                        </div>
                    </div>

                    <div class="project-meta">
                        <div><i class="fas fa-calendar-alt"></i> ${project.startDate ? project.startDate.slice(0,4) : '2024'} - ${project.endDate ? project.endDate.slice(0,4) : 'Ongoing'}</div>
                        <div><i class="fas fa-coins"></i> ${project.budget || 'County Funded'}</div>
                    </div>

                    <div class="project-actions">
                        <button class="btn-details" onclick="openProjectModal('${project.id}')">
                            <i class="fas fa-info-circle"></i> Project Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateLoadMoreButton() {
    if (!loadMoreBtn) return;
    if (filteredProjects.length > visibleCount) {
        loadMoreBtn.style.display = 'inline-block';
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Projects';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

function updateProjectStats() {
    const totalProjects = allProjects.length;
    const activeProjects = allProjects.filter(p => p.status?.toLowerCase() === 'ongoing').length;
    const completedProjects = allProjects.filter(p => p.status?.toLowerCase() === 'completed').length;
    const upcomingProjects = allProjects.filter(p => p.status?.toLowerCase() === 'upcoming').length;

    const totalEl = document.getElementById('totalProjects');
    const activeEl = document.getElementById('activeProjects');
    const completedEl = document.getElementById('completedProjects');
    const upcomingEl = document.getElementById('upcomingProjects');

    if (totalEl) totalEl.textContent = `${totalProjects}`;
    if (activeEl) activeEl.textContent = `${activeProjects}`;
    if (completedEl) completedEl.textContent = `${completedProjects}`;
    if (upcomingEl) upcomingEl.textContent = `${upcomingProjects}`;

    // Alternative stat cards check
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        if (!totalEl) statCards[0].querySelector('h3').textContent = `${totalProjects}`;
        if (!activeEl) statCards[1].querySelector('h3').textContent = `${activeProjects}`;
        if (!completedEl) statCards[2].querySelector('h3').textContent = `${completedProjects}`;
        if (!upcomingEl) statCards[3].querySelector('h3').textContent = `${upcomingProjects}`;
    }
}

window.openProjectModal = function(id) {
    const project = allProjects.find(p => String(p.id) === String(id));
    if (!project || !projectModal || !modalBody) return;

    const impacts = Array.isArray(project.impact)
        ? project.impact.map(i => `<li><i class="fas fa-check-circle" style="color: #1977cc; margin-right: 8px;"></i>${i}</li>`).join('')
        : `<li>${project.impact || 'Modernizes tertiary healthcare infrastructure for Western Kenya.'}</li>`;

    modalBody.innerHTML = `
        <div style="padding: 10px;">
            <div style="height: 280px; overflow: hidden; border-radius: 10px; margin-bottom: 20px;">
                <img src="${project.image || 'img/Photo-2-Mother-and-Child-Hospital-1200x630.jpg'}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='img/about.jpg'">
            </div>
            <span style="display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0284c7; border-radius: 4px; font-weight: 600; font-size: 0.85rem; margin-bottom: 10px;">${(project.category || 'Infrastructure').toUpperCase()}</span>
            <h2 style="color: #2c4964; margin-bottom: 12px; font-size: 1.8rem;">${project.title}</h2>
            <p style="color: #475569; line-height: 1.7; font-size: 1.05rem; margin-bottom: 20px;">${project.shortDescription || ''}</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div><strong>Status:</strong> <span style="color: #0284c7; font-weight: 600;">${project.status || 'Ongoing'}</span></div>
                <div><strong>Progress:</strong> ${project.progress || 0}%</div>
                <div><strong>Timeline:</strong> ${project.startDate || '2024'} to ${project.endDate || 'Ongoing'}</div>
                <div><strong>Budget / Funding:</strong> ${project.budget || 'County & Partners'}</div>
                <div><strong>Contractor:</strong> ${project.contractor || 'National Consortium'}</div>
                <div><strong>Location:</strong> ${project.location || 'KTRH Campus'}</div>
            </div>

            <h4 style="color: #2c4964; margin-bottom: 10px;"><i class="fas fa-award"></i> Expected Healthcare Impact</h4>
            <ul style="list-style: none; padding-left: 0; line-height: 2; margin-bottom: 20px;">
                ${impacts}
            </ul>
        </div>
    `;

    projectModal.style.display = 'flex';
};

function closeProjectModal() {
    if (projectModal) {
        projectModal.style.display = 'none';
    }
}
