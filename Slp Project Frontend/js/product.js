(function () {
    function getQueryParam(name) {
        return new URLSearchParams(location.search).get(name);
    }
    const id = getQueryParam('id') || 'p1';
    const product = findProductById(id) || SAMPLE_PRODUCTS[0];

    // Product images mapping - Add your local images here
    const productImages = {
        'p1': [
            'assets/products/headphone.jpg',
            'assets/products/headphone_angle1.jpg',
            'assets/products/headphone_angle2.jpg',
            'assets/products/headphone_box.jpg'
        ],
        'p2': [
            'assets/products/smartwatch.jpg',
            'assets/products/smartwatch_angle1.jpg',
            'assets/products/smartwatch_angle2.jpg',
            'assets/products/smartwatch_box.jpg'
        ],
        'p3': [
            'assets/products/steel water bottle.jpg',
            'assets/products/bottle_angle1.jpg',
            'assets/products/bottle_angle2.jpg'
        ],
        'p4': [
            'assets/products/gaming keyboard.jpg',
            'assets/products/keyboard_angle1.jpg',
            'assets/products/keyboard_angle2.jpg'
        ],
        'p5': [
            'assets/products/4k action camera.jpg',
            'assets/products/camera_angle1.jpg',
            'assets/products/camera_angle2.jpg'
        ],
        'p6': [
            'assets/products/leather wallet.jpg',
            'assets/products/wallet_angle1.jpg',
            'assets/products/wallet_open.jpg'
        ],
        'p7': [
            'assets/products/led_Desk_Lamp.jpg',
            'assets/products/lamp_angle1.jpg',
            'assets/products/lamp_on.jpg'
        ],
        'p8': [
            'assets/products/wireless_charger_pad.jpg',
            'assets/products/charger_angle1.jpg',
            'assets/products/charger_in_use.jpg'
        ]
    };

    // Get images for current product or use default
    const images = productImages[product.id] || [product.img, product.img, product.img];

    // Build product detail
    const detail = document.getElementById('productDetail');
    if (detail) {
        detail.innerHTML = `
        <div class="card" style="padding:24px">
            <div class="gallery">
                <div class="gallery-main">
                    <img id="mainImage" src="${images[0]}" alt="${product.title}">
                    <div class="gallery-thumbs">
                        ${images.map((img, index) => `
                            <img src="${img}" class="${index === 0 ? 'active' : ''}" data-src="${img}">
                        `).join('')}
                    </div>
                </div>
                <div class="product-info">
                    <h1>${product.title}</h1>
                    <div class="product-rating">
                        <span class="rating-stars">${generateStarRating(product.rating)}</span>
                        <span class="rating-value">${product.rating} ★</span>
                        <span class="rating-count">(1,234 ratings)</span>
                    </div>
                    <div class="product-category muted">${product.category}</div>
                    
                    <div class="price-section">
                        <h2 class="product-price">₹${product.price.toLocaleString('en-IN')}</h2>
                        <div class="delivery-info">Free delivery — Available</div>
                    </div>
                    
                    <div class="product-description">
                        <h3>Description</h3>
                        <p>${product.desc}</p>
                    </div>
                    
                    <div class="product-specifications">
                        <h3>Specifications</h3>
                        <div class="specs-grid">
                            <div class="spec-item">
                                <span class="spec-label">Brand</span>
                                <span class="spec-value">ShopWaveX</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Model</span>
                                <span class="spec-value">${product.id.toUpperCase()}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Warranty</span>
                                <span class="spec-value">1 Year</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">In Stock</span>
                                <span class="spec-value">Yes</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="customer-reviews">
                        <h3>Customer Reviews</h3>
                        <div class="reviews-summary">
                            <div class="overall-rating">
                                <div class="average-rating">${product.rating}</div>
                                <div class="rating-stars">${generateStarRating(product.rating)}</div>
                                <div class="total-reviews">1,234 reviews</div>
                            </div>
                            <div class="rating-breakdown">
                                <div class="rating-bar">
                                    <span>5 ★</span>
                                    <div class="bar"><div class="fill" style="width: 70%"></div></div>
                                    <span>70%</span>
                                </div>
                                <div class="rating-bar">
                                    <span>4 ★</span>
                                    <div class="bar"><div class="fill" style="width: 20%"></div></div>
                                    <span>20%</span>
                                </div>
                                <div class="rating-bar">
                                    <span>3 ★</span>
                                    <div class="bar"><div class="fill" style="width: 5%"></div></div>
                                    <span>5%</span>
                                </div>
                                <div class="rating-bar">
                                    <span>2 ★</span>
                                    <div class="bar"><div class="fill" style="width: 3%"></div></div>
                                    <span>3%</span>
                                </div>
                                <div class="rating-bar">
                                    <span>1 ★</span>
                                    <div class="bar"><div class="fill" style="width: 2%"></div></div>
                                    <span>2%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
        
        // Thumbnail click functionality
        detail.querySelectorAll('.gallery-thumbs img').forEach(img => {
            img.addEventListener('click', (e) => {
                document.querySelectorAll('.gallery-thumbs img').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById('mainImage').src = e.currentTarget.dataset.src || e.currentTarget.src;
            });
        });
    }

    // Buy box
    const buyBox = document.getElementById('buyBox');
    if (buyBox) {
        buyBox.innerHTML = `
        <div class="buy-box-content">
            <div class="price-section">
                <div class="muted">Price</div>
                <div class="price">₹${product.price.toLocaleString('en-IN')}</div>
                <div class="delivery-info">
                    <span class="free-delivery">FREE delivery</span>
                    <div class="delivery-date">Get it by Tomorrow</div>
                </div>
            </div>
            
            <div class="stock-info">In Stock</div>
            
            <div class="qty">
                <label>Quantity:</label>
                <input id="qtyInput" type="number" min="1" max="10" value="1" />
            </div>
            
            <div class="action-buttons">
                <button id="addCartBtn" class="btn btn-secondary">Add to Cart</button>
                <button id="buyNowBtn" class="btn btn-primary">Buy Now</button>
            </div>
            
            <div class="security-info">
                <div class="secure-payment">🔒 Secure transaction</div>
                <div class="return-policy">✅ 30-day return policy</div>
            </div>
        </div>
    `;
        
        // Add to Cart button functionality
        document.getElementById('addCartBtn').addEventListener('click', () => {
            const qty = Number(document.getElementById('qtyInput').value) || 1;
            addToCart(product.id, qty);
            document.getElementById('addCartBtn').textContent = 'Added to Cart ✓';
            setTimeout(() => {
                document.getElementById('addCartBtn').textContent = 'Add to Cart';
            }, 2000);
        });
        
        // Buy Now button functionality - Direct checkout
        document.getElementById('buyNowBtn').addEventListener('click', () => {
            const qty = Number(document.getElementById('qtyInput').value) || 1;
            
            // Create a cart with only this product for direct checkout
            const directCart = {};
            directCart[product.id] = qty;
            
            // Save to localStorage for checkout page
            localStorage.setItem('checkout_cart', JSON.stringify(directCart));
            localStorage.setItem('direct_checkout', 'true'); // Flag for direct checkout
            
            // Redirect directly to checkout
            window.location.href = 'checkout.html';
        });
    }

    // Helper function to generate star rating HTML
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
})();
