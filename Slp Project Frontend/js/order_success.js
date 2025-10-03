document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart count (should be 0 after order)
    updateCartCount();
    
    // Display order details
    displayOrderDetails();
    
    // Update year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
});

function displayOrderDetails() {
    const order = JSON.parse(localStorage.getItem('last_order') || '{}');
    
    if (!order.id) {
        // No order found, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    // Calculate order total
    let total = 0;
    Object.keys(order.items).forEach(productId => {
        const product = findProductById(productId);
        const quantity = order.items[productId];
        total += product.price * quantity;
    });
    
    // Add shipping
    total += total > 500 ? 0 : 50;
    
    // Update UI
    document.getElementById('orderId').textContent = order.id;
    document.getElementById('orderTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
    document.getElementById('paymentMethod').textContent = 
        order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery';
    
    // Set delivery date (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3 + Math.floor(Math.random() * 3));
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('deliveryDate').textContent = deliveryDate.toLocaleDateString('en-IN', options);
}














