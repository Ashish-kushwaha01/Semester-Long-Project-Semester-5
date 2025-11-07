// Vendor Dashboard JavaScript

let currentVendor = null;
let allVendorProducts = [];
let currentProductsPage = 1;
const PRODUCTS_PER_PAGE = 10;

// Initialize dashboard
function initializeDashboard() {
    currentVendor = getCurrentVendor();
    if (!currentVendor) return;
    
    // Update vendor name in header
    const vendorNameElement = document.getElementById('vendorName');
    if (vendorNameElement) {
        vendorNameElement.textContent = currentVendor.businessName || 'Vendor';
    }
    
    // Load initial data
    loadDashboardData();
    setupEventListeners();
    
    // Show welcome message
    showVendorToast(`Welcome back, ${currentVendor.businessName}!`, 'success');
}

// Load dashboard data
function loadDashboardData() {
    allVendorProducts = getVendorProducts(currentVendor.id);
    
    // Update counts
    const productsCountElement = document.getElementById('productsCount');
    const ordersCountElement = document.getElementById('ordersCount');
    
    if (productsCountElement) {
        productsCountElement.textContent = allVendorProducts.filter(p => p.status === 'active').length;
    }
    
    if (ordersCountElement) {
        ordersCountElement.textContent = getVendorOrders(currentVendor.id).length;
    }
    
    // Load dashboard stats
    loadDashboardStats();
    
    // Load recent orders
    loadRecentOrders();
    
    // Load products for products section
    loadProductsTable();
    
    // Load inventory
    loadInventory();
}

// Load dashboard statistics
function loadDashboardStats() {
    const analytics = getVendorAnalytics(currentVendor.id);
    
    // Update stats elements if they exist
    const totalRevenueElement = document.getElementById('totalRevenue');
    const totalOrdersElement = document.getElementById('totalOrders');
    const totalProductsElement = document.getElementById('totalProducts');
    const avgRatingElement = document.getElementById('avgRating');
    
    if (totalRevenueElement) totalRevenueElement.textContent = formatVendorCurrency(analytics.totalRevenue);
    if (totalOrdersElement) totalOrdersElement.textContent = analytics.totalOrders;
    if (totalProductsElement) totalProductsElement.textContent = analytics.totalProducts;
    if (avgRatingElement) avgRatingElement.textContent = analytics.avgRating;
    
    // Update inventory stats
    const lowStockCountElement = document.getElementById('lowStockCount');
    const outOfStockCountElement = document.getElementById('outOfStockCount');
    const totalInventoryValueElement = document.getElementById('totalInventoryValue');
    
    if (lowStockCountElement) lowStockCountElement.textContent = analytics.lowStockCount;
    if (outOfStockCountElement) outOfStockCountElement.textContent = analytics.outOfStockCount;
    if (totalInventoryValueElement) totalInventoryValueElement.textContent = formatVendorCurrency(analytics.totalInventoryValue);
}

// Load recent orders
function loadRecentOrders() {
    const orders = getVendorOrders(currentVendor.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    const ordersList = document.getElementById('recentOrdersList');
    if (!ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="no-data"><p>No recent orders</p></div>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item" onclick="viewOrderDetails('${order.id}')">
            <div class="order-info">
                <h4>Order #${order.id.slice(-8)}</h4>
                <p>${order.customerName} • ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="order-amount">${formatVendorCurrency(order.total)}</div>
        </div>
    `).join('');
}

// View order details (placeholder function)
function viewOrderDetails(orderId) {
    showVendorToast(`Viewing details for order ${orderId.slice(-8)}`, 'success');
    // In a real application, this would open a modal or navigate to order details
}

// Load products table
function loadProductsTable(page = 1) {
    currentProductsPage = page;
    
    const searchInput = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    
    // Filter products
    let filteredProducts = allVendorProducts.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm) ||
                            (product.sku && product.sku.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryValue || product.category === categoryValue;
        const matchesStatus = !statusValue || product.status === statusValue;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    // Paginate
    const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
    
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    
    if (paginatedProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    No products found. <a href="javascript:void(0)" onclick="showSection('add-product')">Add your first product</a>
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = paginatedProducts.map(product => `
            <tr>
                <td>
                    <div class="product-info">
                        <img src="${product.img}" alt="${product.title}" class="product-image" 
                            onerror="this.src='https://placehold.co/50x50?text=Product'">
                        <div class="product-details">
                            <h4>${product.title}</h4>
                            <p>SKU: ${product.sku}</p>
                        </div>
                    </div>
                </td>
                <td>${product.category}</td>
                <td>${formatVendorCurrency(product.price)}</td>
                <td>
                    <span class="stock-badge ${
                        product.stock === 0 ? 'out-of-stock' : 
                        product.stock <= product.lowStockAlert ? 'low-stock' : 'in-stock'
                    }">
                        ${product.stock} in stock
                    </span>
                </td>
                <td>
                    <span class="status-badge ${product.status}">${product.status}</span>
                </td>
                <td>
                    <div class="rating-display">
                        <span>${product.rating}</span>
                        <span>★</span>
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-action btn-edit" onclick="editProduct('${product.id}')" title="Edit">
                            ✏️
                        </button>
                        <button class="btn-action btn-stock" onclick="updateStock('${product.id}')" title="Update Stock">
                            📦
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteProduct('${product.id}')" title="Delete">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Update pagination
    updateProductsPagination(filteredProducts.length, page);
}

// Update products pagination
function updateProductsPagination(totalProducts, currentPage) {
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    const pagination = document.getElementById('productsPagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="loadProductsTable(${currentPage - 1})">← Previous</button>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="pagination-btn" onclick="loadProductsTable(${i})">${i}</button>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="loadProductsTable(${currentPage + 1})">Next →</button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Load inventory
function loadInventory() {
    const inventoryBody = document.getElementById('inventoryTableBody');
    if (!inventoryBody) return;
    
    const lowStockProducts = allVendorProducts.filter(p => p.stock > 0 && p.stock <= p.lowStockAlert);
    const outOfStockProducts = allVendorProducts.filter(p => p.stock === 0);
    
    const inventoryProducts = [...lowStockProducts, ...outOfStockProducts];
    
    if (inventoryProducts.length === 0) {
        inventoryBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">All products are well stocked</td>
            </tr>
        `;
    } else {
        inventoryBody.innerHTML = inventoryProducts.map(product => `
            <tr>
                <td>
                    <div class="product-info">
                        <img src="${product.img}" alt="${product.title}" class="product-image" 
                            onerror="this.src='https://placehold.co/50x50?text=Product'">
                        <div class="product-details">
                            <h4>${product.title}</h4>
                        </div>
                    </div>
                </td>
                <td>${product.sku}</td>
                <td>${product.stock}</td>
                <td>${product.lowStockAlert}</td>
                <td>
                    <span class="stock-badge ${
                        product.stock === 0 ? 'out-of-stock' : 'low-stock'
                    }">
                        ${product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                </td>
                <td>${new Date(product.updatedAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn-action btn-stock" onclick="updateStock('${product.id}')">
                        Update Stock
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Product search and filters
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (productSearch) {
        productSearch.addEventListener('input', () => {
            loadProductsTable(1);
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            loadProductsTable(1);
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            loadProductsTable(1);
        });
    }
    
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    // Stock update form
    const stockUpdateForm = document.getElementById('stockUpdateForm');
    if (stockUpdateForm) {
        stockUpdateForm.addEventListener('submit', handleStockUpdate);
    }
    
    // Image upload
    const productImages = document.getElementById('productImages');
    if (productImages) {
        productImages.addEventListener('change', handleImageUpload);
    }
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Stats cards click events
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', function() {
            const statType = this.querySelector('.stat-icon').className.split(' ')[1];
            switch(statType) {
                case 'revenue':
                    showSection('analytics');
                    break;
                case 'orders':
                    showSection('orders');
                    break;
                case 'products':
                    showSection('products');
                    break;
                case 'rating':
                    showSection('analytics');
                    break;
            }
        });
    });
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Activate corresponding nav item
    const correspondingNav = document.querySelector(`[data-section="${sectionId}"]`);
    if (correspondingNav) {
        correspondingNav.classList.add('active');
    }
    
    // Load section-specific data
    if (sectionId === 'products') {
        loadProductsTable(1);
    } else if (sectionId === 'inventory') {
        loadInventory();
    } else if (sectionId === 'analytics') {
        loadDashboardStats();
    }
}

// Handle add product
function handleAddProduct(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitProductBtn');
    setVendorButtonLoading(submitBtn, true);
    
    const productData = {
        title: document.getElementById('productTitle').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        desc: document.getElementById('productDescription').value,
        lowStockAlert: 10 // Default value
    };
    
    // Simulate API call
    setTimeout(() => {
        try {
            const newProduct = addVendorProduct(productData);
            showVendorToast(`Product "${newProduct.title}" added successfully!`);
            
            // Reset form
            document.getElementById('addProductForm').reset();
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview) {
                imagePreview.innerHTML = '';
            }
            
            // Update products list
            allVendorProducts = getVendorProducts(currentVendor.id);
            loadProductsTable(1);
            
            // Show products section
            showSection('products');
            
        } catch (error) {
            showVendorToast('Error adding product: ' + error.message, 'error');
        } finally {
            setVendorButtonLoading(submitBtn, false);
        }
    }, 1500);
}

// Edit product
function editProduct(productId) {
    const product = allVendorProducts.find(p => p.id === productId);
    if (!product) {
        showVendorToast('Product not found', 'error');
        return;
    }
    
    const modal = document.getElementById('editProductModal');
    const formContainer = document.getElementById('editProductFormContainer');
    
    if (!modal || !formContainer) {
        showVendorToast('Edit modal not found', 'error');
        return;
    }
    
    formContainer.innerHTML = `
        <form onsubmit="handleEditProduct('${productId}', event)">
            <div class="form-grid">
                <div class="form-group">
                    <label for="editTitle">Product Title</label>
                    <input type="text" id="editTitle" value="${product.title}" required>
                </div>
                <div class="form-group">
                    <label for="editCategory">Category</label>
                    <select id="editCategory" required>
                        <option value="Electronics" ${product.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
                        <option value="Fashion" ${product.category === 'Fashion' ? 'selected' : ''}>Fashion</option>
                        <option value="Home" ${product.category === 'Home' ? 'selected' : ''}>Home</option>
                        <option value="Sports" ${product.category === 'Sports' ? 'selected' : ''}>Sports</option>
                        <option value="Accessories" ${product.category === 'Accessories' ? 'selected' : ''}>Accessories</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editPrice">Price (₹)</label>
                    <input type="number" id="editPrice" value="${product.price}" required min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="editStock">Stock</label>
                    <input type="number" id="editStock" value="${product.stock}" required min="0">
                </div>
            </div>
            <div class="form-group">
                <label for="editDescription">Description</label>
                <textarea id="editDescription" required rows="4">${product.desc}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('editProductModal').style.display='none'">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Product</button>
            </div>
        </form>
    `;
    
    modal.style.display = 'block';
}

// Handle edit product
function handleEditProduct(productId, e) {
    e.preventDefault();
    
    const updates = {
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCategory').value,
        price: parseFloat(document.getElementById('editPrice').value),
        stock: parseInt(document.getElementById('editStock').value),
        desc: document.getElementById('editDescription').value
    };
    
    const updatedProduct = updateVendorProduct(productId, updates);
    
    if (updatedProduct) {
        showVendorToast(`Product "${updatedProduct.title}" updated successfully!`);
        document.getElementById('editProductModal').style.display = 'none';
        allVendorProducts = getVendorProducts(currentVendor.id);
        loadProductsTable(currentProductsPage);
        loadInventory();
        loadDashboardStats();
    } else {
        showVendorToast('Error updating product', 'error');
    }
}

// Update stock
function updateStock(productId) {
    const product = allVendorProducts.find(p => p.id === productId);
    if (!product) {
        showVendorToast('Product not found', 'error');
        return;
    }
    
    const modal = document.getElementById('stockUpdateModal');
    const productIdInput = document.getElementById('updateProductId');
    const stockQuantityInput = document.getElementById('updateStockQuantity');
    
    if (!modal || !productIdInput || !stockQuantityInput) {
        showVendorToast('Stock update modal not found', 'error');
        return;
    }
    
    productIdInput.value = productId;
    stockQuantityInput.value = product.stock;
    modal.style.display = 'block';
}

// Handle stock update
function handleStockUpdate(e) {
    e.preventDefault();
    
    const productId = document.getElementById('updateProductId').value;
    const newStock = parseInt(document.getElementById('updateStockQuantity').value);
    
    if (isNaN(newStock) || newStock < 0) {
        showVendorToast('Please enter a valid stock quantity', 'error');
        return;
    }
    
    const updatedProduct = updateProductStock(productId, newStock);
    
    if (updatedProduct) {
        showVendorToast(`Stock updated to ${newStock} for "${updatedProduct.title}"`);
        document.getElementById('stockUpdateModal').style.display = 'none';
        allVendorProducts = getVendorProducts(currentVendor.id);
        loadProductsTable(currentProductsPage);
        loadInventory();
        loadDashboardStats();
    } else {
        showVendorToast('Error updating stock', 'error');
    }
}

// Delete product
function deleteProduct(productId) {
    const product = allVendorProducts.find(p => p.id === productId);
    if (!product) {
        showVendorToast('Product not found', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete "${product.title}"? This will make it unavailable to customers.`)) {
        const deletedProduct = deleteVendorProduct(productId);
        if (deletedProduct) {
            showVendorToast(`Product "${deletedProduct.title}" has been deleted`);
            allVendorProducts = getVendorProducts(currentVendor.id);
            loadProductsTable(currentProductsPage);
            loadDashboardStats();
        } else {
            showVendorToast('Error deleting product', 'error');
        }
    }
}

// Handle image upload
function handleImageUpload(e) {
    const files = e.target.files;
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    preview.innerHTML = '';
    
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewImage = document.createElement('div');
                previewImage.className = 'preview-image';
                previewImage.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="remove-image" onclick="this.parentElement.remove()">×</button>
                `;
                preview.appendChild(previewImage);
            };
            reader.readAsDataURL(file);
        }
    }
}

// Add specification row
function addSpecification() {
    const container = document.getElementById('specificationsContainer');
    if (!container) return;
    
    const newRow = document.createElement('div');
    newRow.className = 'spec-row';
    newRow.innerHTML = `
        <input type="text" class="spec-key" placeholder="Specification (e.g., Brand)">
        <input type="text" class="spec-value" placeholder="Value (e.g., Sony)">
        <button type="button" class="btn-remove-spec" onclick="removeSpecification(this)">×</button>
    `;
    container.appendChild(newRow);
}

// Remove specification
function removeSpecification(button) {
    button.closest('.spec-row').remove();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Make functions available globally
window.showSection = showSection;
window.editProduct = editProduct;
window.updateStock = updateStock;
window.deleteProduct = deleteProduct;
window.handleEditProduct = handleEditProduct;
window.handleStockUpdate = handleStockUpdate;
window.handleImageUpload = handleImageUpload;
window.addSpecification = addSpecification;
window.removeSpecification = removeSpecification;
window.loadProductsTable = loadProductsTable;