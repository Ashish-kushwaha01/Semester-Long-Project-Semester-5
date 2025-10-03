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
            localStorage.removeItem('amazon_clone_cart');
            localStorage.removeItem('checkout_cart');
            
            // Redirect to success page
            window.location.href = 'order_success.html';
        }, 2000);
    });
}
















// document.addEventListener('DOMContentLoaded', function() {
//     // Initialize cart count
//     updateCartCount();
    
//     // Load and display checkout items
//     renderCheckoutItems();
    
//     // Setup payment method toggle
//     setupPaymentToggle();
    
//     // Setup step navigation
//     setupStepNavigation();
    
//     // Setup place order button
//     setupPlaceOrder();
    
//     // Update year in footer
//     document.getElementById('year').textContent = new Date().getFullYear();
// });

// let currentStep = 1;
// const shippingData = {};

// function setupStepNavigation() {
//     // Next to Payment button
//     document.getElementById('nextToPayment').addEventListener('click', function() {
//         if (validateShippingForm()) {
//             saveShippingData();
//             goToStep(2);
//         }
//     });
    
//     // Back to Shipping button
//     document.getElementById('backToShipping').addEventListener('click', function() {
//         goToStep(1);
//     });
    
//     // Review Order button
//     document.getElementById('reviewOrder').addEventListener('click', function() {
//         if (validatePaymentForm()) {
//             savePaymentData();
//             updateReviewSection();
//             goToStep(3);
//         }
//     });
    
//     // Back to Payment button
//     document.getElementById('backToPayment').addEventListener('click', function() {
//         goToStep(2);
//     });
    
//     // Step click handlers for completed steps
//     document.querySelectorAll('.step.completed').forEach(step => {
//         step.addEventListener('click', function() {
//             const stepNumber = parseInt(this.getAttribute('data-step'));
//             if (stepNumber < currentStep) {
//                 goToStep(stepNumber);
//             }
//         });
//     });
// }

// function goToStep(stepNumber) {
//     // Hide all steps
//     document.querySelectorAll('.checkout-step').forEach(step => {
//         step.classList.remove('active');
//     });
    
//     // Update steps appearance
//     document.querySelectorAll('.step').forEach(step => {
//         const stepNum = parseInt(step.getAttribute('data-step'));
//         step.classList.remove('active', 'completed');
        
//         if (stepNum === stepNumber) {
//             step.classList.add('active');
//         } else if (stepNum < stepNumber) {
//             step.classList.add('completed');
//         }
//     });
    
//     // Show current step
//     document.getElementById(`step${stepNumber}`).classList.add('active');
//     currentStep = stepNumber;
    
//     // Update order summary for each step
//     if (stepNumber === 2) {
//         renderCheckoutItemsForStep('Step2');
//     } else if (stepNumber === 3) {
//         renderCheckoutItemsForStep('Step3');
//         updateFinalTotal();
//     }
// }

// function validateShippingForm() {
//     const form = document.getElementById('shippingForm');
//     if (!form.checkValidity()) {
//         form.reportValidity();
//         return false;
//     }
//     return true;
// }

// function validatePaymentForm() {
//     const cardRadio = document.getElementById('card');
//     if (cardRadio.checked) {
//         const cardForm = document.getElementById('cardForm');
//         const cardInputs = cardForm.querySelectorAll('input[required]');
//         let isValid = true;
        
//         cardInputs.forEach(input => {
//             if (!input.value.trim()) {
//                 isValid = false;
//                 input.focus();
//             }
//         });
        
//         if (!isValid) {
//             alert('Please fill all card details');
//             return false;
//         }
//     }
//     return true;
// }

// function saveShippingData() {
//     const form = document.getElementById('shippingForm');
//     const inputs = form.querySelectorAll('input');
//     inputs.forEach(input => {
//         shippingData[input.previousElementSibling.textContent] = input.value;
//     });
// }

// function savePaymentData() {
//     const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
//     shippingData.paymentMethod = paymentMethod;
// }

// function updateReviewSection() {
//     // Update shipping review
//     const shippingReview = document.getElementById('shippingReview');
//     shippingReview.innerHTML = `
//         <p><strong>${shippingData['Full Name']}</strong></p>
//         <p>${shippingData['Email']}</p>
//         <p>${shippingData['Phone Number']}</p>
//         <p>${shippingData.Address}</p>
//     `;
    
//     // Update payment review
//     const paymentReview = document.getElementById('paymentReview');
//     const paymentText = shippingData.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery';
//     paymentReview.innerHTML = `<p>${paymentText}</p>`;
// }

// function updateFinalTotal() {
//     const total = document.getElementById('total').textContent;
//     document.getElementById('finalTotal').textContent = total;
// }

// function renderCheckoutItemsForStep(stepSuffix) {
//     const cart = JSON.parse(localStorage.getItem('checkout_cart') || '{}');
//     const container = document.getElementById(`checkoutItems${stepSuffix}`);
//     const subtotalEl = document.getElementById(`subtotal${stepSuffix}`);
//     const shippingEl = document.getElementById(`shipping${stepSuffix}`);
//     const totalEl = document.getElementById(`total${stepSuffix}`);
    
//     if (Object.keys(cart).length === 0) {
//         container.innerHTML = '<p>No items in cart</p>';
//         return;
//     }
    
//     let subtotal = 0;
//     let html = '';
    
//     Object.keys(cart).forEach(productId => {
//         const product = findProductById(productId);
//         const quantity = cart[productId];
//         const itemTotal = product.price * quantity;
//         subtotal += itemTotal;
        
//         html += `
//             <div class="checkout-item">
//                 <img src="${product.img}" alt="${product.title}">
//                 <div class="checkout-item-details">
//                     <div class="checkout-item-title">${product.title}</div>
//                     <div class="checkout-item-price">₹${product.price.toLocaleString('en-IN')}</div>
//                     <div class="checkout-item-quantity">Qty: ${quantity}</div>
//                 </div>
//                 <div class="price">₹${itemTotal.toLocaleString('en-IN')}</div>
//             </div>
//         `;
//     });
    
//     container.innerHTML = html;
    
//     const shipping = subtotal > 500 ? 0 : 50;
//     const total = subtotal + shipping;
    
//     subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
//     shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`;
//     totalEl.textContent = `₹${total.toLocaleString('en-IN')}`;
// }

// // Keep the existing renderCheckoutItems, setupPaymentToggle, and setupPlaceOrder functions...
// // (The rest of your existing checkout.js code remains the same)