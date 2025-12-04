// Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Update year
            document.getElementById('year').textContent = new Date().getFullYear();
            
            // Initialize auth state
            if (authManager && authManager.updateUIBasedOnAuth) {
                authManager.updateUIBasedOnAuth();
            }
            
            // Initialize track order functionality
            initTrackOrder();
        });
        
        function initTrackOrder() {
            const trackBtn = document.getElementById('trackOrderBtn');
            const orderInput = document.getElementById('orderNumber');
            const orderError = document.getElementById('orderError');
            const trackStep = document.getElementById('trackOrderStep');
            const loadingStep = document.getElementById('loadingStep');
            const orderResultStep = document.getElementById('orderResultStep');
            const backBtn = document.getElementById('backToTrack');
            const tryAgainBtn = document.getElementById('tryAgainBtn');
            
            // Track order button click
            trackBtn.addEventListener('click', async function() {
                const orderNumber = orderInput.value.trim();
                
                if (!orderNumber) {
                    showError(orderError, 'Please enter order number');
                    return;
                }
                
                // Clear error
                hideError(orderError);
                
                // Show loading
                trackStep.style.display = 'none';
                loadingStep.style.display = 'block';
                
                try {
                    // Fetch order from API
                    const order = await fetchOrderDetails(orderNumber);
                    
                    // Hide loading
                    loadingStep.style.display = 'none';
                    
                    if (order) {
                        // Show order with same UI as my_orders
                        displayOrder(order);
                        orderResultStep.style.display = 'block';
                    } else {
                        // Show error
                        trackStep.style.display = 'block';
                        showError(orderError, 'Order not found. Please check order number.');
                    }
                    
                } catch (error) {
                    console.error('Error:', error);
                    loadingStep.style.display = 'none';
                    trackStep.style.display = 'block';
                    showError(orderError, 'Network error. Please try again.');
                }
            });
            
            // Enter key support
            orderInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    trackBtn.click();
                }
            });
            
            // Back button
            backBtn.addEventListener('click', function() {
                orderResultStep.style.display = 'none';
                trackStep.style.display = 'block';
                orderInput.value = '';
                orderInput.focus();
            });
            
            // Try again button
            if (tryAgainBtn) {
                tryAgainBtn.addEventListener('click', function() {
                    document.getElementById('noOrders').style.display = 'none';
                    orderResultStep.style.display = 'none';
                    trackStep.style.display = 'block';
                    orderInput.value = '';
                    orderInput.focus();
                });
            }
            
            // Initialize modal
            initModal();
        }
        
        // Fetch order details from API
        async function fetchOrderDetails(orderNumber) {
            try {
                const response = await fetch(`http://localhost:8000/api/orders/guest-user-get-order/?order_number=${encodeURIComponent(orderNumber)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Order data:', data);
                
                if (data.orders && data.orders.length > 0) {
                    return data.orders[0];
                }
                return null;
                
            } catch (error) {
                console.error('Fetch error:', error);
                throw error;
            }
        }
        
        // Display order using same UI as my_orders
        function displayOrder(order) {
            const ordersList = document.getElementById('ordersList');
            const noOrders = document.getElementById('noOrders');
            
            // Show orders list, hide no orders state
            ordersList.style.display = 'block';
            noOrders.style.display = 'none';
            
            // Create order card using same format as my_orders
            ordersList.innerHTML = createOrderCard(order);
            
            // Add event listeners to view details button
            const viewDetailsBtn = ordersList.querySelector('.view-details');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', function() {
                    showOrderDetails(order);
                });
            }
            
            // Add event listeners to track order button
            const trackOrderBtn = ordersList.querySelector('.track-order');
            if (trackOrderBtn) {
                trackOrderBtn.addEventListener('click', function() {
                    trackSpecificOrder(order.order_number);
                });
            }
        }
        
        // Create order card HTML (same as my_orders)
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
            
            // Create items HTML with images
            const itemsHTML = order.items.map(item => createOrderItem(item)).join('');
            
            return `
                <div class="order-card" data-status="${order.status.toLowerCase()}">
                    <div class="order-header">
                        <div class="order-meta">
                            <div class="meta-item">
                                <span class="meta-label">ORDER PLACED</span>
                                <span class="meta-value">${date} at ${time}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">TOTAL</span>
                                <span class="meta-value">₹${parseFloat(order.total).toFixed(2)}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">ORDER #</span>
                                <span class="meta-value">${order.order_number}</span>
                            </div>
                        </div>
                        <div class="order-status">
                            <span class="status-badge ${status.class}">${status.text}</span>
                        </div>
                    </div>
                    
                    <div class="order-body">
                        <div class="order-items">
                            ${itemsHTML}
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
        
        // Create order item HTML with image
        function createOrderItem(item) {
            const imageUrl = item.variant_primary_image?.image || 'assets/default-product.jpg';
            const altText = item.variant_primary_image?.alt_text || 'Product Image';
            
            return `
                <div class="order-item">
                    <div class="item-image">
                        <img src="${imageUrl}" alt="${altText}" loading="lazy"
                             onerror="this.src='assets/default-product.jpg'">
                    </div>
                    <div class="item-details">
                        <div class="item-name">${item.product_name || `Product ${item.product_id}`}</div>
                        <div class="item-meta">
                            <span>Qty: ${item.quantity}</span>
                           
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
        
        // Show order details modal
        function showOrderDetails(order) {
            const modal = document.getElementById('orderDetailsModal');
            const content = document.getElementById('orderDetailsContent');
            
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
                        <h3><i class="fas fa-box"></i> Items Ordered (${order.items.length})</h3>
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
                    
                    <div class="guest-note">
                        <div class="info-box">
                            <i class="fas fa-info-circle"></i>
                            <p>Note: You are viewing this order as a guest. To track all your orders and get better support, please <a href="login/signIn.html">create an account</a>.</p>
                        </div>
                    </div>
                </div>
            `;
            
            content.innerHTML = orderDetailsHTML;
            modal.style.display = 'flex';
            
            // Add close modal functionality
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.onclick = function() {
                    modal.style.display = 'none';
                };
            }
            
            // Close modal when clicking outside
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            };
        }
        
        // Create detailed order item HTML with image
        function createDetailedOrderItem(item) {
            const imageUrl = item.variant_primary_image?.image || 'assets/default-product.jpg';
            const altText = item.variant_primary_image?.alt_text || 'Product Image';
            
            return `
                <div class="detailed-order-item">
                    <div class="item-image">
                        <img src="${imageUrl}" alt="${altText}" loading="lazy"
                             onerror="this.src='assets/default-product.jpg'">
                    </div>
                    <div class="item-info">
                        <div class="item-name">${item.product_name || `Product ${item.product_id}`}</div>
                        
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
        
        // Track specific order
        function trackSpecificOrder(orderNumber) {
            showToast(`Tracking order #${orderNumber}... This feature will be implemented soon!`);
        }
        
        // Initialize modal
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
        }
        
        // Show error message
        function showError(element, message) {
            element.textContent = message;
            element.style.display = 'block';
        }
        
        // Hide error message
        function hideError(element) {
            element.style.display = 'none';
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
                background: #3b82f6;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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