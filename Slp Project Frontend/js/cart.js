(function () {
    const API_BASE_URL = 'http://localhost:8000/api/product';
    let cartProducts = []; // Store product details for items in cart

    // Initialize cart page
    async function initCart() {
        updateCartCount();
        document.getElementById('year').textContent = new Date().getFullYear();
        
        try {
            await renderCart();
        } catch (error) {
            console.error('❌ Error initializing cart:', error);
            showErrorState('Failed to load cart items. Please try again.');
        }
    }

    async function renderCart() {
        const cart = getCart();
        const productIds = Object.keys(cart);
        const container = document.getElementById('cartContainer');
        const summary = document.getElementById('cartSummary');
        const itemCount = document.getElementById('itemCount');
        
        // Update item count
        const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        itemCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
        
        if (productIds.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>Add some items to get started</p>
                    <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            summary.innerHTML = '';
            return;
        }

        // Show loading state
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading cart items...</p>
            </div>
        `;

        try {
            // Fetch product details for all items in cart
            cartProducts = await fetchCartProducts(productIds);
            
            // Render cart items
            container.innerHTML = cartProducts.map(product => {
                if (!product) return '';
                
                const qty = cart[product.id];
                const subtotal = product.price * qty;
                
                return `
                    <div class="cart-item" data-product-id="${product.id}">
                        <div class="cart-item-image">
                            <img src="${product.img}" alt="${product.title}" 
                                 onerror="this.src='assets/default-product.jpg'">
                        </div>
                        <div class="cart-item-content">
                            <h3 class="cart-item-title">
                                <a href="product.html?id=${product.id}">${product.title}</a>
                            </h3>
                            <p class="cart-item-category">${product.category}</p>
                            <p class="cart-item-price">₹${product.price.toLocaleString('en-IN')} each</p>
                            <div class="cart-item-controls">
                                <div class="quantity-controls">
                                    <label>Qty:</label>
                                    <button class="qty-btn" onclick="decreaseQty('${product.id}')">−</button>
                                    <input type="number" min="1" max="10" value="${qty}" 
                                        onchange="onQtyChange('${product.id}', this.value)" 
                                        class="quantity-input">
                                    <button class="qty-btn" onclick="increaseQty('${product.id}')">+</button>
                                </div>
                                <button onclick="onRemove('${product.id}')" class="remove-btn">
                                    Remove
                                </button>
                            </div>
                        </div>
                        <div class="cart-item-total">
                            <div class="price">₹${subtotal.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                `;
            }).join('');

            // Calculate and render summary
            renderCartSummary(cartProducts, cart);

        } catch (error) {
            console.error('❌ Error rendering cart:', error);
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Unable to load cart items</h3>
                    <p>There was a problem loading your cart. Please try again.</p>
                    <button class="btn btn-primary" onclick="renderCart()">Retry</button>
                </div>
            `;
        }
    }

    // Fetch product details for items in cart
    async function fetchCartProducts(productIds) {
        console.log('🔄 Fetching cart products:', productIds);
        
        const products = [];
        
        for (const productId of productIds) {
            try {
                const response = await fetch(`${API_BASE_URL}/get/product/${productId}/`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const productData = await response.json();
                console.log('📦 Product data for cart:', productData);
                
                // Transform API data to frontend format
                const product = transformProductForCart(productData);
                if (product) {
                    products.push(product);
                }
                
            } catch (error) {
                console.error(`❌ Error fetching product ${productId}:`, error);
                // Add a placeholder product so cart doesn't break
                products.push({
                    id: productId,
                    title: 'Product Not Available',
                    price: 0,
                    img: 'assets/default-product.jpg',
                    category: 'Unknown'
                });
            }
        }
        
        return products;
    }


    // Transform API product data for cart display
function transformProductForCart(backendProduct) {
    if (!backendProduct) return null;

    // Handle both array and single object responses
    const product = Array.isArray(backendProduct) ? backendProduct[0] : backendProduct;
    if (!product) return null;

    // Get the first variant for pricing and images
    const firstVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;

    // If no variant exists, create a fallback variant
    if (!firstVariant) {
        console.warn(`⚠️ No variants found for product ${product.id}, using fallback`);
        return {
            id: product.id.toString(),
            variant_id: product.id.toString(), // Fallback to product ID
            title: product.title,
            price: parseFloat(product.base_price || 0),
            img: 'assets/default-product.jpg',
            category: 'Uncategorized',
            variants: []
        };
    }

    // Get product image
    let productImage = 'assets/default-product.jpg';
    if (firstVariant.images && firstVariant.images.length > 0) {
        productImage = firstVariant.images[0].image;
    }

    // Get category information
    let categoryName = 'Uncategorized';
    if (product.category_path && product.category_path.length > 0) {
        if (product.category_path.length === 1) {
            categoryName = product.category_path[0];
        } else if (product.category_path.length >= 2) {
            categoryName = product.category_path[1];
        }
    } else if (product.category && product.category.length > 0) {
        const categoryObj = product.category[0];
        if (typeof categoryObj === 'object' && categoryObj.name) {
            categoryName = categoryObj.name;
        }
    }

    // Get price
    const price = parseFloat(firstVariant.adjusted_price || product.base_price || 0);

    return {
        id: product.id.toString(), // Product ID for cart management
        variant_id: firstVariant.id.toString(), // Variant ID for checkout
        title: product.title,
        price: price,
        img: productImage,
        category: categoryName,
        variants: product.variants || []
    };
}





    // Render cart summary
    function renderCartSummary(products, cart) {
        const summary = document.getElementById('cartSummary');
        const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        
        const subtotal = products.reduce((sum, product) => {
            const qty = cart[product.id];
            return sum + (product.price * qty);
        }, 0);
        
        const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
        const total = subtotal + shipping;

        summary.innerHTML = `
            <div class="cart-summary">
                <h3 class="summary-title">Order Summary</h3>
                
                <div class="summary-row">
                    <span>Subtotal (${totalItems} items)</span>
                    <span class="price">₹${subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                <div class="summary-row">
                    <span>Shipping</span>
                    <span>${shipping === 0 ? 'FREE' : '₹' + shipping.toLocaleString('en-IN')}</span>
                </div>
                
                <div class="summary-divider"></div>
                
                <div class="summary-row summary-total">
                    <span>Total Amount</span>
                    <span class="price total-amount">₹${total.toLocaleString('en-IN')}</span>
                </div>
                
                <p class="shipping-note">
                    ${shipping === 0 ? 
                        '🎉 You qualify for free shipping!' : 
                        `Add ₹${(500 - subtotal).toLocaleString('en-IN')} more for free shipping`
                    }
                </p>
                
                <button onclick="proceedToCheckout()" class="checkout-btn">
                    Proceed to Checkout - ₹${total.toLocaleString('en-IN')}
                </button>
                
                <div class="secure-checkout">
                    <span class="secure-icon">🔒</span>
                    Secure checkout · SSL encrypted
                </div>
            </div>
        `;
    }

    // Quantity control functions
    window.decreaseQty = function (id) {
        const currentQty = getCart()[id] || 1;
        if (currentQty > 1) {
            onQtyChange(id, currentQty - 1);
        }
    };

    window.increaseQty = function (id) {
        const currentQty = getCart()[id] || 1;
        if (currentQty < 10) { // Maximum 10 items
            onQtyChange(id, currentQty + 1);
        } else {
            showNotification('Maximum quantity reached (10 items)', 'warning');
        }
    };

    window.onQtyChange = function (id, value) {
        let newQty = Math.max(1, Math.min(10, Number(value))); // Ensure quantity between 1-10
        
        if (isNaN(newQty)) {
            newQty = 1;
        }
        
        updateCartItem(id, newQty);
        
        // Update the input field immediately
        const input = document.querySelector(`[data-product-id="${id}"] .quantity-input`);
        if (input) {
            input.value = newQty;
        }
        
        renderCart();
        showNotification(`Quantity updated`, 'success');
    };

    window.onRemove = function (id) {
        if (confirm('Are you sure you want to remove this item from your cart?')) {
            removeFromCart(id);
            renderCart();
            showNotification('Item removed from cart', 'success');
        }
    };


    window.proceedToCheckout = async function () {
    const cart = getCart();
    if (Object.keys(cart).length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    try {
        // Show loading state
        showNotification('Preparing checkout...', 'info');

        // Fetch latest product details to ensure we have correct variant IDs
        const productIds = Object.keys(cart);
        const products = await fetchCartProducts(productIds);
        
        // Prepare checkout data with variant IDs
        const checkoutData = {
            items: {},
            productDetails: {}
        };

        products.forEach(product => {
            if (product && product.variant_id) {
                const productId = product.id;
                const variantId = product.variant_id;
                checkoutData.items[variantId] = cart[productId]; // Use variant ID as key
                checkoutData.productDetails[variantId] = {
                    id: variantId,
                    product_id: productId,
                    title: product.title,
                    price: product.price,
                    img: product.img,
                    category: product.category
                };
            }
        });

        // Validate that we have variant IDs for all products
        const missingVariants = productIds.filter(id => {
            const product = products.find(p => p && p.id === id);
            return !product || !product.variant_id;
        });

        if (missingVariants.length > 0) {
            console.error('❌ Missing variant IDs for products:', missingVariants);
            showNotification('Some products are not available for checkout', 'error');
            return;
        }

        console.log('🛒 Checkout data prepared:', checkoutData);

        // Save checkout data
        localStorage.setItem('checkout_cart', JSON.stringify(checkoutData.items));
        localStorage.setItem('checkout_product_details', JSON.stringify(checkoutData.productDetails));
        
        // Redirect to checkout
        window.location.href = 'checkout.html';

    } catch (error) {
        console.error('❌ Error preparing checkout:', error);
        showNotification('Failed to prepare checkout. Please try again.', 'error');
    }
};

    // Utility functions
    function showErrorState(message) {
        const container = document.getElementById('cartContainer');
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Something went wrong</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="initCart()">Try Again</button>
            </div>
        `;
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .loading-state {
            text-align: center;
            padding: 40px;
            grid-column: 1 / -1;
        }
        
        .loading-spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error-state, .empty-cart {
            text-align: center;
            padding: 40px;
            grid-column: 1 / -1;
        }
        
        .error-icon, .empty-cart-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
    `;
    document.head.appendChild(style);

    // Initialize cart when page loads
    document.addEventListener('DOMContentLoaded', initCart);
})();