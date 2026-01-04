// ===========================================
// HOME PAGE - STRAPI INTEGRATION
// ===========================================

// Shared Strapi API Configuration
const STRAPI_API_URL = 'https://better-friend-c539968cc5.strapiapp.com/api';
const STRAPI_IMAGE_URL = 'https://better-friend-c539968cc5.strapiapp.com';

// DOM Elements
let statsElements = [];
let doctorsGrid;
let heroVideo;
let heroVideoFallback;

// Global State
let homeStats = {};
let featuredDoctors = [];
let heroVideoId = 'IzZeZbr7Jf0'; // Default video ID

// Function to inject CSS for image handling
function injectHomeImageStyles() {
    // Check if styles already exist
    if (document.getElementById('home-image-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'home-image-styles';
    style.textContent = `
        /* Home page doctor card image optimization */
        .doctors-grid .doctor-card {
            border-radius: 10px;
            overflow: hidden;
            background: white;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            height: 100%;
        }
        
        .doctors-grid .doctor-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .doctors-grid .doctor-img {
            position: relative;
            width: 100%;
            height: 220px;
            overflow: hidden;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .doctors-grid .doctor-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            transition: transform 0.5s ease;
            min-width: 100%;
            min-height: 100%;
        }
        
        .doctors-grid .doctor-card:hover .doctor-img img {
            transform: scale(1.05);
        }
        
        .doctors-grid .doctor-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .doctors-grid .doctor-card:hover .doctor-overlay {
            opacity: 1;
        }
        
        .doctors-grid .view-profile {
            background: var(--primary-color);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: 600;
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        
        .doctors-grid .doctor-card:hover .view-profile {
            transform: translateY(0);
        }
        
        .doctors-grid .doctor-info {
            padding: 15px;
        }
        
        .doctors-grid .doctor-info h3 {
            font-size: 18px;
            margin: 0 0 5px 0;
            color: #333;
        }
        
        .doctors-grid .doctor-info .specialty {
            color: var(--primary-color);
            font-weight: 600;
            font-size: 14px;
            margin: 0 0 5px 0;
        }
        
        .doctors-grid .doctor-info .experience {
            color: #666;
            font-size: 13px;
            margin: 0 0 10px 0;
        }
        
        .doctors-grid .doctor-rating {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .doctors-grid .doctor-rating i {
            color: #FFD700;
            font-size: 14px;
        }
        
        .doctors-grid .doctor-rating span {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }
        
        /* Image loading animation */
        .doctor-img img.loading {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        /* Responsive grid */
        @media (max-width: 768px) {
            .doctors-grid {
                grid-template-columns: repeat(2, 1fr) !important;
            }
            
            .doctors-grid .doctor-img {
                height: 180px;
            }
        }
        
        @media (max-width: 576px) {
            .doctors-grid {
                grid-template-columns: 1fr !important;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Function to setup image loading for home page
function setupHomeImageLoading() {
    // Listen for image load events
    document.addEventListener('load', function(e) {
        if (e.target.tagName === 'IMG') {
            e.target.classList.remove('loading');
            e.target.classList.add('loaded');
        }
    }, true);
    
    // Add error handling for images
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            console.warn('Image failed to load:', e.target.src);
            e.target.src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=70';
            e.target.classList.remove('loading');
        }
    }, true);
}

// Function to fetch home page data from Strapi
async function fetchHomePageData() {
    try {
        console.log('Fetching home page data from Strapi...');
        
        // Fetch multiple data sources in parallel
        const [doctorsData, homePageData] = await Promise.all([
            fetchDoctors(),
            fetchHomePageContent()
        ]);
        
        return {
            doctors: doctorsData,
            homePage: homePageData
        };
    } catch (error) {
        console.error('Error fetching home page data:', error);
        return {
            doctors: getFallbackDoctors(),
            homePage: null
        };
    }
}

// Function to fetch doctors (reusing doctors page function)
async function fetchDoctors() {
    try {
        console.log('Fetching doctors for home page...');
        const response = await fetch(`${STRAPI_API_URL}/doctors?populate=*&pagination[limit]=6&sort[0]=createdAt:desc`);
        
        if (!response.ok) {
            console.error('API response not ok:', response.status, response.statusText);
            return getFallbackDoctors();
        }
        
        const data = await response.json();
        
        // Handle Strapi v4 response structure
        if (data.data && Array.isArray(data.data)) {
            console.log(`Fetched ${data.data.length} doctors for home page`);
            return data.data;
        } else if (Array.isArray(data)) {
            console.log(`Fetched ${data.length} doctors for home page`);
            return data;
        } else {
            console.error('Unexpected API response structure:', data);
            return getFallbackDoctors();
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return getFallbackDoctors();
    }
}

// Function to fetch home page content
async function fetchHomePageContent() {
    try {
        console.log('Fetching home page content from Strapi...');
        
        const response = await fetch(`${STRAPI_API_URL}/home-page?populate=*`);
        
        if (!response.ok) {
            console.log('Home page content not found in Strapi, using defaults');
            return null;
        }
        
        const data = await response.json();
        
        if (data.data) {
            if (Array.isArray(data.data) && data.data.length > 0) {
                return data.data[0];
            }
            return data.data;
        }
        return data;
        
    } catch (error) {
        console.log('Home page content not available, using defaults');
        return null;
    }
}

// Fallback doctors data for home page
function getFallbackDoctors() {
    console.log('Using fallback doctors data for home page');
    return [
        {
            id: 1,
            attributes: {
                name: "Dr. Ondari",
                title: "Chief Cardiologist",
                specialty: "Cardiology",
                department: "Cardiology",
                experience: "15+ years",
                image: {
                    data: {
                        attributes: {
                            url: "img/drondari.png"
                        }
                    }
                },
                rating: 4.5,
                is_featured: true
            }
        },
        {
            id: 2,
            attributes: {
                name: "Dr. Michael Orina",
                title: "Senior Neurologist",
                specialty: "Neurology",
                department: "Neurology",
                experience: "12+ years",
                image: {
                    data: {
                        attributes: {
                            url: "img/dr-orina.jpg"
                        }
                    }
                },
                rating: 5.0,
                is_featured: true
            }
        },
        {
            id: 3,
            attributes: {
                name: "Dr. Oimeke Mariita",
                title: "Lead Cardiologist",
                specialty: "Cardiology",
                department: "Cardiology",
                experience: "10+ years",
                image: {
                    data: {
                        attributes: {
                            url: "images/doctor3.jpg"
                        }
                    }
                },
                rating: 4.5,
                is_featured: true
            }
        }
    ];
}

// Helper function to get doctor image URL (optimized for home page)
function getDoctorImageUrl(imageData) {
    if (!imageData) {
        return 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=70';
    }
    
    let imageUrl = '';
    let format = imageData.data?.attributes?.formats || imageData.formats;
    
    // Try to get medium format first
    if (format) {
        imageUrl = format.medium?.url || format.small?.url || format.large?.url;
    }
    
    // Fallback to regular URL
    if (!imageUrl) {
        if (imageData.data?.attributes?.url) {
            imageUrl = imageData.data.attributes.url;
        } else if (imageData.attributes?.url) {
            imageUrl = imageData.attributes.url;
        } else if (imageData.url) {
            imageUrl = imageData.url;
        }
    }
    
    // Prepend base URL if needed
    if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${STRAPI_IMAGE_URL}${imageUrl}`;
    }
    
    return imageUrl || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=70';
}

// Function to calculate home page statistics
async function calculateHomeStats(doctorsData, homePageData) {
    console.log('Calculating home page statistics...');
    
    const stats = {
        specialistDoctors: 0,
        hospitalBeds: 500, // Default value
        departments: 50, // Default value
        yearsExperience: 25, // Default value
        totalPatients: 100000, // Default value
        successRate: 98, // Default value
        staffMembers: 500 // Default value
    };
    
    // Get attributes if homePageData is from Strapi
    const homeAttributes = homePageData?.attributes || homePageData || {};
    
    // Count specialist doctors
    if (Array.isArray(doctorsData)) {
        stats.specialistDoctors = doctorsData.length;
    }
    
    // Use values from Strapi if available
    if (homeAttributes.stats) {
        const strapiStats = typeof homeAttributes.stats === 'string' 
            ? JSON.parse(homeAttributes.stats) 
            : homeAttributes.stats;
        
        if (strapiStats.specialistDoctors) stats.specialistDoctors = strapiStats.specialistDoctors;
        if (strapiStats.hospitalBeds) stats.hospitalBeds = strapiStats.hospitalBeds;
        if (strapiStats.departments) stats.departments = strapiStats.departments;
        if (strapiStats.yearsExperience) stats.yearsExperience = strapiStats.yearsExperience;
        if (strapiStats.totalPatients) stats.totalPatients = strapiStats.totalPatients;
        if (strapiStats.successRate) stats.successRate = strapiStats.successRate;
        if (strapiStats.staffMembers) stats.staffMembers = strapiStats.staffMembers;
    }
    
    // Get hero video ID from Strapi if available
    if (homeAttributes.heroVideoId) {
        heroVideoId = homeAttributes.heroVideoId;
    }
    
    console.log('Home stats calculated:', stats);
    return stats;
}

// Function to animate counting numbers
function animateCounter(element, target, suffix = '', duration = 2000) {
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
        
        // Format number
        if (typeof target === 'number' && target % 1 === 0) {
            element.textContent = Math.floor(current) + suffix;
        } else {
            element.textContent = current.toFixed(1) + suffix;
        }
    }, 16);
}

// Function to update stats with animation
function updateStats(stats) {
    console.log('Updating home page stats...');
    
    // Get all stat elements
    const statElements = [
        { element: document.querySelector('.quick-stats .stat-item:nth-child(1) h3'), value: stats.specialistDoctors },
        { element: document.querySelector('.quick-stats .stat-item:nth-child(2) h3'), value: stats.hospitalBeds },
        { element: document.querySelector('.quick-stats .stat-item:nth-child(3) h3'), value: stats.departments, suffix: '+' },
        { element: document.querySelector('.quick-stats .stat-item:nth-child(4) h3'), value: stats.yearsExperience }
    ];
    
    // Animate each stat
    statElements.forEach((stat, index) => {
        if (stat.element) {
            // Reset to 0 first
            stat.element.textContent = '0' + (stat.suffix || '');
            
            // Animate after a delay for staggered effect
            setTimeout(() => {
                animateCounter(stat.element, stat.value, stat.suffix || '');
            }, index * 300);
        }
    });
    
    // Update hero features (optional)
    const heroFeatures = document.querySelectorAll('.hero-features .feature span');
    if (heroFeatures.length >= 3) {
        heroFeatures[0].textContent = '24/7 Emergency Services';
        heroFeatures[1].textContent = stats.specialistDoctors + '+ Specialist Doctors';
        heroFeatures[2].textContent = stats.yearsExperience + ' Years Experience';
    }
}

// Function to add responsive grid styles for doctors
function addResponsiveGridStyles() {
    // Check if style already exists
    if (document.getElementById('responsive-doctors-grid')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'responsive-doctors-grid';
    style.textContent = `
        /* Responsive grid for doctors section */
        .doctors-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 20px;
            width: 100%;
        }
        
        .doctor-card {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
        }
        
        @media (min-width: 768px) {
            .doctors-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
        
        @media (min-width: 992px) {
            .doctors-grid {
                grid-template-columns: repeat(3, 1fr);
            }
            
            .doctor-card {
                max-width: 350px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Function to render featured doctors with smaller cards
function renderFeaturedDoctors(doctors) {
    if (!doctorsGrid) {
        console.error('Doctors grid not found');
        return;
    }
    
    console.log(`Rendering ${Math.min(doctors.length, 6)} featured doctors`);
    
    // Add responsive grid styles
    addResponsiveGridStyles();
    
    // Take up to 6 doctors for home page (2 rows of 3 on desktop)
    const doctorsToShow = doctors.slice(0, 6);
    
    const doctorsHTML = doctorsToShow.map(doctor => {
        const attrs = doctor.attributes || doctor;
        const name = attrs.name || 'Dr. Unknown';
        const specialty = attrs.specialty || attrs.department || 'General Medicine';
        const experience = attrs.experience || '5+ years';
        const imageUrl = getDoctorImageUrl(attrs.image);
        const rating = attrs.rating || 4.5;
        const doctorId = doctor.id || '';
        
        // Generate star rating HTML
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return `
            <div class="doctor-card" data-id="${doctorId}">
                <div class="doctor-img">
                    <img src="${imageUrl}" 
                         alt="${name}" 
                         loading="lazy"
                         class="loading"
                         onload="this.classList.remove('loading'); this.classList.add('loaded')"
                         onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=70'; this.classList.remove('loading')">
                    <div class="doctor-overlay">
                        <a href="doctors.html" class="view-profile">View Profile</a>
                    </div>
                </div>
                <div class="doctor-info">
                    <h3>${name}</h3>
                    <p class="specialty">${specialty}</p>
                    <p class="experience">${experience}</p>
                    <div class="doctor-rating">
                        ${starsHTML}
                        <span>${rating}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    doctorsGrid.innerHTML = doctorsHTML;
}

// Function to update hero video
function updateHeroVideo(videoId) {
    console.log('Updating hero video with ID:', videoId);
    
    if (!heroVideo) {
        console.error('Hero video iframe not found');
        return;
    }
    
    // Update the YouTube iframe src
    const newSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&enablejsapi=1`;
    
    heroVideo.src = newSrc;
    
    // Update fallback image based on video ID (optional)
    if (heroVideoFallback) {
        const fallbackImages = {
            'IzZeZbr7Jf0': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2067&q=80',
            'dQw4w9WgXcQ': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2067&q=80',
        };
        
        if (fallbackImages[videoId]) {
            heroVideoFallback.style.backgroundImage = `url('${fallbackImages[videoId]}')`;
        }
    }
}

// Function to setup video controls (optional)
function setupVideoControls() {
    const videoControls = document.createElement('div');
    videoControls.className = 'video-controls';
    videoControls.innerHTML = `
        <div style="position: absolute; bottom: 20px; right: 20px; z-index: 10;">
            <button id="changeVideoBtn" style="background: rgba(0,0,0,0.7); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-size: 14px;">
                <i class="fas fa-video"></i> Change Video
            </button>
        </div>
    `;
    
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        videoContainer.appendChild(videoControls);
        
        const changeVideoBtn = document.getElementById('changeVideoBtn');
        if (changeVideoBtn) {
            changeVideoBtn.addEventListener('click', function() {
                const videoIds = ['IzZeZbr7Jf0', 'dQw4w9WgXcQ', '9bZkp7q19f0'];
                const randomVideoId = videoIds[Math.floor(Math.random() * videoIds.length)];
                updateHeroVideo(randomVideoId);
            });
        }
    }
}

// Function to handle contact form submission
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value,
            createdAt: new Date().toISOString()
        };
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send to Strapi
            const response = await fetch(`${STRAPI_API_URL}/contact-submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: formData
                })
            });
            
            if (response.ok) {
                alert('Thank you! Your message has been sent successfully.');
                contactForm.reset();
            } else {
                throw new Error('Failed to submit form');
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            alert('Sorry, there was an error sending your message. Please try again.');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Function to initialize home page
async function initializeHomePage() {
    console.log('Initializing home page...');
    
    // Inject image styles first
    injectHomeImageStyles();
    setupHomeImageLoading();
    
    // Get DOM elements
    doctorsGrid = document.querySelector('.doctors-grid');
    heroVideo = document.getElementById('youtubeVideo');
    heroVideoFallback = document.querySelector('.video-fallback');
    
    try {
        // Fetch data from Strapi
        const { doctors, homePage } = await fetchHomePageData();
        
        // Calculate statistics
        homeStats = await calculateHomeStats(doctors, homePage);
        
        // Update page content
        updateStats(homeStats);
        renderFeaturedDoctors(doctors);
        
        // Update hero video if different from default
        if (heroVideoId !== 'IzZeZbr7Jf0') {
            updateHeroVideo(heroVideoId);
        }
        
        // Setup video controls (optional)
        setupVideoControls();
        
        // Setup contact form
        setupContactForm();
        
        // Setup newsletter form
        setupNewsletterForm();
        
        console.log('Home page initialized successfully');
        
    } catch (error) {
        console.error('Error initializing home page:', error);
        
        // Use fallback data
        const fallbackDoctors = getFallbackDoctors();
        const fallbackStats = {
            specialistDoctors: fallbackDoctors.length,
            hospitalBeds: 500,
            departments: 50,
            yearsExperience: 25
        };
        
        updateStats(fallbackStats);
        renderFeaturedDoctors(fallbackDoctors);
        setupContactForm();
        setupNewsletterForm();
    }
    
    // Set current year in footer
    setCurrentYear();
}

// Function to setup newsletter form
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;
    
    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value;
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        
        if (!email) return;
        
        // Show loading state
        const originalHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        try {
            // Save to Strapi
            const response = await fetch(`${STRAPI_API_URL}/newsletter-subscriptions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: {
                        email: email,
                        subscribedAt: new Date().toISOString(),
                        active: true
                    }
                })
            });
            
            if (response.ok) {
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = '';
            } else {
                throw new Error('Failed to subscribe');
            }
        } catch (error) {
            console.error('Error subscribing to newsletter:', error);
            alert('Sorry, there was an error. Please try again.');
        } finally {
            submitBtn.innerHTML = originalHtml;
        }
    });
}

// Function to set current year in footer
function setCurrentYear() {
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
}

// Initialize when DOM is loaded
if (document.querySelector('.home-page') || window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', initializeHomePage);
}

// Make updateHeroVideo function globally available for manual control
window.updateHeroVideo = updateHeroVideo;