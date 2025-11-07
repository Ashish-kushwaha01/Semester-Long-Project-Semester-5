document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count
    updateCartCount();
    
    // Load and display checkout items
    renderCheckoutItems();
    
    // Setup payment method toggle
    setupPaymentToggle();
    
    // Setup place order button
    setupPlaceOrder();
    
    // Update year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
});

function renderCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem('checkout_cart') || '{}');
    const container = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    if (Object.keys(cart).length === 0) {
        container.innerHTML = '<p>No items in cart</p>';
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Cart is Empty';
        return;
    }
    
    let subtotal = 0;
    let html = '';
    
    Object.keys(cart).forEach(productId => {
        const product = findProductById(productId);
        const quantity = cart[productId];
        const itemTotal = product.price * quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="checkout-item">
                <img src="${product.img}" alt="${product.title}">
                <div class="checkout-item-details">
                    <div class="checkout-item-title">${product.title}</div>
                    <div class="checkout-item-price">₹${product.price.toLocaleString('en-IN')}</div>
                    <div class="checkout-item-quantity">Qty: ${quantity}</div>
                </div>
                <div class="price">₹${itemTotal.toLocaleString('en-IN')}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;
    
    subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`;
    totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
    
    // Update place order button text
    placeOrderBtn.innerHTML = `Place Order - ₹${total.toLocaleString('en-IN')}`;
}

function setupPaymentToggle() {
    const cardRadio = document.getElementById('card');
    const codRadio = document.getElementById('cod');
    const cardForm = document.getElementById('cardForm');
    const codMessage = document.getElementById('codMessage');
    
    function togglePaymentForms() {
        if (cardRadio.checked) {
            cardForm.classList.add('active');
            codMessage.classList.remove('active');
        } else {
            cardForm.classList.remove('active');
            codMessage.classList.add('active');
        }
    }
    
    cardRadio.addEventListener('change', togglePaymentForms);
    codRadio.addEventListener('change', togglePaymentForms);
    
    // Initialize
    togglePaymentForms();
}

function setupPlaceOrder() {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const shippingForm = document.getElementById('shippingForm');
    
    placeOrderBtn.addEventListener('click', function() {
        // Validate shipping form
        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return;
        }
        
        // Validate card form if card payment is selected
        const cardRadio = document.getElementById('card');
        if (cardRadio.checked) {
            const cardForm = document.getElementById('cardForm');
            const cardInputs = cardForm.querySelectorAll('input[required]');
            let isValid = true;
            
            cardInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.focus();
                }
            });
            
            if (!isValid) {
                alert('Please fill all card details');
                return;
            }
        }
        
        // Show loading state
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = 'Processing Order...';
        
        // Simulate order processing
        setTimeout(() => {
            // Save order details
            const order = {
                id: 'ORD' + Date.now(),
                items: JSON.parse(localStorage.getItem('checkout_cart') || '{}'),
                timestamp: new Date().toISOString(),
                paymentMethod: document.querySelector('input[name="payment"]:checked').value
            };
            
            localStorage.setItem('last_order', JSON.stringify(order));
            
            // Clear cart
            localStorage.removeItem('shopWave_X_cart');
            localStorage.removeItem('checkout_cart');
            
            // Redirect to success page
            window.location.href = 'order_success.html';
        }, 2000);
    });
}
