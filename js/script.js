// Enhanced Hospital Website JavaScript with YouTube Video Support

// DOM Ready Function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initPreloader();
    initMobileMenu();
    initBackToTop();
    initSmoothScroll();
    initNavbarScroll();
    initYouTubeVideo();
    initStatsCounter();
    initContactForm();
    initChatWidget();
    initCurrentYear();
    initScrollAnimations();
    initFormValidation();
    initGallery();
     if (document.getElementById('applicationModal')) initCareersPage();
     if (document.getElementById('contactForm')) initContactPageForm();
    if (document.querySelector('.history-timeline')) initAboutPage();
});

// Enhanced Preloader
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Calculate minimum display time
        const minDisplayTime = 1000;
        const startTime = Date.now();
        
        window.addEventListener('load', () => {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
            
            setTimeout(() => {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    // Show chat widget after preloader
                    setTimeout(() => {
                        const chatWidget = document.getElementById('chatWidget');
                        if (chatWidget) {
                            chatWidget.classList.add('active');
                        }
                    }, 1000);
                }, 500);
            }, remainingTime);
        });
    }
}

// Mobile Menu Toggle - Enhanced
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    if (navToggle) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navbar.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Toggle body scroll
            document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : '';
            
            // Close all dropdowns when toggling mobile menu
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        });
    }
    
    // Handle dropdown toggle on mobile
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdown.classList.toggle('active');
                    
                    // Close other dropdowns
                    dropdowns.forEach(other => {
                        if (other !== dropdown) {
                            other.classList.remove('active');
                        }
                    });
                }
            });
        }
    });
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbar.classList.contains('active') && window.innerWidth <= 992) {
                navbar.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
                
                // Close all dropdowns
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && !navToggle.contains(e.target)) {
            if (navbar.classList.contains('active')) {
                navbar.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
                
                // Close all dropdowns
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            navbar.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset dropdowns
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

// Back to Top Button
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });
        
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Smooth Scroll for Navigation Links
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar Scroll Effect
function initNavbarScroll() {
    const header = document.getElementById('header');
    
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
                
                // Hide navbar on scroll down, show on scroll up
                if (currentScroll > lastScroll && currentScroll > 200) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            } else {
                header.classList.remove('scrolled');
                header.style.transform = 'translateY(0)';
            }
            
            lastScroll = currentScroll;
        });
    }
}

// YouTube Video Background with Fallback
function initYouTubeVideo() {
    const videoFallback = document.querySelector('.video-fallback');
    const heroVideo = document.getElementById('youtubeVideo');
    
    if (heroVideo && videoFallback) {
        // Check if we're on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // On mobile, show fallback image instead of video
        if (isMobile || window.innerWidth <= 768) {
            heroVideo.style.display = 'none';
            videoFallback.style.display = 'block';
            videoFallback.classList.add('active');
            return;
        }
        
        // Video state tracking
        let videoLoaded = false;
        let videoError = false;
        
        // Check video load status
        setTimeout(() => {
            if (!videoLoaded && !videoError) {
                console.log('YouTube video loading slowly, showing fallback...');
                videoFallback.classList.add('active');
            }
        }, 3000);
        
        // Listen for YouTube API events
        if (typeof YT !== 'undefined') {
            // YouTube API is loaded
            new YT.Player('youtubeVideo', {
                events: {
                    'onReady': function(event) {
                        videoLoaded = true;
                        console.log('YouTube video ready');
                        videoFallback.style.opacity = '0';
                        setTimeout(() => {
                            videoFallback.style.display = 'none';
                        }, 500);
                    },
                    'onError': function(event) {
                        videoError = true;
                        console.log('YouTube video error:', event.data);
                        videoFallback.classList.add('active');
                    }
                }
            });
        } else {
            // Fallback if YouTube API fails to load
            heroVideo.addEventListener('load', () => {
                videoLoaded = true;
                console.log('YouTube iframe loaded');
                setTimeout(() => {
                    videoFallback.style.opacity = '0';
                    setTimeout(() => {
                        videoFallback.style.display = 'none';
                    }, 500);
                }, 1000);
            });
            
            heroVideo.addEventListener('error', () => {
                videoError = true;
                console.log('YouTube iframe error');
                videoFallback.classList.add('active');
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                heroVideo.style.display = 'none';
                videoFallback.style.display = 'block';
                videoFallback.classList.add('active');
            } else {
                if (!videoError) {
                    heroVideo.style.display = 'block';
                    if (videoLoaded) {
                        videoFallback.style.display = 'none';
                    }
                }
            }
        });
        
        // Pause video when not in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Video is in view
                    if (heroVideo.contentWindow) {
                        heroVideo.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    }
                } else {
                    // Video is out of view
                    if (heroVideo.contentWindow) {
                        heroVideo.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    }
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(heroVideo);
    }
}

// Stats Counter with Intersection Observer
function initStatsCounter() {
    const statItems = document.querySelectorAll('.stat-item h3');
    
    if (statItems.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const target = parseInt(stat.getAttribute('data-count')) || 0;
                const suffix = stat.textContent.includes('+') ? '+' : '';
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        stat.textContent = target.toLocaleString() + suffix;
                        clearInterval(timer);
                        stat.classList.add('animated');
                    } else {
                        stat.textContent = Math.floor(current).toLocaleString();
                    }
                }, 16);
                
                observer.unobserve(stat);
            }
        });
    }, { 
        threshold: 0.5,
        rootMargin: '50px'
    });
    
    statItems.forEach(stat => observer.observe(stat));
}

// Enhanced Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateContactForm()) {
                return;
            }
            
            // Get form data
            const formData = new FormData(this);
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                // Simulate API call (replace with actual API endpoint)
                await simulateAPICall(formData);
                
                // Show success message
                showNotification('Message sent successfully! We will contact you soon.', 'success');
                
                // Reset form
                this.reset();
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
            } catch (error) {
                // Show error message
                showNotification('Failed to send message. Please try again.', 'error');
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', () => {
                clearFieldError(input);
            });
        });
    }
}

// Form Validation
function initFormValidation() {
    // Add validation patterns to inputs
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^\d+]/g, '');
        });
    });
    
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function(e) {
            if (this.value && !isValidEmail(this.value)) {
                this.classList.add('error');
                showFieldError(this, 'Please enter a valid email address');
            }
        });
    });
}

// Validate Contact Form
function validateContactForm() {
    const form = document.getElementById('contactForm');
    let isValid = true;
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            showFieldError(field, 'This field is required');
        }
    });
    
    // Check email validity
    const emailField = form.querySelector('input[type="email"]');
    if (emailField.value && !isValidEmail(emailField.value)) {
        isValid = false;
        emailField.classList.add('error');
        showFieldError(emailField, 'Please enter a valid email address');
    }
    
    // Check phone validity
    const phoneField = form.querySelector('input[type="tel"]');
    if (phoneField.value && !isValidPhone(phoneField.value)) {
        isValid = false;
        phoneField.classList.add('error');
        showFieldError(phoneField, 'Please enter a valid phone number');
    }
    
    return isValid;
}

// Validate individual field
function validateField(field) {
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        errorMessage = 'This field is required';
    } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
    } else if (field.type === 'tel' && field.value && !isValidPhone(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
    }
    
    if (!isValid) {
        field.classList.add('error');
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

// Helper Functions
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPhone(phone) {
    const re = /^[\d\s\+\-\(\)]{10,}$/;
    return re.test(phone);
}

function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Chat Widget
function initChatWidget() {
    const chatWidget = document.getElementById('chatWidget');
    const chatClose = chatWidget?.querySelector('.chat-close');
    const chatOptions = chatWidget?.querySelectorAll('.chat-option');
    
    if (chatWidget && chatClose) {
        // Close chat widget
        chatClose.addEventListener('click', () => {
            chatWidget.classList.remove('active');
            // Reopen after 5 minutes
            setTimeout(() => {
                chatWidget.classList.add('active');
            }, 300000); // 5 minutes
        });
        
        // Handle chat options
        chatOptions?.forEach(option => {
            option.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                
                switch(action) {
                    case 'appointment':
                        window.location.href = 'appointment.html';
                        break;
                    case 'emergency':
                        window.location.href = 'tel:+254758721997';
                        break;
                    case 'location':
                        window.open('https://maps.google.com/?q=Kisii+Teaching+Referral+Hospital', '_blank');
                        break;
                }
                
                // Close chat after action
                chatWidget.classList.remove('active');
            });
        });
        
        // Auto-show chat widget after 10 seconds
        setTimeout(() => {
            chatWidget.classList.add('active');
        }, 10000);
        
        // Hide chat widget when scrolling down
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 500) {
                // Scrolling down, hide chat
                chatWidget.classList.remove('active');
            }
            lastScrollTop = scrollTop;
        });
    }
}

// Update Copyright Year
function initCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .doctor-card, .contact-card, .stat-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Add staggered animation delay
                const index = Array.from(animatedElements).indexOf(entry.target);
                entry.target.style.animationDelay = `${index * 0.1}s`;
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Gallery Lightbox
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (galleryItems.length > 0) {
        // Create lightbox container
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close"><i class="fas fa-times"></i></button>
                <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
                <img src="" alt="">
                <div class="lightbox-caption"></div>
            </div>
        `;
        document.body.appendChild(lightbox);
        
        // Add lightbox styles
        const style = document.createElement('style');
        style.textContent = `
            .lightbox {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .lightbox.active {
                display: flex;
                opacity: 1;
            }
            
            .lightbox-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
                animation: scaleIn 0.3s ease;
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            .lightbox-content img {
                max-width: 100%;
                max-height: 80vh;
                border-radius: 8px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            }
            
            .lightbox-close {
                position: absolute;
                top: -40px;
                right: 0;
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 5px;
                transition: transform 0.3s ease;
            }
            
            .lightbox-close:hover {
                transform: rotate(90deg);
            }
            
            .lightbox-prev,
            .lightbox-next {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }
            
            .lightbox-prev:hover,
            .lightbox-next:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .lightbox-prev {
                left: -60px;
            }
            
            .lightbox-next {
                right: -60px;
            }
            
            .lightbox-caption {
                color: white;
                text-align: center;
                margin-top: 15px;
                font-size: 18px;
                font-family: var(--font-heading);
            }
            
            @media (max-width: 768px) {
                .lightbox-prev {
                    left: 10px;
                }
                
                .lightbox-next {
                    right: 10px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Handle gallery items click
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const imgSrc = item.querySelector('img').src;
                const caption = item.querySelector('h3') ? 
                               item.querySelector('h3').textContent : 
                               item.querySelector('img').alt;
                
                lightbox.querySelector('img').src = imgSrc;
                lightbox.querySelector('.lightbox-caption').textContent = caption;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Store current index
                lightbox.dataset.currentIndex = index;
            });
        });
        
        // Lightbox controls
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        const lightboxPrev = lightbox.querySelector('.lightbox-prev');
        const lightboxNext = lightbox.querySelector('.lightbox-next');
        
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        lightboxPrev.addEventListener('click', () => {
            const currentIndex = parseInt(lightbox.dataset.currentIndex);
            const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
            
            const imgSrc = galleryItems[prevIndex].querySelector('img').src;
            const caption = galleryItems[prevIndex].querySelector('h3') ? 
                           galleryItems[prevIndex].querySelector('h3').textContent : 
                           galleryItems[prevIndex].querySelector('img').alt;
            
            lightbox.querySelector('img').src = imgSrc;
            lightbox.querySelector('.lightbox-caption').textContent = caption;
            lightbox.dataset.currentIndex = prevIndex;
        });
        
        lightboxNext.addEventListener('click', () => {
            const currentIndex = parseInt(lightbox.dataset.currentIndex);
            const nextIndex = (currentIndex + 1) % galleryItems.length;
            
            const imgSrc = galleryItems[nextIndex].querySelector('img').src;
            const caption = galleryItems[nextIndex].querySelector('h3') ? 
                           galleryItems[nextIndex].querySelector('h3').textContent : 
                           galleryItems[nextIndex].querySelector('img').alt;
            
            lightbox.querySelector('img').src = imgSrc;
            lightbox.querySelector('.lightbox-caption').textContent = caption;
            lightbox.dataset.currentIndex = nextIndex;
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('active')) {
                if (e.key === 'Escape') {
                    lightboxClose.click();
                } else if (e.key === 'ArrowLeft') {
                    lightboxPrev.click();
                } else if (e.key === 'ArrowRight') {
                    lightboxNext.click();
                }
            }
        });
    }
}

// Simulate API Call
async function simulateAPICall(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve({ success: true, message: 'Message sent successfully' });
            } else {
                reject(new Error('Network error'));
            }
        }, 1500);
    });
}

// Notification System
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => {
        n.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => n.remove(), 300);
    });
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
                min-width: 300px;
            }
            
            .notification.success {
                background: #28a745;
                color: white;
            }
            
            .notification.error {
                background: #dc3545;
                color: white;
            }
            
            .notification.info {
                background: var(--primary);
                color: white;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                font-size: 14px;
                opacity: 0.7;
                transition: opacity 0.2s ease;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
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
            
            @media (max-width: 576px) {
                .notification {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Active Navigation on Scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const headerHeight = document.getElementById('header').offsetHeight;
        
        if (window.scrollY >= (sectionTop - headerHeight - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Set minimum date for appointment forms
window.addEventListener('load', () => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    dateInputs.forEach(input => {
        input.min = today;
    });
});

// Lazy Loading Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Load background images
                if (img.hasAttribute('data-bg')) {
                    img.style.backgroundImage = `url('${img.getAttribute('data-bg')}')`;
                    img.classList.add('loaded');
                }
                
                // Load regular images
                if (img.hasAttribute('data-src')) {
                    img.src = img.getAttribute('data-src');
                    img.classList.add('loaded');
                }
                
                imageObserver.unobserve(img);
            }
        });
    });
    
    // Observe lazy-loaded images
    document.querySelectorAll('img[loading="lazy"], .lazy-bg').forEach(img => {
        imageObserver.observe(img);
    });
}

// Performance monitoring
window.addEventListener('load', () => {
    // Log performance metrics
    if ('performance' in window) {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        console.log(`Page loaded in ${loadTime}ms`);
        
        // Show performance warning if load time is too long
        if (loadTime > 3000) {
            console.warn('Page load time is high. Consider optimizing assets.');
        }
    }
});

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator) {
  // Check if the service worker file exists
  fetch('/sw.js')
    .then(response => {
      if (response.ok) {
        return navigator.serviceWorker.register('/sw.js');
      } else {
        throw new Error('Service worker file not found');
      }
    })
    .then(registration => {
      console.log('ServiceWorker registered:', registration);
    })
    .catch(error => {
      console.log('ServiceWorker registration skipped:', error.message);
    });
}

// Offline detection
window.addEventListener('online', () => {
    showNotification('You are back online!', 'info');
});

window.addEventListener('offline', () => {
    showNotification('You are offline. Some features may not work.', 'error');
});

// Initialize YouTube API if needed
function loadYouTubeAPI() {
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}

// Load YouTube API on page load
loadYouTubeAPI();
// ===========================================
// CONTACT US PAGE FUNCTIONS ONLY
// Add these functions to the END of your js/script.js file
// ===========================================

// Contact Page Form Handler
function initContactPageForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    // Form validation
    function validateContactForm() {
        let isValid = true;
        const requiredFields = contactForm.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            const value = field.value.trim();
            
            if (!value) {
                showFieldError(field, 'This field is required');
                isValid = false;
            } else if (field.type === 'email' && !isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            } else if (field.type === 'tel' && !isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                isValid = false;
            } else {
                clearFieldError(field);
            }
        });
        
        return isValid;
    }
    
    // Email validation
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Phone validation
    function isValidPhone(phone) {
        const re = /^[\d\s\+\-\(\)]{10,}$/;
        return re.test(phone);
    }
    
    // Show field error
    function showFieldError(field, message) {
        clearFieldError(field);
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
        
        field.parentNode.appendChild(errorDiv);
    }
    
    // Clear field error
    function clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
    
    // Individual field validation
    function validateField(field) {
        const value = field.value.trim();
        
        if (field.hasAttribute('required') && !value) {
            showFieldError(field, 'This field is required');
            return false;
        }
        
        if (field.type === 'email' && value && !isValidEmail(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        if (field.type === 'tel' && value && !isValidPhone(value)) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
        
        clearFieldError(field);
        return true;
    }
    
    // Form submission
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateContactForm()) {
            if (typeof showNotification === 'function') {
                showNotification('Please fill in all required fields correctly.', 'error');
            } else {
                alert('Please fill in all required fields correctly.');
            }
            return;
        }
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            department: document.getElementById('department').value,
            message: document.getElementById('message').value.trim()
        };
        
        // Submit button state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call (replace with your actual API endpoint)
            await simulateFormSubmission(formData);
            
            // Success message
            if (typeof showNotification === 'function') {
                showNotification(`Thank you ${formData.name}! Your message has been sent successfully. We'll contact you soon.`, 'success');
            } else {
                alert(`Thank you ${formData.name}! Your message has been sent successfully. We'll contact you soon.`);
            }
            
            // Reset form
            contactForm.reset();
            
        } catch (error) {
            // Error message
            if (typeof showNotification === 'function') {
                showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
            } else {
                alert('Sorry, there was an error sending your message. Please try again.');
            }
            console.error('Form submission error:', error);
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
    
    // Simulate form submission
    async function simulateFormSubmission(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() < 0.9) {
                    // Log to console for development
                    console.log('Contact form submitted:', data);
                    resolve({ success: true, message: 'Message sent successfully' });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }
}

// Initialize contact page form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on contact page by looking for contact form
    if (document.getElementById('contactForm')) {
        initContactPageForm();
    }
});

// ===========================================
// CAREERS PAGE FUNCTIONS ONLY
// Add these functions to the END of your js/script.js file
// ===========================================

// Careers Page Functions
function initCareersPage() {
    // Check if we're on careers page
    if (!document.getElementById('applicationModal')) return;
    
    // Job Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const jobCards = document.querySelectorAll('.job-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            
            // Filter job cards
            jobCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Application Modal
    const applyBtns = document.querySelectorAll('.btn-apply');
    const applicationModal = document.getElementById('applicationModal');
    const modalClose = document.getElementById('modalClose');
    const modalJobTitle = document.getElementById('modalJobTitle');
    const selectedJobInput = document.getElementById('selectedJob');
    
    applyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const jobTitle = this.dataset.job;
            modalJobTitle.textContent = `Apply for: ${jobTitle}`;
            selectedJobInput.value = jobTitle;
            
            // Show modal
            applicationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal
    modalClose.addEventListener('click', () => {
        applicationModal.style.display = 'none';
        document.body.style.overflow = '';
    });
    
    // Close modal when clicking outside
    applicationModal.addEventListener('click', (e) => {
        if (e.target === applicationModal) {
            applicationModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
    
    // Job Application Form
    const jobApplicationForm = document.getElementById('jobApplicationForm');
    if (jobApplicationForm) {
        jobApplicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateJobApplication()) {
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Get form data
            const formData = {
                jobTitle: selectedJobInput.value,
                name: document.getElementById('modalName').value.trim(),
                email: document.getElementById('modalEmail').value.trim(),
                phone: document.getElementById('modalPhone').value.trim(),
                qualification: document.getElementById('modalQualification').value.trim(),
                coverLetter: document.getElementById('modalCoverLetter').value.trim(),
                cv: document.getElementById('modalCV').files[0]?.name || 'No file',
                certificates: document.getElementById('modalCertificates').files[0]?.name || 'No file',
                timestamp: new Date().toISOString()
            };
            
            // Submit button state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            try {
                // Simulate API call
                await simulateJobApplication(formData);
                
                // Success
                showNotification(`Thank you! Your application for ${formData.jobTitle} has been submitted.`, 'success');
                
                // Reset form
                jobApplicationForm.reset();
                
                // Close modal
                applicationModal.style.display = 'none';
                document.body.style.overflow = '';
                
            } catch (error) {
                // Error
                showNotification('Sorry, there was an error submitting your application. Please try again.', 'error');
                console.error('Application error:', error);
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // General Application Form
    const generalAppForm = document.getElementById('generalApplicationForm');
    if (generalAppForm) {
        generalAppForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateGeneralApplication()) {
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // Get form data
            const formData = {
                name: document.getElementById('appName').value.trim(),
                email: document.getElementById('appEmail').value.trim(),
                phone: document.getElementById('appPhone').value.trim(),
                category: document.getElementById('appCategory').value,
                position: document.getElementById('appPosition').value.trim(),
                experience: document.getElementById('appExperience').value.trim(),
                cv: document.getElementById('appCV').files[0]?.name || 'No file',
                timestamp: new Date().toISOString()
            };
            
            // Submit button state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            try {
                // Simulate API call
                await simulateGeneralApplication(formData);
                
                // Success
                showNotification('Thank you! Your general application has been submitted. We will contact you if a matching position becomes available.', 'success');
                
                // Reset form
                generalAppForm.reset();
                
            } catch (error) {
                // Error
                showNotification('Sorry, there was an error submitting your application. Please try again.', 'error');
                console.error('General application error:', error);
            } finally {
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Form Validation Functions
    function validateJobApplication() {
        const requiredFields = jobApplicationForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            const value = field.value.trim();
            
            if (!value) {
                showFieldError(field, 'This field is required');
                isValid = false;
            } else if (field.type === 'email' && !isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            } else if (field.type === 'tel' && !isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                isValid = false;
            } else {
                clearFieldError(field);
            }
        });
        
        // Validate file size (max 5MB)
        const cvInput = document.getElementById('modalCV');
        if (cvInput.files.length > 0) {
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
        const requiredFields = generalAppForm.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            const value = field.value.trim();
            
            if (!value) {
                showFieldError(field, 'This field is required');
                isValid = false;
            } else if (field.type === 'email' && !isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            } else if (field.type === 'tel' && !isValidPhone(value)) {
                showFieldError(field, 'Please enter a valid phone number');
                isValid = false;
            } else {
                clearFieldError(field);
            }
        });
        
        // Validate file size (max 5MB)
        const cvInput = document.getElementById('appCV');
        if (cvInput.files.length > 0) {
            const fileSize = cvInput.files[0].size;
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (fileSize > maxSize) {
                showNotification('CV file size must be less than 5MB.', 'error');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // Helper functions (reuse from contact page if available)
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
    
    // Simulate API calls
    async function simulateJobApplication(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.9) {
                    console.log('Job application submitted:', data);
                    resolve({ success: true });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }
    
    async function simulateGeneralApplication(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() < 0.9) {
                    console.log('General application submitted:', data);
                    resolve({ success: true });
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }
    
    // Update chat widget options for careers page
    const chatOptions = document.querySelectorAll('.chat-option');
    chatOptions.forEach(option => {
        option.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            switch(action) {
                case 'careers':
                    window.scrollTo({
                        top: document.querySelector('.careers-why-us').offsetTop - 100,
                        behavior: 'smooth'
                    });
                    break;
                case 'application':
                    document.getElementById('applicationModal').style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                    break;
                case 'contact':
                    window.location.href = 'mailto:careers@ktrh.or.ke';
                    break;
            }
            
            // Close chat
            document.getElementById('chatWidget').classList.remove('active');
        });
    });
}

// Initialize careers page functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add this line to your existing initialization
    if (document.getElementById('applicationModal')) initCareersPage();
});

// ===========================================
// ABOUT PAGE FUNCTIONS ONLY
// Add these functions to the END of your js/script.js file
// ===========================================

// About Page Functions
function initAboutPage() {
    // Check if we're on about page
    if (!document.querySelector('.history-timeline')) return;
    
    // Animate statistics counters
    const statNumbers = document.querySelectorAll('.stat-item h3');
    
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stat = entry.target;
                    const target = parseInt(stat.textContent.replace('+', '')) || 0;
                    const hasPlus = stat.textContent.includes('+');
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;
                    
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            stat.textContent = target.toLocaleString() + (hasPlus ? '+' : '');
                            clearInterval(timer);
                            stat.classList.add('animated');
                        } else {
                            stat.textContent = Math.floor(current).toLocaleString();
                        }
                    }, 16);
                    
                    observer.unobserve(stat);
                }
            });
        }, { 
            threshold: 0.5,
            rootMargin: '50px'
        });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
    
    // Timeline animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                timelineObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.3,
        rootMargin: '50px'
    });
    
    timelineItems.forEach(item => timelineObserver.observe(item));
    
    // Team member hover effect enhancement
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', () => {
            const image = member.querySelector('.member-image img');
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        });
        
        member.addEventListener('mouseleave', () => {
            const image = member.querySelector('.member-image img');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
    });
    
    // Facilities animation
    const facilityCards = document.querySelectorAll('.facility-card');
    
    const facilityObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 100);
                facilityObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.2,
        rootMargin: '50px'
    });
    
    facilityCards.forEach(card => facilityObserver.observe(card));
    
    // Partners logo animation
    const partnerLogos = document.querySelectorAll('.partner-logo');
    
    const partnerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 150);
                partnerObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.2,
        rootMargin: '50px'
    });
    
    partnerLogos.forEach(logo => partnerObserver.observe(logo));
    
    // Update chat widget options for about page
    const chatOptions = document.querySelectorAll('.chat-option');
    chatOptions.forEach(option => {
        option.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            switch(action) {
                case 'appointment':
                    window.location.href = 'appointment.html';
                    break;
                case 'directions':
                    window.open('https://maps.google.com/?q=Kisii+Teaching+Referral+Hospital', '_blank');
                    break;
                case 'emergency':
                    window.location.href = 'tel:+254758721997';
                    break;
            }
            
            // Close chat
            document.getElementById('chatWidget').classList.remove('active');
        });
    });
    
    // Add some CSS animations for about page elements
    const style = document.createElement('style');
    style.textContent = `
        .timeline-item.animated .timeline-content {
            animation: fadeInUp 0.6s ease-out;
        }
        
        .team-member.animated {
            animation: fadeIn 0.6s ease-out;
        }
        
        .facility-card.animated {
            animation: fadeInUp 0.5s ease-out;
        }
        
        .partner-logo.animated {
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize about page functions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add this line to your existing initialization
    if (document.querySelector('.history-timeline')) initAboutPage();
});
// Carousel functionality
// Continuous scrolling carousel
document.addEventListener('DOMContentLoaded', function() {
    const carouselContainer = document.querySelector('.auto-carousel-container');
    if (!carouselContainer) return;
    
    const track = document.querySelector('.auto-carousel-track');
    const logos = document.querySelectorAll('.partner-logo');
    
    if (logos.length === 0) return;
    
    // Clone all logos for seamless infinite scroll
    logos.forEach(logo => {
        const clone = logo.cloneNode(true);
        track.appendChild(clone);
    });
    
    // Optional: Pause on hover
    carouselContainer.addEventListener('mouseenter', function() {
        track.style.animationPlayState = 'paused';
    });
    
    carouselContainer.addEventListener('mouseleave', function() {
        track.style.animationPlayState = 'running';
    });
    
    // Optional: Touch swipe support for mobile
    let startX = 0;
    let scrollLeft = 0;
    
    carouselContainer.addEventListener('touchstart', function(e) {
        startX = e.touches[0].pageX - carouselContainer.offsetLeft;
        scrollLeft = track.scrollLeft;
        track.style.animationPlayState = 'paused';
    });
    
    carouselContainer.addEventListener('touchmove', function(e) {
        if (!startX) return;
        const x = e.touches[0].pageX - carouselContainer.offsetLeft;
        const walk = (x - startX) * 2;
        track.style.transform = `translateX(${walk}px)`;
    });
    
    carouselContainer.addEventListener('touchend', function() {
        startX = 0;
        setTimeout(() => {
            track.style.animationPlayState = 'running';
        }, 2000); // Resume after 2 seconds
    });
});