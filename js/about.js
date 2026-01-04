// ===========================================
// ABOUT PAGE - STRAPI INTEGRATION - CORRECTED VERSION
// ===========================================

// Strapi API Configuration
const STRAPI_API_URL = 'https://better-friend-c539968cc5.strapiapp.com/api';
const STRAPI_IMAGE_URL = 'https://better-friend-c539968cc5.strapiapp.com';

// DOM Elements for About Page
let aboutHeroTitle;
let aboutHeroSubtitle;
let overviewTitle;
let overviewDescription;
let overviewImage;
let missionStatement;
let visionStatement;
let valuesList;
let statisticsGrid;
let leadershipGrid;

// Helper function to extract text from Rich Text or JSON
function extractTextFromRichText(richText) {
    if (!richText) return '';
    
    // If it's already a string, return it
    if (typeof richText === 'string') {
        return richText;
    }
    
    // If it's an object with a text property
    if (richText.text) {
        return richText.text;
    }
    
    // If it's an array (Strapi Rich Text format)
    if (Array.isArray(richText)) {
        let text = '';
        richText.forEach(block => {
            if (block.type === 'paragraph' && block.children) {
                block.children.forEach(child => {
                    if (child.text) {
                        text += child.text + ' ';
                    }
                });
            }
        });
        return text.trim();
    }
    
    // If it's an object, try to stringify it
    if (typeof richText === 'object') {
        console.warn('Rich text is an object:', richText);
        return JSON.stringify(richText); // For debugging
    }
    
    return '';
}

// Helper function to get attributes from Strapi response
function getAttributes(data) {
    if (!data) return null;
    
    // Handle Strapi v4 response structure
    if (data.attributes !== undefined) {
        return data.attributes;
    }
    
    // Handle Strapi v3 response structure or direct data
    return data;
}

// Function to fetch about page data from Strapi
async function fetchAboutPageData() {
    try {
        console.log('Fetching about page data from Strapi...');
        
        // Try multiple endpoint variations
        const endpoints = [
            `${STRAPI_API_URL}/about-page?populate=*`,
            `${STRAPI_API_URL}/statistics?filters[isActive][$eq]=true&sort[0]=order:asc`,
            // Try both singular and plural endpoints
            `${STRAPI_API_URL}/leaderships?populate=*&filters[isActive][$eq]=true&sort[0]=order:asc`,
            `${STRAPI_API_URL}/leadership?populate=*&filters[isActive][$eq]=true&sort[0]=order:asc`
        ];
        
        const [aboutResponse, statsResponse, leadershipResponse1, leadershipResponse2] = await Promise.all([
            fetch(endpoints[0]),
            fetch(endpoints[1]),
            fetch(endpoints[2]),
            fetch(endpoints[3])
        ]);
        
        // Handle about page
        if (!aboutResponse.ok) {
            console.error('About page API error:', aboutResponse.status);
            throw new Error(`About page: ${aboutResponse.status}`);
        }
        
        const aboutData = await aboutResponse.json();
        console.log('About page data:', aboutData);
        
        // Handle statistics
        let statsData = { data: [] };
        if (statsResponse.ok) {
            statsData = await statsResponse.json();
        } else {
            console.warn('Statistics endpoint failed:', statsResponse.status);
        }
        
        // Handle leadership - try first endpoint, then second
        let leadershipData = { data: [] };
        if (leadershipResponse1.ok) {
            leadershipData = await leadershipResponse1.json();
            console.log('Using leaderships endpoint');
        } else if (leadershipResponse2.ok) {
            leadershipData = await leadershipResponse2.json();
            console.log('Using leadership endpoint');
        } else {
            console.warn('Both leadership endpoints failed:', leadershipResponse1.status, leadershipResponse2.status);
        }
        
        console.log('Fetched data:', {
            about: aboutData.data ? 'Yes' : 'No',
            statsCount: statsData.data?.length || 0,
            leadershipCount: leadershipData.data?.length || 0
        });
        
        return {
            about: aboutData.data || aboutData,
            stats: statsData.data || [],
            leadership: leadershipData.data || []
        };
    } catch (error) {
        console.error('Error fetching about page data:', error);
        return null;
    }
}

// Function to update hero section
function updateHeroSection(aboutData) {
    if (!aboutData) return;
    
    const attributes = getAttributes(aboutData);
    if (!attributes) return;
    
    // Update hero title
    if (aboutHeroTitle && attributes.heroTitle) {
        aboutHeroTitle.textContent = attributes.heroTitle;
    }
    
    // Update hero subtitle
    if (aboutHeroSubtitle && attributes.heroSubtitle) {
        aboutHeroSubtitle.textContent = extractTextFromRichText(attributes.heroSubtitle);
    }
}

// Function to update overview section
function updateOverviewSection(aboutData) {
    if (!aboutData) return;
    
    const attributes = getAttributes(aboutData);
    if (!attributes) return;
    
    // Update overview title
    if (overviewTitle && attributes.overviewTitle) {
        overviewTitle.textContent = attributes.overviewTitle;
    }
    
    // Update overview description - FIXED: Use extractTextFromRichText
    if (overviewDescription && attributes.overviewDescription) {
        overviewDescription.textContent = extractTextFromRichText(attributes.overviewDescription);
    }
    
    // Update overview image
    if (overviewImage && attributes.overviewImage) {
        let imageUrl = '';
        
        // Handle different Strapi image structures
        if (attributes.overviewImage.data?.attributes?.url) {
            // v4 structure
            imageUrl = attributes.overviewImage.data.attributes.url;
        } else if (attributes.overviewImage.url) {
            // v3 structure
            imageUrl = attributes.overviewImage.url;
        } else if (typeof attributes.overviewImage === 'string') {
            // Direct string
            imageUrl = attributes.overviewImage;
        }
        
        if (imageUrl) {
            if (!imageUrl.startsWith('http')) {
                imageUrl = `${STRAPI_IMAGE_URL}${imageUrl}`;
            }
            overviewImage.src = imageUrl;
            overviewImage.alt = attributes.overviewTitle || 'KTRH Hospital';
        }
    }
}

// Function to update mission & vision
function updateMissionVision(aboutData) {
    if (!aboutData) return;
    
    const attributes = getAttributes(aboutData);
    if (!attributes) return;
    
    // Update mission statement
    if (missionStatement && attributes.missionStatement) {
        missionStatement.textContent = extractTextFromRichText(attributes.missionStatement);
    }
    
    // Update vision statement
    if (visionStatement && attributes.visionStatement) {
        visionStatement.textContent = extractTextFromRichText(attributes.visionStatement);
    }
    
    // Update values list
    if (valuesList && attributes.values) {
        try {
            let values = attributes.values;
            
            // Parse if it's a JSON string
            if (typeof values === 'string') {
                try {
                    values = JSON.parse(values);
                } catch (e) {
                    console.warn('Could not parse values as JSON:', e);
                    // If it's a string but not JSON, treat it as a simple string
                    valuesList.innerHTML = `<li>${values}</li>`;
                    return;
                }
            }
            
            // Handle array format
            if (Array.isArray(values)) {
                const valuesHTML = values.map(value => {
                    if (typeof value === 'string') {
                        return `<li>${value}</li>`;
                    } else if (value.name && value.description) {
                        return `<li><strong>${value.name}:</strong> ${value.description}</li>`;
                    } else if (value.name) {
                        return `<li><strong>${value.name}</strong></li>`;
                    }
                    return `<li>${JSON.stringify(value)}</li>`;
                }).join('');
                
                valuesList.innerHTML = valuesHTML;
            } else if (typeof values === 'object') {
                // If it's an object, display key-value pairs
                const valuesHTML = Object.entries(values)
                    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
                    .join('');
                valuesList.innerHTML = valuesHTML;
            }
        } catch (error) {
            console.error('Error parsing values:', error);
            valuesList.innerHTML = '<li>Values information available</li>';
        }
    }
}

// Function to render statistics
function renderStatistics(statsData) {
    if (!statisticsGrid) {
        console.error('Statistics grid element not found');
        return;
    }
    
    // Always show statistics - use defaults if API fails
    let statisticsToShow = [];
    
    if (Array.isArray(statsData) && statsData.length > 0) {
        statisticsToShow = statsData;
        console.log('Using API statistics:', statsData.length);
    } else {
        // Default statistics
        statisticsToShow = [
            { attributes: { title: '15+', label: 'Years of Service' } },
            { attributes: { title: '300+', label: 'Medical Staff' } },
            { attributes: { title: '50,000+', label: 'Patients Annually' } },
            { attributes: { title: '24/7', label: 'Emergency Services' } }
        ];
        console.log('Using default statistics');
    }
    
    const statsHTML = statisticsToShow.map(stat => {
        const attributes = getAttributes(stat) || stat;
        const title = attributes.title || '';
        const label = attributes.label || '';
        
        return `
            <div class="stat-item">
                <h3>${title}</h3>
                <p>${label}</p>
            </div>
        `;
    }).join('');
    
    statisticsGrid.innerHTML = statsHTML;
    console.log('Statistics rendered:', statisticsToShow.length);
}

// Function to render leadership team
function renderLeadershipTeam(leadershipData) {
    if (!leadershipGrid) {
        console.error('Leadership grid element not found');
        return;
    }
    
    // Always show leadership - use defaults if API fails
    let leadershipToShow = [];
    
    if (Array.isArray(leadershipData) && leadershipData.length > 0) {
        leadershipToShow = leadershipData;
        console.log('Using API leadership:', leadershipData.length);
    } else {
        // Default leadership team
        leadershipToShow = [
            {
                attributes: {
                    name: 'Dr. John Otieno',
                    position: 'Chief Executive Officer',
                    qualification: 'MD, MBA Healthcare Management',
                    experience: '15+ years in healthcare leadership'
                }
            },
            {
                attributes: {
                    name: 'Dr. Sarah Mwangi',
                    position: 'Medical Director',
                    qualification: 'MD, MPH',
                    experience: '12+ years in clinical leadership'
                }
            },
            {
                attributes: {
                    name: 'Mr. James Omondi',
                    position: 'Director of Nursing Services',
                    qualification: 'BSc Nursing, MBA',
                    experience: '18+ years in nursing management'
                }
            },
            {
                attributes: {
                    name: 'Dr. Grace Akinyi',
                    position: 'Head of Clinical Services',
                    qualification: 'MD, MMed Pediatrics',
                    experience: '10+ years in clinical administration'
                }
            }
        ];
        console.log('Using default leadership');
    }
    
    const leadershipHTML = leadershipToShow.map(member => {
        const attributes = getAttributes(member) || member;
        
        // Get image URL
        let imageUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
        
        if (attributes.image) {
            if (attributes.image.data?.attributes?.url) {
                const url = attributes.image.data.attributes.url;
                imageUrl = url.startsWith('http') ? url : `${STRAPI_IMAGE_URL}${url}`;
            } else if (attributes.image.url) {
                const url = attributes.image.url;
                imageUrl = url.startsWith('http') ? url : `${STRAPI_IMAGE_URL}${url}`;
            } else if (typeof attributes.image === 'string') {
                const url = attributes.image;
                imageUrl = url.startsWith('http') ? url : `${STRAPI_IMAGE_URL}${url}`;
            }
        }
        
        return `
            <div class="team-member">
                <div class="member-image">
                    <img src="${imageUrl}" alt="${attributes.name || 'Team Member'}">
                </div>
                <div class="member-info">
                    <h3>${attributes.name || ''}</h3>
                    <p class="position">${attributes.position || ''}</p>
                    <p class="qualification">${attributes.qualification || ''}</p>
                    <p class="experience">${attributes.experience || ''}</p>
                </div>
            </div>
        `;
    }).join('');
    
    leadershipGrid.innerHTML = leadershipHTML;
    console.log('Leadership team rendered:', leadershipToShow.length);
}

// Function to initialize about page with Strapi data
async function initializeAboutPage() {
    console.log('Initializing about page...');
    
    // Get DOM elements
    aboutHeroTitle = document.getElementById('aboutHeroTitle') || document.querySelector('.page-header h1');
    aboutHeroSubtitle = document.getElementById('aboutHeroSubtitle') || document.querySelector('.page-header p');
    overviewTitle = document.getElementById('overviewTitle') || document.querySelector('.about-overview h2');
    overviewDescription = document.getElementById('overviewDescription') || document.querySelector('.about-overview .highlight');
    overviewImage = document.getElementById('overviewImage') || document.querySelector('.overview-image img');
    missionStatement = document.getElementById('missionStatement') || document.querySelector('.mission-vision .mission p');
    visionStatement = document.getElementById('visionStatement') || document.querySelector('.mission-vision .vision p');
    valuesList = document.getElementById('valuesList') || document.querySelector('.mission-vision .values ul');
    statisticsGrid = document.getElementById('statisticsGrid') || document.querySelector('.stats-grid');
    leadershipGrid = document.getElementById('leadershipGrid') || document.querySelector('.team-grid');
    
    console.log('DOM elements loaded');
    
    try {
        // Fetch data from Strapi
        const pageData = await fetchAboutPageData();
        
        if (pageData) {
            console.log('Page data received, updating content...');
            
            // Update content from Strapi
            if (pageData.about) {
                updateHeroSection(pageData.about);
                updateOverviewSection(pageData.about);
                updateMissionVision(pageData.about);
            }
            
            // Always render statistics and leadership (with defaults if needed)
            renderStatistics(pageData.stats);
            renderLeadershipTeam(pageData.leadership);
            
            console.log('Content updated successfully');
        } else {
            console.log('No API data, using defaults');
            // Use default content
            renderStatistics([]);
            renderLeadershipTeam([]);
        }
    } catch (error) {
        console.error('Error initializing about page:', error);
        // Use default content on error
        renderStatistics([]);
        renderLeadershipTeam([]);
    }
    
    // Initialize animations if function exists
    if (typeof initAboutPage === 'function') {
        initAboutPage();
    }
}

// Initialize when page loads
if (document.querySelector('.about-overview')) {
    document.addEventListener('DOMContentLoaded', initializeAboutPage);
}

// Fallback: If page is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (document.querySelector('.about-overview')) {
        setTimeout(initializeAboutPage, 100);
    }
}
