(function () {
    const API_BASE_URL = 'http://localhost:8000/api/product';
    let allProducts = [];
    let filteredProducts = [];
    
    // Initialize search page
    async function initSearch() {
        updateCartCount();
        document.getElementById('year').textContent = new Date().getFullYear();
        
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        
        // Set search input value
        document.getElementById('searchInput').value = query;
        
        try {
            // Show loading state
            showLoadingState();
            
            // Get all products from API
            await fetchAllProducts();
            
            // Filter products based on search query
            if (query) {
                filteredProducts = searchProducts(query, allProducts);
            } else {
                filteredProducts = [...allProducts];
            }
            
            // Update UI
            updateSearchInfo(query);
            renderCategories();
            renderProducts();
            setupEventListeners();
            
        } catch (error) {
            console.error('❌ Error initializing search:', error);
            showErrorState('Failed to load products. Please try again.');
        } finally {
            hideLoadingState();
        }
    }
    
    // Fetch all products from API
    async function fetchAllProducts() {
        try {
            console.log('🔄 Fetching all products from API...');
            
            const response = await fetch(`${API_BASE_URL}/get/products/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const productsData = await response.json();
            console.log('📦 Raw API response:', productsData);
            
            // Handle different response structures
            let productsArray = [];
            if (Array.isArray(productsData)) {
                productsArray = productsData;
            } else if (productsData && typeof productsData === 'object') {
                if (Array.isArray(productsData.products)) {
                    productsArray = productsData.products;
                } else if (Array.isArray(productsData.data)) {
                    productsArray = productsData.data;
                } else {
                    productsArray = [productsData];
                }
            }
            
            // Transform API data to match our frontend structure
            allProducts = transformProductsData(productsArray);
            console.log('✅ Transformed products:', allProducts.length);
            
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            throw error;
        }
    }
    
    // Transform API product data to frontend format
    function transformProductsData(products) {
        return products.map(product => {
            if (!product) return null;
            
            // Handle both array and single object responses
            const productData = Array.isArray(product) ? product[0] : product;
            
            if (!productData) return null;
            
            // Get the first variant for pricing and images
            const firstVariant = productData.variants && productData.variants.length > 0 
                ? productData.variants[0] 
                : null;
            
            // Get product image
            let productImage = 'assets/default-product.jpg';
            if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
                productImage = firstVariant.images[0].image;
            } else if (productData.images && productData.images.length > 0) {
                productImage = productData.images[0];
            }
            
            // Get category information
            let categoryName = 'Uncategorized';
            let displayCategory = 'Uncategorized';
            
            if (productData.category_path && productData.category_path.length > 0) {
                // Use the display category logic (middle category)
                if (productData.category_path.length === 1) {
                    displayCategory = productData.category_path[0];
                } else if (productData.category_path.length >= 2) {
                    displayCategory = productData.category_path[1];
                }
                categoryName = displayCategory;
            } else if (productData.category && productData.category.length > 0) {
                const categoryObj = productData.category[0];
                if (typeof categoryObj === 'object' && categoryObj.name) {
                    categoryName = categoryObj.name;
                    displayCategory = categoryObj.name;
                }
            }
            
            // Get price
            const price = firstVariant ? 
                parseFloat(firstVariant.adjusted_price) : 
                parseFloat(productData.base_price || 0);
            
            return {
                id: productData.id.toString(),
                title: productData.title,
                description: productData.description,
                price: price,
                rating: productData.rating || 4.5, // Default rating
                img: productImage,
                category: displayCategory, // Use display category for filtering
                displayCategory: displayCategory,
                rootCategory: productData.category_path ? productData.category_path[0] : categoryName,
                categoryPath: productData.category_path ? productData.category_path.join(' › ') : categoryName,
                category_id: productData.category_id,
                variants: productData.variants || [],
                specifications: productData.specifications || {}
            };
        }).filter(product => product !== null); // Remove null products
    }
    
    // Search products by name, category, or description
    function searchProducts(query, products) {
        if (!query.trim()) return products;
        
        const searchTerm = query.toLowerCase().trim();
        console.log(`🔍 Searching for: "${searchTerm}" in ${products.length} products`);
        
        return products.filter(product => {
            if (!product) return false;
            
            // Search in title
            const titleMatch = product.title && 
                product.title.toLowerCase().includes(searchTerm);
            
            // Search in category
            const categoryMatch = product.category && 
                product.category.toLowerCase().includes(searchTerm);
            
            // Search in display category
            const displayCategoryMatch = product.displayCategory && 
                product.displayCategory.toLowerCase().includes(searchTerm);
            
            // Search in root category
            const rootCategoryMatch = product.rootCategory && 
                product.rootCategory.toLowerCase().includes(searchTerm);
            
            // Search in description
            const descriptionMatch = product.description && 
                product.description.toLowerCase().includes(searchTerm);
            
            // Search in category path
            const categoryPathMatch = product.categoryPath && 
                product.categoryPath.toLowerCase().includes(searchTerm);
            
            const isMatch = titleMatch || categoryMatch || displayCategoryMatch || 
                          rootCategoryMatch || descriptionMatch || categoryPathMatch;
            
            if (isMatch) {
                console.log(`✅ Match found: ${product.title} (Category: ${product.category})`);
            }
            
            return isMatch;
        });
    }
    
    // Update search information
    function updateSearchInfo(query) {
        const resultsInfo = document.getElementById('resultsInfo');
        const resultsCount = document.getElementById('resultsCount');
        
        if (query) {
            resultsInfo.innerHTML = `Showing results for <strong>"${query}"</strong>`;
        } else {
            resultsInfo.innerHTML = '<strong>All Products</strong>';
        }
        
        resultsCount.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`;
    }
    
    // Render category filters
    function renderCategories() {
        // Get unique categories from ALL products (not just filtered)
        const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
        const container = document.getElementById('categoryFilters');
        
        console.log('📊 Available categories:', categories);
        
        if (categories.length === 0) {
            container.innerHTML = '<p class="no-categories">No categories available</p>';
            return;
        }
        
        container.innerHTML = categories.map(category => `
            <label class="filter-option">
                <input type="checkbox" value="${category}"> ${category}
            </label>
        `).join('');
    }
    
    // Render products grid
    function renderProducts() {
        const container = document.getElementById('resultsGrid');
        const noResults = document.getElementById('noResults');
        
        console.log(`🎨 Rendering ${filteredProducts.length} products`);
        
        if (filteredProducts.length === 0) {
            container.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        noResults.style.display = 'none';
        
        container.innerHTML = filteredProducts.map(product => {
            // Generate random review count for demo
            const reviewCount = Math.floor(Math.random() * 1000) + 100;
            
            return `
            <div class="search-product-card">
                <a href="product.html?id=${product.id}" style="text-decoration:none;color:inherit">
                    <img src="${product.img}" alt="${product.title}" class="search-product-image" 
                        onerror="this.src='assets/default-product.jpg'">
                    
                    <div class="search-product-info">
                        <h3 class="search-product-title">${product.title}</h3>
                        <div class="search-product-category">${product.category}</div>
                        
                        <div class="search-product-rating">
                            <span class="rating-stars">${generateStarRating(product.rating)}</span>
                            <span class="rating-value">${product.rating}</span>
                            <span class="rating-count">(${reviewCount})</span>
                        </div>
                        
                        <div class="search-product-price">₹${product.price.toLocaleString('en-IN')}</div>
                        <div class="delivery-info">FREE delivery • Get it by tomorrow</div>
                    </div>
                </a>
                
                <div class="search-product-actions">
                    <button class="btn btn-secondary" onclick="addToCart('${product.id}', 1); showAddToCartFeedback(this)">
                        Add to Cart
                    </button>
                    <a class="btn btn-primary" href="product.html?id=${product.id}">
                        Buy Now
                    </a>
                </div>
            </div>
            `;
        }).join('');
    }
    
    // Generate star rating HTML
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
    
    // Setup event listeners for filters and sorting
    function setupEventListeners() {
        // Category filter
        document.querySelectorAll('#categoryFilters input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
        
        // Price filter
        document.getElementById('applyPriceFilter').addEventListener('click', applyFilters);
        
        // Rating filter
        document.querySelectorAll('.filter-section:nth-child(3) input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
        
        // Sort options
        document.getElementById('sortSelect').addEventListener('change', applySorting);
        
        // Search form
        document.getElementById('searchForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const query = document.getElementById('searchInput').value.trim();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            } else {
                window.location.href = `search.html`;
            }
        });
        
        // Enter key in search input
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('searchForm').dispatchEvent(new Event('submit'));
            }
        });
    }
    
    // Apply all filters
    function applyFilters() {
        // Start with all products when applying filters (not just current filtered)
        let workingProducts = [...allProducts];
        
        const query = document.getElementById('searchInput').value;
        if (query) {
            workingProducts = searchProducts(query, workingProducts);
        }
        
        // Category filter
        const selectedCategories = Array.from(
            document.querySelectorAll('#categoryFilters input[type="checkbox"]:checked')
        ).map(cb => cb.value);
        
        if (selectedCategories.length > 0) {
            workingProducts = workingProducts.filter(product => 
                selectedCategories.includes(product.category)
            );
        }
        
        // Price filter
        const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        
        if (minPrice > 0 || maxPrice < Infinity) {
            workingProducts = workingProducts.filter(product => 
                product.price >= minPrice && product.price <= maxPrice
            );
        }
        
        // Rating filter
        const selectedRatings = Array.from(
            document.querySelectorAll('.filter-section:nth-child(3) input[type="checkbox"]:checked')
        ).map(cb => parseFloat(cb.value));
        
        if (selectedRatings.length > 0) {
            const minRating = Math.min(...selectedRatings);
            workingProducts = workingProducts.filter(product => 
                product.rating >= minRating
            );
        }
        
        filteredProducts = workingProducts;
        
        // Apply current sorting
        applySorting();
        
        // Update UI
        updateSearchInfo(query);
        renderProducts();
    }
    
    // Apply sorting
    function applySorting() {
        const sortBy = document.getElementById('sortSelect').value;
        
        switch (sortBy) {
            case 'price-low':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'newest':
                // Since we don't have dates, sort by ID (newer products have higher IDs)
                filteredProducts.sort((a, b) => b.id - a.id);
                break;
            default: // relevance
                // For relevance, keep search score order (already sorted by relevance)
                break;
        }
        
        renderProducts();
    }
    
    // Loading state functions
    function showLoadingState() {
        const container = document.getElementById('resultsGrid');
        container.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <div class="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        `;
    }
    
    function hideLoadingState() {
        // Loading state is cleared when products are rendered
    }
    
    function showErrorState(message) {
        const container = document.getElementById('resultsGrid');
        const noResults = document.getElementById('noResults');
        
        container.style.display = 'none';
        noResults.style.display = 'block';
        noResults.innerHTML = `
            <div class="error-icon">⚠️</div>
            <h3>Unable to Load Products</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
        `;
    }
    
    // Show feedback when adding to cart
    window.showAddToCartFeedback = function(button) {
        const originalText = button.textContent;
        button.textContent = 'Added ✓';
        button.style.background = '#10b981';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.disabled = false;
        }, 2000);
    };
    
    // Initialize the search page
    document.addEventListener('DOMContentLoaded', initSearch);
})();