(function () {
    let allProducts = [];
    let filteredProducts = [];
    
    // Initialize search page
    function initSearch() {
        updateCartCount();
        document.getElementById('year').textContent = new Date().getFullYear();
        
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        
        // Set search input value
        document.getElementById('searchInput').value = query;
        
        // Get all products and filter
        allProducts = searchProducts(query);
        filteredProducts = [...allProducts];
        
        // Update UI
        updateSearchInfo(query);
        renderCategories();
        renderProducts();
        setupEventListeners();
    }
    
    // Update search information
    function updateSearchInfo(query) {
        const resultsInfo = document.getElementById('resultsInfo');
        const resultsCount = document.getElementById('resultsCount');
        
        if (query) {
            resultsInfo.textContent = `Results for "${query}"`;
            resultsInfo.innerHTML = `Showing results for <strong>"${query}"</strong>`;
        } else {
            resultsInfo.textContent = 'Showing all products';
            resultsInfo.innerHTML = '<strong>All Products</strong>';
        }
        
        resultsCount.textContent = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`;
    }
    
    // Render category filters
    function renderCategories() {
        const categories = [...new Set(allProducts.map(p => p.category))];
        const container = document.getElementById('categoryFilters');
        
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
        
        if (filteredProducts.length === 0) {
            container.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }
        
        container.style.display = 'grid';
        noResults.style.display = 'none';
        
        container.innerHTML = filteredProducts.map(product => `
            <div class="search-product-card">
                <a href="product.html?id=${product.id}" style="text-decoration:none;color:inherit">
                    <img src="${product.img}" alt="${product.title}" class="search-product-image" 
                        onerror="this.src='https://via.placeholder.com/280x200?text=Product+Image'">
                    
                    <div class="search-product-info">
                        <h3 class="search-product-title">${product.title}</h3>
                        <div class="search-product-category">${product.category}</div>
                        
                        <div class="search-product-rating">
                            <span class="rating-stars">${generateStarRating(product.rating)}</span>
                            <span class="rating-value">${product.rating}</span>
                            <span class="rating-count">(${Math.floor(Math.random() * 1000) + 100})</span>
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
        `).join('');
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
            const query = document.getElementById('searchInput').value;
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        });
    }
    
    // Apply all filters
    function applyFilters() {
        filteredProducts = [...allProducts];
        
        // Category filter
        const selectedCategories = Array.from(
            document.querySelectorAll('#categoryFilters input[type="checkbox"]:checked')
        ).map(cb => cb.value);
        
        if (selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
                selectedCategories.includes(product.category)
            );
        }
        
        // Price filter
        const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
        const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        
        filteredProducts = filteredProducts.filter(product => 
            product.price >= minPrice && product.price <= maxPrice
        );
        
        // Rating filter
        const selectedRatings = Array.from(
            document.querySelectorAll('.filter-section:nth-child(3) input[type="checkbox"]:checked')
        ).map(cb => parseFloat(cb.value));
        
        if (selectedRatings.length > 0) {
            const minRating = Math.min(...selectedRatings);
            filteredProducts = filteredProducts.filter(product => 
                product.rating >= minRating
            );
        }
        
        // Apply current sorting
        applySorting();
        
        // Update UI
        updateSearchInfo(document.getElementById('searchInput').value);
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
                // Since we don't have dates, randomize for demo
                filteredProducts.sort(() => Math.random() - 0.5);
                break;
            default: // relevance
                // Keep original order for relevance
                break;
        }
        
        renderProducts();
    }
    
    // Show feedback when adding to cart
    window.showAddToCartFeedback = function(button) {
        const originalText = button.textContent;
        button.textContent = 'Added ✓';
        button.style.background = '#10b981';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    };
    
    // Initialize the search page
    initSearch();
})();