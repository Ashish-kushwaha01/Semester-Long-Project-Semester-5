// Constants
const API_BASE_URL = 'http://localhost:8000/api/orders';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth state
    authManager.updateUIBasedOnAuth();
    
    // Clear cart after successful order
    clearCart();
    
    // Update year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    
    // Store order ID for tracking
    if (orderId) {
        localStorage.setItem('last_order_id', orderId);
    }
    
    // Setup track order button
    setupTrackOrderButton();
    
    // Start confetti animation
    startConfetti();
});

// Setup track order button based on user authentication
function setupTrackOrderButton() {
    const trackOrderBtn = document.querySelector('.btn-secondary');
    
    if (!trackOrderBtn) return;
    
    const isAuthenticated = authManager.isAuthenticated();
    const lastOrderId = localStorage.getItem('last_order_id');
    
    if (isAuthenticated && lastOrderId) {
        // Logged-in user: pre-fill order ID
        trackOrderBtn.href = `my_order.html?order_id=${lastOrderId}`;
        trackOrderBtn.innerHTML = '📦 Track Your Order';
    } else if (lastOrderId) {
        // Guest user with recent order: pre-fill but still show input
        trackOrderBtn.href = `track_order.html?`;
        trackOrderBtn.innerHTML = '📦 Track Your Order';
    } else {
        // Guest user without recent order: normal track page
        trackOrderBtn.href = 'track_order.html';
        trackOrderBtn.innerHTML = '📦 Track Your Order';
    }
}

// Clear cart after successful order
function clearCart() {
    localStorage.removeItem('shopWave_X_cart');
    localStorage.removeItem('checkout_cart');
    localStorage.removeItem('checkout_product_details');
    localStorage.removeItem('direct_purchase');
    
    // Update cart count
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
}

// Confetti animation
function startConfetti() {
    const confettiPieces = document.querySelectorAll('.confetti-piece');
    confettiPieces.forEach((piece, index) => {
        piece.style.animationDelay = `${index * 0.1}s`;
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.background = getRandomColor();
    });
}

// Helper function for random colors
function getRandomColor() {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Add CSS for confetti
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
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
document.head.appendChild(confettiStyle);