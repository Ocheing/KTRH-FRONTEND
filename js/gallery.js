// ==========================================================================
// MEDIA & GALLERY — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

// DOM Elements
let galleryGrid;
let featuredVideosGrid;
let categoryBtns;
let mediaSearch;
let loadMoreBtn;
let imageModal;
let videoModal;
let modalImage;
let videoFrame;
let modalTitle;
let modalDescription;
let videoTitle;
let videoDescription;
let modalDate;
let modalCategory;
let prevBtn;
let nextBtn;

// State Management
let allMediaItems = [];
let displayedItems = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let visibleCount = 12;
let currentPhotos = [];
let currentPhotoIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    initGalleryPage();
});

// Real-time update listener from Admin Portal
window.addEventListener('ktrh_data_updated', function(e) {
    if (!e.detail?.collection || e.detail.collection === 'gallery') {
        loadGalleryFromStore();
        loadFeaturedVideos();
    }
});

function initGalleryPage() {
    // Gallery Grid & Filters
    galleryGrid = document.getElementById('galleryGrid');
    featuredVideosGrid = document.getElementById('featuredVideosGrid');
    categoryBtns = document.querySelectorAll('.media-categories .category-btn');
    mediaSearch = document.getElementById('mediaSearch');
    loadMoreBtn = document.getElementById('loadMore');

    // Modals & Navigation
    imageModal = document.getElementById('imageModal');
    videoModal = document.getElementById('videoModal');
    modalImage = document.getElementById('modalImage');
    videoFrame = document.getElementById('videoFrame');
    modalTitle = document.getElementById('modalTitle');
    modalDescription = document.getElementById('modalDescription');
    videoTitle = document.getElementById('videoTitle');
    videoDescription = document.getElementById('videoDescription');
    modalDate = document.getElementById('modalDate');
    modalCategory = document.getElementById('modalCategory');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');

    setupEventListeners();
    loadGalleryFromStore();
    loadFeaturedVideos();
}

function loadGalleryFromStore() {
    if (window.KTRHStore) {
        allMediaItems = window.KTRHStore.getGallery();
    } else {
        allMediaItems = [];
    }

    displayedItems = [...allMediaItems];
    filterMedia();
}

// ==========================================================================
// FEATURED VIDEOS COMPONENT
// ==========================================================================
function loadFeaturedVideos() {
    if (!featuredVideosGrid) {
        featuredVideosGrid = document.getElementById('featuredVideosGrid');
    }
    if (!featuredVideosGrid) return;

    try {
        if (!window.KTRHStore) {
            renderFeaturedVideosEmpty("Data store is initializing. Please refresh momentarily.");
            return;
        }

        const items = window.KTRHStore.getGallery() || [];
        // Extract videos: items with mediaType === 'video' OR category === 'videos'
        const videos = items.filter(item => 
            item && (item.mediaType === 'video' || (item.category && item.category.toLowerCase() === 'videos'))
        );

        if (videos.length === 0) {
            renderFeaturedVideosEmpty("No featured videos available at the moment.");
            return;
        }

        renderFeaturedVideosGrid(videos);
    } catch (error) {
        console.error('Error loading featured videos:', error);
        renderFeaturedVideosError("An error occurred while loading featured videos.");
    }
}

function renderFeaturedVideosGrid(videos) {
    if (!featuredVideosGrid) return;

    featuredVideosGrid.innerHTML = videos.map((video, index) => {
        const thumb = getYouTubeThumbnail(video.url);
        const duration = video.duration || 'Featured';
        const desc = video.description || '';
        const truncatedDesc = desc.length > 95 ? desc.substring(0, 95) + '...' : desc;

        return `
            <div class="video-card" onclick="openVideoModal('${video.id}')" style="cursor: pointer; animation-delay: ${index * 0.1}s">
                <div class="video-thumbnail">
                    <img src="${thumb}" alt="${escapeHtml(video.title)}" loading="lazy" onerror="this.src='img/about.jpg'">
                    <div class="play-btn" title="Play Video">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="video-duration">${duration}</div>
                </div>
                <div class="video-info">
                    <h3>${escapeHtml(video.title)}</h3>
                    <p>${escapeHtml(truncatedDesc)}</p>
                    <div class="video-meta">
                        <span><i class="far fa-calendar"></i> ${formatDate(video.date)}</span>
                        <span><i class="fas fa-eye"></i> ${(video.views || 0).toLocaleString()} views</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderFeaturedVideosEmpty(message) {
    if (!featuredVideosGrid) return;
    featuredVideosGrid.innerHTML = `
        <div class="no-items-message" style="grid-column: 1 / -1; width: 100%;">
            <i class="fas fa-video-slash" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 15px; display: block;"></i>
            <h3 style="color: #2c4964; margin-bottom: 8px;">No Featured Videos</h3>
            <p>${escapeHtml(message || 'No featured videos available at the moment.')}</p>
        </div>
    `;
}

function renderFeaturedVideosError(errorMsg) {
    if (!featuredVideosGrid) return;
    featuredVideosGrid.innerHTML = `
        <div class="no-items-message" style="grid-column: 1 / -1; width: 100%; border-color: #fca5a5; background: #fef2f2;">
            <i class="fas fa-exclamation-circle" style="font-size: 3.5rem; color: #ef4444; margin-bottom: 15px; display: block;"></i>
            <h3 style="color: #991b1b; margin-bottom: 8px;">Unable to Load Videos</h3>
            <p style="color: #b91c1c; margin-bottom: 20px;">${escapeHtml(errorMsg)}</p>
            <button onclick="loadFeaturedVideos()" class="refresh-button" style="padding: 10px 24px; background: #1977cc; color: #fff; border: none; border-radius: 50px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                <i class="fas fa-sync-alt"></i> Try Again
            </button>
        </div>
    `;
}

// ==========================================================================
// EVENT LISTENERS & FILTERING
// ==========================================================================
function setupEventListeners() {
    // Category Buttons
    if (categoryBtns && categoryBtns.length > 0) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.getAttribute('data-category') || 'all';
                visibleCount = 12; // Reset pagination on category switch
                filterMedia();
            });
        });
    }

    // Search Input
    if (mediaSearch) {
        mediaSearch.addEventListener('input', function() {
            currentSearchTerm = this.value.trim().toLowerCase();
            visibleCount = 12;
            filterMedia();
        });

        // Search Button
        const searchBtn = document.getElementById('searchButton');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                currentSearchTerm = mediaSearch.value.trim().toLowerCase();
                visibleCount = 12;
                filterMedia();
            });
        }
    }

    // Load More Button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            visibleCount += 8;
            renderGalleryGrid();
            updateLoadMoreButton();
        });
    }

    // Modal Close Buttons (both image and video modals)
    const closeBtns = document.querySelectorAll('.modal-close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Close modal when clicking on backdrop
    window.addEventListener('click', function(e) {
        if (e.target === imageModal || e.target === videoModal) {
            closeModals();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModals();
        } else if (e.key === 'ArrowLeft' && imageModal && imageModal.style.display === 'flex') {
            navigatePhoto(-1);
        } else if (e.key === 'ArrowRight' && imageModal && imageModal.style.display === 'flex') {
            navigatePhoto(1);
        }
    });

    // Image Modal Prev / Next Buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navigatePhoto(-1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navigatePhoto(1);
        });
    }
}

function filterMedia() {
    displayedItems = allMediaItems.filter(item => {
        let matchesCategory = false;
        if (currentCategory === 'all') {
            matchesCategory = true;
        } else if (currentCategory === 'videos') {
            matchesCategory = item.mediaType === 'video' || (item.category && item.category.toLowerCase() === 'videos');
        } else {
            matchesCategory = item.category && item.category.toLowerCase() === currentCategory.toLowerCase();
        }

        const matchesSearch = !currentSearchTerm || 
            (item.title && item.title.toLowerCase().includes(currentSearchTerm)) ||
            (item.description && item.description.toLowerCase().includes(currentSearchTerm)) ||
            (item.category && item.category.toLowerCase().includes(currentSearchTerm));

        return matchesCategory && matchesSearch;
    });

    renderGalleryGrid();
    updateLoadMoreButton();
}

function renderGalleryGrid() {
    if (!galleryGrid) return;

    if (displayedItems.length === 0) {
        const catLabel = currentCategory === 'all' ? '' : ` in "${capitalize(currentCategory)}"`;
        galleryGrid.innerHTML = `
            <div class="no-items-message">
                <i class="fas fa-images"></i>
                <h3>No Media Items Found</h3>
                <p>No photos or videos match your current filter${catLabel}${currentSearchTerm ? ' and search "' + escapeHtml(currentSearchTerm) + '"' : ''}.</p>
                <button onclick="resetGalleryFilters()" style="margin-top: 15px; padding: 10px 24px; background: #1977cc; color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                    <i class="fas fa-sync-alt"></i> Show All Media
                </button>
            </div>
        `;
        return;
    }

    const itemsToRender = displayedItems.slice(0, visibleCount);

    galleryGrid.innerHTML = itemsToRender.map(item => {
        const isVideo = item.mediaType === 'video' || (item.category && item.category.toLowerCase() === 'videos');
        const categoryTag = item.category ? capitalize(item.category) : (isVideo ? 'Video' : 'Photo');
        const thumbnailSrc = isVideo ? getYouTubeThumbnail(item.url) : (item.url || 'img/about.jpg');

        return `
            <div class="gallery-item ${item.category || 'facilities'}" onclick="openMediaLightbox('${item.id}')" style="cursor: pointer;">
                <img src="${thumbnailSrc}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='img/about.jpg'">
                <div class="gallery-overlay">
                    <span class="gallery-tag">${categoryTag}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.description || '')}</p>
                    <div class="gallery-item-footer">
                        <span><i class="fas fa-eye"></i> ${(item.views || 0).toLocaleString()}</span>
                        ${isVideo 
                            ? '<span class="video-indicator"><i class="fas fa-play-circle"></i> Watch Video</span>' 
                            : '<span class="zoom-indicator"><i class="fas fa-search-plus"></i> View Photo</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

window.resetGalleryFilters = function() {
    currentCategory = 'all';
    currentSearchTerm = '';
    visibleCount = 12;
    if (mediaSearch) mediaSearch.value = '';
    if (categoryBtns && categoryBtns.length > 0) {
        categoryBtns.forEach(b => b.classList.remove('active'));
        categoryBtns[0].classList.add('active');
    }
    filterMedia();
};

function updateLoadMoreButton() {
    if (!loadMoreBtn) return;
    if (displayedItems.length > visibleCount) {
        loadMoreBtn.style.display = 'inline-block';
        loadMoreBtn.innerHTML = `<i class="fas fa-plus"></i> Load More Media (${displayedItems.length - visibleCount} remaining)`;
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// ==========================================================================
// MODAL LIGHTBOXES (VIDEO & PHOTO)
// ==========================================================================
window.openMediaLightbox = function(id) {
    const item = allMediaItems.find(m => String(m.id) === String(id));
    if (!item) return;

    const isVideo = item.mediaType === 'video' || (item.category && item.category.toLowerCase() === 'videos');
    if (isVideo) {
        openVideoModal(id);
    } else {
        openImageModal(id);
    }
};

window.openVideoModal = function(id) {
    const video = allMediaItems.find(m => String(m.id) === String(id)) ||
                  (window.KTRHStore ? window.KTRHStore.getGallery().find(m => String(m.id) === String(id)) : null);
    if (!video) return;

    // Increment views in data store
    if (window.KTRHStore) {
        const currentViews = video.views || 0;
        window.KTRHStore.update('gallery', video.id, { views: currentViews + 1 });
        video.views = currentViews + 1;
    }

    if (!videoModal) videoModal = document.getElementById('videoModal');
    if (!videoFrame) videoFrame = document.getElementById('videoFrame');
    if (!videoTitle) videoTitle = document.getElementById('videoTitle');
    if (!videoDescription) videoDescription = document.getElementById('videoDescription');

    if (!videoModal) return;

    if (videoFrame) {
        const embedUrl = formatYouTubeEmbedUrl(video.url);
        videoFrame.src = embedUrl.includes('?') ? `${embedUrl}&autoplay=1` : `${embedUrl}?autoplay=1`;
    }
    if (videoTitle) videoTitle.textContent = video.title;
    if (videoDescription) videoDescription.textContent = video.description || '';

    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.openImageModal = function(id) {
    currentPhotos = displayedItems.filter(item => 
        item.mediaType !== 'video' && (!item.category || item.category.toLowerCase() !== 'videos')
    );
    if (currentPhotos.length === 0) {
        currentPhotos = allMediaItems.filter(item => 
            item.mediaType !== 'video' && (!item.category || item.category.toLowerCase() !== 'videos')
        );
    }

    currentPhotoIndex = currentPhotos.findIndex(m => String(m.id) === String(id));
    if (currentPhotoIndex === -1 && currentPhotos.length > 0) {
        currentPhotoIndex = 0;
    }

    showPhotoAtIndex(currentPhotoIndex);
};

function showPhotoAtIndex(index) {
    if (index < 0 || index >= currentPhotos.length) return;
    const item = currentPhotos[index];
    if (!item) return;

    // Increment views in store
    if (window.KTRHStore) {
        const currentViews = item.views || 0;
        window.KTRHStore.update('gallery', item.id, { views: currentViews + 1 });
        item.views = currentViews + 1;
    }

    if (!imageModal) imageModal = document.getElementById('imageModal');
    if (!modalImage) modalImage = document.getElementById('modalImage');
    if (!modalTitle) modalTitle = document.getElementById('modalTitle');
    if (!modalDescription) modalDescription = document.getElementById('modalDescription');
    if (!modalDate) modalDate = document.getElementById('modalDate');
    if (!modalCategory) modalCategory = document.getElementById('modalCategory');

    if (modalImage) modalImage.src = item.url || 'img/about.jpg';
    if (modalTitle) modalTitle.textContent = item.title;
    if (modalDescription) modalDescription.textContent = item.description || '';
    if (modalDate) modalDate.textContent = formatDate(item.date);
    if (modalCategory) modalCategory.textContent = item.category ? capitalize(item.category) : 'Photo';

    if (imageModal) {
        imageModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function navigatePhoto(direction) {
    if (!currentPhotos || currentPhotos.length === 0) return;
    currentPhotoIndex = (currentPhotoIndex + direction + currentPhotos.length) % currentPhotos.length;
    showPhotoAtIndex(currentPhotoIndex);
}

function closeModals() {
    if (imageModal) imageModal.style.display = 'none';
    if (videoModal) {
        videoModal.style.display = 'none';
        if (videoFrame) videoFrame.src = ''; // Halt playback immediately
    }
    document.body.style.overflow = '';
}

// ==========================================================================
// UTILITY FUNCTIONS
// ==========================================================================
function getYouTubeThumbnail(url) {
    if (!url) return 'img/about.jpg';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return url.startsWith('http') || url.startsWith('img/') ? url : 'img/about.jpg';
}

function formatYouTubeEmbedUrl(url) {
    if (!url) return '';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }
    if (url.includes('watch?v=')) {
        return url.replace('watch?v=', 'embed/');
    }
    return url;
}

function formatDate(dateStr) {
    if (!dateStr) return 'Recently';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
