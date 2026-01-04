// ===========================================
// GALLERY PAGE - STRAPI INTEGRATION
// ===========================================

// Strapi API Configuration
const STRAPI_API_URL = 'https://better-friend-c539968cc5.strapiapp.com/api';
const STRAPI_IMAGE_URL = 'https://better-friend-c539968cc5.strapiapp.com';

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

// Function to fetch gallery items from Strapi
async function fetchGalleryItems(page = 1, category = 'all', search = '') {
    try {
        console.log('Fetching gallery items from Strapi...');
        
        // Build query parameters
        let filters = [];
        
        // Filter by category if not 'all'
        if (category !== 'all') {
            filters.push(`filters[category][$eq]=${category}`);
        }
        
        // Filter by search term if provided
        if (search) {
            filters.push(`filters[$or][0][title][$containsi]=${search}`);
            filters.push(`filters[$or][1][description][$containsi]=${search}`);
        }
        
        // Filter by published items
        filters.push('filters[publishedAt][$lte]=now()');
        
        // Add pagination
        const pagination = `pagination[page]=${page}&pagination[pageSize]=${itemsPerPage}`;
        const sort = 'sort[0]=date:desc';
        
        // Build URL
        let query = `${STRAPI_API_URL}/gallery-items?populate=*&${sort}&${pagination}`;
        
        if (filters.length > 0) {
            query += `&${filters.join('&')}`;
        }
        
        console.log('Fetching URL:', query);
        
        const response = await fetch(query);
        
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle Strapi v4 response structure
        if (data.data && Array.isArray(data.data)) {
            console.log(`Fetched ${data.data.length} gallery items from API`);
            return {
                items: data.data,
                pagination: data.meta?.pagination || {}
            };
        } else if (Array.isArray(data)) {
            console.log(`Fetched ${data.length} gallery items from API`);
            return {
                items: data,
                pagination: { page, pageSize: itemsPerPage, total: data.length }
            };
        } else {
            console.error('Unexpected API response structure:', data);
            return { items: [], pagination: {} };
        }
    } catch (error) {
        console.error('Error fetching gallery items:', error);
        return { items: [], pagination: {} };
    }
}

// Function to fetch featured videos
async function fetchFeaturedVideos() {
    try {
        const response = await fetch(
            `${STRAPI_API_URL}/gallery-items?populate=*&filters[category][$eq]=videos&filters[isFeatured][$eq]=true&filters[publishedAt][$lte]=now()&sort[0]=date:desc&pagination[limit]=3`
        );
        
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
            return data.data;
        } else if (Array.isArray(data)) {
            return data;
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
    return item.attributes !== undefined ? item.attributes : item;
}

// Function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    if (!url) return '';
    
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : '';
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
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Function to get time ago
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

// Function to render gallery item
function renderGalleryItem(item) {
    if (!item) {
        return '<div class="gallery-item error">Error: Item data missing</div>';
    }
    
    const attrs = getItemData(item);
    const itemId = item.id || '';
    
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
    let imageUrl = '';
    let thumbnailUrl = '';
    
    if (attrs.image?.data?.attributes?.url) {
        imageUrl = `${STRAPI_IMAGE_URL}${attrs.image.data.attributes.url}`;
    } else if (attrs.thumbnail?.data?.attributes?.url) {
        thumbnailUrl = `${STRAPI_IMAGE_URL}${attrs.thumbnail.data.attributes.url}`;
    }
    
    // For videos, get thumbnail
    if (mediaType === 'video' && attrs.videoUrl) {
        if (!thumbnailUrl) {
            thumbnailUrl = getVideoThumbnail(attrs.videoUrl);
        }
    }
    
    // Default image if none available
    if (!imageUrl && !thumbnailUrl) {
        // Use placeholder based on category
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
    
    // Category mapping for display
    const categoryMap = {
        'events': 'Events',
        'facilities': 'Facilities',
        'team': 'Team Activities',
        'achievements': 'Achievements',
        'community': 'Community',
        'videos': 'Videos'
    };
    
    const categoryDisplay = categoryMap[category] || 'Events';
    
    return `
        <div class="gallery-item ${category}" data-id="${itemId}" data-title="${title}">
            <div class="gallery-image ${mediaType === 'video' ? 'video-item' : ''}">
                <img src="${thumbnailUrl || imageUrl}" alt="${title}" loading="lazy">
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
    
    // Get thumbnail
    let thumbnailUrl = '';
    if (attrs.thumbnail?.data?.attributes?.url) {
        thumbnailUrl = `${STRAPI_IMAGE_URL}${attrs.thumbnail.data.attributes.url}`;
    } else if (attrs.image?.data?.attributes?.url) {
        thumbnailUrl = `${STRAPI_IMAGE_URL}${attrs.image.data.attributes.url}`;
    } else if (videoUrl) {
        thumbnailUrl = getVideoThumbnail(videoUrl);
    }
    
    // Default thumbnail
    if (!thumbnailUrl) {
        thumbnailUrl = 'https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=70';
    }
    
    // Get duration placeholder (in real app, you'd calculate this)
    const duration = "15:30";
    
    return `
        <div class="video-card" data-video-id="${video.id}">
            <div class="video-thumbnail">
                <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
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
    
    // Remove loading spinner if it exists
    const loadingSpinner = document.querySelector('.gallery-loading');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
    
    if (!Array.isArray(items) || items.length === 0) {
        // Show no items message
        const noItemsMessage = document.getElementById('noItemsMessage');
        if (noItemsMessage) {
            noItemsMessage.style.display = 'block';
        } else {
            // Create no items message
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
    
    // Hide no items message
    const noItemsMessage = document.getElementById('noItemsMessage');
    if (noItemsMessage) {
        noItemsMessage.style.display = 'none';
    }
    
    // Render items
    galleryGrid.innerHTML = items.map(item => renderGalleryItem(item)).join('');
    
    // Re-attach event listeners
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
    
    // Attach video play listeners
    attachFeaturedVideoListeners();
}

// Function to filter items by category
async function filterItemsByCategory(category) {
    console.log('Filtering items by category:', category);
    
    // Update current category
    currentCategory = category;
    
    // Reset pagination
    page = 1;
    
    // Fetch items for the category
    const result = await fetchGalleryItems(page, category, currentSearchTerm);
    allMediaItems = result.items;
    displayedItems = allMediaItems;
    
    renderGalleryGrid(displayedItems);
    
    // Update load more button
    updateLoadMoreButton(result.pagination);
    
    console.log(`Displaying ${displayedItems.length} items in ${category} category`);
}

// Function to search items
async function searchItems(searchTerm) {
    console.log('Searching items:', searchTerm);
    
    // Update current search term
    currentSearchTerm = searchTerm;
    
    // Reset pagination
    page = 1;
    
    // Fetch items with search term
    const result = await fetchGalleryItems(page, currentCategory, searchTerm);
    allMediaItems = result.items;
    displayedItems = allMediaItems;
    
    renderGalleryGrid(displayedItems);
    
    // Update load more button
    updateLoadMoreButton(result.pagination);
    
    console.log(`Found ${displayedItems.length} items matching "${searchTerm}"`);
}

// Function to load more items
async function loadMoreItems() {
    if (!loadMoreBtn) return;
    
    // Show loading state
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    // Load next page
    const nextPage = page + 1;
    const result = await fetchGalleryItems(nextPage, currentCategory, currentSearchTerm);
    
    if (result.items.length > 0) {
        // Append new items
        allMediaItems = [...allMediaItems, ...result.items];
        displayedItems = allMediaItems;
        
        // Render all items again (or you could just append)
        renderGalleryGrid(displayedItems);
        
        // Update page number
        page = nextPage;
        
        // Update load more button
        updateLoadMoreButton(result.pagination);
        
        console.log(`Loaded page ${page}, total items: ${allMediaItems.length}`);
    }
    
    // Reset button state
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
    
    // Category mapping
    const categoryMap = {
        'events': 'Events',
        'facilities': 'Facilities',
        'team': 'Team Activities',
        'achievements': 'Achievements',
        'community': 'Community',
        'videos': 'Videos'
    };
    
    const categoryDisplay = categoryMap[category] || 'Events';
    
    // Get image URL
    let imageUrl = '';
    if (attrs.image?.data?.attributes?.url) {
        imageUrl = `${STRAPI_IMAGE_URL}${attrs.image.data.attributes.url}`;
    }
    
    // Fallback to default if no image
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
    
    // Update modal content
    document.getElementById('modalImage').src = imageUrl;
    document.getElementById('modalImage').alt = title;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalDescription').textContent = description;
    document.getElementById('modalDate').textContent = date;
    document.getElementById('modalCategory').textContent = categoryDisplay;
    
    // Set current index
    currentMediaIndex = allMediaItems.findIndex(i => i.id === item.id);
    updateNavigationButtons();
    
    // Show modal
    imageModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Function to show video modal
function showVideoModal(item) {
    const attrs = getItemData(item);
    const title = attrs.title || 'Video';
    const description = attrs.description || '';
    const videoUrl = attrs.videoUrl || '';
    
    // Extract video ID for embedding
    let embedUrl = '';
    const videoId = getYouTubeVideoId(videoUrl);
    
    if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    } else if (videoUrl.includes('vimeo')) {
        const vimeoId = videoUrl.split('/').pop();
        embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    } else {
        // Not a supported video URL
        showNotification('This video format is not supported.', 'error');
        return;
    }
    
    // Update modal content
    document.getElementById('videoTitle').textContent = title;
    document.getElementById('videoDescription').textContent = description;
    document.getElementById('videoFrame').src = embedUrl;
    
    // Show modal
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Function to update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentMediaIndex === 0;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentMediaIndex === allMediaItems.length - 1;
    }
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
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: title,
            text: description,
            url: url,
        })
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        // Fallback to copying link to clipboard
        const shareUrl = `${url}#gallery-item-${item.id}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => showNotification('Link copied to clipboard!', 'success'))
            .catch(() => {
                // Fallback to prompt
                prompt('Copy this link to share:', shareUrl);
            });
    }
}

// Function to close modals
function closeModals() {
    if (imageModal) {
        imageModal.style.display = 'none';
    }
    
    if (videoModal) {
        // Stop video playback
        const videoFrame = document.getElementById('videoFrame');
        if (videoFrame) {
            videoFrame.src = '';
        }
        videoModal.style.display = 'none';
    }
    
    document.body.style.overflow = 'auto';
}

// Function to attach gallery item listeners
function attachGalleryItemListeners() {
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const itemId = this.getAttribute('data-id');
            const item = allMediaItems.find(i => i.id.toString() === itemId);
            
            if (item) {
                const attrs = getItemData(item);
                
                // Increment views (optional - you can create an API endpoint for this)
                // await incrementViews(itemId);
                
                if (attrs.mediaType === 'video') {
                    showVideoModal(item);
                } else {
                    showImageModal(item);
                }
            }
        });
    });
    
    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            const item = allMediaItems.find(i => i.id.toString() === itemId);
            
            if (item) {
                shareItem(item);
            }
        });
    });
}

// Function to attach featured video listeners
function attachFeaturedVideoListeners() {
    document.querySelectorAll('.play-btn, .video-card').forEach(btn => {
        btn.addEventListener('click', async function() {
            const card = this.closest('.video-card');
            const videoId = card.getAttribute('data-video-id');
            const item = allMediaItems.find(i => i.id.toString() === videoId);
            
            if (item) {
                showVideoModal(item);
            }
        });
    });
}

// Function to increment views (optional)
async function incrementViews(itemId) {
    try {
        await fetch(`${STRAPI_API_URL}/gallery-items/${itemId}/increment-views`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

// Notification function (similar to careers page)
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

// Function to initialize gallery page
async function initializeGalleryPage() {
    console.log('Gallery page loaded, initializing...');
    
    // Get DOM elements
    galleryGrid = document.getElementById('galleryGrid');
    categoryBtns = document.querySelectorAll('.category-btn');
    mediaSearch = document.getElementById('mediaSearch');
    loadMoreBtn = document.getElementById('loadMore');
    imageModal = document.getElementById('imageModal');
    videoModal = document.getElementById('videoModal');
    
    // Add loading spinner if not exists
    if (galleryGrid && !document.querySelector('.gallery-loading')) {
        galleryGrid.innerHTML = `
            <div class="gallery-loading" style="text-align: center; padding: 50px; grid-column: 1 / -1;">
                <div class="loader" style="margin: 0 auto;"></div>
                <p style="margin-top: 20px; color: #666;">Loading gallery items...</p>
            </div>
        `;
    }
    
    // Ensure modals exist
    if (!imageModal) {
        const modalHTML = `
            <div class="image-modal" id="imageModal" style="display: none;">
                <div class="modal-content">
                    <button class="modal-close" id="modalClose">&times;</button>
                    <div class="modal-body">
                        <img id="modalImage" src="" alt="">
                        <div class="modal-info">
                            <h2 id="modalTitle"></h2>
                            <p id="modalDescription"></p>
                            <div class="modal-meta">
                                <span><i class="far fa-calendar"></i> <span id="modalDate"></span></span>
                                <span><i class="fas fa-tag"></i> <span id="modalCategory"></span></span>
                            </div>
                        </div>
                        <div class="modal-navigation">
                            <button class="nav-btn prev-btn" id="prevBtn">
                                <i class="fas fa-chevron-left"></i> Previous
                            </button>
                            <button class="nav-btn next-btn" id="nextBtn">
                                Next <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Re-get references
        imageModal = document.getElementById('imageModal');
    }
    
    if (!videoModal) {
        const modalHTML = `
            <div class="video-modal" id="videoModal" style="display: none;">
                <div class="modal-content">
                    <button class="modal-close" id="videoModalClose">&times;</button>
                    <div class="modal-body">
                        <div class="video-container">
                            <iframe id="videoFrame" width="100%" height="500" src="" frameborder="0" allowfullscreen></iframe>
                        </div>
                        <div class="modal-info">
                            <h2 id="videoTitle"></h2>
                            <p id="videoDescription"></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Re-get references
        videoModal = document.getElementById('videoModal');
    }
    
    // Fetch initial gallery items
    console.log('Fetching gallery items from API...');
    const result = await fetchGalleryItems(page, currentCategory, currentSearchTerm);
    allMediaItems = result.items;
    displayedItems = allMediaItems;
    
    if (allMediaItems.length === 0) {
        console.warn('No gallery items fetched from API');
    } else {
        renderGalleryGrid(displayedItems);
        updateLoadMoreButton(result.pagination);
    }
    
    // Fetch featured videos
    const featuredVideos = await fetchFeaturedVideos();
    renderFeaturedVideos(featuredVideos);
    
    // Set up category filter functionality
    if (categoryBtns) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active button
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter items
                filterItemsByCategory(category);
            });
        });
    }
    
    // Set up search functionality
    if (mediaSearch) {
        let searchTimeout;
        mediaSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchItems(this.value);
            }, 500);
        });
    }
    
    // Set up load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreItems);
    }
    
    // Set up modal functionality
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    if (imageModal) {
        imageModal.addEventListener('click', function(e) {
            if (e.target === imageModal) {
                closeModals();
            }
        });
    }
    
    if (videoModal) {
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                closeModals();
            }
        });
    }
    
    // Set up navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', navigateToPrevious);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', navigateToNext);
    }
    
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    console.log('Gallery page initialized successfully');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the gallery page
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
    `;
    document.head.appendChild(style);
}

// Export functions for global access
window.closeModals = closeModals;
window.navigateToPrevious = navigateToPrevious;
window.navigateToNext = navigateToNext;
