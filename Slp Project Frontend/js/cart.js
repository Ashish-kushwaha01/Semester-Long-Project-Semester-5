(function () {
    function renderCart() {
        const cart = getCart();
        const ids = Object.keys(cart);
        const container = document.getElementById('cartContainer');
        const summary = document.getElementById('cartSummary');
        const itemCount = document.getElementById('itemCount');
        
        // Update item count
        const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        itemCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
        
        if (ids.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <h2>Your cart is empty</h2>
                    <p>Add some items to get started</p>
                    <a href="index.html" class="continue-shopping">Continue Shopping</a>
                </div>
            `;
            summary.innerHTML = '';
            return;
        }

        container.innerHTML = ids.map(id => {
            const product = findProductById(id);
            const qty = cart[id];
            const subtotal = product.price * qty;
            return `
                <div class="cart-item">
                    <img src="${product.img}" alt="${product.title}" />
                    <div class="cart-item-content">
                        <h3 class="cart-item-title">${product.title}</h3>
                        <p class="cart-item-category">${product.category}</p>
                        <p class="cart-item-price">₹${product.price.toLocaleString('en-IN')} each</p>
                        <div class="cart-item-controls">
                            <label>Qty:</label>
                            <input type="number" min="1" value="${qty}" 
                                onchange="onQtyChange('${id}', this.value)" 
                                class="quantity-input">
                            <button onclick="onRemove('${id}')" class="remove-btn">Remove</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        <div class="price">₹${subtotal.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            `;
        }).join('');

        const subtotal = ids.reduce((sum, id) => sum + (findProductById(id).price * cart[id]), 0);
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
                
                <div class="summary-row summary-total">
                    <span>Total</span>
                    <span class="price">₹${total.toLocaleString('en-IN')}</span>
                </div>
                
                <p class="shipping-note">${shipping === 0 ? '🎉 You qualify for free shipping!' : 'Add ₹' + (500 - subtotal).toLocaleString('en-IN') + ' more for free shipping'}</p>
                
                <button onclick="proceedToCheckout()" class="checkout-btn">
                    Proceed to Checkout - ₹${total.toLocaleString('en-IN')}
                </button>
            </div>
        `;
    }

    window.onQtyChange = function (id, value) {
        value = Math.max(1, Number(value)); // Ensure minimum quantity is 1
        updateCartItem(id, value);
        renderCart();
    };

    window.onRemove = function (id) {
        removeFromCart(id);
        renderCart();
    };

    window.proceedToCheckout = function () {
        // Save cart data for checkout page
        const cart = getCart();
        localStorage.setItem('checkout_cart', JSON.stringify(cart));
        window.location.href = 'checkout.html';
    };

    renderCart();
})();