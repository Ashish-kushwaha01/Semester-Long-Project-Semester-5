
// // Enhanced home page functionality with category filtering
// let currentFilter = null;
// let allProducts = [];

// // Render categories on home page
// function renderCategories() {
//     const productCategories = [...new Set(SAMPLE_PRODUCTS.map(p => p.category))];
//     const allCategories = Object.keys(CATEGORY_IMAGES);
//     const categories = [...new Set([...productCategories, ...allCategories])];

//     const container = document.getElementById('categoryGrid');
//     if (!container) return;
    
//     container.innerHTML = categories.map(cat => `
//         <div class="category-card" data-category="${cat}" onclick="filterByCategory('${cat}')">
//             <img src="${CATEGORY_IMAGES[cat] || 'assets/default-category.jpg'}" alt="${cat}" />
//             <h3>${cat}</h3>
//             <div class="muted">Explore ${cat}</div>
//         </div>
//     `).join('');
// }

// // Render products on home page with filtering
// function renderProducts(filterCategory = null) {
//     const container = document.getElementById('productGrid');
//     const productsTitle = document.getElementById('productsTitle');
//     const productsSubtitle = document.getElementById('productsSubtitle');
//     const filterControls = document.getElementById('filterControls');
//     const filterInfo = document.getElementById('filterInfo');
    
//     if (!container) return;

//     // Filter products if category is selected
//     let productsToShow = filterCategory 
//         ? SAMPLE_PRODUCTS.filter(p => p.category === filterCategory)
//         : SAMPLE_PRODUCTS;

//     // Update UI based on filter
//     if (filterCategory) {
//         productsTitle.textContent = `${filterCategory} Products`;
//         productsSubtitle.textContent = `Discover amazing ${filterCategory.toLowerCase()} products`;
//         filterControls.style.display = 'flex';
//         filterInfo.textContent = `${productsToShow.length} products found`;
        
//         // Update active category card
//         document.querySelectorAll('.category-card').forEach(card => {
//             card.classList.remove('active');
//             if (card.dataset.category === filterCategory) {
//                 card.classList.add('active');
//             }
//         });
//     } else {
//         productsTitle.textContent = 'Trending picks';
//         productsSubtitle.textContent = 'Popular products everyone loves';
//         filterControls.style.display = 'none';
        
//         // Remove active state from all category cards
//         document.querySelectorAll('.category-card').forEach(card => {
//             card.classList.remove('active');
//         });
//     }

//     // Show loading state
//     container.innerHTML = `
//         <div class="loading">
//             <div class="loading-spinner"></div>
//         </div>
//     `;

//     // Simulate loading delay for better UX
//     setTimeout(() => {
//         if (productsToShow.length === 0) {
//             container.innerHTML = `
//                 <div class="empty-state">
//                     <div class="empty-state-icon">🔍</div>
//                     <h3>No products found</h3>
//                     <p>We couldn't find any products in this category.</p>
//                     <button class="btn btn-primary" onclick="clearFilter()">Browse All Products</button>
//                 </div>
//             `;
//             return;
//         }

//         container.innerHTML = productsToShow.map(p => `
//             <div class="card">
//                 <a href="product.html?id=${p.id}" style="text-decoration:none;color:inherit">
//                     <img loading="lazy" src="${p.img}" alt="${p.title}" 
//                         onerror="this.src='https://via.placeholder.com/280x200?text=Product+Image'">
//                     <div class="card-content">
//                         <div class="card-title">${p.title}</div>
//                         <div class="card-category">${p.category}</div>
//                         <div class="card-footer">
//                             <div class="price">₹${p.price.toLocaleString('en-IN')}</div>
//                             <div class="rating">
//                                 <span>${p.rating}</span>
//                                 <span>★</span>
//                             </div>
//                         </div>
//                     </div>
//                 </a>
//                 <div class="card-actions">
//                     <button class="btn btn-secondary" onclick="event.stopPropagation(); addToCartWithAnimation('${p.id}', 1, this)">
//                         Add to Cart
//                     </button>
//                     <a class="btn btn-primary" href="product.html?id=${p.id}" onclick="event.stopPropagation()">
//                         Buy Now
//                     </a>
//                 </div>
//             </div>
//         `).join('');

//         // Add click animation to cards
//         addCardAnimations();
        
//     }, 500);
// }

// // Filter products by category
// function filterByCategory(category) {
//     currentFilter = category;
//     renderProducts(category);
    
//     // Smooth scroll to products section
//     document.getElementById('productsTitle').scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//     });
    
//     // Update URL without page reload (for sharing)
//     const url = new URL(window.location);
//     url.searchParams.set('category', category);
//     window.history.pushState({}, '', url);
// }

// // Clear category filter
// function clearFilter() {
//     currentFilter = null;
//     renderProducts();
    
//     // Update URL
//     const url = new URL(window.location);
//     url.searchParams.delete('category');
//     window.history.pushState({}, '', url);
// }

// // Enhanced add to cart with animation
// function addToCartWithAnimation(productId, quantity = 1, button) {
//     const product = findProductById(productId);
//     if (!product) return;

//     // Add to cart
//     addToCart(productId, quantity);
    
//     // Button animation
//     if (button) {
//         const originalText = button.innerHTML;
//         button.innerHTML = '✓ Added';
//         button.style.background = '#10b981';
//         button.style.transform = 'scale(0.95)';
        
//         setTimeout(() => {
//             button.innerHTML = originalText;
//             button.style.background = '';
//             button.style.transform = '';
//         }, 2000);
//     }
    
//     // Cart icon animation
//     animateCartIcon();
// }

// // Animate cart icon when item is added
// function animateCartIcon() {
//     const cartCount = document.getElementById('cartCount');
//     if (cartCount) {
//         cartCount.style.transform = 'scale(1.3)';
//         setTimeout(() => {
//             cartCount.style.transform = 'scale(1)';
//         }, 300);
//     }
// }

// // Add hover animations to cards
// function addCardAnimations() {
//     const cards = document.querySelectorAll('.card');
//     cards.forEach(card => {
//         card.addEventListener('mouseenter', function() {
//             this.style.transform = 'translateY(-8px)';
//         });
        
//         card.addEventListener('mouseleave', function() {
//             this.style.transform = 'translateY(0)';
//         });
//     });
// }

// // Check URL for category filter on page load
// function checkUrlFilter() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const category = urlParams.get('category');
    
//     if (category && Object.keys(CATEGORY_IMAGES).includes(category)) {
//         filterByCategory(category);
//     }
// }

// // Initialize home page
// document.addEventListener('DOMContentLoaded', () => {
//     renderCategories();
//     renderProducts();
//     checkUrlFilter();
    
//     // Setup clear filter button
//     const clearFilterBtn = document.getElementById('clearFilter');
//     if (clearFilterBtn) {
//         clearFilterBtn.addEventListener('click', clearFilter);
//     }
    
//     // Add keyboard navigation for categories
//     document.addEventListener('keydown', function(e) {
//         if (e.key === 'Escape' && currentFilter) {
//             clearFilter();
//         }
//     });
// });

// // Export functions for global access
// window.filterByCategory = filterByCategory;
// window.clearFilter = clearFilter;
// window.addToCartWithAnimation = addToCartWithAnimation;



















// Enhanced home page functionality with real API integration
let currentFilter = null;
let allProducts = [];

// Initialize home page with real data
async function initializeHomePage() {
    console.log('🚀 Initializing home page with real data...');
    
    try {
        // Show loading state
        showLoadingState();
        
        // Fetch real products from API
        const backendProducts = await fetchActiveProducts();
        
        // Transform data to frontend format
        allProducts = transformProductData(backendProducts);
        
        console.log('✅ Transformed products:', allProducts);
        
        // Render categories and products
        renderCategories();
        renderProducts();
        checkUrlFilter();
        
    } catch (error) {
        console.error('❌ Failed to initialize home page:', error);
        // Fallback to sample data
        allProducts = SAMPLE_PRODUCTS;
        renderCategories();
        renderProducts();
    }
}

// Render categories based on real product data
function renderCategories() {
    const productCategories = [...new Set(allProducts.map(p => p.category))];
    const allCategories = Object.keys(CATEGORY_IMAGES);
    const categories = [...new Set([...productCategories, ...allCategories])];

    const container = document.getElementById('categoryGrid');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="category-card" data-category="${cat}" onclick="filterByCategory('${cat}')">
            <img src="${CATEGORY_IMAGES[cat] || 'assets/default-category.jpg'}" alt="${cat}" />
            <h3>${cat}</h3>
            <div class="muted">Explore ${cat}</div>
        </div>
    `).join('');
}

// Render products with real data
function renderProducts(filterCategory = null) {
    const container = document.getElementById('productGrid');
    const productsTitle = document.getElementById('productsTitle');
    const productsSubtitle = document.getElementById('productsSubtitle');
    const filterControls = document.getElementById('filterControls');
    const filterInfo = document.getElementById('filterInfo');
    
    if (!container) return;

    // Filter products if category is selected
    let productsToShow = filterCategory 
        ? allProducts.filter(p => p.category === filterCategory)
        : allProducts;

    // Update UI based on filter
    if (filterCategory) {
        productsTitle.textContent = `${filterCategory} Products`;
        productsSubtitle.textContent = `Discover amazing ${filterCategory.toLowerCase()} products`;
        filterControls.style.display = 'flex';
        filterInfo.textContent = `${productsToShow.length} products found`;
        
        // Update active category card
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.category === filterCategory) {
                card.classList.add('active');
            }
        });
    } else {
        productsTitle.textContent = 'Trending picks';
        productsSubtitle.textContent = 'Popular products everyone loves';
        filterControls.style.display = 'none';
        
        // Remove active state from all category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
    }

    // Show loading state
    container.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading amazing products...</p>
        </div>
    `;

    // Simulate loading delay for better UX
    setTimeout(() => {
        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No products found</h3>
                    <p>We couldn't find any products in this category.</p>
                    <button class="btn btn-primary" onclick="clearFilter()">Browse All Products</button>
                </div>
            `;
            return;
        }

        container.innerHTML = productsToShow.map(p => `
            <div class="card">
                <a href="product.html?id=${p.id}" style="text-decoration:none;color:inherit">
                    <img loading="lazy" src="${p.img}" alt="${p.title}" 
                        onerror="this.src='https://via.placeholder.com/280x200?text=Product+Image'">
                    <div class="card-content">
                        <div class="card-title">${p.title}</div>
                        <div class="card-category">${p.category}</div>
                        <div class="card-footer">
                            <div class="price">₹${p.price.toLocaleString('en-IN')}</div>
                            <div class="rating">
                                <span>${p.rating}</span>
                                <span>★</span>
                            </div>
                        </div>
                    </div>
                </a>
                <div class="card-actions">
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); addToCartWithAnimation('${p.id}', 1, this)">
                        Add to Cart
                    </button>
                    <a class="btn btn-primary" href="product.html?id=${p.id}" onclick="event.stopPropagation()">
                        Buy Now
                    </a>
                </div>
            </div>
        `).join('');

        // Add click animation to cards
        addCardAnimations();
        
    }, 500);
}

// Show loading state
function showLoadingState() {
    const container = document.getElementById('productGrid');
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading amazing products from our collection...</p>
            </div>
        `;
    }
}

// Filter products by category
function filterByCategory(category) {
    currentFilter = category;
    renderProducts(category);
    
    // Smooth scroll to products section
    document.getElementById('productsTitle').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Update URL without page reload (for sharing)
    const url = new URL(window.location);
    url.searchParams.set('category', category);
    window.history.pushState({}, '', url);
}

// Clear category filter
function clearFilter() {
    currentFilter = null;
    renderProducts();
    
    // Update URL
    const url = new URL(window.location);
    url.searchParams.delete('category');
    window.history.pushState({}, '', url);
}

// Enhanced add to cart with animation
function addToCartWithAnimation(productId, quantity = 1, button) {
    const product = findProductById(productId);
    if (!product) return;

    // Add to cart
    addToCart(productId, quantity);
    
    // Button animation
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '✓ Added';
        button.style.background = '#10b981';
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
            button.style.transform = '';
        }, 2000);
    }
    
    // Cart icon animation
    animateCartIcon();
}

// Animate cart icon when item is added
function animateCartIcon() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 300);
    }
}

// Add hover animations to cards
function addCardAnimations() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Check URL for category filter on page load
function checkUrlFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        filterByCategory(category);
    }
}

// Find product by ID (updated to work with real data)
function findProductById(id) {
    return allProducts.find(p => p.id === id);
}

// Initialize home page
document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
    
    // Setup clear filter button
    const clearFilterBtn = document.getElementById('clearFilter');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearFilter);
    }
    
    // Add keyboard navigation for categories
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentFilter) {
            clearFilter();
        }
    });
});

// Export functions for global access
window.filterByCategory = filterByCategory;
window.clearFilter = clearFilter;
window.addToCartWithAnimation = addToCartWithAnimation;