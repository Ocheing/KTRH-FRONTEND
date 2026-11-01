// ==========================================================================
// HOME PAGE CONTROLLER — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

let doctorsGrid;
let heroVideo;

document.addEventListener('DOMContentLoaded', function() {
    initHomePage();
});

// Real-time update listener from Admin Portal
window.addEventListener('ktrh_data_updated', function(e) {
    refreshHomePageContent();
});

function initHomePage() {
    doctorsGrid = document.querySelector('.doctors-grid');
    heroVideo = document.getElementById('youtubeVideo');

    refreshHomePageContent();
    setupContactForm();
    setupNewsletterForm();
    setCurrentYear();
}

function refreshHomePageContent() {
    if (!window.KTRHStore) return;

    // Load stats
    const stats = window.KTRHStore.getStats();
    updateHomeStats(stats);

    // Load doctors
    const allDocs = window.KTRHStore.getDoctors();
    const featured = allDocs.filter(d => d.is_featured);
    const doctorsToShow = featured.length > 0 ? featured.slice(0, 3) : allDocs.slice(0, 3);
    renderHomeDoctors(doctorsToShow);
}

function updateHomeStats(stats) {
    if (!stats) return;

    const statElements = {
        'doctors': stats.specialistDoctors || '45+',
        'beds': stats.hospitalBeds || '650+',
        'departments': stats.departments || '28+',
        'experience': stats.yearsExperience || '100+'
    };

    const statItems = document.querySelectorAll('.stat-item, .counter-box');
    if (statItems.length >= 4) {
        const keys = ['doctors', 'beds', 'departments', 'experience'];
        statItems.forEach((item, index) => {
            const h2 = item.querySelector('h2, .stat-number, h3');
            if (h2 && keys[index]) {
                h2.textContent = statElements[keys[index]];
            }
        });
    }
}

function renderHomeDoctors(doctors) {
    if (!doctorsGrid) return;

    if (!doctors || doctors.length === 0) {
        doctorsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <p>Medical specialists available for consultation. Visit the <a href="doctors.html" style="color: #1977cc; font-weight: 600;">Doctors Directory</a>.</p>
            </div>
        `;
        return;
    }

    doctorsGrid.innerHTML = doctors.map(doc => {
        const deptTag = doc.department ? doc.department.charAt(0).toUpperCase() + doc.department.slice(1) : 'Cardiology';
        const ratingStars = '★'.repeat(Math.floor(doc.rating || 5)) + (doc.rating % 1 !== 0 ? '½' : '');

        return `
            <div class="doctor-card">
                <div class="doctor-img">
                    <img src="${doc.image || 'img/drondari.png'}" alt="${doc.name}" loading="lazy" onerror="this.src='img/drondari.png'">
                    <span class="doctor-dept-badge">${deptTag}</span>
                </div>
                <div class="doctor-info">
                    <h3>${doc.name}</h3>
                    <p class="doctor-title">${doc.title || doc.specialty}</p>
                    <div class="doctor-rating">
                        <span style="color: #f59e0b; margin-right: 5px;">${ratingStars}</span>
                        <small>(${doc.experience || '10+ yrs'})</small>
                    </div>
                    <div class="doctor-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                        <a href="appointment.html?doctor=${encodeURIComponent(doc.id)}" class="btn-book" style="flex: 1; text-align: center; padding: 8px 12px; background: #1977cc; color: white; border-radius: 5px; text-decoration: none; font-size: 0.9rem; font-weight: 600;">
                            Book Visit
                        </a>
                        <a href="doctors.html" class="btn-learn" style="flex: 1; text-align: center; padding: 8px 12px; border: 1px solid #1977cc; color: #1977cc; border-radius: 5px; text-decoration: none; font-size: 0.9rem; font-weight: 600;">
                            Profile
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value || 'Not provided';
        const subject = document.getElementById('subject')?.value;
        const message = document.getElementById('message')?.value;

        if (!name || !email || !message) {
            alert('Please fill in your name, email, and message.');
            return;
        }

        const msgRecord = {
            id: `msg-${Date.now()}`,
            name: name,
            email: email,
            phone: phone,
            subject: subject || 'General Inquiries',
            department: 'General Hospital Inquiries',
            message: message,
            status: 'Unread',
            createdAt: new Date().toISOString()
        };

        if (window.KTRHStore) {
            window.KTRHStore.add('contactMessages', msgRecord);
        }

        alert(`Thank you, ${name}! Your inquiry has been sent to KTRH Administration. We will respond via ${email}.`);
        contactForm.reset();
    });
}

function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput?.value;

        if (!email) return;

        if (window.KTRHStore) {
            window.KTRHStore.add('newsletterSubscriptions', {
                id: `sub-${Date.now()}`,
                email: email,
                date: new Date().toISOString().split('T')[0]
            });
        }

        alert('Thank you for subscribing to KTRH hospital bulletins and health updates!');
        emailInput.value = '';
    });
}

function setCurrentYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}
