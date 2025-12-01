
// Modern Product Page with Real API Integration
(function () {
    const API_BASE_URL = 'http://localhost:8000/api/product';
    let currentProduct = null;
    let currentVariant = null;
    let currentBreadcrumbFilter = null;
    let currentReviews = [];

    function getQueryParam(name) {
        return new URLSearchParams(location.search).get(name);
    }

    function generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) stars += '★';
        if (halfStar) stars += '½';
        for (let i = 0; i < emptyStars; i++) stars += '☆';

        return stars;
    }

    async function fetchProductDetails(productId) {
        try {
            showLoadingState();
            console.log('🔄 Fetching product details for ID:', productId);

            const response = await fetch(`${API_BASE_URL}/get/product/${productId}/`);

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const productData = await response.json();
            console.log('📦 Raw API response:', productData);

            // Check if we got any data
            if (!productData) {
                throw new Error('No product data received from server');
            }

            // Handle both array and single object responses
            const product = Array.isArray(productData) ? productData[0] : productData;

            if (!product) {
                throw new Error('Product not found in response');
            }

            // Validate required fields
            if (!product.id || !product.title) {
                throw new Error('Invalid product data: missing required fields');
            }

            console.log('✅ Product data received:', product);
            return productData; // Return the raw data, let transformProductData handle it
        } catch (error) {
            console.error('❌ Error fetching product details:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            showErrorState('Failed to load product details. Please try again later.');
            return null;
        }
    }

    
    function transformProductData(backendProduct) {
    if (!backendProduct) return null;

    // Handle both array and single object responses
    const product = Array.isArray(backendProduct) ? backendProduct[0] : backendProduct;

    if (!product) return null;

    // Get the first variant for initial display
    const firstVariant = product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;

    // Get images - FIXED VERSION
    let productImages = ['assets/default-product.jpg'];

    if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
        // Extract image URLs from variant images
        productImages = firstVariant.images.map(img => img.image);

        // Sort so primary image comes first
        productImages.sort((a, b) => {
            const aIsPrimary = firstVariant.images.find(img => img.image === a)?.is_primary;
            const bIsPrimary = firstVariant.images.find(img => img.image === b)?.is_primary;
            return (bIsPrimary ? 1 : 0) - (aIsPrimary ? 1 : 0);
        });
    }

    // FIXED: Get category information properly
    let categoryName = 'Uncategorized';
    let categoryPath = 'Uncategorized';
    let rootCategory = 'General';
    let displayCategory = 'General';

    // Use category_path if available (Fashion -> Clothes -> Shirt)
    if (product.category_path && product.category_path.length > 0) {
        categoryPath = product.category_path.join(' › ');
        
        // Root category is the first element (Fashion)
        rootCategory = product.category_path[0];
        
        // Display category logic for breadcrumb:
        if (product.category_path.length === 1) {
            // Only one category: Fashion -> use Fashion
            displayCategory = product.category_path[0];
        } else if (product.category_path.length === 2) {
            // Two categories: Fashion -> Clothes -> use Clothes
            displayCategory = product.category_path[1];
        } else {
            // Three or more categories: Fashion -> Clothes -> Shirt -> use Clothes (the middle one)
            displayCategory = product.category_path[1];
        }
        
        categoryName = displayCategory; // For general use
    }
    
    // Fallback to category array
    else if (product.category && product.category.length > 0) {
        const categoryObj = product.category[0];
        if (typeof categoryObj === 'object' && categoryObj.name) {
            categoryName = categoryObj.name;
            displayCategory = categoryObj.name;
            rootCategory = categoryObj.name;
            categoryPath = categoryObj.name;
        }
    }

    return {
        id: product.id.toString(),
        title: product.title,
        description: product.description,
        basePrice: parseFloat(product.base_price),
        price: parseFloat(firstVariant?.adjusted_price || product.base_price),
        rating: 4.5, // Default rating
        images: productImages,
        category: categoryName, // For general use (Clothes)
        displayCategory: displayCategory, // For product cards (Clothes)
        rootCategory: rootCategory, // For featured sections (Fashion)
        categoryPath: categoryPath, // Complete path for breadcrumb (Fashion › Clothes › Shirt)
        category_id: product.category_id,
        variants: product.variants || [],
        specifications: generateSpecifications(product, firstVariant)
    };
}

    function generateSpecifications(product, variant) {
    const specs = {
        "General": [
            { name: "Product Name", value: product.title },
            { name: "Brand", value: "ShopwaveX" },
            { name: "Model", value: `SWX-${product.id}` },
            { name: "Category", value: product.rootCategory }, // Show complete path here
            { name: "Status", value: product.status }
        ],
        "Pricing": [
            { name: "Base Price", value: `₹${parseFloat(product.base_price).toLocaleString('en-IN')}` }
        ]
    };

    // Add variant specifications
    if (variant && variant.attributes && variant.attributes.length > 0) {
        specs["Specifications"] = variant.attributes.map(attr => ({
            name: attr.attribute,
            value: attr.value
        }));
    }

    return specs;
}

    async function initializeProductPage() {
    const productId = getQueryParam('id');

    if (!productId) {
        showErrorState('Product ID not found in URL');
        return;
    }

    try {
        showLoadingState();
        
        const backendProduct = await fetchProductDetails(productId);

        if (!backendProduct) {
            showErrorState('Product not found');
            return;
        }

        currentProduct = transformProductData(backendProduct);

        if (!currentProduct) {
            showErrorState('Failed to process product data');
            return;
        }

        console.log('🔄 Transformed product:', currentProduct);

        // Set first variant as current
        if (currentProduct.variants && currentProduct.variants.length > 0) {
            currentVariant = currentProduct.variants[0];
        } else {
            console.warn('⚠️ No variants found for product');
        }

        // HIDE LOADING STATE BEFORE UPDATING DISPLAY
        hideLoadingState();
        
        updateProductDisplay();
        initializeEventListeners();

    } catch (error) {
        console.error('❌ Error initializing product page:', error);
        // Also hide loading state on error
        hideLoadingState();
        showErrorState('Failed to load product page: ' + error.message);
    }
}

    function updateProductDisplay() {
        updateBreadcrumb();
        updateGallery();
        updateProductInfo();
        updateVariants();
        updateBuyBox();
        updateSpecifications();
        updateReviews();
        loadSimilarProducts();
    }

    
    function updateBreadcrumb() {
    const breadcrumbElement = document.getElementById('categoryBreadcrumb');
    const productBreadcrumbElement = document.getElementById('productBreadcrumb');
    
    if (breadcrumbElement && productBreadcrumbElement) {
        // Get the category path array
        const categoryPath = currentProduct.categoryPath ? 
            currentProduct.categoryPath.split(' › ') : 
            [currentProduct.displayCategory || currentProduct.category];
        
        // Create clickable breadcrumb items
        breadcrumbElement.innerHTML = categoryPath
            .map((category, index) => {
                if (index === categoryPath.length - 1) {
                    // Last item - not clickable, current category
                    return `<span class="breadcrumb-current">${category}</span>`;
                } else {
                    // Clickable breadcrumb items
                    return `<span class="breadcrumb-item" data-category="${category}" data-level="${index}">${category}</span> › `;
                }
            })
            .join('');
        
        productBreadcrumbElement.textContent = currentProduct.title;
        
        // Add click event listeners to breadcrumb items
        addBreadcrumbClickListeners();
    }
}

function addBreadcrumbClickListeners() {
    const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
    
    breadcrumbItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            const level = parseInt(this.dataset.level);
            
            console.log(`🔄 Breadcrumb clicked: ${category} at level ${level}`);
            
            // Filter products based on the clicked category level
            filterProductsByBreadcrumb(category, level);
        });
    });
}

function filterProductsByBreadcrumb(clickedCategory, level) {
    console.log(`🔍 Filtering products for category: ${clickedCategory} at level: ${level}`);
    
    // Store the current filter state
    currentBreadcrumbFilter = {
        category: clickedCategory,
        level: level
    };
    
    // Show loading state
    showBreadcrumbLoading();
    
    // Simulate API call or filter existing products
    setTimeout(() => {
        loadProductsByCategory(clickedCategory, level);
    }, 500);
}

function showBreadcrumbLoading() {
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="loading-spinner"></div>
                <p>Loading ${currentBreadcrumbFilter.category} products...</p>
            </div>
        `;
    }
}


async function loadProductsByCategory(category, level) {
    try {
        console.log(`📡 Loading products for category: ${category}, level: ${level}`);
        
        // Fetch all products
        const response = await fetch(`${API_BASE_URL}/get/products/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const productsData = await response.json();
        const allProducts = Array.isArray(productsData) ? productsData : [productsData];

        // Filter products based on the category level
        const filteredProducts = allProducts.filter(product => {
            if (!product.category_path || product.category_path.length === 0) {
                return false;
            }
            
            // Check if the product belongs to the clicked category at the specified level
            if (level < product.category_path.length) {
                return product.category_path[level] === category;
            }
            
            return false;
        });

        console.log(`✅ Found ${filteredProducts.length} products for ${category}`);
        
        // Update the UI with filtered products
        displayFilteredProducts(filteredProducts, category);
        
    } catch (error) {
        console.error('❌ Error loading products by category:', error);
        showBreadcrumbError('Failed to load products. Please try again.');
    }
}

function displayFilteredProducts(products, category) {
    const container = document.getElementById('productGrid');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p>No products found in ${category} category.</p>
                <button class="btn btn-primary" onclick="clearBreadcrumbFilter()">Show All Products</button>
            </div>
        `;
        return;
    }

    // Display the filtered products
    container.innerHTML = products.map(product => {
        const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
        const productImage = firstVariant && firstVariant.images && firstVariant.images.length > 0
            ? firstVariant.images[0].image
            : 'assets/default-product.jpg';

        // Determine display category based on current filter level
        let displayCategory = product.category_path ? 
            product.category_path[product.category_path.length - 2] || product.category_path[0] : 
            product.category?.[0]?.name || 'Uncategorized';

        return `
            <div class="card">
                <a href="product.html?id=${product.id}" style="text-decoration:none;color:inherit">
                    <img loading="lazy" src="${productImage}" alt="${product.title}" 
                         onerror="this.src='assets/default-product.jpg'">
                    <div class="card-content">
                        <div class="card-title">${product.title}</div>
                        <div class="card-category">${displayCategory}</div>
                        <div class="card-footer">
                            <div class="price">₹${parseFloat(firstVariant?.adjusted_price || product.base_price).toLocaleString('en-IN')}</div>
                            <div class="rating">
                                <span>4.5</span>
                                <span>★</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');

    // Update page title and description
    updateFilteredPageInfo(category, products.length);
}

function updateFilteredPageInfo(category, productCount) {
    const productsTitle = document.getElementById('productsTitle');
    const productsSubtitle = document.getElementById('productsSubtitle');
    const filterInfo = document.getElementById('filterInfo');
    
    if (productsTitle) {
        productsTitle.textContent = `${category} Products`;
    }
    if (productsSubtitle) {
        productsSubtitle.textContent = `Browse all ${category.toLowerCase()} products`;
    }
    if (filterInfo) {
        filterInfo.textContent = `${productCount} products found`;
    }
    
    // Show filter controls
    const filterControls = document.getElementById('filterControls');
    if (filterControls) {
        filterControls.style.display = 'flex';
    }
}

function clearBreadcrumbFilter() {
    currentBreadcrumbFilter = null;
    // Reload all products or go back to the main page
    window.location.reload(); // Or implement your own logic to show all products
}

function showBreadcrumbError(message) {
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="error-icon">⚠️</div>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="clearBreadcrumbFilter()">Back to All Products</button>
            </div>
        `;
    }
}


    function updateGallery() {
        console.log('🔄 updateGallery called');

        const mainImage = document.getElementById('mainImage');
        const thumbsContainer = document.getElementById('galleryThumbs');

        // Check if elements exist
        if (!mainImage) {
            console.error('❌ CRITICAL: mainImage element not found!');
            console.error('Available elements on page:');
            console.log(document.querySelectorAll('*[id]'));
            throw new Error('mainImage element not found in DOM');
        }

        if (!thumbsContainer) {
            console.error('❌ CRITICAL: galleryThumbs element not found!');
            throw new Error('galleryThumbs element not found in DOM');
        }

        console.log('✅ DOM elements found, proceeding with gallery update');

        if (currentProduct.images && currentProduct.images.length > 0) {
            console.log('📸 Setting main image:', currentProduct.images[0]);
            mainImage.src = currentProduct.images[0];
            mainImage.alt = currentProduct.title;

            // Add error handling for image loading
            mainImage.onerror = function () {
                console.error('❌ Failed to load main image, using fallback');
                this.src = 'assets/default-product.jpg';
            };

            thumbsContainer.innerHTML = currentProduct.images.map((img, index) => `
            <div class="thumb-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                <img src="${img}" alt="Thumbnail ${index + 1}" 
                     onerror="this.src='assets/default-product.jpg'">
            </div>
        `).join('');

            // Add thumbnail click listeners
            document.querySelectorAll('.thumb-item').forEach(thumb => {
                thumb.addEventListener('click', function () {
                    const index = this.dataset.index;
                    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    mainImage.src = currentProduct.images[index];
                });
            });
        } else {
            console.warn('⚠️ No images available, using default');
            mainImage.src = 'assets/default-product.jpg';
            mainImage.alt = 'Default product image';
            thumbsContainer.innerHTML = `
            <div class="thumb-item active">
                <img src="assets/default-product.jpg" alt="Default product image">
            </div>
        `;
        }

        console.log('✅ Gallery update completed');
    }

    function updateProductInfo() {
    document.getElementById('productTitle').textContent = currentProduct.title;
    
    // Show display category (Clothes) instead of root category
    document.getElementById('productCategory').textContent = currentProduct.displayCategory || currentProduct.category;
    
    document.getElementById('productDescription').textContent = currentProduct.description;

    // Calculate discount (random for demo)
    const discount = Math.floor(Math.random() * 30) + 10;
    const originalPrice = Math.round(currentProduct.price * (1 + discount / 100));

    document.getElementById('productPrice').textContent = `₹${currentProduct.price.toLocaleString('en-IN')}`;
    document.getElementById('discountBadge').textContent = `${discount}% off`;
    document.getElementById('originalPrice').textContent = `₹${originalPrice.toLocaleString('en-IN')}`;

    // Update rating
    document.querySelector('.product-rating .rating-stars').textContent = generateStarRating(currentProduct.rating);
    document.querySelector('.product-rating .rating-value').textContent = currentProduct.rating;
}

    function updateVariants() {
        const container = document.getElementById('variantSelection');

        if (currentProduct.variants.length <= 1) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = `
            <h3>Available Variants</h3>
            <div class="variants-grid">
                ${currentProduct.variants.map((variant, index) => `
                    <div class="variant-option ${index === 0 ? 'active' : ''}" 
                         data-variant-id="${variant.id}">
                        <div class="variant-name">${variant.name || 'Variant ' + (index + 1)}</div>
                        <div class="variant-price">₹${parseFloat(variant.adjusted_price).toLocaleString('en-IN')}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add variant selection listeners
        document.querySelectorAll('.variant-option').forEach(option => {
            option.addEventListener('click', function () {
                const variantId = this.dataset.variantId;
                selectVariant(variantId);
            });
        });
    }

    function selectVariant(variantId) {
        const variant = currentProduct.variants.find(v => v.id == variantId);
        if (!variant) return;

        currentVariant = variant;

        // Update UI
        document.querySelectorAll('.variant-option').forEach(opt => opt.classList.remove('active'));
        document.querySelector(`[data-variant-id="${variantId}"]`).classList.add('active');

        // Update price
        const newPrice = parseFloat(variant.adjusted_price);
        document.getElementById('productPrice').textContent = `₹${newPrice.toLocaleString('en-IN')}`;
        document.getElementById('buyBoxPrice').textContent = `₹${newPrice.toLocaleString('en-IN')}`;

        // Update stock
        updateStockInfo(variant.stock);

        // Update images if variant has different images
        if (variant.images && variant.images.length > 0) {
            const variantImages = variant.images.map(img => img.image);
            if (JSON.stringify(variantImages) !== JSON.stringify(currentProduct.images)) {
                currentProduct.images = variantImages;
                updateGallery();
            }
        }
    }

    function updateBuyBox() {
        const stock = currentVariant ? currentVariant.stock : 0;
        const price = currentVariant ? parseFloat(currentVariant.adjusted_price) : currentProduct.price;

        document.getElementById('buyBoxPrice').textContent = `₹${price.toLocaleString('en-IN')}`;
        updateStockInfo(stock);
    }

    function updateStockInfo(stock) {
        const stockInfo = document.getElementById('stockInfo');
        const isInStock = stock > 0;

        stockInfo.innerHTML = `
            <span class="stock-badge ${isInStock ? 'in-stock' : 'out-of-stock'}">
                ${isInStock ? 'In Stock' : 'Out of Stock'}
            </span>
        `;

        // Update button states
        const addCartBtn = document.getElementById('addCartBtn');
        const buyNowBtn = document.getElementById('buyNowBtn');
        const qtyInput = document.getElementById('qtyInput');
        const qtyButtons = document.querySelectorAll('.qty-btn');

        if (isInStock) {
            addCartBtn.disabled = false;
            buyNowBtn.disabled = false;
            qtyInput.disabled = false;
            qtyButtons.forEach(btn => btn.disabled = false);
            addCartBtn.textContent = 'Add to Cart';
            buyNowBtn.textContent = 'Buy Now';
        } else {
            addCartBtn.disabled = true;
            buyNowBtn.disabled = true;
            qtyInput.disabled = true;
            qtyButtons.forEach(btn => btn.disabled = true);
            addCartBtn.textContent = 'Out of Stock';
            buyNowBtn.textContent = 'Out of Stock';
        }
    }

    function updateSpecifications() {
        const container = document.getElementById('specsContainer');
        if (!container || !currentProduct.specifications) return;

        let specsHTML = '';

        for (const [category, specifications] of Object.entries(currentProduct.specifications)) {
            specsHTML += `
                <div class="specs-category">
                    <h4>${category}</h4>
                    <table class="specs-table">
                        <tbody>
                            ${specifications.map(spec => `
                                <tr>
                                    <td>${spec.name}</td>
                                    <td>${spec.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        container.innerHTML = specsHTML;
    }

    function updateReviews() {
        // For now, using sample reviews. You can integrate with your review API later.
        currentReviews = [
            {
                id: 1,
                reviewer: "Sachin Yadav",
                rating: 5,
                title: "Excellent product!",
                text: "This product exceeded my expectations. The quality is outstanding and it works perfectly.",
                date: "2024-01-15",
                verified: true
            },
            {
                id: 2,
                reviewer: "Pradeep Tiwari",
                rating: 4,
                title: "Great value for money",
                text: "Good product with nice features. The delivery was fast and packaging was secure.",
                date: "2024-01-10",
                verified: true
            }
        ];

        const stats = calculateRatingStats(currentReviews);

        document.getElementById('averageRating').textContent = stats.average.toFixed(1);
        document.querySelector('.overall-rating .rating-stars').textContent = generateStarRating(stats.average);
        document.querySelector('.total-reviews').textContent = `${stats.total} reviews`;

        const reviewsList = document.getElementById('reviewsList');
        if (reviewsList) {
            if (currentReviews.length === 0) {
                reviewsList.innerHTML = `
                    <div class="empty-reviews">
                        <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                `;
            } else {
                reviewsList.innerHTML = currentReviews.map(review => `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <h4>${review.reviewer}</h4>
                                <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
                            </div>
                            <div class="review-rating">${generateStarRating(review.rating)}</div>
                        </div>
                        <div class="review-title">${review.title}</div>
                        <div class="review-text">${review.text}</div>
                    </div>
                `).join('');
            }
        }
    }

    function calculateRatingStats(reviews) {
        const total = reviews.length;
        const average = total > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;

        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            breakdown[review.rating]++;
        });

        return { average, total, breakdown };
    }


async function loadSimilarProducts() {
    const container = document.getElementById('similarProductsGrid');
    if (!container) {
        console.error('❌ Similar products container not found');
        return;
    }

    try {
        // Show loading state
        container.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="loading-spinner"></div>
                <p>Loading similar products...</p>
            </div>
        `;

        console.log('🔄 Fetching products for similar items...');
        console.log('🎯 Current product category info:', {
            id: currentProduct?.id,
            category_id: currentProduct?.category_id,
            categoryPath: currentProduct?.categoryPath,
            displayCategory: currentProduct?.displayCategory,
            rootCategory: currentProduct?.rootCategory
        });
        
        const response = await fetch(`${API_BASE_URL}/get/products/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const productsData = await response.json();
        console.log('📦 Raw similar products API response:', productsData);
        
        // Handle different response structures
        let allProducts = [];
        if (Array.isArray(productsData)) {
            allProducts = productsData;
        } else if (productsData && typeof productsData === 'object') {
            if (Array.isArray(productsData.products)) {
                allProducts = productsData.products;
            } else if (Array.isArray(productsData.data)) {
                allProducts = productsData.data;
            } else {
                allProducts = [productsData];
            }
        }

        console.log('🔍 Total products available:', allProducts.length);

        // STRICT CATEGORY FILTERING LOGIC
        const similarProducts = allProducts.filter(p => {
            if (!p || !p.id) {
                return false;
            }

            // Exclude current product
            if (p.id.toString() === currentProduct?.id) {
                return false;
            }

            // STRATEGY 1: Match by exact category_id (Most reliable)
            if (currentProduct?.category_id && p.category_id) {
                if (p.category_id === currentProduct.category_id) {
                    console.log(`✅ Exact category_id match: ${p.title}`);
                    return true;
                }
            }

            // STRATEGY 2: Match by category path hierarchy
            if (currentProduct?.categoryPath && p.category_path && p.category_path.length > 0) {
                const currentPath = currentProduct.categoryPath;
                const productPath = Array.isArray(p.category_path) ? p.category_path : [p.category_path];
                
                // Convert both to arrays for comparison
                const currentPathArray = currentPath.split(' › ');
                const productPathArray = productPath;
                
                // Match by root category (most broad)
                if (currentPathArray[0] && productPathArray[0] && currentPathArray[0] === productPathArray[0]) {
                    console.log(`✅ Root category match: ${p.title} (${productPathArray[0]})`);
                    return true;
                }
                
                // Match by display category (more specific)
                if (currentProduct.displayCategory && productPathArray.length >= 2) {
                    const productDisplayCategory = productPathArray[1];
                    if (currentProduct.displayCategory === productDisplayCategory) {
                        console.log(`✅ Display category match: ${p.title} (${productDisplayCategory})`);
                        return true;
                    }
                }
            }

            // STRATEGY 3: Match by category object
            if (currentProduct?.category && p.category) {
                let productCategoryName = '';
                
                if (Array.isArray(p.category)) {
                    // Extract category name from array of category objects
                    const categoryObj = p.category[0];
                    if (categoryObj && typeof categoryObj === 'object') {
                        productCategoryName = categoryObj.name || '';
                    } else if (typeof categoryObj === 'string') {
                        productCategoryName = categoryObj;
                    }
                } else if (typeof p.category === 'string') {
                    productCategoryName = p.category;
                } else if (p.category.name) {
                    productCategoryName = p.category.name;
                }
                
                if (productCategoryName && currentProduct.category === productCategoryName) {
                    console.log(`✅ Category name match: ${p.title} (${productCategoryName})`);
                    return true;
                }
            }

            // STRATEGY 4: Match by root category specifically
            if (currentProduct?.rootCategory && p.category_path && p.category_path.length > 0) {
                const productRootCategory = p.category_path[0];
                if (currentProduct.rootCategory === productRootCategory) {
                    console.log(`✅ Root category direct match: ${p.title} (${productRootCategory})`);
                    return true;
                }
            }

            console.log(`❌ No category match for: ${p.title || p.id}`);
            return false;
        }).slice(0, 4); // Limit to 4 products

        console.log('🎉 Final similar products found:', similarProducts.length);
        console.log('📋 Matching products:', similarProducts.map(p => ({
            id: p.id,
            title: p.title,
            category_id: p.category_id,
            category_path: p.category_path
        })));

        if (similarProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: #565959;">
                    <div class="empty-icon">🔍</div>
                    <h3>No Similar Products Found</h3>
                    <p>We couldn't find any other products in the same category.</p>
                    <p><small>Current category: ${currentProduct?.displayCategory || currentProduct?.category || 'Unknown'}</small></p>
                </div>
            `;
            return;
        }

        // Generate product cards
        container.innerHTML = similarProducts.map(product => {
            try {
                const productId = product.id || 'unknown';
                const productTitle = product.title || 'Untitled Product';
                
                // Get category display - use the same logic as current product
                let categoryDisplay = 'UNCATEGORIZED';
                if (product.category_path && product.category_path.length > 0) {
                    if (product.category_path.length === 1) {
                        categoryDisplay = product.category_path[0];
                    } else if (product.category_path.length >= 2) {
                        categoryDisplay = product.category_path[1]; // Show display category
                    }
                } else {
                    categoryDisplay = product.category?.[0]?.name || product.category_name || 'UNCATEGORIZED';
                }
                
                // Get price
                const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                const price = firstVariant ? 
                    parseFloat(firstVariant.adjusted_price) : 
                    parseFloat(product.base_price || product.price || 0);
                
                // Get product image
                let productImage = 'assets/default-product.jpg';
                if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
                    productImage = firstVariant.images[0].image;
                } else if (product.images && product.images.length > 0) {
                    productImage = product.images[0];
                } else if (product.image) {
                    productImage = product.image;
                }

                // Default rating
                const rating = product.rating || 4.5;
                const ratingValue = rating.toFixed(1);

                return `
                    <div class="card" data-product-id="${productId}">
                        <a href="product.html?id=${productId}" style="text-decoration: none; color: inherit;">
                            <div class="card-image">
                                <img src="${productImage}" alt="${productTitle}" 
                                     onerror="this.src='assets/default-product.jpg'">
                            </div>
                            <div class="card-content">
                                <div class="card-title">${productTitle}</div>
                                <div class="card-category">${categoryDisplay}</div>
                                <div class="card-price">₹${price.toLocaleString('en-IN')}</div>
                                <div class="card-rating">
                                    <span class="rating-stars">${generateStarRating(rating)}</span>
                                    <span class="rating-value">${ratingValue}</span>
                                </div>
                                <div class="card-actions">
                                    <button class="btn btn-outline" onclick="event.preventDefault(); addSimilarToCart('${productId}')">Add to Cart</button>
                                    <button class="btn btn-primary" onclick="event.preventDefault(); buySimilarNow('${productId}')">Buy Now</button>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            } catch (error) {
                console.error('❌ Error generating product card:', error, product);
                return `<div class="card error-card">Error loading product</div>`;
            }
        }).join('');

    } catch (error) {
        console.error('❌ Error loading similar products:', error);
        container.innerHTML = `
            <div class="error-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="error-icon">⚠️</div>
                <p>Unable to load similar products</p>
                <button class="btn btn-outline" onclick="loadSimilarProducts()">Try Again</button>
            </div>
        `;
    }
}

// Add fallback function
function loadAllProductsAsFallback() {
    console.log('🔄 Loading all products as fallback...');
    loadSimilarProducts(); // This will now show products even without category matches
}




function updateBreadcrumb() {
    const breadcrumbElement = document.getElementById('categoryBreadcrumb');
    const productBreadcrumbElement = document.getElementById('productBreadcrumb');
    
    if (breadcrumbElement && productBreadcrumbElement) {
        // Get the category path array
        const categoryPath = currentProduct.categoryPath ? 
            currentProduct.categoryPath.split(' › ') : 
            [currentProduct.displayCategory || currentProduct.category];
        
        // Create clickable breadcrumb items
        breadcrumbElement.innerHTML = categoryPath
            .map((category, index) => {
                if (index === categoryPath.length - 1) {
                    // Last item - not clickable, current category
                    return `<span class="breadcrumb-current">${category}</span>`;
                } else {
                    // Clickable breadcrumb items
                    return `<span class="breadcrumb-item" data-category="${category}" data-level="${index}">${category}</span> › `;
                }
            })
            .join('');
        
        productBreadcrumbElement.textContent = currentProduct.title;
        
        // Add click event listeners to breadcrumb items
        addBreadcrumbClickListeners();
    }
}

function addBreadcrumbClickListeners() {
    const breadcrumbItems = document.querySelectorAll('.breadcrumb-item');
    
    breadcrumbItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.dataset.category;
            const level = parseInt(this.dataset.level);
            
            console.log(`🔄 Breadcrumb clicked: ${category} at level ${level}`);
            
            // Filter products based on the clicked category level
            filterProductsByBreadcrumb(category, level);
        });
    });
}

function filterProductsByBreadcrumb(clickedCategory, level) {
    console.log(`🔍 Filtering products for category: ${clickedCategory} at level: ${level}`);
    
    // Store the current filter state
    currentBreadcrumbFilter = {
        category: clickedCategory,
        level: level
    };
    
    // Show loading state
    showBreadcrumbLoading();
    
    // Simulate API call or filter existing products
    setTimeout(() => {
        loadProductsByCategory(clickedCategory, level);
    }, 500);
}

function showBreadcrumbLoading() {
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="loading-spinner"></div>
                <p>Loading ${currentBreadcrumbFilter.category} products...</p>
            </div>
        `;
    }
}


// Helper functions for similar product actions
function addSimilarToCart(productId) {
    addToCart(productId, 1);
    
    // Show feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '✓ Added';
    button.style.background = '#10b981';
    button.style.color = 'white';
    button.style.borderColor = '#10b981';

    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        button.style.color = '';
        button.style.borderColor = '';
    }, 2000);
}

function buySimilarNow(productId) {
    const directCart = {};
    directCart[productId] = 1;
    
    localStorage.setItem('checkout_cart', JSON.stringify(directCart));
    localStorage.setItem('direct_checkout', 'true');
    window.location.href = 'checkout.html';
}

// Update your generateStarRating function to handle similar products
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '★';
    if (hasHalfStar) stars += '½';
    for (let i = 0; i < emptyStars; i++) stars += '☆';

    return stars;
}








    function initializeEventListeners() {
        // Quantity controls
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const qtyInput = document.getElementById('qtyInput');

        decreaseBtn.addEventListener('click', () => {
            const current = parseInt(qtyInput.value) || 1;
            if (current > 1) {
                qtyInput.value = current - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            const current = parseInt(qtyInput.value) || 1;
            if (current < 10) {
                qtyInput.value = current + 1;
            }
        });

        qtyInput.addEventListener('change', function () {
            let value = parseInt(this.value) || 1;
            if (value < 1) value = 1;
            if (value > 10) value = 10;
            this.value = value;
        });

        // Add to cart
        document.getElementById('addCartBtn').addEventListener('click', addToCartHandler);

        // Buy now
        document.getElementById('buyNowBtn').addEventListener('click', buyNowHandler);
    }
    

    function addToCartHandler() {
        if (!currentProduct || !currentVariant) return;

        const qty = Number(document.getElementById('qtyInput').value) || 1;
        const productId = currentVariant.id || currentProduct.id;

        addToCart(productId.toString(), qty);

        const button = document.getElementById('addCartBtn');
        const originalText = button.textContent;
        button.textContent = '✓ Added to Cart';
        button.style.background = '#10b981';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }



// Update the buyNowHandler in product.js
function buyNowHandler() {
    if (!currentProduct || !currentVariant) return;

    const qty = Number(document.getElementById('qtyInput').value) || 1;
    const productId = currentVariant.id || currentProduct.id;
    const variant = currentVariant;

    // Create DIRECT PURCHASE data (completely separate from cart)
    const directPurchase = {
        type: 'direct_purchase',
        items: {
            [productId.toString()]: qty
        },
        productDetails: {
            [productId.toString()]: {
                id: productId.toString(),
                title: currentProduct.title,
                price: variant.adjusted_price ? parseFloat(variant.adjusted_price) : currentProduct.price,
                img: currentProduct.images && currentProduct.images.length > 0 ? currentProduct.images[0] : 'assets/default-product.jpg',
                category: currentProduct.category,
                variantName: variant.name || 'Default',
                stock: variant.stock || 0,
                description: currentProduct.description
            }
        },
        quantity: qty,
        timestamp: new Date().toISOString(),
        source: 'direct_buy_now'
    };

    // Save DIRECT PURCHASE data (separate from cart)
    localStorage.setItem('direct_purchase', JSON.stringify(directPurchase));
    
    // CLEAR any existing cart data to ensure separation
    localStorage.removeItem('checkout_cart');
    localStorage.removeItem('checkout_product_details');
    
    console.log('🚀 Direct Purchase data saved:', directPurchase);

    // Check if user is authenticated
    if (!authManager.isAuthenticated()) {
        // Show login modal or redirect to login for guest users
        showLoginModalForCheckout();
    } else {
        // Redirect directly to checkout for authenticated users
        window.location.href = 'checkout.html';
    }
}

function showLoginModalForCheckout() {
    // Create a modal to inform user about login requirement
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Login Required</h3>
            <p>You need to login to proceed with checkout. Guest users can only make online payments.</p>
            <div class="modal-actions">
                <button class="btn btn-outline" id="continueAsGuest">Continue as Guest (Online Payment Only)</button>
                <button class="btn btn-primary" id="goToLogin">Login / Sign Up</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.querySelector('.modal-content').style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        text-align: center;
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners for modal buttons
    modal.querySelector('#continueAsGuest').addEventListener('click', () => {
        modal.remove();
        window.location.href = 'checkout.html';
    });
    
    modal.querySelector('#goToLogin').addEventListener('click', () => {
        modal.remove();
        window.location.href = 'login/signIn.html?redirect=checkout';
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}







    function showLoadingState() {
    console.log('🔄 Showing loading state...');
    // Don't replace the entire container, just show a loading overlay
    const mainSection = document.getElementById('productContainer');
    if (mainSection) {
        // Create loading overlay that doesn't remove existing elements
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading product details...</p>
            </div>
        `;
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
        `;
        
        // Remove any existing loading overlay
        const existingOverlay = mainSection.querySelector('.loading-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        mainSection.appendChild(loadingOverlay);
    }
}

function hideLoadingState() {
    console.log('🔄 Hiding loading state...');
    const mainSection = document.getElementById('productContainer');
    if (mainSection) {
        const loadingOverlay = mainSection.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
            console.log('✅ Loading state hidden');
        }
    }
}


    function showErrorState(message) {
    console.log('❌ Showing error state:', message);
    // Remove loading overlay first
    const mainSection = document.getElementById('productContainer');
    if (mainSection) {
        const loadingOverlay = mainSection.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
        
        // Replace content with error state
        mainSection.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Unable to Load Product</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.location.href='index.html'">Back to Home</button>
            </div>
        `;
    }
}

    // Initialize the product page
    document.addEventListener('DOMContentLoaded', initializeProductPage);
})();