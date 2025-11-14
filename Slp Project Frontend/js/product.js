// (function () {
//     function getQueryParam(name) {
//         return new URLSearchParams(location.search).get(name);
//     }
//     const id = getQueryParam('id') || 'p1';
//     const product = findProductById(id) || SAMPLE_PRODUCTS[0];

//     // Product images mapping - Add your local images here
//     const productImages = {
//         'p1': [
//             'assets/products/headphone.jpg',
//             'assets/products/headphone_angle1.jpg',
//             'assets/products/headphone_angle2.jpg',
//             'assets/products/headphone_box.jpg'
//         ],
//         'p2': [
//             'assets/products/smartwatch.jpg',
//             'assets/products/smartwatch_angle1.jpg',
//             'assets/products/smartwatch_angle2.jpg',
//             'assets/products/smartwatch_box.jpg'
//         ],
//         'p3': [
//             'assets/products/steel water bottle.jpg',
//             'assets/products/bottle_angle1.jpg',
//             'assets/products/bottle_angle2.jpg'
//         ],
//         'p4': [
//             'assets/products/gaming keyboard.jpg',
//             'assets/products/keyboard_angle1.jpg',
//             'assets/products/keyboard_angle2.jpg'
//         ],
//         'p5': [
//             'assets/products/4k action camera.jpg',
//             'assets/products/camera_angle1.jpg',
//             'assets/products/camera_angle2.jpg'
//         ],
//         'p6': [
//             'assets/products/leather wallet.jpg',
//             'assets/products/wallet_angle1.jpg',
//             'assets/products/wallet_open.jpg'
//         ],
//         'p7': [
//             'assets/products/led_Desk_Lamp.jpg',
//             'assets/products/lamp_angle1.jpg',
//             'assets/products/lamp_on.jpg'
//         ],
//         'p8': [
//             'assets/products/wireless_charger_pad.jpg',
//             'assets/products/charger_angle1.jpg',
//             'assets/products/charger_in_use.jpg'
//         ]
//     };

//     // Get images for current product or use default
//     const images = productImages[product.id] || [product.img, product.img, product.img];

//     // Build product detail
//     const detail = document.getElementById('productDetail');
//     if (detail) {
//         detail.innerHTML = `
//         <div class="card" style="padding:24px">
//             <div class="gallery">
//                 <div class="gallery-main">
//                     <img id="mainImage" src="${images[0]}" alt="${product.title}">
//                     <div class="gallery-thumbs">
//                         ${images.map((img, index) => `
//                             <img src="${img}" class="${index === 0 ? 'active' : ''}" data-src="${img}">
//                         `).join('')}
//                     </div>
//                 </div>
//                 <div class="product-info">
//                     <h1>${product.title}</h1>
//                     <div class="product-rating">
//                         <span class="rating-stars">${generateStarRating(product.rating)}</span>
//                         <span class="rating-value">${product.rating} ★</span>
//                         <span class="rating-count">(1,234 ratings)</span>
//                     </div>
//                     <div class="product-category muted">${product.category}</div>
                    
//                     <div class="price-section">
//                         <h2 class="product-price">₹${product.price.toLocaleString('en-IN')}</h2>
//                         <div class="delivery-info">Free delivery — Available</div>
//                     </div>
                    
//                     <div class="product-description">
//                         <h3>Description</h3>
//                         <p>${product.desc}</p>
//                     </div>
                    
//                     <div class="product-specifications">
//                         <h3>Specifications</h3>
//                         <div class="specs-grid">
//                             <div class="spec-item">
//                                 <span class="spec-label">Brand</span>
//                                 <span class="spec-value">ShopWaveX</span>
//                             </div>
//                             <div class="spec-item">
//                                 <span class="spec-label">Model</span>
//                                 <span class="spec-value">${product.id.toUpperCase()}</span>
//                             </div>
//                             <div class="spec-item">
//                                 <span class="spec-label">Warranty</span>
//                                 <span class="spec-value">1 Year</span>
//                             </div>
//                             <div class="spec-item">
//                                 <span class="spec-label">In Stock</span>
//                                 <span class="spec-value">Yes</span>
//                             </div>
//                         </div>
//                     </div>
                    
//                     <div class="customer-reviews">
//                         <h3>Customer Reviews</h3>
//                         <div class="reviews-summary">
//                             <div class="overall-rating">
//                                 <div class="average-rating">${product.rating}</div>
//                                 <div class="rating-stars">${generateStarRating(product.rating)}</div>
//                                 <div class="total-reviews">1,234 reviews</div>
//                             </div>
//                             <div class="rating-breakdown">
//                                 <div class="rating-bar">
//                                     <span>5 ★</span>
//                                     <div class="bar"><div class="fill" style="width: 70%"></div></div>
//                                     <span>70%</span>
//                                 </div>
//                                 <div class="rating-bar">
//                                     <span>4 ★</span>
//                                     <div class="bar"><div class="fill" style="width: 20%"></div></div>
//                                     <span>20%</span>
//                                 </div>
//                                 <div class="rating-bar">
//                                     <span>3 ★</span>
//                                     <div class="bar"><div class="fill" style="width: 5%"></div></div>
//                                     <span>5%</span>
//                                 </div>
//                                 <div class="rating-bar">
//                                     <span>2 ★</span>
//                                     <div class="bar"><div class="fill" style="width: 3%"></div></div>
//                                     <span>3%</span>
//                                 </div>
//                                 <div class="rating-bar">
//                                     <span>1 ★</span>
//                                     <div class="bar"><div class="fill" style="width: 2%"></div></div>
//                                     <span>2%</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
        
//         // Thumbnail click functionality
//         detail.querySelectorAll('.gallery-thumbs img').forEach(img => {
//             img.addEventListener('click', (e) => {
//                 document.querySelectorAll('.gallery-thumbs img').forEach(i => i.classList.remove('active'));
//                 e.currentTarget.classList.add('active');
//                 document.getElementById('mainImage').src = e.currentTarget.dataset.src || e.currentTarget.src;
//             });
//         });
//     }

//     // Buy box
//     const buyBox = document.getElementById('buyBox');
//     if (buyBox) {
//         buyBox.innerHTML = `
//         <div class="buy-box-content">
//             <div class="price-section">
//                 <div class="muted">Price</div>
//                 <div class="price">₹${product.price.toLocaleString('en-IN')}</div>
//                 <div class="delivery-info">
//                     <span class="free-delivery">FREE delivery</span>
//                     <div class="delivery-date">Get it by Tomorrow</div>
//                 </div>
//             </div>
            
//             <div class="stock-info">In Stock</div>
            
//             <div class="qty">
//                 <label>Quantity:</label>
//                 <input id="qtyInput" type="number" min="1" max="10" value="1" />
//             </div>
            
//             <div class="action-buttons">
//                 <button id="addCartBtn" class="btn btn-secondary">Add to Cart</button>
//                 <button id="buyNowBtn" class="btn btn-primary">Buy Now</button>
//             </div>
            
//             <div class="security-info">
//                 <div class="secure-payment">🔒 Secure transaction</div>
//                 <div class="return-policy">✅ 30-day return policy</div>
//             </div>
//         </div>
//     `;
        
//         // Add to Cart button functionality
//         document.getElementById('addCartBtn').addEventListener('click', () => {
//             const qty = Number(document.getElementById('qtyInput').value) || 1;
//             addToCart(product.id, qty);
//             document.getElementById('addCartBtn').textContent = 'Added to Cart ✓';
//             setTimeout(() => {
//                 document.getElementById('addCartBtn').textContent = 'Add to Cart';
//             }, 2000);
//         });
        
//         // Buy Now button functionality - Direct checkout
//         document.getElementById('buyNowBtn').addEventListener('click', () => {
//             const qty = Number(document.getElementById('qtyInput').value) || 1;
            
//             // Create a cart with only this product for direct checkout
//             const directCart = {};
//             directCart[product.id] = qty;
            
//             // Save to localStorage for checkout page
//             localStorage.setItem('checkout_cart', JSON.stringify(directCart));
//             localStorage.setItem('direct_checkout', 'true'); // Flag for direct checkout
            
//             // Redirect directly to checkout
//             window.location.href = 'checkout.html';
//         });
//     }

//     // Helper function to generate star rating HTML
//     function generateStarRating(rating) {
//         const fullStars = Math.floor(rating);
//         const halfStar = rating % 1 >= 0.5;
//         const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
//         let stars = '';
//         for (let i = 0; i < fullStars; i++) stars += '★';
//         if (halfStar) stars += '½';
//         for (let i = 0; i < emptyStars; i++) stars += '☆';
        
//         return stars;
//     }
// })();



















// Modern Product Page with Real API Integration
(function () {
    const API_BASE_URL = 'http://localhost:8000/api/product';
    let currentProduct = null;
    let currentVariant = null;
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
            
            const response = await fetch(`${API_BASE_URL}/get/product/${productId}/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const productData = await response.json();
            const product = Array.isArray(productData) ? productData[0] : productData;
            
            if (!product) {
                throw new Error('Product not found');
            }
            
            return product;
        } catch (error) {
            console.error('❌ Error fetching product details:', error);
            showErrorState('Failed to load product details. Please try again later.');
            return null;
        }
    }

    function transformProductData(backendProduct) {
        if (!backendProduct) return null;

        // Get the first variant for initial display
        const firstVariant = backendProduct.variants && backendProduct.variants.length > 0 
            ? backendProduct.variants[0] 
            : null;

        // Get images
        let productImages = ['assets/default-product.jpg'];
        if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
            productImages = firstVariant.images.map(img => img.image);
        }

        // Get category name
        const categoryName = backendProduct.category?.[0]?.name || 'Uncategorized';

        return {
            id: backendProduct.id.toString(),
            title: backendProduct.title,
            description: backendProduct.description,
            basePrice: parseFloat(backendProduct.base_price),
            price: parseFloat(firstVariant?.adjusted_price || backendProduct.base_price),
            rating: 4.5,
            images: productImages,
            category: categoryName,
            category_id: backendProduct.category_id,
            variants: backendProduct.variants || [],
            specifications: generateSpecifications(backendProduct, firstVariant)
        };
    }

    function generateSpecifications(product, variant) {
        const specs = {
            "General": [
                { name: "Product Name", value: product.title },
                { name: "Brand", value: "ShopwaveX" },
                { name: "Model", value: `SWX-${product.id}` },
                { name: "Category", value: product.category },
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
            const backendProduct = await fetchProductDetails(productId);
            
            if (!backendProduct) {
                return;
            }

            currentProduct = transformProductData(backendProduct);
            
            if (!currentProduct) {
                showErrorState('Failed to process product data');
                return;
            }

            // Set first variant as current
            if (currentProduct.variants.length > 0) {
                currentVariant = currentProduct.variants[0];
            }

            updateProductDisplay();
            initializeEventListeners();
            
        } catch (error) {
            console.error('❌ Error initializing product page:', error);
            showErrorState('Failed to load product page');
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
        document.getElementById('categoryBreadcrumb').textContent = currentProduct.category;
        document.getElementById('productBreadcrumb').textContent = currentProduct.title;
    }

    function updateGallery() {
        const mainImage = document.getElementById('mainImage');
        const thumbsContainer = document.getElementById('galleryThumbs');

        if (currentProduct.images.length > 0) {
            mainImage.src = currentProduct.images[0];
            mainImage.alt = currentProduct.title;

            thumbsContainer.innerHTML = currentProduct.images.map((img, index) => `
                <div class="thumb-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <img src="${img}" alt="Thumbnail ${index + 1}" 
                         onerror="this.src='assets/default-product.jpg'">
                </div>
            `).join('');

            // Add thumbnail click listeners
            document.querySelectorAll('.thumb-item').forEach(thumb => {
                thumb.addEventListener('click', function() {
                    const index = this.dataset.index;
                    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    mainImage.src = currentProduct.images[index];
                });
            });
        }
    }

    function updateProductInfo() {
        document.getElementById('productTitle').textContent = currentProduct.title;
        document.getElementById('productCategory').textContent = currentProduct.category;
        document.getElementById('productDescription').textContent = currentProduct.description;

        // Calculate discount (random for demo)
        const discount = Math.floor(Math.random() * 30) + 10;
        const originalPrice = Math.round(currentProduct.price * (1 + discount/100));

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
            option.addEventListener('click', function() {
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
                reviewer: "John Doe",
                rating: 5,
                title: "Excellent product!",
                text: "This product exceeded my expectations. The quality is outstanding and it works perfectly.",
                date: "2024-01-15",
                verified: true
            },
            {
                id: 2,
                reviewer: "Sarah Smith",
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
        
        const breakdown = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
        reviews.forEach(review => {
            breakdown[review.rating]++;
        });
        
        return { average, total, breakdown };
    }


    // Enhanced fetchProductDetails with better error handling
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
        
        // Handle both array and single object responses
        const product = Array.isArray(productData) ? productData[0] : productData;
        
        if (!product) {
            throw new Error('Product not found in response');
        }
        
        console.log('✅ Product data received:', product);
        return product;
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



    async function loadSimilarProducts() {
        const container = document.getElementById('similarProductsGrid');
        if (!container) return;

        try {
            const response = await fetch(`${API_BASE_URL}/get/products/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const productsData = await response.json();
            const allProducts = Array.isArray(productsData) ? productsData : [productsData];
            
            // Filter similar products
            const similarProducts = allProducts
                .filter(p => p.category_id === currentProduct.category_id && p.id != currentProduct.id)
                .slice(0, 4);

            if (similarProducts.length === 0) {
                container.innerHTML = '<p class="empty-state">No similar products found.</p>';
                return;
            }

            container.innerHTML = similarProducts.map(product => {
                const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                const productImage = firstVariant && firstVariant.images && firstVariant.images.length > 0 
                    ? firstVariant.images[0].image 
                    : 'assets/default-product.jpg';

                return `
                    <div class="card">
                        <a href="product.html?id=${product.id}" style="text-decoration:none;color:inherit">
                            <img loading="lazy" src="${productImage}" alt="${product.title}" 
                                 onerror="this.src='assets/default-product.jpg'">
                            <div class="card-content">
                                <div class="card-title">${product.title}</div>
                                <div class="card-category">${product.category}</div>
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

        } catch (error) {
            console.error('❌ Error loading similar products:', error);
            container.innerHTML = '<p class="empty-state">Unable to load similar products.</p>';
        }
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

        qtyInput.addEventListener('change', function() {
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

    function buyNowHandler() {
        if (!currentProduct || !currentVariant) return;

        const qty = Number(document.getElementById('qtyInput').value) || 1;
        const productId = currentVariant.id || currentProduct.id;
        
        // Create a cart with only this product for direct checkout
        const directCart = {};
        directCart[productId.toString()] = qty;
        
        // Save to localStorage for checkout page
        localStorage.setItem('checkout_cart', JSON.stringify(directCart));
        localStorage.setItem('direct_checkout', 'true');
        
        // Redirect directly to checkout
        window.location.href = 'checkout.html';
    }

    function showLoadingState() {
        const mainSection = document.querySelector('.product-main-section');
        if (mainSection) {
            mainSection.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading product details...</p>
                </div>
            `;
        }
    }

    function showErrorState(message) {
        const mainSection = document.querySelector('.product-main-section');
        if (mainSection) {
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


