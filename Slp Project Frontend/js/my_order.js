// Initialize orders page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Orders page loaded, initializing...');
    
    // Force cart count update immediately
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Check if user is logged in
    if (!authManager.isAuthenticated()) {
        alert('Please login to view your orders!');
        window.location.href = 'login/signIn.html';
        return;
    }

    // Initialize tab functionality
    initTabs();
    
    // Load orders
    loadOrders();
    
    // Initialize modal
    initModal();
    
    // Final cart count update after orders are loaded
    setTimeout(() => {
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    }, 100);
});

// Tab functionality
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Filter orders
            const filter = this.dataset.filter;
            filterOrders(filter);
        });
    });
}

// Modal functionality
function initModal() {
    const modal = document.getElementById('orderDetailsModal');
    const closeBtn = document.getElementById('closeModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
}

// Load orders from API
async function loadOrders() {
    try {
        const response = await ApiClient.get('http://127.0.0.1:8000/api/orders/get-all/');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Orders loaded:', data);
        
        // Store orders globally for filtering
        window.allOrders = data.orders || [];
        
        // Update statistics
        updateOrderStats();
        
        // Render orders
        renderOrders(window.allOrders);
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        showError('Failed to load orders. Please try again later.');
        
        // Show no orders state
        document.getElementById('ordersList').style.display = 'none';
        document.getElementById('noOrders').style.display = 'block';
    }
}

// Update order statistics
function updateOrderStats() {
    const orders = window.allOrders || [];
    
    const stats = {
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
    };
    
    orders.forEach(order => {
        const status = order.status.toLowerCase();
        
        if (status.includes('processing') || status.includes('confirmed') || status.includes('packed')) {
            stats.processing++;
        } else if (status.includes('shipped') || status.includes('out_for_delivery')) {
            stats.shipped++;
        } else if (status.includes('delivered')) {
            stats.delivered++;
        } else if (status.includes('cancelled') || status.includes('returned') || status.includes('refunded')) {
            stats.cancelled++;
        }
    });
    
    // Update UI
    document.getElementById('processingCount').textContent = stats.processing;
    document.getElementById('shippedCount').textContent = stats.shipped;
    document.getElementById('deliveredCount').textContent = stats.delivered;
    document.getElementById('cancelledCount').textContent = stats.cancelled;
}

// Filter orders based on selected tab
function filterOrders(filter) {
    const orders = window.allOrders || [];
    let filteredOrders = orders;
    
    if (filter !== 'all') {
        filteredOrders = orders.filter(order => {
            const status = order.status.toLowerCase();
            
            switch(filter) {
                case 'processing':
                    return status.includes('processing') || 
                           status.includes('confirmed') || 
                           status.includes('packed');
                case 'shipped':
                    return status.includes('shipped') || 
                           status.includes('out_for_delivery');
                case 'delivered':
                    return status.includes('delivered');
                case 'cancelled':
                    return status.includes('cancelled') || 
                           status.includes('returned') || 
                           status.includes('refunded');
                default:
                    return true;
            }
        });
    }
    
    renderOrders(filteredOrders);
}

// Render orders to the page
function renderOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    const noOrders = document.getElementById('noOrders');
    
    if (!orders || orders.length === 0) {
        ordersList.style.display = 'none';
        noOrders.style.display = 'block';
        return;
    }
    
    // Show orders list, hide no orders state
    ordersList.style.display = 'block';
    noOrders.style.display = 'none';
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Generate HTML for each order
    const ordersHTML = orders.map(order => createOrderCard(order)).join('');
    
    ordersList.innerHTML = ordersHTML;
    
    // Add event listeners to view details buttons
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderNumber = this.dataset.orderNumber;
            showOrderDetails(orderNumber);
        });
    });
    
    // Add event listeners to track order buttons
    document.querySelectorAll('.track-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderNumber = this.dataset.orderNumber;
            trackOrder(orderNumber);
        });
    });
    
    // Add event listeners to cancel order buttons
    document.querySelectorAll('.cancel-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderNumber = this.dataset.orderNumber;
            cancelOrder(orderNumber);
        });
    });
    
    // Add event listeners to buy again buttons
    document.querySelectorAll('.buy-again').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderNumber = this.dataset.orderNumber;
            buyAgain(orderNumber);
        });
    });
}

// Create order card HTML
function createOrderCard(order) {
    const status = getStatusInfo(order.status);
    const date = new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const time = new Date(order.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
        <div class="order-card" data-status="${order.status.toLowerCase()}">
            <div class="order-header">
                <div class="order-meta">
                    <div class="meta-item">
                        <span class="meta-label">ORDER PLACED</span>
                        <span class="meta-value">${date}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">TOTAL</span>
                        <span class="meta-value">₹${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">SHIP TO</span>
                        <span class="meta-value">${order.shipping.name}</span>
                    </div>
                </div>
                <div class="order-status">
                    <span class="status-badge ${status.class}">${status.text}</span>
                </div>
            </div>
            
            <div class="order-body">
                <div class="order-items">
                    ${order.items.map(item => createOrderItem(item)).join('')}
                </div>
                
                <div class="order-summary">
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>₹${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span>₹${parseFloat(order.shipping_charge || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax</span>
                        <span>₹${parseFloat(order.tax || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span>₹${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div class="order-footer">
                <div class="shipping-info">
                    <div class="shipping-label">SHIPPING ADDRESS</div>
                    <div class="shipping-address">
                        ${order.shipping.address_1}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pincode}
                    </div>
                </div>
                
                <div class="order-actions">
                    <button class="action-btn secondary view-details" data-order-number="${order.order_number}">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${order.status === 'DELIVERED' ? `
                        <button class="action-btn secondary buy-again" data-order-number="${order.order_number}">
                            <i class="fas fa-shopping-cart"></i> Buy Again
                        </button>
                    ` : ''}
                    ${['PROCESSING', 'CONFIRMED', 'PACKED'].includes(order.status) ? `
                        <button class="action-btn danger cancel-order" data-order-number="${order.order_number}">
                            <i class="fas fa-times"></i> Cancel Order
                        </button>
                    ` : ''}
                    ${['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status) ? `
                        <button class="action-btn primary track-order" data-order-number="${order.order_number}">
                            <i class="fas fa-map-marker-alt"></i> Track Order
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Create order item HTML
function createOrderItem(item) {
    const imageUrl = item.variant_primary_image?.image || 'assets/default-product.jpg';
    const altText = item.variant_primary_image?.alt_text || 'Product Image';
    
    return `
        <div class="order-item">
            <div class="item-image">
                <img src="${imageUrl}" alt="${altText}" loading="lazy">
            </div>
            <div class="item-details">
                <div class="item-name"> ${item.product_name}</div>
                <div class="item-meta">
                    <span>Qty: ${item.quantity}</span>
                    <span>Size: Standard</span>
                    <span>Color: Black</span>
                </div>
            </div>
            <div class="item-price">
                ₹${parseFloat(item.subtotal).toFixed(2)}
            </div>
        </div>
    `;
}

// Get status information
function getStatusInfo(status) {
    const statusMap = {
        'PROCESSING': { class: 'status-processing', text: 'Processing' },
        'CONFIRMED': { class: 'status-confirmed', text: 'Confirmed' },
        'PACKED': { class: 'status-processing', text: 'Packed' },
        'SHIPPED': { class: 'status-shipped', text: 'Shipped' },
        'OUT_FOR_DELIVERY': { class: 'status-shipped', text: 'Out for Delivery' },
        'DELIVERED': { class: 'status-delivered', text: 'Delivered' },
        'CANCELLED': { class: 'status-cancelled', text: 'Cancelled' },
        'RETURN_REQUESTED': { class: 'status-cancelled', text: 'Return Requested' },
        'RETURNED': { class: 'status-cancelled', text: 'Returned' },
        'REFUNDED': { class: 'status-refunded', text: 'Refunded' },
        'CLOSED': { class: 'status-delivered', text: 'Closed' }
    };
    
    return statusMap[status] || { class: 'status-processing', text: status };
}

// Show order details in modal
async function showOrderDetails(orderNumber) {
    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    
    // Find the order
    const order = window.allOrders.find(o => o.order_number === orderNumber);
    
    if (!order) {
        showError('Order details not found.');
        return;
    }
    
    const status = getStatusInfo(order.status);
    const date = new Date(order.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Build detailed order HTML
    const orderDetailsHTML = `
        <div class="order-details">
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Order Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Order Number</span>
                        <span class="detail-value">${order.order_number}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Order Date</span>
                        <span class="detail-value">${date}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Order Status</span>
                        <span class="status-badge ${status.class}">${status.text}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Payment Method</span>
                        <span class="detail-value">${order.payment_method || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Payment Status</span>
                        <span class="detail-value">${order.payment_status || 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-box"></i> Items Ordered</h3>
                <div class="order-items">
                    ${order.items.map(item => createDetailedOrderItem(item)).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-receipt"></i> Price Breakdown</h3>
                <div class="price-breakdown">
                    <div class="summary-row">
                        <span>Subtotal (${order.items.length} items)</span>
                        <span>₹${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping Charge</span>
                        <span>₹${parseFloat(order.shipping_charge || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (GST)</span>
                        <span>₹${parseFloat(order.tax || 0).toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Grand Total</span>
                        <span>₹${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-truck"></i> Shipping Information</h3>
                <div class="shipping-details">
                    <p><strong>Name:</strong> ${order.shipping.name}</p>
                    <p><strong>Phone:</strong> ${order.shipping.phone}</p>
                    <p><strong>Email:</strong> ${order.shipping.email || 'N/A'}</p>
                    <p><strong>Address:</strong> ${order.shipping.address_1} ${order.shipping.address_2 || ''}</p>
                    <p><strong>City:</strong> ${order.shipping.city}</p>
                    <p><strong>State:</strong> ${order.shipping.state}</p>
                    <p><strong>Pincode:</strong> ${order.shipping.pincode}</p>
                </div>
            </div>
            
            ${order.is_refundable ? `
                <div class="refund-info">
                    <div class="refund-badge">
                        <i class="fas fa-shield-alt"></i> Eligible for Return/Refund
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    content.innerHTML = orderDetailsHTML;
    modal.style.display = 'flex';
}

// Create detailed order item HTML
function createDetailedOrderItem(item) {
    const imageUrl = item.variant_primary_image?.image || 'assets/default-product.jpg';
    
    return `
        <div class="detailed-order-item">
            <div class="item-image">
                <img src="${imageUrl}" alt="Product Image" loading="lazy">
            </div>
            <div class="item-info">
                <div class="item-name">Product Variant #${item.product_variant_id}</div>
                <div class="item-sku">SKU: ${item.product_variant_id}</div>
                <div class="item-qty">Quantity: ${item.quantity}</div>
                <div class="item-status">
                    Status: <span class="status-badge">${item.status}</span>
                </div>
            </div>
            <div class="item-price">
                <div class="price-unit">₹${parseFloat(item.price).toFixed(2)} each</div>
                <div class="price-total">₹${parseFloat(item.subtotal).toFixed(2)} total</div>
            </div>
        </div>
    `;
}

// Track order function
function trackOrder(orderNumber) {
    showToast(`Tracking order #${orderNumber}... This feature will be implemented soon!`);
}

// Cancel order function
function cancelOrder(orderNumber) {
    if (confirm(`Are you sure you want to cancel order #${orderNumber}?`)) {
        showToast(`Cancelling order #${orderNumber}...`);
        // Implement actual cancellation API call here
        // After successful cancellation, reload orders
        setTimeout(() => {
            showToast('Order cancelled successfully!');
            loadOrders();
        }, 1500);
    }
}

// Buy again function
function buyAgain(orderNumber) {
    showToast(`Adding items from order #${orderNumber} to cart...`);
    // Implement add to cart functionality here
    setTimeout(() => {
        showToast('Items added to cart successfully!');
        window.location.href = 'cart.html';
    }, 1500);
}

// Show toast notification
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow-hover);
        z-index: 10000;
        animation: fadeInOut 3s ease-in-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remove toast after animation
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: fadeInOut 3s ease-in-out;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Ensure cart count updates when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && typeof updateCartCount === 'function') {
        updateCartCount();
    }
});

// Update cart count when page gains focus
window.addEventListener('focus', function() {
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});