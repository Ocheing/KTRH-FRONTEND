// ===========================================
// ABOUT PAGE - MINIMAL VERSION
// ===========================================

// Function to initialize about page
function initializeAboutPage() {
    console.log('About page loaded successfully');
    
    // Initialize animations if function exists
    if (typeof initAboutPage === 'function') {
        initAboutPage();
    }
}

// Initialize when page loads
if (document.querySelector('.about-overview')) {
    document.addEventListener('DOMContentLoaded', initializeAboutPage);
}