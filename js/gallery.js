// ==========================================================================
// MEDIA & GALLERY — POWERED BY KTRH CENTRAL DATA STORE
// ==========================================================================

// DOM Elements
let galleryGrid;
let categoryBtns;
let mediaSearch;
let loadMoreBtn;
let imageModal;
let videoModal;
let modalImage;
let modalVideoIframe;
let modalTitle;
let modalDescription;

// State Management
let allMediaItems = [];
let displayedItems = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let visibleCount = 12;

document.addEventListener('DOMContentLoaded', function() {
    initGalleryPage();
});

// Real-time update listener from Admin Portal
window.addEventListener('ktrh_data_updated', function(e) {
    if (!e.detail?.collection || e.detail.collection === 'gallery') {
        loadGalleryFromStore();
    }
});

function initGalleryPage() {
    galleryGrid = document.getElementById('galleryGrid');
    categoryBtns = document.querySelectorAll('.media-categories .category-btn');
    mediaSearch = document.getElementById('mediaSearch');
    loadMoreBtn = document.getElementById('loadMore');
    imageModal = document.getElementById('imageModal');
    videoModal = document.getElementById('videoModal');
    modalImage = document.getElementById('modalImage');
    modalVideoIframe = document.getElementById('modalVideoIframe');
    modalTitle = document.getElementById('modalTitle');
    modalDescription = document.getElementById('modalDescription');

    setupEventListeners();
    loadGalleryFromStore();
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

function setupEventListeners() {
    // Category Buttons
    if (categoryBtns) {
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.getAttribute('data-category') || 'all';
                filterMedia();
            });
        });
    }

    // Search Input
    if (mediaSearch) {
        mediaSearch.addEventListener('input', function() {
            currentSearchTerm = this.value.trim().toLowerCase();
            filterMedia();
        });

        const searchBtn = document.getElementById('searchButton');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                currentSearchTerm = mediaSearch.value.trim().toLowerCase();
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

    // Modal Close buttons
    const closeBtns = document.querySelectorAll('.modal-close');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    window.addEventListener('click', function(e) {
        if (e.target === imageModal || e.target === videoModal) {
            closeModals();
        }
    });
}

function filterMedia() {
    displayedItems = allMediaItems.filter(item => {
        const matchesCategory = currentCategory === 'all' || 
            (item.category && item.category.toLowerCase() === currentCategory.toLowerCase());

        const matchesSearch = !currentSearchTerm || 
            (item.title && item.title.toLowerCase().includes(currentSearchTerm)) ||
            (item.description && item.description.toLowerCase().includes(currentSearchTerm));

        return matchesCategory && matchesSearch;
    });

    renderGalleryGrid();
    updateLoadMoreButton();
}

function renderGalleryGrid() {
    if (!galleryGrid) return;

    if (displayedItems.length === 0) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #666;">
                <i class="fas fa-camera" style="font-size: 3.5rem; color: #cbd5e1; margin-bottom: 15px;"></i>
                <h3 style="color: #2c4964; margin-bottom: 8px;">No Media Items Found</h3>
                <p>No photos or videos match your current filter.</p>
            </div>
        `;
        return;
    }

    const itemsToRender = displayedItems.slice(0, visibleCount);

    galleryGrid.innerHTML = itemsToRender.map(item => {
        const isVideo = item.mediaType === 'video';
        const categoryTag = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Photo';
        const thumbnailSrc = isVideo ? getYouTubeThumbnail(item.url) : (item.url || 'img/about.jpg');

        return `
            <div class="gallery-item ${item.category || 'facilities'}" onclick="openMediaLightbox('${item.id}')">
                <img src="${thumbnailSrc}" alt="${item.title}" loading="lazy" onerror="this.src='img/about.jpg'">
                <div class="gallery-overlay">
                    <span class="gallery-tag">${categoryTag}</span>
                    <h3>${item.title}</h3>
                    <p>${item.description || ''}</p>
                    <div class="gallery-item-footer">
                        <span><i class="fas fa-eye"></i> ${item.views || 0}</span>
                        ${isVideo ? '<span class="video-indicator"><i class="fas fa-play-circle"></i> Play</span>' : '<span class="zoom-indicator"><i class="fas fa-search-plus"></i> View</span>'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getYouTubeThumbnail(url) {
    if (!url) return 'img/about.jpg';
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    return 'img/about.jpg';
}

function updateLoadMoreButton() {
    if (!loadMoreBtn) return;
    if (displayedItems.length > visibleCount) {
        loadMoreBtn.style.display = 'inline-block';
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More Media';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

window.openMediaLightbox = function(id) {
    const item = allMediaItems.find(m => String(m.id) === String(id));
    if (!item) return;

    // Increment views in data store
    if (window.KTRHStore) {
        const currentViews = item.views || 0;
        window.KTRHStore.update('gallery', item.id, { views: currentViews + 1 });
        item.views = currentViews + 1;
    }

    if (item.mediaType === 'video') {
        if (!videoModal) return;
        const iframe = document.getElementById('videoPlayer') || modalVideoIframe;
        if (iframe) {
            let embedUrl = item.url;
            if (item.url.includes('watch?v=')) {
                embedUrl = item.url.replace('watch?v=', 'embed/');
            }
            iframe.src = `${embedUrl}?autoplay=1`;
        }
        videoModal.style.display = 'flex';
    } else {
        if (!imageModal) return;
        const img = document.getElementById('modalImage');
        const caption = document.getElementById('modalCaption') || document.querySelector('.modal-caption h3');
        const desc = document.querySelector('.modal-caption p');

        if (img) img.src = item.url;
        if (caption) caption.textContent = item.title;
        if (desc) desc.textContent = item.description || '';

        imageModal.style.display = 'flex';
    }
};

function closeModals() {
    if (imageModal) imageModal.style.display = 'none';
    if (videoModal) {
        videoModal.style.display = 'none';
        const iframe = document.getElementById('videoPlayer') || modalVideoIframe;
        if (iframe) iframe.src = '';
    }
}
