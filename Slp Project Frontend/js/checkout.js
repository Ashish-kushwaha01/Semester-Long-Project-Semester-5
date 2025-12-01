document.addEventListener('DOMContentLoaded', function() {
    // Initialize auth state
    authManager.updateUIBasedOnAuth();
    
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

const API_BASE_URL = 'http://localhost:8000/api/product';
const ORDER_API_BASE_URL = 'http://localhost:8000/api/orders';

// Add this function to your checkout.js file
function handleDirectPurchase() {
    try {
        const directPurchaseRaw = localStorage.getItem('direct_purchase');
        if (!directPurchaseRaw) return null;
        
        const directPurchase = JSON.parse(directPurchaseRaw);
        
        if (directPurchase.type === 'direct_purchase') {
            console.log('🛒 Processing direct purchase (bypassing cart)');
            
            // Convert direct purchase to checkout format
            const checkoutData = {
                items: directPurchase.items,
                productDetails: directPurchase.productDetails,
                isDirectPurchase: true,
                source: directPurchase.source
            };
            
            // Save for checkout processing
            localStorage.setItem('checkout_cart', JSON.stringify(checkoutData.items));
            localStorage.setItem('checkout_product_details', JSON.stringify(checkoutData.productDetails));
            localStorage.setItem('is_direct_purchase', 'true');
            
            // Clean up direct purchase data
            localStorage.removeItem('direct_purchase');
            
            return checkoutData;
        }
    } catch (error) {
        console.error('❌ Error handling direct purchase:', error);
        localStorage.removeItem('direct_purchase');
    }
    
    return null;
}

async function renderCheckoutItems() {
    const container = document.getElementById('checkoutItems');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    
    // Check for direct purchase first
    const directPurchase = handleDirectPurchase();
    
    let cart, productDetails;
    
    if (directPurchase) {
        console.log('🎯 Rendering direct purchase items');
        cart = directPurchase.items;
        productDetails = directPurchase.productDetails;
    } else {
        // Normal cart flow - now using variant IDs
        cart = JSON.parse(localStorage.getItem('checkout_cart') || '{}');
        productDetails = JSON.parse(localStorage.getItem('checkout_product_details') || '{}');
    }
    
    // Check if cart is empty after processing
    if (Object.keys(cart).length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <p>No items in cart</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Cart is Empty';
        return;
    }
    
    // Show loading state
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading order details...</p>
        </div>
    `;

    try {
        let subtotal = 0;
        let html = '';
        
        // Process items using variant IDs
        for (const variantId of Object.keys(cart)) {
            let product;
            const quantity = cart[variantId];
            
            if (directPurchase && productDetails[variantId]) {
                // Use stored product details for direct purchase
                product = productDetails[variantId];
                console.log('📦 Using stored product details for direct purchase:', product);
            } else if (productDetails[variantId]) {
                // Use stored product details from cart
                product = productDetails[variantId];
                console.log('📦 Using stored product details from cart:', product);
            } else {
                // Fallback: fetch product details from API
                // Note: This now fetches by variant ID, but your API might need adjustment
                product = await fetchProductDetailsByVariant(variantId);
            }
            
            if (product) {
                const itemTotal = product.price * quantity;
                subtotal += itemTotal;
                
                html += `
                    <div class="checkout-item">
                        <img src="${product.img}" alt="${product.title}" 
                             onerror="this.src='assets/default-product.jpg'">
                        <div class="checkout-item-details">
                            <div class="checkout-item-title">${product.title}</div>
                            <div class="checkout-item-category">${product.category}</div>
                            <div class="checkout-item-price">₹${product.price.toLocaleString('en-IN')}</div>
                            <div class="checkout-item-quantity">Qty: ${quantity}</div>
                            ${directPurchase ? '<div class="direct-purchase-badge">Direct Purchase</div>' : ''}
                            <div class="variant-info">Variant ID: ${variantId}</div>
                        </div>
                        <div class="price">₹${itemTotal.toLocaleString('en-IN')}</div>
                    </div>
                `;
            } else {
                // Product not found - show placeholder
                html += `
                    <div class="checkout-item error">
                        <img src="assets/default-product.jpg" alt="Product not available">
                        <div class="checkout-item-details">
                            <div class="checkout-item-title">Product Not Available (Variant: ${variantId})</div>
                            <div class="checkout-item-price">Removed from cart</div>
                        </div>
                        <div class="price">—</div>
                    </div>
                `;
            }
        }
        
        container.innerHTML = html;
        
        const shipping = subtotal > 500 ? 0 : 50;
        const total = subtotal + shipping;
        
        subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
        shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`;
        totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
        
        // Update place order button text
        const buttonText = directPurchase ? 'Buy Now' : 'Place Order';
        placeOrderBtn.innerHTML = `${buttonText} - ₹${total.toLocaleString('en-IN')}`;
        placeOrderBtn.disabled = false;
        
        // Add special styling for direct purchase
        if (directPurchase) {
            placeOrderBtn.classList.add('direct-purchase-btn');
        } else {
            placeOrderBtn.classList.remove('direct-purchase-btn');
        }
        
    } catch (error) {
        console.error('❌ Error rendering checkout items:', error);
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <p>Failed to load order details</p>
                <button class="btn btn-outline" onclick="renderCheckoutItems()">Try Again</button>
            </div>
        `;
        placeOrderBtn.disabled = true;
    }
}

// Add this function to fetch product by variant ID (if needed)
async function fetchProductDetailsByVariant(variantId) {
    try {
        // You might need to create a new API endpoint to get product by variant ID
        // For now, this is a fallback
        console.log(`🔄 Fetching product for variant: ${variantId}`);
        // This would need to be implemented based on your API structure
        return null;
    } catch (error) {
        console.error(`❌ Error fetching variant ${variantId}:`, error);
        return null;
    }
}









// Fetch product details from API
async function fetchProductDetails(productId) {
    try {
        console.log(`🔄 Fetching product details for: ${productId}`);
        
        const response = await fetch(`${API_BASE_URL}/get/product/${productId}/`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const productData = await response.json();
        console.log('📦 Product data for checkout:', productData);
        
        return transformProductForCheckout(productData);
        
    } catch (error) {
        console.error(`❌ Error fetching product ${productId}:`, error);
        return null;
    }
}

// Transform API product data for checkout display
function transformProductForCheckout(backendProduct) {
    if (!backendProduct) return null;

    // Handle both array and single object responses
    const product = Array.isArray(backendProduct) ? backendProduct[0] : backendProduct;
    if (!product) return null;

    // Get the first variant for pricing and images
    const firstVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : null;

    // Get product image
    let productImage = 'assets/default-product.jpg';
    if (firstVariant && firstVariant.images && firstVariant.images.length > 0) {
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
    const price = firstVariant ? 
        parseFloat(firstVariant.adjusted_price) : 
        parseFloat(product.base_price || 0);

    return {
        id: product.id.toString(),
        title: product.title,
        price: price,
        img: productImage,
        category: categoryName
    };
}

function setupPaymentToggle() {
    const onlineRadio = document.getElementById('online');
    const codRadio = document.getElementById('cod');
    const onlineForm = document.getElementById('onlineForm');
    const codForm = document.getElementById('codForm');
    const codOption = document.getElementById('codOption');
    
    // Check if user is authenticated and show/hide COD option accordingly
    const isAuthenticated = authManager.isAuthenticated();
    if (!isAuthenticated) {
        codOption.classList.add('disabled');
        codOption.querySelector('.payment-desc').textContent = 'Login required for Cash on Delivery';
        onlineRadio.checked = true;
    }
    
    function togglePaymentForms() {
        if (onlineRadio.checked) {
            onlineForm.classList.add('active');
            codForm.classList.remove('active');
            onlineForm.style.display = 'block';
            codForm.style.display = 'none';
        } else {
            onlineForm.classList.remove('active');
            codForm.classList.add('active');
            onlineForm.style.display = 'none';
            codForm.style.display = 'block';
        }
    }
    
    onlineRadio.addEventListener('change', togglePaymentForms);
    codRadio.addEventListener('change', togglePaymentForms);
    
    // Initialize
    togglePaymentForms();
}

function setupPlaceOrder() {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const shippingForm = document.getElementById('shippingForm');
    
    placeOrderBtn.addEventListener('click', async function() {
        // Validate shipping form
        if (!validateCheckoutForm()) {
            return;
        }
        
        // Check if user is trying to use COD without login
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const isAuthenticated = authManager.isAuthenticated();
        
        if (paymentMethod === 'Cash_On_Delivery' && !isAuthenticated) {
            showNotification('Please login to use Cash on Delivery', 'error');
            return;
        }
        
        // Show loading state
        const originalText = placeOrderBtn.innerHTML;
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = `
            <div class="btn-loading">
                <span class="loading-spinner-small"></span>
                Processing Order...
            </div>
        `;
        
        try {
            // Process order based on payment method
            if (paymentMethod === 'Online_Mode') {
                await processOnlinePayment();
            } else if (paymentMethod === 'Cash_On_Delivery') {
                await processCashOnDelivery();
            }
            
        } catch (error) {
            console.error('❌ Order processing error:', error);
            showNotification('Failed to process order. Please try again.', 'error');
            
            // Reset button
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = originalText;
        }
    });
}

async function processOnlinePayment() {
    try {
        // Step 1: Validate checkout and get session ID
        const checkoutSessionId = await validateCheckout();
        
        // Step 2: Initiate payment with Razorpay
        const paymentData = await initiatePayment(checkoutSessionId);
        
        // Step 3: Open Razorpay payment gateway automatically
        await openRazorpayPayment(paymentData, checkoutSessionId);
        
    } catch (error) {
        console.error('❌ Online payment processing failed:', error);
        throw error;
    }
}

async function processCashOnDelivery() {
    try {
        // Step 1: Validate checkout and get session ID
        const checkoutSessionId = await validateCheckout();
        
        // Step 2: Create COD order
        const orderData = await createCodOrder(checkoutSessionId);
        
        // Show success notification
        showNotification('Order placed successfully with Cash on Delivery!', 'success');
        
        // Clear cart and redirect to success page
        clearCart();
        
        // Redirect to success page
        setTimeout(() => {
            window.location.href = `order_success.html?order_id=${orderData.order_number}&payment_method=cod`;
        }, 1000);
        
    } catch (error) {
        console.error('❌ COD order processing failed:', error);
        throw error;
    }
}


async function validateCheckout() {
    const shippingData = getShippingFormData();
    const cart = JSON.parse(localStorage.getItem('checkout_cart') || '{}');
    const productDetails = JSON.parse(localStorage.getItem('checkout_product_details') || '{}');
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const isAuthenticated = authManager.isAuthenticated();
    
    // Validate COD for guest users
    if (!isAuthenticated && paymentMethod === 'Cash_On_Delivery') {
        throw new Error('Please login to use Cash on Delivery');
    }

    // Prepare items for validation - use variant IDs
    const itemsWithQty = Object.keys(cart).map(variantId => ({
        item_id: parseInt(variantId), // This should now be the variant ID
        qty: parseInt(cart[variantId])
    }));

    console.log('🛒 Items with Qty for API (using variant IDs):', itemsWithQty);
    
    const payload = {
        items_with_qty: itemsWithQty,
        shipping_name: shippingData.fullName,
        shipping_phone: shippingData.phone,
        shipping_email: shippingData.email || '',
        shipping_address_1: shippingData.address,
        shipping_address_2: shippingData.address2 || '',
        shipping_city: shippingData.city,
        shipping_state: shippingData.state,
        shipping_pincode: shippingData.pincode,
        payment_method: paymentMethod
    };

    console.log('📤 Payload being sent to API:', payload);
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = localStorage.getItem('accessToken');
    if (token && isAuthenticated) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${ORDER_API_BASE_URL}/validate-checkout/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
            if (response.status === 400) {
                let errorMessage = 'Invalid data provided: ';
                if (data.errors) {
                    errorMessage += Object.values(data.errors).flat().join(', ');
                } else if (data.message) {
                    errorMessage = data.message;
                }
                throw new Error(errorMessage);
            }
            throw new Error(data.message || `Checkout validation failed (${response.status})`);
        }
        
        console.log('✅ Checkout validated. Session ID:', data.checkout_session_id);
        return data.checkout_session_id;
        
    } catch (error) {
        console.error('❌ Checkout validation failed:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}



async function initiatePayment(checkoutSessionId) {
    try {
        // Prepare headers with authentication if available
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${ORDER_API_BASE_URL}/initiate-payment/`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                checkout_session_id: checkoutSessionId
            })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication required. Please login to continue.');
            }
            
            const errorData = await response.json();
            throw new Error(errorData.message || 'Payment initiation failed');
        }
        
        const data = await response.json();
        console.log('✅ Payment initiated:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Payment initiation failed:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

async function createCodOrder(checkoutSessionId) {
    try {
        const response = await fetch(`${ORDER_API_BASE_URL}/create-order-cod/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({
                checkout_session_id: checkoutSessionId
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'COD order creation failed');
        }
        
        const data = await response.json();
        console.log('✅ COD order created:', data);
        return data;
        
    } catch (error) {
        console.error('❌ COD order creation failed:', error);
        showNotification('COD order creation failed: ' + error.message, 'error');
        throw error;
    }
}

function openRazorpayPayment(paymentData, checkoutSessionId) {
    return new Promise((resolve, reject) => {
        // Calculate amount in paise (Razorpay requires amount in smallest currency unit)
        const amountInPaise = Math.round(paymentData.amount * 100);
        
        const options = {
            "key": paymentData.razorpay_key, // Automatically from API
            "amount": amountInPaise.toString(), // Convert to string as required by Razorpay
            "currency": paymentData.currency || "INR",
            "name": "ShopWaveX",
            "description": "Product Purchase",
            "image": "../assets/logo.png", // Your logo
            "order_id": paymentData.payment_gateway_id, // Automatically from API
            "handler": function (response) {
                // Payment successful
                console.log('Payment successful:', response);
                handleSuccessfulPayment(response, checkoutSessionId);
                resolve(response);
            },
            "prefill": {
                "name": document.querySelector('input[placeholder="Ashish Kushwaha"]').value,
                "email": document.querySelector('input[type="email"]').value,
                "contact": document.querySelector('input[type="tel"]').value
            },
            "notes": {
                "checkout_session_id": checkoutSessionId,
                "platform": "website"
            },
            "theme": {
                "color": "#3399cc"
            },
            "modal": {
                "ondismiss": function() {
                    console.log('Payment modal dismissed');
                    showNotification('Payment cancelled', 'error');
                    reject(new Error('Payment cancelled by user'));
                }
            }
        };

        console.log('🔧 Razorpay Options:', options);

        // Check if Razorpay is loaded
        if (typeof Razorpay === 'undefined') {
            // Load Razorpay script dynamically
            loadRazorpayScript().then(() => {
                initializeRazorpay(options, resolve, reject);
            }).catch(error => {
                console.error('❌ Failed to load Razorpay:', error);
                showNotification('Payment gateway loading failed', 'error');
                reject(error);
            });
        } else {
            initializeRazorpay(options, resolve, reject);
        }
    });
}

function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

function initializeRazorpay(options, resolve, reject) {
    try {
        const rzp1 = new Razorpay(options);
        
        rzp1.on('payment.failed', function (response) {
            console.error('Payment failed:', response.error);
            showNotification(`Payment failed: ${response.error.description}`, 'error');
            reject(new Error(`Payment failed: ${response.error.description}`));
        });

        // Open Razorpay payment modal automatically
        console.log('🚀 Opening Razorpay payment modal...');
        rzp1.open();
        
    } catch (error) {
        console.error('❌ Razorpay initialization failed:', error);
        showNotification('Payment gateway error', 'error');
        reject(error);
    }
}

function handleSuccessfulPayment(response, checkoutSessionId) {
    // Show success message
    showNotification('Payment successful! Order is being processed.', 'success');
    
    // Clear cart
    clearCart();
    
    // Store order information
    localStorage.setItem('last_payment_response', JSON.stringify({
        ...response,
        checkout_session_id: checkoutSessionId
    }));
    
    // Redirect to success page after a short delay
    setTimeout(() => {
        window.location.href = `order_success.html?order_id=${checkoutSessionId}&payment_id=${response.razorpay_payment_id}`;
    }, 1500);
}

// Form Validation Functions
function validateCheckoutForm() {
    const shippingForm = document.getElementById('shippingForm');
    const requiredInputs = shippingForm.querySelectorAll('input[required]');
    let isValid = true;
    
    // Clear previous errors
    clearFormErrors(shippingForm);
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
            
            if (isValid === false) {
                input.focus();
                isValid = false;
            }
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
            showFieldError(input, 'Please enter a valid email address');
            isValid = false;
        } else if (input.type === 'tel' && !isValidPhone(input.value)) {
            showFieldError(input, 'Please enter a valid phone number');
            isValid = false;
        } else if (input.placeholder === 'PIN Code' && !isValidPincode(input.value)) {
            showFieldError(input, 'Please enter a valid PIN code');
            isValid = false;
        }
    });
    
    return isValid;
}

// Validation helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function isValidPincode(pincode) {
    const pincodeRegex = /^\d{6}$/;
    return pincodeRegex.test(pincode);
}

// Form error handling
function showFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    let errorElement = formGroup.querySelector('.field-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    input.style.borderColor = '#ef4444';
}

function clearFormErrors(form) {
    const errors = form.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());
    
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => input.style.borderColor = '');
}


function getShippingFormData() {
    const form = document.getElementById('shippingForm');
    
    // Direct field mapping using name attributes
    const getValue = (name) => {
        const input = form.querySelector(`[name="${name}"]`);
        return input ? input.value.trim() : '';
    };

    const data = {
        fullName: getValue('fullName'),
        email: getValue('email'),
        phone: getValue('phone'),
        address: getValue('address1'),
        address2: getValue('address2') || 'Not provided', // Provide default if empty
        city: getValue('city'),
        state: getValue('state'),
        pincode: getValue('pincode')
    };

    console.log('🏠 Shipping data extracted:', data);
    
    // Validate that required fields are not empty
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    const emptyFields = requiredFields.filter(field => !data[field]);
    
    if (emptyFields.length > 0) {
        console.error('❌ Required fields are empty:', emptyFields);
        // Highlight empty fields to user
        emptyFields.forEach(field => {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.style.borderColor = '#ef4444';
                showFieldError(input, 'This field is required');
            }
        });
        throw new Error('Please fill all required fields');
    }

    return data;
}

// Add this function to debug API endpoints
function debugApiEndpoints() {
    console.log('🔍 API Endpoints Debug Info:');
    console.log('Product API Base:', API_BASE_URL);
    console.log('Order API Base:', ORDER_API_BASE_URL);
    console.log('Full Validate Checkout URL:', `${ORDER_API_BASE_URL}/validate-checkout/`);
    console.log('Full Initiate Payment URL:', `${ORDER_API_BASE_URL}/initiate-payment/`);
    console.log('Full COD Order URL:', `${ORDER_API_BASE_URL}/create-order-cod/`);
}

// Call this at the beginning to verify endpoints
debugApiEndpoints();

function clearCart() {
    localStorage.removeItem('shopWave_X_cart');
    localStorage.removeItem('checkout_cart');
    localStorage.removeItem('checkout_product_details');
    localStorage.removeItem('is_direct_purchase');
    updateCartCount();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : '⚠️'}</span>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Helper function to get product details from storage
function getProductDetailsFromStorage() {
    return JSON.parse(localStorage.getItem('checkout_product_details') || '{}');
}

// Add CSS for notifications and loading states
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
    }
    
    .loading-spinner {
        border: 3px solid #f3f4f6;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
    }
    
    .loading-spinner-small {
        border: 2px solid #f3f4f6;
        border-top: 2px solid #ffffff;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        animation: spin 1s linear infinite;
        margin-right: 8px;
        display: inline-block;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .btn-loading {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .field-error {
        color: #ef4444;
        font-size: 14px;
        margin-top: 4px;
    }
    
    .empty-cart, .error-state {
        text-align: center;
        padding: 40px;
    }
    
    .empty-icon, .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }
    
    .checkout-item.error {
        opacity: 0.6;
        background: #fef2f2;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .direct-purchase-badge {
        background: #3b82f6;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        margin-top: 4px;
        display: inline-block;
    }
    
    .direct-purchase-btn {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    }
`;
document.head.appendChild(style);