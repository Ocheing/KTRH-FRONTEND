// ===========================================
// GALLERY PAGE - STRAPI INTEGRATION
// ===========================================

// Strapi API Configuration
const STRAPI_API_URL = 'http://127.0.0.1:1337/api';
const STRAPI_IMAGE_URL = 'http://127.0.0.1:1337';

// DOM Elements
let galleryGrid;
let categoryBtns;
let mediaSearch;
let loadMoreBtn;
let imageModal;
let videoModal;
let currentMediaIndex = 0;
let allMediaItems = [];
let displayedItems = [];
let page = 1;
const itemsPerPage = 12;

// Global State
let currentCategory = 'all';
let currentSearchTerm = '';

// Helper function to get image URL from ANY Strapi media format
function getStrapiImageUrl(mediaData) {
    if (!mediaData) return null;
    
    // If mediaData is already a URL string
    if (typeof mediaData === 'string') {
        return mediaData.startsWith('http') ? mediaData : `${STRAPI_IMAGE_URL}${mediaData}`;
    }
    
    // Check for nested formats in the exact order from your console log
    console.log('DEBUG - Media data structure to parse:', JSON.stringify(mediaData, null, 2));
    
    // Try all possible Strapi formats
    const possiblePaths = [
        // Format 1: Direct in mediaData array
        () => mediaData[0]?.url ? `${STRAPI_IMAGE_URL}${mediaData[0].url}` : null,
        // Format 2: Direct in mediaData object
        () => mediaData.url ? `${STRAPI_IMAGE_URL}${mediaData.url}` : null,
        // Format 3: data.attributes.url (Strapi v4)
        () => mediaData.data?.attributes?.url ? `${STRAPI_IMAGE_URL}${mediaData.data.attributes.url}` : null,
        // Format 4: data.url (alternative Strapi v4)
        () => mediaData.data?.url ? `${STRAPI_IMAGE_URL}${mediaData.data.url}` : null,
        // Format 5: attributes.url (direct)
        () => mediaData.attributes?.url ? `${STRAPI_IMAGE_URL}${mediaData.attributes.url}` : null,
        // Format 6: With formats
        () => {
            if (mediaData.data?.attributes?.formats) {
                const formats = mediaData.data.attributes.formats;
                const formatOrder = ['large', 'medium', 'small', 'thumbnail'];
                for (const format of formatOrder) {
                    if (formats[format]?.url) {
                        return `${STRAPI_IMAGE_URL}${formats[format].url}`;
                    }
                }
            }
            return null;
        },
        // Format 7: Direct formats in mediaData
        () => {
            if (mediaData.formats) {
                const formatOrder = ['large', 'medium', 'small', 'thumbnail'];
                for (const format of formatOrder) {
                    if (mediaData.formats[format]?.url) {
                        return `${STRAPI_IMAGE_URL}${mediaData.formats[format].url}`;
                    }
                }
            }
            return null;
        }
    ];
    
    for (const getUrl of possiblePaths) {
        const url = getUrl();
        if (url) {
            console.log('DEBUG - Found image URL:', url);
            return url;
        }
    }
    
    console.log('DEBUG - No image URL found in media data');
    return null;
}

// Function to fetch gallery items from Strapi
async function fetchGalleryItems(page = 1, category = 'all', search = '') {
    try {
        console.log('Fetching gallery items from Strapi...');
        
        // Build query string manually to avoid URL encoding issues
        let queryParams = [];
        
        // Populate all relations
        queryParams.push('populate=*');
        
        // Sort by date
        queryParams.push('sort[0]=date:desc');
        
        // Pagination
        queryParams.push(`pagination[page]=${page}`);
        queryParams.push(`pagination[pageSize]=${itemsPerPage}`);
        
        // Category filter
        if (category !== 'all') {
            queryParams.push(`filters[category][$eq]=${category}`);
        }
        
        // Search filter
        if (search && search.trim() !== '') {
            queryParams.push(`filters[$or][0][title][$containsi]=${encodeURIComponent(search)}`);
            queryParams.push(`filters[$or][1][description][$containsi]=${encodeURIComponent(search)}`);
        }
        
        // Build URL with proper format
        const url = `${STRAPI_API_URL}/gallery-items?${queryParams.join('&')}`;
        
        console.log('Fetching URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Debug: Log the full response
        console.log('Full API Response:', data);
        
        // Handle different response structures
        if (data.data && Array.isArray(data.data)) {
            console.log(`Fetched ${data.data.length} gallery items from API`);
            
            // Check if items have attributes or if data is direct
            const items = data.data.map(item => {
                // If item has attributes, return as is (Strapi v4)
                if (item.attributes) {
                    return item;
                } 
                // If item is already the data (maybe older Strapi version)
                else {
                    return { id: item.id || item._id || Math.random(), attributes: item };
                }
            });
            
            return {
                items: items,
                pagination: data.meta?.pagination || { 
                    page: page, 
                    pageSize: itemsPerPage, 
                    pageCount: 1, 
                    total: data.data.length 
                }
            };
        } else if (Array.isArray(data)) {
            console.log(`Fetched ${data.length} gallery items from API`);
            return {
                items: data.map(item => ({ 
                    id: item.id || item._id || Math.random(), 
                    attributes: item 
                })),
                pagination: { 
                    page: page, 
                    pageSize: itemsPerPage, 
                    pageCount: 1, 
                    total: data.length 
                }
            };
        } else {
            console.error('Unexpected API response structure:', data);
            return { 
                items: [], 
                pagination: { 
                    page: page, 
                    pageSize: itemsPerPage, 
                    pageCount: 1, 
                    total: 0 
                } 
            };
        }
    } catch (error) {
        console.error('Error fetching gallery items:', error);
        return { 
            items: [], 
            pagination: { 
                page: page, 
                pageSize: itemsPerPage, 
                pageCount: 1, 
                total: 0 
            } 
        };
    }
}

// Function to fetch featured videos
async function fetchFeaturedVideos() {
    try {
        const url = `${STRAPI_API_URL}/gallery-items?populate=*&filters[category][$eq]=videos&sort[0]=date:desc&pagination[pageSize]=3`;
        
        console.log('Fetching featured videos from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('Featured videos API Error:', response.status);
            return [];
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
            return data.data.map(item => ({
                id: item.id,
                attributes: item.attributes || item
            }));
        } else if (Array.isArray(data)) {
            return data.map(item => ({
                id: item.id || item._id || Math.random(),
                attributes: item
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching featured videos:', error);
        return [];
    }
}

// Helper function to get item data
function getItemData(item) {
    if (!item) return {};
    
    // If item has attributes, use them
    if (item.attributes) {
        return item.attributes;
    }
    
    // If item is already the data
    return item;
}

// Function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    if (!url) return '';
    
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}

// Function to get video thumbnail URL
function getVideoThumbnail(videoUrl) {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return '';
}

// Function to format date
function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

// Function to get time ago
function getTimeAgo(dateString) {
    if (!dateString) return 'Recently';
    
    try {
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
    } catch (e) {
        return 'Recently';
    }
}

// Function to render gallery item
function renderGalleryItem(item) {
    if (!item) {
        return '<div class="gallery-item error">Error: Item data missing</div>';
    }
    
    const attrs = getItemData(item);
    const itemId = item.id || 'temp-' + Math.random().toString(36).substr(2, 9);
    
    const title = attrs.title || 'Gallery Item';
    const category = attrs.category || 'events';
    const mediaType = attrs.mediaType || 'image';
    const description = attrs.description || '';
    const date = attrs.date ? formatDate(attrs.date) : 'Not specified';
    const shortDescription = description.length > 100 
        ? description.substring(0, 100) + '...' 
        : description;
    const timeAgo = attrs.date ? getTimeAgo(attrs.date) : 'Recently';
    
    // Get image URLs
    let imageUrl = getStrapiImageUrl(attrs.image);
    let thumbnailUrl = getStrapiImageUrl(attrs.thumbnail);
    
    console.log(`Item ${itemId} - Image extraction:`, {
        hasImageData: !!attrs.image,
        imageUrl: imageUrl,
        hasThumbnailData: !!attrs.thumbnail,
        thumbnailUrl: thumbnailUrl
    });
    
    // For videos, get thumbnail from YouTube
    if (mediaType === 'video' && attrs.videoUrl && !imageUrl && !thumbnailUrl) {
        thumbnailUrl = getVideoThumbnail(attrs.videoUrl);
    }
    
    // Default placeholder if no image
    if (!imageUrl && !thumbnailUrl) {
        console.log(`No image found for item ${itemId}, using placeholder`);
        const placeholders = {
            events: 'https://images.unsplash.com/photo-1516549655669-df6654e435de?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70',
            facilities: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70',
            team: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70',
            achievements: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70',
            community: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70',
            videos: 'https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70'
        };
        imageUrl = placeholders[category] || placeholders.events;
    }
    
    const categoryMap = {
        'events': 'Events',
        'facilities': 'Facilities',
        'team': 'Team Activities',
        'achievements': 'Achievements',
        'community': 'Community',
        'videos': 'Videos'
    };
    
    const categoryDisplay = categoryMap[category] || 'Events';
    const displayImage = thumbnailUrl || imageUrl;
    
    return `
        <div class="gallery-item ${category}" data-id="${itemId}" data-title="${title}">
            <div class="gallery-image ${mediaType === 'video' ? 'video-item' : ''}">
                <img src="${displayImage}" alt="${title}" loading="lazy" 
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1516549655669-df6654e435de?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70';">
                ${mediaType === 'video' ? '<div class="video-play"><i class="fas fa-play"></i></div>' : ''}
                <div class="gallery-overlay">
                    <div class="overlay-content">
                        <span class="item-category">${categoryDisplay}</span>
                        <h3>${title}</h3>
                        <p>${shortDescription}</p>
                        <div class="item-date">
                            <i class="far fa-calendar"></i> ${timeAgo}
                        </div>
                    </div>
                </div>
            </div>
            <div class="gallery-actions">
                <button class="action-btn view-btn" data-id="${itemId}">
                    <i class="fas fa-${mediaType === 'video' ? 'play' : 'expand'}"></i> ${mediaType === 'video' ? 'Play' : 'View'}
                </button>
                <button class="action-btn share-btn" data-id="${itemId}">
                    <i class="fas fa-share-alt"></i> Share
                </button>
            </div>
        </div>
    `;
}

// Function to render featured video card
function renderFeaturedVideo(video) {
    if (!video) return '';
    
    const attrs = getItemData(video);
    const title = attrs.title || 'Video';
    const description = attrs.description || '';
    const date = attrs.date ? getTimeAgo(attrs.date) : 'Recently';
    const videoUrl = attrs.videoUrl || '';
    const views = attrs.views || 0;
    
    let thumbnailUrl = getStrapiImageUrl(attrs.thumbnail) || getStrapiImageUrl(attrs.image);
    
    if (!thumbnailUrl && videoUrl) {
        thumbnailUrl = getVideoThumbnail(videoUrl);
    }
    
    if (!thumbnailUrl) {
        thumbnailUrl = 'https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70';
    }
    
    const duration = "15:30";
    
    return `
        <div class="video-card" data-video-id="${video.id}">
            <div class="video-thumbnail">
                <img src="${thumbnailUrl}" alt="${title}" loading="lazy"
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70';">
                <div class="play-btn">
                    <i class="fas fa-play"></i>
                </div>
                <div class="video-duration">${duration}</div>
            </div>
            <div class="video-info">
                <h3>${title}</h3>
                <p>${description.length > 100 ? description.substring(0, 100) + '...' : description}</p>
                <div class="video-meta">
                    <span><i class="far fa-eye"></i> ${views.toLocaleString()} views</span>
                    <span><i class="far fa-calendar"></i> ${date}</span>
                </div>
            </div>
        </div>
    `;
}

// Function to render gallery grid
function renderGalleryGrid(items) {
    if (!galleryGrid) {
        console.error('Gallery grid container not found');
        return;
    }
    
    const loadingSpinner = document.querySelector('.gallery-loading');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    if (!Array.isArray(items) || items.length === 0) {
        const noItemsMessage = document.getElementById('noItemsMessage');
        if (noItemsMessage) {
            noItemsMessage.style.display = 'block';
        } else {
            galleryGrid.innerHTML = `
                <div class="no-items-message" id="noItemsMessage">
                    <i class="fas fa-images"></i>
                    <h3>No Media Items Found</h3>
                    <p>There are no gallery items available at the moment.</p>
                </div>
            `;
        }
        return;
    }
    
    const noItemsMessage = document.getElementById('noItemsMessage');
    if (noItemsMessage) {
        noItemsMessage.style.display = 'none';
    }
    
    galleryGrid.innerHTML = items.map(item => renderGalleryItem(item)).join('');
    attachGalleryItemListeners();
}

// Function to render featured videos
function renderFeaturedVideos(videos) {
    const videoGrid = document.querySelector('.video-grid');
    if (!videoGrid) return;
    
    if (!Array.isArray(videos) || videos.length === 0) {
        videoGrid.innerHTML = '<p class="no-videos">No featured videos available.</p>';
        return;
    }
    
    videoGrid.innerHTML = videos.map(video => renderFeaturedVideo(video)).join('');
    attachFeaturedVideoListeners();
}

// Function to filter items by category
async function filterItemsByCategory(category) {
    console.log('Filtering items by category:', category);
    
    currentCategory = category;
    page = 1;
    
    if (galleryGrid) {
        galleryGrid.innerHTML = `
            <div class="gallery-loading" style="text-align: center; padding: 50px; grid-column: 1 / -1;">
                <div class="loader" style="margin: 0 auto;"></div>
                <p style="margin-top: 20px; color: #666;">Loading gallery items...</p>
            </div>
        `;
    }
    
    const result = await fetchGalleryItems(page, category, currentSearchTerm);
    allMediaItems = result.items;
    displayedItems = allMediaItems;
    
    renderGalleryGrid(displayedItems);
    updateLoadMoreButton(result.pagination);
    
    console.log(`Displaying ${displayedItems.length} items in ${category} category`);
}

// Function to search items
async function searchItems(searchTerm) {
    console.log('Searching items:', searchTerm);
    
    currentSearchTerm = searchTerm;
    page = 1;
    
    const result = await fetchGalleryItems(page, currentCategory, searchTerm);
    allMediaItems = result.items;
    displayedItems = allMediaItems;
    
    renderGalleryGrid(displayedItems);
    updateLoadMoreButton(result.pagination);
}

// Function to load more items
async function loadMoreItems() {
    if (!loadMoreBtn) return;
    
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    const nextPage = page + 1;
    const result = await fetchGalleryItems(nextPage, currentCategory, currentSearchTerm);
    
    if (result.items.length > 0) {
        allMediaItems = [...allMediaItems, ...result.items];
        displayedItems = allMediaItems;
        
        renderGalleryGrid(displayedItems);
        page = nextPage;
        updateLoadMoreButton(result.pagination);
    }
    
    loadMoreBtn.disabled = false;
    loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Media';
}

// Function to update load more button
function updateLoadMoreButton(pagination) {
    if (!loadMoreBtn) return;
    
    if (!pagination || pagination.page >= pagination.pageCount) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Function to show image modal
function showImageModal(item) {
    const attrs = getItemData(item);
    const title = attrs.title || 'Gallery Item';
    const description = attrs.description || '';
    const date = attrs.date ? formatDate(attrs.date) : 'Not specified';
    const category = attrs.category || 'events';
    
    const categoryMap = {
        'events': 'Events',
        'facilities': 'Facilities',
        'team': 'Team Activities',
        'achievements': 'Achievements',
        'community': 'Community',
        'videos': 'Videos'
    };
    
    const categoryDisplay = categoryMap[category] || 'Events';
    let imageUrl = getStrapiImageUrl(attrs.image);
    
    if (!imageUrl) {
        const placeholders = {
            events: 'https://images.unsplash.com/photo-1516549655669-df6654e435de?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
            facilities: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
            team: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
            achievements: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
            community: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
            videos: 'https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
        };
        imageUrl = placeholders[category] || placeholders.events;
    }
    
    document.getElementById('modalImage').src = imageUrl;
    document.getElementById('modalImage').alt = title;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalDescription').textContent = description;
    document.getElementById('modalDate').textContent = date;
    document.getElementById('modalCategory').textContent = categoryDisplay;
    
    currentMediaIndex = allMediaItems.findIndex(i => i.id === item.id);
    updateNavigationButtons();
    
    imageModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Function to show video modal
function showVideoModal(item) {
    const attrs = getItemData(item);
    const title = attrs.title || 'Video';
    const description = attrs.description || '';
    const videoUrl = attrs.videoUrl || '';
    
    let embedUrl = '';
    const videoId = getYouTubeVideoId(videoUrl);
    
    if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } else if (videoUrl.includes('vimeo')) {
        const vimeoId = videoUrl.split('/').pop();
        embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    } else {
        showNotification('This video format is not supported.', 'error');
        return;
    }
    
    document.getElementById('videoTitle').textContent = title;
    document.getElementById('videoDescription').textContent = description;
    document.getElementById('videoFrame').src = embedUrl;
    
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Function to update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.disabled = currentMediaIndex === 0;
    if (nextBtn) nextBtn.disabled = currentMediaIndex === allMediaItems.length - 1;
}

// Function to navigate to previous item
function navigateToPrevious() {
    if (currentMediaIndex > 0) {
        currentMediaIndex--;
        const item = allMediaItems[currentMediaIndex];
        const attrs = getItemData(item);
        
        if (attrs.mediaType === 'video') {
            showVideoModal(item);
        } else {
            showImageModal(item);
        }
    }
}

// Function to navigate to next item
function navigateToNext() {
    if (currentMediaIndex < allMediaItems.length - 1) {
        currentMediaIndex++;
        const item = allMediaItems[currentMediaIndex];
        const attrs = getItemData(item);
        
        if (attrs.mediaType === 'video') {
            showVideoModal(item);
        } else {
            showImageModal(item);
        }
    }
}

// Function to share item
function shareItem(item) {
    const attrs = getItemData(item);
    const title = attrs.title || 'Gallery Item';
    const description = attrs.description || '';
    const url = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: description,
            url: url,
        })
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        const shareUrl = `${url}#gallery-item-${item.id}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => showNotification('Link copied to clipboard!', 'success'))
            .catch(() => {
                prompt('Copy this link to share:', shareUrl);
            });
    }
}

// Function to close modals
function closeModals() {
    if (imageModal) imageModal.style.display = 'none';
    
    if (videoModal) {
        const videoFrame = document.getElementById('videoFrame');
        if (videoFrame) videoFrame.src = '';
        videoModal.style.display = 'none';
    }
    
    document.body.style.overflow = 'auto';
}

// Function to attach gallery item listeners
function attachGalleryItemListeners() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const item = allMediaItems.find(i => i.id && i.id.toString() === itemId);
            
            if (item) {
                const attrs = getItemData(item);
                if (attrs.mediaType === 'video') {
                    showVideoModal(item);
                } else {
                    showImageModal(item);
                }
            }
        });
    });
    
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const item = allMediaItems.find(i => i.id && i.id.toString() === itemId);
            
            if (item) {
                shareItem(item);
            }
        });
    });
}

// Function to attach featured video listeners
function attachFeaturedVideoListeners() {
    document.querySelectorAll('.play-btn, .video-card').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.video-card');
            if (!card) return;
            
            const videoId = card.getAttribute('data-video-id');
            const item = allMediaItems.find(i => i.id && i.id.toString() === videoId);
            
            if (item) {
                showVideoModal(item);
            }
        });
    });
}

// Notification function
function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
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
    
    const duration = type === 'error' ? 7000 : 5000;
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Function to initialize gallery page
async function initializeGalleryPage() {
    console.log('Gallery page loaded, initializing...');
    
    galleryGrid = document.getElementById('galleryGrid');
    categoryBtns = document.querySelectorAll('.category-btn');
    mediaSearch = document.getElementById('mediaSearch');
    loadMoreBtn = document.getElementById('loadMore');
    imageModal = document.getElementById('imageModal');
    videoModal = document.getElementById('videoModal');
    
    if (galleryGrid && !document.querySelector('.gallery-loading')) {
        galleryGrid.innerHTML = `
            <div class="gallery-loading" style="text-align: center; padding: 50px; grid-column: 1 / -1;">
                <div class="loader" style="margin: 0 auto;"></div>
                <p style="margin-top: 20px; color: #666;">Loading gallery items...</p>
            </div>
        `;
    }
    
    console.log('Testing Strapi connection...');
    try {
        const testResponse = await fetch(`${STRAPI_API_URL}/gallery-items?populate=*&pagination[pageSize]=1`);
        console.log('Strapi test response status:', testResponse.status);
        if (!testResponse.ok) {
            showNotification('Cannot connect to Strapi server. Make sure Strapi is running on port 1337.', 'error');
        }
    } catch (error) {
        console.error('Strapi connection error:', error);
        showNotification('Cannot connect to Strapi server. Make sure Strapi is running on port 1337.', 'error');
    }
    
    console.log('Fetching gallery items from API...');
    const result = await fetchGalleryItems(page, currentCategory, currentSearchTerm);
    allMediaItems = result.items;
    displayedItems = allMediaItems;
    
    console.log('Total items fetched:', allMediaItems.length);
    
    if (allMediaItems.length === 0) {
        renderGalleryGrid([]);
    } else {
        renderGalleryGrid(displayedItems);
        updateLoadMoreButton(result.pagination);
    }
    
    const featuredVideos = await fetchFeaturedVideos();
    console.log('Featured videos fetched:', featuredVideos.length);
    renderFeaturedVideos(featuredVideos);
    
    if (categoryBtns) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filterItemsByCategory(category);
            });
        });
    }
    
    if (mediaSearch) {
        let searchTimeout;
        mediaSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchItems(this.value);
            }, 500);
        });
    }
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreItems);
    }
    
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    if (imageModal) {
        imageModal.addEventListener('click', function(e) {
            if (e.target === imageModal) closeModals();
        });
    }
    
    if (videoModal) {
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) closeModals();
        });
    }
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', navigateToPrevious);
    if (nextBtn) nextBtn.addEventListener('click', navigateToNext);
    
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    console.log('Gallery page initialization complete');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.gallery-section')) {
        initializeGalleryPage();
    }
});

// Add CSS animations for notifications
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Export functions for global access
window.closeModals = closeModals;
window.navigateToPrevious = navigateToPrevious;
window.navigateToNext = navigateToNext;