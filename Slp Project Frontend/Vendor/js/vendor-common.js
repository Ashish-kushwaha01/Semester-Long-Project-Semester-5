// Vendor Common JavaScript - Shared between all vendor pages

// Vendor product database - Extends the main SAMPLE_PRODUCTS
const VENDOR_PRODUCTS_KEY = 'vendor_products';
const VENDOR_ORDERS_KEY = 'vendor_orders';
const CURRENT_VENDOR_KEY = 'current_vendor';

// Sample products for vendor (extended version)
const VENDOR_SAMPLE_PRODUCTS = [
    { 
        id: 'p1', 
        title: 'Wireless Noise-Cancelling Headphones', 
        price: 119.99, 
        rating: 4.6, 
        img: 'assets/headphones.jpg', 
        category: 'Electronics', 
        desc: 'High-quality over-ear headphones with active noise cancellation.',
        vendorId: 'vendor_1',
        sku: 'SKU-ELEC-001',
        stock: 45,
        lowStockAlert: 10,
        status: 'active',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-03-20').toISOString(),
        salesCount: 23,
        isVendorProduct: true
    },
    { 
        id: 'p2', 
        title: 'Smartwatch Series 5', 
        price: 149.99, 
        rating: 4.4, 
        img: 'assets/smartwatch.jpg', 
        category: 'Electronics', 
        desc: 'Fitness tracking, heart-rate monitoring and notifications.',
        vendorId: 'vendor_1',
        sku: 'SKU-ELEC-002',
        stock: 32,
        lowStockAlert: 10,
        status: 'active',
        createdAt: new Date('2024-02-10').toISOString(),
        updatedAt: new Date('2024-03-18').toISOString(),
        salesCount: 18,
        isVendorProduct: true
    },
    { 
        id: 'p3', 
        title: 'Stainless Steel Water Bottle 1L', 
        price: 19.99, 
        rating: 4.8, 
        img: 'assets/water-bottle.jpg', 
        category: 'Home', 
        desc: 'Keeps drinks cold for 24 hours.',
        vendorId: 'vendor_1',
        sku: 'SKU-HOME-001',
        stock: 5,
        lowStockAlert: 10,
        status: 'active',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date('2024-03-22').toISOString(),
        salesCount: 45,
        isVendorProduct: true
    }
];

// Sample orders for vendor
const VENDOR_SAMPLE_ORDERS = [
    {
        id: 'order_001',
        vendorId: 'vendor_1',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        total: 139.98,
        status: 'completed',
        items: [
            { productId: 'p1', quantity: 1, price: 119.99 },
            { productId: 'p3', quantity: 1, price: 19.99 }
        ],
        createdAt: new Date('2024-03-15').toISOString(),
        updatedAt: new Date('2024-03-15').toISOString()
    },
    {
        id: 'order_002',
        vendorId: 'vendor_1',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@email.com',
        total: 149.99,
        status: 'completed',
        items: [
            { productId: 'p2', quantity: 1, price: 149.99 }
        ],
        createdAt: new Date('2024-03-18').toISOString(),
        updatedAt: new Date('2024-03-18').toISOString()
    },
    {
        id: 'order_003',
        vendorId: 'vendor_1',
        customerName: 'Mike Wilson',
        customerEmail: 'mike.wilson@email.com',
        total: 19.99,
        status: 'pending',
        items: [
            { productId: 'p3', quantity: 1, price: 19.99 }
        ],
        createdAt: new Date('2024-03-22').toISOString(),
        updatedAt: new Date('2024-03-22').toISOString()
    }
];

// Initialize vendor products from main products if not exists
function initializeVendorProducts() {
    if (!localStorage.getItem(VENDOR_PRODUCTS_KEY)) {
        localStorage.setItem(VENDOR_PRODUCTS_KEY, JSON.stringify(VENDOR_SAMPLE_PRODUCTS));
    }
    
    if (!localStorage.getItem(VENDOR_ORDERS_KEY)) {
        localStorage.setItem(VENDOR_ORDERS_KEY, JSON.stringify(VENDOR_SAMPLE_ORDERS));
    }
    
    // Initialize current vendor if not exists (for demo purposes)
    if (!localStorage.getItem(CURRENT_VENDOR_KEY)) {
        const demoVendor = {
            id: 'vendor_1',
            businessName: 'TechGadgets Inc.',
            email: 'vendor@techgadgets.com',
            phone: '+1-555-0123',
            joinedDate: new Date('2024-01-01').toISOString()
        };
        localStorage.setItem(CURRENT_VENDOR_KEY, JSON.stringify(demoVendor));
    }
}

// Generate unique SKU
function generateSKU() {
    return 'SKU-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Get current vendor
function getCurrentVendor() {
    const vendor = localStorage.getItem(CURRENT_VENDOR_KEY);
    return vendor ? JSON.parse(vendor) : null;
}

// Check vendor authentication
function checkVendorAuth() {
    const vendor = getCurrentVendor();
    if (!vendor) {
        // Redirect to signin page if not on signin/signup pages
        if (!window.location.pathname.includes('vendor-signin.html') && 
            !window.location.pathname.includes('vendor-signup.html')) {
            window.location.href = 'vendor-signin.html';
        }
        return false;
    }
    return true;
}

// Vendor logout
function vendorLogout() {
    localStorage.removeItem(CURRENT_VENDOR_KEY);
    window.location.href = 'vendor-signin.html';
}

// Get vendor products
function getVendorProducts(vendorId = null) {
    const products = JSON.parse(localStorage.getItem(VENDOR_PRODUCTS_KEY) || '[]');
    if (vendorId) {
        return products.filter(product => product.vendorId === vendorId);
    }
    return products;
}

// Get vendor orders
function getVendorOrders(vendorId = null) {
    const orders = JSON.parse(localStorage.getItem(VENDOR_ORDERS_KEY) || '[]');
    if (vendorId) {
        return orders.filter(order => order.vendorId === vendorId);
    }
    return orders;
}

// Save vendor products
function saveVendorProducts(products) {
    localStorage.setItem(VENDOR_PRODUCTS_KEY, JSON.stringify(products));
    // Also update the main products for customer view
    updateMainProducts(products);
}

// Update main products when vendor makes changes
function updateMainProducts(vendorProducts) {
    const activeVendorProducts = vendorProducts.filter(p => p.status === 'active');
    
    // Get existing customer products or initialize
    let customerProducts = JSON.parse(localStorage.getItem('customer_products') || '[]');
    
    // Update or add vendor products
    vendorProducts.forEach(vendorProduct => {
        if (vendorProduct.status === 'active') {
            const existingIndex = customerProducts.findIndex(p => p.id === vendorProduct.id);
            if (existingIndex !== -1) {
                // Update existing product
                customerProducts[existingIndex] = {
                    ...customerProducts[existingIndex],
                    price: vendorProduct.price,
                    title: vendorProduct.title,
                    desc: vendorProduct.desc,
                    category: vendorProduct.category,
                    img: vendorProduct.img
                };
            } else {
                // Add new product (without vendor-specific fields)
                const { vendorId, sku, lowStockAlert, status, createdAt, updatedAt, salesCount, isVendorProduct, ...customerProduct } = vendorProduct;
                customerProducts.push(customerProduct);
            }
        } else {
            // Remove inactive products
            customerProducts = customerProducts.filter(p => p.id !== vendorProduct.id);
        }
    });
    
    localStorage.setItem('customer_products', JSON.stringify(customerProducts));
}

// Add new product
function addVendorProduct(productData) {
    const products = getVendorProducts();
    const newProduct = {
        id: 'vp_' + Date.now(),
        ...productData,
        vendorId: getCurrentVendor()?.id || 'default_vendor',
        sku: generateSKU(),
        rating: 4.0,
        salesCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVendorProduct: true,
        img: productData.img || 'assets/products/default-product.jpg'
    };
    
    products.push(newProduct);
    saveVendorProducts(products);
    return newProduct;
}

// Update product
function updateVendorProduct(productId, updates) {
    const products = getVendorProducts();
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products[index] = {
            ...products[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        saveVendorProducts(products);
        return products[index];
    }
    return null;
}

// Delete product (soft delete by setting status to inactive)
function deleteVendorProduct(productId) {
    return updateVendorProduct(productId, { status: 'inactive' });
}

// Update product stock
function updateProductStock(productId, newStock) {
    const product = updateVendorProduct(productId, { stock: newStock });
    
    if (product && newStock === 0) {
        // If stock is 0, show out of stock in customer view
        showVendorToast(`Product "${product.title}" is now out of stock`, 'warning');
    } else if (product && newStock <= product.lowStockAlert) {
        showVendorToast(`Product "${product.title}" is running low on stock`, 'warning');
    }
    
    return product;
}

// Get vendor analytics
function getVendorAnalytics(vendorId) {
    const products = getVendorProducts(vendorId);
    const orders = getVendorOrders(vendorId);
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalProducts = products.filter(p => p.status === 'active').length;
    const activeProducts = products.filter(p => p.status === 'active');
    const avgRating = activeProducts.length > 0 
        ? activeProducts.reduce((sum, product) => sum + (product.rating || 0), 0) / activeProducts.length 
        : 0;
    
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.lowStockAlert).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    return {
        totalRevenue,
        totalOrders,
        totalProducts,
        avgRating: parseFloat(avgRating.toFixed(1)),
        lowStockCount,
        outOfStockCount,
        totalInventoryValue
    };
}

// Show toast notification
function showVendorToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.vendor-toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `vendor-toast vendor-toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Set button loading state
function setVendorButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        button.disabled = true;
        if (btnText) btnText.style.visibility = 'hidden';
        if (btnLoader) btnLoader.style.display = 'inline-block';
    } else {
        button.disabled = false;
        if (btnText) btnText.style.visibility = 'visible';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

// Format currency
function formatVendorCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// Load sample orders for demo
function loadSampleOrders() {
    const orders = getVendorOrders();
    if (orders.length === 0) {
        localStorage.setItem(VENDOR_ORDERS_KEY, JSON.stringify(VENDOR_SAMPLE_ORDERS));
        showVendorToast('Sample orders loaded successfully!');
        
        // Refresh the dashboard if we're on the orders page
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
    } else {
        showVendorToast('Orders are already loaded', 'warning');
    }
}

// Initialize vendor system
document.addEventListener('DOMContentLoaded', function() {
    initializeVendorProducts();
    
    // Check auth on vendor pages
    if (window.location.pathname.includes('vendor-') && 
        !window.location.pathname.includes('vendor-signin.html') &&
        !window.location.pathname.includes('vendor-signup.html')) {
        checkVendorAuth();
    }
});

// Make functions available globally
window.vendorLogout = vendorLogout;
window.showVendorToast = showVendorToast;
window.formatVendorCurrency = formatVendorCurrency;
window.setVendorButtonLoading = setVendorButtonLoading;
window.loadSampleOrders = loadSampleOrders;