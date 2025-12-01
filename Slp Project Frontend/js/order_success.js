document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth state
    authManager.updateUIBasedOnAuth();
    
    // Initialize cart count (should be 0 after order)
    updateCartCount();
    
    // Display order details
    displayOrderDetails();
    
    // Update year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
});

function displayOrderDetails() {
    // Try to get order details from multiple sources
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const paymentId = urlParams.get('payment_id');
    const paymentMethod = urlParams.get('payment_method');
    
    // Get from localStorage
    const lastPaymentResponse = JSON.parse(localStorage.getItem('last_payment_response') || '{}');
    
    // Get checkout session data
    const checkoutCart = JSON.parse(localStorage.getItem('checkout_cart') || '{}');
    const checkoutProductDetails = JSON.parse(localStorage.getItem('checkout_product_details') || '{}');
    
    // Determine the actual order data
    let orderData = {};
    
    if (orderId) {
        // Use URL parameters (most reliable)
        orderData = {
            id: orderId,
            payment_id: paymentId,
            payment_method: paymentMethod || 'Online_Mode',
            items: checkoutCart,
            productDetails: checkoutProductDetails
        };
    } else if (lastPaymentResponse.razorpay_payment_id) {
        // Use payment response
        orderData = {
            id: lastPaymentResponse.checkout_session_id || `ORD_${Date.now()}`,
            payment_id: lastPaymentResponse.razorpay_payment_id,
            payment_method: 'Online_Mode',
            items: checkoutCart,
            productDetails: checkoutProductDetails
        };
    } else if (Object.keys(checkoutCart).length > 0) {
        // Use checkout data as fallback
        orderData = {
            id: `TEMP_${Date.now()}`,
            payment_method: 'Cash_On_Delivery',
            items: checkoutCart,
            productDetails: checkoutProductDetails
        };
    } else {
        // No order found, show demo data
        console.warn('No order data found, showing demo data');
        orderData = {
            id: `DEMO_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            payment_method: 'Online_Mode',
            items: {},
            productDetails: {}
        };
    }
    
    // Calculate order total
    let subtotal = 0;
    
    if (orderData.items && Object.keys(orderData.items).length > 0) {
        Object.keys(orderData.items).forEach(variantId => {
            const quantity = orderData.items[variantId];
            let product = null;
            
            // Try to get product details
            if (orderData.productDetails && orderData.productDetails[variantId]) {
                product = orderData.productDetails[variantId];
            }
            
            if (product && product.price) {
                const itemTotal = product.price * quantity;
                subtotal += itemTotal;
            }
        });
    }
    
    // If no items found, use a default amount from localStorage
    if (subtotal === 0) {
        const lastTotal = localStorage.getItem('last_order_total');
        if (lastTotal) {
            subtotal = parseFloat(lastTotal);
        } else {
            // Calculate from cart as fallback
            const cart = getCart();
            const productIds = Object.keys(cart);
            productIds.forEach(productId => {
                const quantity = cart[productId];
                // Use a default price if we can't calculate properly
                subtotal += 199 * quantity; // Default price
            });
        }
    }
    
    // Calculate totals
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;
    
    // Save total for potential reload
    localStorage.setItem('last_order_total', total.toString());
    
    // Update UI with your HTML structure
    document.getElementById('orderId').textContent = orderData.id;
    document.getElementById('orderTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
    
    // Format payment method for display
    const paymentMethodDisplay = formatPaymentMethod(orderData.payment_method);
    document.getElementById('paymentMethod').textContent = paymentMethodDisplay;
    
    // Set delivery date (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3 + Math.floor(Math.random() * 3));
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('deliveryDate').textContent = deliveryDate.toLocaleDateString('en-IN', options);
    
    // Update success message based on payment method
    updateSuccessMessage(orderData.payment_method);
    
    // Clear checkout data after successful order
    clearCheckoutData();
    
    console.log('✅ Order details displayed:', orderData);
}

function formatPaymentMethod(method) {
    const methodMap = {
        'Online_Mode': 'Credit/Debit Card',
        'Cash_On_Delivery': 'Cash on Delivery',
        'card': 'Credit/Debit Card',
        'cod': 'Cash on Delivery',
        'Credit Card': 'Credit/Debit Card'
    };
    return methodMap[method] || method || 'Credit/Debit Card';
}

function updateSuccessMessage(paymentMethod) {
    const successMessage = document.querySelector('.success-message');
    if (!successMessage) return;
    
    if (paymentMethod === 'Cash_On_Delivery' || paymentMethod === 'cod') {
        successMessage.innerHTML = `
            Thank you for your purchase. Your order has been confirmed and is being processed.
            <br><strong>Please keep cash ready for delivery.</strong>
        `;
    } else {
        successMessage.innerHTML = `
            Thank you for your purchase. Your payment was successful and order has been confirmed.
            <br>You will receive an email confirmation shortly.
        `;
    }
}

function clearCheckoutData() {
    // Clear checkout-related data but keep some for potential returns/refunds
    localStorage.removeItem('checkout_cart');
    localStorage.removeItem('checkout_product_details');
    localStorage.removeItem('direct_purchase');
    localStorage.removeItem('is_direct_purchase');
    
    // Clear the main cart
    localStorage.removeItem('shopWave_X_cart');
    
    // Update cart count
    updateCartCount();
    
    console.log('🧹 Checkout and cart data cleared');
}

// Add confetti animation
function startConfetti() {
    const confettiPieces = document.querySelectorAll('.confetti-piece');
    confettiPieces.forEach((piece, index) => {
        piece.style.animationDelay = `${index * 0.1}s`;
        piece.style.left = `${Math.random() * 100}%`;
    });
}

// Start confetti when page loads
document.addEventListener('DOMContentLoaded', startConfetti);

// Add this function to handle track order button
function setupTrackOrder() {
    const trackOrderBtn = document.querySelector('.btn-secondary');
    if (trackOrderBtn) {
        trackOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const orderId = document.getElementById('orderId').textContent;
            showNotification(`Order tracking for ${orderId} will be available soon!`);
        });
    }
}

// Setup track order button
document.addEventListener('DOMContentLoaded', setupTrackOrder);

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(notification);

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
    
    .confetti-piece {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #ff0000;
        top: 0;
        opacity: 0;
        animation: confettiFall 3s ease-in-out infinite;
    }
    
    .confetti-piece:nth-child(2n) {
        background: #00ff00;
    }
    
    .confetti-piece:nth-child(3n) {
        background: #0000ff;
    }
    
    .confetti-piece:nth-child(4n) {
        background: #ffff00;
    }
    
    .confetti-piece:nth-child(5n) {
        background: #ff00ff;
    }
    
    @keyframes confettiFall {
        0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(500px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);