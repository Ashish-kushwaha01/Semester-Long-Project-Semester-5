class VendorDashboard {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/product';
        this.vendorBaseURL = 'http://localhost:8000/api/vendors';
        this.orderBaseURL = 'http://localhost:8000/api/orders'; // Add this line for order base url
        this.currentProductId = null;
        this.currentVariantId = null;
        this.categories = [];
        this.products = [];
        this.currentProductAttributes = [];
        this.vendorInfo = null;
        this.deletedImages = [];
        this.existingPrimaryImageId = null;
        this.newPrimaryImage = null;
        this.orders = []; // Add this to store orders
        this.currentOrder = null; // For detailed view


        this.init();
    }

    init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            return;
        }

        this.bindEvents();
        this.loadVendorProfile();
        this.loadCategories();
        this.loadProducts();
        // this.updateDashboardStats();
        this.loadOrders(); //  load orders on startup
    }

    checkAuthentication() {
        const accessToken = localStorage.getItem('vendor_access_token');
        const vendorInfo = localStorage.getItem('vendor_info');

        if (!accessToken || !vendorInfo) {
            this.showNotification('Please sign in to access the dashboard', 'error');
            setTimeout(() => {
                window.location.href = '../Authentication/SignIn/SignIn.html';
            }, 2000);
            return false;
        }

        try {
            this.vendorInfo = JSON.parse(vendorInfo);
            console.log('🔐 Vendor authenticated:', this.vendorInfo);
            return true;
        } catch (error) {
            console.error('Error parsing vendor info:', error);
            this.clearSession();
            window.location.href = '../Authentication/SignIn/SignIn.html';
            return false;
        }
    }

    clearSession() {
        localStorage.removeItem('vendor_access_token');
        localStorage.removeItem('vendor_refresh_token');
        localStorage.removeItem('vendor_info');
        localStorage.removeItem('vendor_auth_info');
    }

    async loadVendorProfile() {
        try {
            const vendorInfo = localStorage.getItem('vendor_info');
            if (vendorInfo) {
                const vendor = JSON.parse(vendorInfo);
                this.updateVendorUI(vendor);
            } else {
                // If vendor info is not in localStorage, fetch it from API
                await this.fetchVendorProfile();
            }
        } catch (error) {
            console.error('Error loading vendor profile:', error);
            this.showFallbackVendorUI();
        }
    }

    async fetchVendorProfile() {
        try {
            const token = localStorage.getItem('vendor_access_token');
            const response = await fetch(`${this.vendorBaseURL}/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const vendorData = await response.json();
                localStorage.setItem('vendor_info', JSON.stringify(vendorData));
                this.vendorInfo = vendorData;
                this.updateVendorUI(vendorData);
            } else {
                console.warn('Failed to fetch vendor profile, using stored data');
                this.showFallbackVendorUI();
            }
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
            this.showFallbackVendorUI();
        }
    }

    updateVendorUI(vendor) {
        console.log('🔄 Updating vendor UI with:', vendor);
        
        const vendorNameElement = document.getElementById('vendor-name');
        
        if (!vendorNameElement) {
            console.warn('⚠️ Vendor name element not found');
            return;
        }

        // Try different possible field names for vendor name
        const vendorName = 
            vendor.business_name || 
            vendor.seller_name || 
            vendor.full_name || 
            (vendor.business_email ? vendor.business_email.split('@')[0] : 'Vendor Account');

        vendorNameElement.textContent = vendorName;
        
        console.log('✅ Vendor name updated to:', vendorName);

        // Update vendor avatar with initials
        this.updateVendorAvatar(vendorName);

        // Update additional vendor info if elements exist
        this.updateAdditionalVendorInfo(vendor);
    }

    updateVendorAvatar(vendorName) {
        const avatarElement = document.querySelector('.user-avatar');
        if (!avatarElement) return;

        // Get initials from vendor name
        const initials = vendorName
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);

        // Create avatar with initials
        avatarElement.innerHTML = `<span class="avatar-initials">${initials}</span>`;
        
        // Add styles for avatar initials if not already added
        if (!document.querySelector('#avatar-styles')) {
            const style = document.createElement('style');
            style.id = 'avatar-styles';
            style.textContent = `
                .avatar-initials {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                    border-radius: 50%;
                }
                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8f9fa;
                    border: 2px solid #e9ecef;
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateAdditionalVendorInfo(vendor) {
        // Update email if element exists
        const emailElement = document.querySelector('.user-email');
        if (emailElement && vendor.business_email) {
            emailElement.textContent = vendor.business_email;
        }

        // Update store status
        const statusElement = document.querySelector('.store-status');
        if (statusElement) {
            const status = vendor.is_onboarding_complete ? 'Active' : 'In Progress';
            statusElement.textContent = `Store: ${status}`;
        }
    }

    showFallbackVendorUI() {
        console.log('🔄 Showing fallback vendor UI');
        
        const vendorNameElement = document.getElementById('vendor-name');
        if (vendorNameElement) {
            // Try to get business email from various sources
            let businessEmail = '';
            
            if (this.vendorInfo && this.vendorInfo.business_email) {
                businessEmail = this.vendorInfo.business_email;
            } else {
                const vendorInfoStr = localStorage.getItem('vendor_info');
                if (vendorInfoStr) {
                    try {
                        const vendor = JSON.parse(vendorInfoStr);
                        businessEmail = vendor.business_email || '';
                    } catch (e) {
                        console.error('Error parsing vendor info:', e);
                    }
                }
            }
            
            const displayName = businessEmail ? 
                businessEmail.split('@')[0] : 
                'Vendor Account';
                
            vendorNameElement.textContent = displayName;
            
            // Update avatar with fallback
            this.updateVendorAvatar(displayName);
        }
    }

    bindEvents() {
        console.log('🔧 Binding events...');

        // Navigation - Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            if (item.dataset.page) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('📱 Menu item clicked:', item.dataset.page);
                    this.switchPage(item.dataset.page);
                });
            }
        });

        // User dropdown
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeUserDropdown();
        });

        // Add Product button in products section
        const addProductBtn = document.querySelector('.btn-primary[data-page="add-product"]');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('➕ Add Product button clicked');
                this.switchPage('add-product');
            });
        }

        // Back to Products button in add-product section  
        const backToProductsBtn = document.querySelector('.btn-secondary[data-page="products"]');
        if (backToProductsBtn) {
            backToProductsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('⬅️ Back to Products button clicked');
                this.switchPage('products');
            });
        }

         // Orders search and filter
    document.getElementById('search-orders')?.addEventListener('input', (e) => this.filterOrders(e.target.value));
    document.getElementById('order-status-filter')?.addEventListener('change', (e) => this.filterOrdersByStatus(e.target.value));
    document.getElementById('refresh-orders')?.addEventListener('click', () => this.loadOrders());
    // Order form submission
    document.getElementById('update-status-form')?.addEventListener('submit', (e) => this.submitStatusUpdate(e));
    
    // Analytics period change
    document.getElementById('analytics-period')?.addEventListener('change', (e) => this.updateAnalytics(e.target.value));
    document.getElementById('sales-metric')?.addEventListener('change', (e) => this.updateSalesChart(e.target.value));

        // View All link in dashboard
        const viewAllLink = document.querySelector('.view-all[data-page="products"]');
        if (viewAllLink) {
            viewAllLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('👀 View All link clicked');
                this.switchPage('products');
            });
        }

        // Forms
        document.getElementById('add-product-form')?.addEventListener('submit', (e) => this.addProduct(e));
        document.getElementById('add-variant-form')?.addEventListener('submit', (e) => this.addVariant(e));
        document.getElementById('edit-product-form')?.addEventListener('submit', (e) => this.editProduct(e));
        document.getElementById('edit-variant-form')?.addEventListener('submit', (e) => this.editVariant(e));

        // Modal controls
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.closeAllModals());
        });

        // Buttons
        document.getElementById('refresh-products')?.addEventListener('click', () => this.loadProducts());
        document.getElementById('add-variant-btn')?.addEventListener('click', () => this.showAddVariantModal());
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Close modal buttons
        document.querySelector('.close-variant-modal')?.addEventListener('click', () => this.closeModal('add-variant-modal'));
        document.querySelector('.close-edit-variant-modal')?.addEventListener('click', () => this.closeModal('edit-variant-modal'));
        document.querySelector('.close-edit-product-modal')?.addEventListener('click', () => this.closeModal('edit-product-modal'));

        // Search and filter
        document.getElementById('search-products')?.addEventListener('input', (e) => this.filterProducts(e.target.value));
        document.getElementById('status-filter')?.addEventListener('change', (e) => this.filterProductsByStatus(e.target.value));

        // File upload
        this.setupFileUpload();
        this.setupEditFileUpload();

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        console.log('✅ All events bound successfully');
    }

    // Add these filter methods
filterOrders(searchTerm) {
    if (!searchTerm.trim()) {
        this.renderOrders(this.orders);
        return;
    }

    const filtered = this.orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        return (
            order.order_number.toLowerCase().includes(searchLower) ||
            order.shipping.name.toLowerCase().includes(searchLower) ||
            order.shipping.phone.includes(searchTerm) ||
            order.shipping.email.toLowerCase().includes(searchLower) ||
            order.items.some(item => item.product_name.toLowerCase().includes(searchLower))
        );
    });

    this.renderOrders(filtered);
}

filterOrdersByStatus(status) {
    if (!status) {
        this.renderOrders(this.orders);
        return;
    }

    const filtered = this.orders.filter(order => {
        // Calculate overall status for the order
        const orderStatus = this.calculateOrderStatus(order.items);
        return orderStatus === status;
    });

    this.renderOrders(filtered);
}

updateOrderBadge() {
    const orderCount = this.orders.length;
    const badgeElement = document.querySelector('.menu-item[data-page="orders"] .menu-badge');
    if (badgeElement) {
        badgeElement.textContent = orderCount;
    }
}

updateAnalytics(period) {
    console.log('Updating analytics for period:', period);
}

updateSalesChart(metric) {
    console.log('Updating sales chart with metric:', metric);
}

    toggleUserDropdown() {
        const dropdown = document.querySelector('.user-dropdown');
        if (!dropdown) {
            this.createUserDropdown();
        } else {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    }

    closeUserDropdown() {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    createUserDropdown() {
        const userSection = document.querySelector('.user-section');
        const existingDropdown = document.querySelector('.user-dropdown');
        
        if (existingDropdown) {
            existingDropdown.remove();
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            padding: 1rem;
            min-width: 200px;
            z-index: 1000;
            margin-top: 0.5rem;
            border: 1px solid #e9ecef;
        `;

        // Get vendor email for display
        const vendorEmail = this.vendorInfo?.business_email || '';

        dropdown.innerHTML = `
            <div class="user-dropdown-header">
                <div class="dropdown-avatar">
                    ${document.querySelector('.avatar-initials')?.outerHTML || '<i class="fas fa-user-tie"></i>'}
                </div>
                <div class="dropdown-user-info">
                    <div class="dropdown-name">${this.vendorInfo?.business_name || this.vendorInfo?.seller_name || 'Vendor'}</div>
                    <div class="dropdown-email">${vendorEmail}</div>
                </div>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" onclick="window.location.href='../html/vendor_profile.html'">
                <i class="fas fa-user"></i>
                <span>Profile</span>
                
            </div>
            <div class="dropdown-item">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout-item" onclick="dashboard.logout()">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
            </div>
        `;

        // Add styles for dropdown
        const style = document.createElement('style');
        style.textContent = `
            .user-dropdown-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem 0;
                margin-bottom: 0.5rem;
            }
            .dropdown-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            .dropdown-user-info {
                flex: 1;
                min-width: 0;
            }
            .dropdown-name {
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 0.25rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .dropdown-email {
                font-size: 0.875rem;
                color: #718096;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .dropdown-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem 1rem;
                cursor: pointer;
                border-radius: 6px;
                transition: background-color 0.2s;
                color: #4a5568;
            }
            .dropdown-item:hover {
                background-color: #f7fafc;
                color: #2d3748;
            }
            .dropdown-divider {
                height: 1px;
                background-color: #e2e8f0;
                margin: 0.5rem 0;
            }
            .logout-item {
                color: #e53e3e;
            }
            .logout-item:hover {
                background-color: #fed7d7;
                color: #c53030;
            }
        `;
        
        // Only add style once
        if (!document.querySelector('#user-dropdown-styles')) {
            style.id = 'user-dropdown-styles';
            document.head.appendChild(style);
        }

        userSection.style.position = 'relative';
        userSection.appendChild(dropdown);
        dropdown.style.display = 'block';
    }

    setupFileUpload() {
        const primaryUploadArea = document.getElementById('primary-image-upload-area');
        const additionalUploadArea = document.getElementById('additional-images-upload-area');
        const primaryFileInput = document.getElementById('primary-image');
        const additionalFileInput = document.getElementById('additional-images');

        // Primary image upload
        if (primaryUploadArea && primaryFileInput) {
            primaryUploadArea.addEventListener('click', () => primaryFileInput.click());
            this.setupDragAndDrop(primaryUploadArea, primaryFileInput, 'primary');
        }

        // Additional images upload
        if (additionalUploadArea && additionalFileInput) {
            additionalUploadArea.addEventListener('click', () => additionalFileInput.click());
            this.setupDragAndDrop(additionalUploadArea, additionalFileInput, 'additional');
        }
    }

    setupEditFileUpload() {
        const primaryUploadArea = document.getElementById('edit-primary-image-upload-area');
        const additionalUploadArea = document.getElementById('edit-additional-images-upload-area');
        const primaryFileInput = document.getElementById('edit-primary-image');
        const additionalFileInput = document.getElementById('edit-additional-images');

        // Primary image upload
        if (primaryUploadArea && primaryFileInput) {
            primaryUploadArea.addEventListener('click', () => primaryFileInput.click());
            this.setupDragAndDrop(primaryUploadArea, primaryFileInput, 'edit-primary');
        }

        // Additional images upload
        if (additionalUploadArea && additionalFileInput) {
            additionalUploadArea.addEventListener('click', () => additionalFileInput.click());
            this.setupDragAndDrop(additionalUploadArea, additionalFileInput, 'edit-additional');
        }
    }

    setupDragAndDrop(uploadArea, fileInput, type) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary-color)';
            uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            uploadArea.style.background = '';
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                this.previewImages(fileInput.files, type);
            }
        });

        fileInput.addEventListener('change', (e) => {
            this.previewImages(e.target.files, type);
        });
    }

    previewImages(files, type) {
        let previewContainer;

        switch (type) {
            case 'primary':
                previewContainer = document.getElementById('primary-image-preview');
                break;
            case 'additional':
                previewContainer = document.getElementById('additional-images-preview');
                break;
            case 'edit-primary':
                previewContainer = document.getElementById('edit-primary-image-preview');
                break;
            case 'edit-additional':
                previewContainer = document.getElementById('edit-additional-images-preview');
                break;
            default:
                return;
        }

        if (!previewContainer) return;

        // Clear previous previews for primary images (only one allowed)
        if (type === 'primary' || type === 'edit-primary') {
            previewContainer.innerHTML = '';
        }

        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.createElement('div');
                    preview.className = 'preview-image';
                    preview.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <button type="button" class="remove-image" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    previewContainer.appendChild(preview);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    switchPage(page) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.toggle('active', section.id === `${page}-section`);
        });

        // if (page === 'products') {
        //     this.loadProducts();
        // } else if (page === 'dashboard') {
        //     this.updateDashboardStats();
        // }

         // Handle page-specific loading
    switch(page) {
        case 'products':
            this.loadProducts();
            break;
        case 'dashboard':
            this.updateDashboardStats();
            break;
        case 'orders':
            this.loadOrders();
            break;
        case 'analytics':
            this.loadAnalytics();
            break;
        case 'settings':
            this.loadSettings();
            break;
        // Add product page doesn't need special loading
    }
}

// In the switchPage method, add handling for the new pages:
switchPage(page) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === `${page}-section`);
    });

    // Handle page-specific loading
    switch(page) {
        case 'products':
            this.loadProducts();
            break;
        case 'dashboard':
            this.updateDashboardStats();
            break;
        case 'orders':
            this.loadOrders();
            break;
        case 'analytics':
            this.loadAnalytics();
            break;
        case 'settings':
            this.loadSettings();
            break;
        // Add product page doesn't need special loading
    }
}

// Add these new methods to the class:

async loadOrders() {
    try {
        this.showLoading(true);
        const response = await fetch(`${this.orderBaseURL}/vendor-get-all/`, {
            headers: this.getHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📦 Orders data received:', data);
            
            if (data.orders && Array.isArray(data.orders)) {
                this.orders = data.orders;
                this.renderOrders(this.orders);
                this.updateOrderBadge(); // Add this line
                this.updateDashboardStats();
            } else {
                console.warn('⚠️ Unexpected orders response format:', data);
                this.orders = [];
                this.renderOrders([]);
            }
        } else {
            console.warn('⚠️ Failed to fetch orders, showing empty state');
            this.renderOrders([]);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        this.showNotification(`Failed to load orders: ${error.message}`, 'error');
        this.renderOrders([]);
    } finally {
        this.showLoading(false);
    }
}

renderOrders(orders) {
    const container = document.getElementById('orders-container');
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = this.getEmptyState('orders', 'No Orders Yet', 'Your orders will appear here once customers start purchasing your products');
        return;
    }

    // Process orders to group by order number
    const ordersByOrderNumber = {};
    orders.forEach(order => {
        const orderNumber = order.order_number;
        if (!ordersByOrderNumber[orderNumber]) {
            ordersByOrderNumber[orderNumber] = {
                order_number: orderNumber,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                total: order.total,
                created_at: order.created_at,
                updated_at: order.updated_at,
                shipping: order.shipping,
                items: [],
                status: this.calculateOrderStatus(order.items) // Calculate overall status
            };
        }
        ordersByOrderNumber[orderNumber].items.push(...order.items);
    });

    // Convert to array and render
    const groupedOrders = Object.values(ordersByOrderNumber);
    
    container.innerHTML = groupedOrders.map(order => {
        // Get primary image from first item
        const primaryImage = order.items && order.items.length > 0 
            ? this.getPrimaryImage(order.items[0])
            : null;

        // Calculate item count
        const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);
        
        // Calculate total amount from all items
        const totalAmount = order.total;

        // Format date
        const orderDate = new Date(order.created_at).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Determine status badge class
        const statusClass = this.getStatusClass(order.status);

        return `
            <div class="order-card" data-order-number="${order.order_number}">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order #${order.order_number}</div>
                        <div class="order-date">${orderDate}</div>
                    </div>
                    <span class="order-status ${statusClass}">${this.formatStatus(order.status)}</span>
                </div>
                
                <div class="order-content">
                    <div class="order-image">
                        ${primaryImage ? 
                            `<img src="${primaryImage}" alt="Product Image" class="order-product-image">` : 
                            `<div class="order-image-placeholder"><i class="fas fa-box-open"></i></div>`
                        }
                    </div>
                    
                    <div class="order-details">
                        <div class="order-info-grid">
                            <div class="order-info-item">
                                <span class="info-label">Customer</span>
                                <span class="info-value">${order.shipping.name || 'N/A'}</span>
                            </div>
                            <div class="order-info-item">
                                <span class="info-label">Items</span>
                                <span class="info-value">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
                            </div>
                            <div class="order-info-item">
                                <span class="info-label">Total Amount</span>
                                <span class="info-value">₹${parseFloat(totalAmount).toFixed(2)}</span>
                            </div>
                            <div class="order-info-item">
                                <span class="info-label">Payment</span>
                                <span class="info-value ${order.payment_status === 'PAYMENT_PAID' ? 'payment-paid' : 'payment-pending'}">
                                    ${this.formatPaymentMethod(order.payment_method)}
                                </span>
                            </div>
                        </div>
                        
                        <div class="customer-info">
                            <div class="customer-address">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${order.shipping.address_1}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pincode}</span>
                            </div>
                            <div class="customer-contact">
                                <i class="fas fa-phone"></i>
                                <span>${order.shipping.phone}</span>
                                <i class="fas fa-envelope"></i>
                                <span>${order.shipping.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="order-actions">
                    <button class="btn btn-secondary" onclick="dashboard.viewOrder('${order.order_number}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-primary" onclick="dashboard.updateOrderStatus('${order.order_number}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Helper methods for order rendering
getPrimaryImage(item) {
    if (item.variant_primary_image && item.variant_primary_image.image) {
        return item.variant_primary_image.image;
    }
    return null;
}

calculateOrderStatus(items) {
    if (!items || items.length === 0) return 'PENDING';
    
    // Define status hierarchy
    const statusHierarchy = {
        'CANCELLED': 0,
        'PENDING': 1,
        'PROCESSING': 2,
        'CONFIRMED': 3,
        'PACKED': 4,
        'SHIPPED': 5,
        'OUT_FOR_DELIVERY': 6,
        'DELIVERED': 7,
        'RETURN_REQUESTED': 8,
        'RETURNED': 9,
        'REFUNDED': 10,
        'CLOSED': 11
    };
    
    // Get all unique statuses
    const statuses = [...new Set(items.map(item => item.status.toUpperCase()))];
    
    // If all items have the same status, return that
    if (statuses.length === 1) {
        return statuses[0];
    }
    
    // Find the lowest status in hierarchy (most concerning)
    let lowestStatus = 'DELIVERED';
    let lowestRank = statusHierarchy['DELIVERED'];
    
    statuses.forEach(status => {
        const rank = statusHierarchy[status] || 1;
        if (rank < lowestRank) {
            lowestRank = rank;
            lowestStatus = status;
        }
    });
    
    return lowestStatus;
}

getStatusClass(status) {
    if (!status) return 'pending';
    
    const statusClasses = {
        'PENDING': 'pending',
        'PROCESSING': 'processing',
        'CONFIRMED': 'confirmed',
        'PACKED': 'packed',
        'SHIPPED': 'shipped',
        'OUT_FOR_DELIVERY': 'out-for-delivery',
        'DELIVERED': 'delivered',
        'CANCELLED': 'cancelled',
        'RETURN_REQUESTED': 'return-requested',
        'RETURNED': 'returned',
        'REFUNDED': 'refunded',
        'CLOSED': 'closed'
    };
    return statusClasses[status.toUpperCase()] || 'pending';
}

formatStatus(status) {
    if (!status) return 'Pending';
    return status
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}


formatPaymentMethod(method) {
    const methods = {
        'Online_Mode': 'Online Payment',
        'Cash_On_Delivery': 'Cash on Delivery',
        'ONLINE': 'Online Payment',
        'COD': 'Cash on Delivery'
    };
    return methods[method] || method || 'N/A';
}


async viewOrder(orderNumber) {
    try {
        this.showLoading(true);
        console.log('🔍 Fetching details for order:', orderNumber);
        
        // Get all orders with this order number
        const orderData = this.orders.filter(order => order.order_number === orderNumber);
        
        if (orderData.length === 0) {
            this.showNotification('Order not found in local data', 'error');
            // Try to fetch from API directly
            await this.fetchOrderFromAPI(orderNumber);
            return;
        }

        console.log('📦 Found order data:', orderData);
        
        // Group items by this order number
        const allItems = [];
        const vendors = new Set();
        
        orderData.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                allItems.push(...order.items);
            }
            if (order.vendor_id) {
                vendors.add(order.vendor_id);
            }
        });

        // Get order info from first item
        const orderInfo = orderData[0];
        
        console.log('📊 Order Info:', orderInfo);
        console.log('📦 Items found:', allItems.length);
        
        // Render order details
        this.renderOrderDetails(orderInfo, allItems);
        
        // Show the modal
        this.showModal('order-details-modal');
        
    } catch (error) {
        console.error('❌ Error viewing order:', error);
        this.showNotification(`Failed to load order details: ${error.message}`, 'error');
    } finally {
        this.showLoading(false);
    }
}

async fetchOrderFromAPI(orderNumber) {
    try {
        console.log('🌐 Fetching order from API:', orderNumber);
        
        const response = await fetch(`${this.orderBaseURL}/vendor-get-all/`, {
            headers: this.getHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            if (data.orders && Array.isArray(data.orders)) {
                this.orders = data.orders;
                
                // Try to find the order again
                const orderData = this.orders.filter(order => order.order_number === orderNumber);
                
                if (orderData.length === 0) {
                    this.showNotification(`Order ${orderNumber} not found`, 'error');
                    return;
                }
                
                const allItems = [];
                orderData.forEach(order => {
                    allItems.push(...order.items);
                });
                
                this.renderOrderDetails(orderData[0], allItems);
                this.showModal('order-details-modal');
            }
        } else {
            this.showNotification('Could not fetch order details from server', 'error');
        }
    } catch (error) {
        console.error('Error fetching order from API:', error);
        this.showNotification('Failed to connect to server', 'error');
    }
}

renderOrderDetails(orderInfo, items) {
    const container = document.getElementById('order-details-content');
    if (!container) {
        console.error('❌ Order details container not found');
        return;
    }

    // Format dates
    const createdDate = new Date(orderInfo.created_at).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const updatedDate = new Date(orderInfo.updated_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    // Calculate totals
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + parseFloat(item.subtotal || 0), 0);
    const taxAmount = items.reduce((total, item) => total + parseFloat(item.tax_amount || 0), 0);
    const commission = items.reduce((total, item) => total + parseFloat(item.commission_amount || 0), 0);
    const vendorEarning = items.reduce((total, item) => total + parseFloat(item.vendor_earning || 0), 0);

    // Calculate overall order status
    const orderStatus = this.calculateOrderStatus(items);

    console.log('💰 Financial Summary:', {
        itemCount,
        subtotal,
        taxAmount,
        commission,
        vendorEarning
    });

    container.innerHTML = `
        <div class="order-details-container">
            <!-- Order Header -->
            <div class="order-details-header">
                <div class="order-header-left">
                    <h3 class="order-title">Order #${orderInfo.order_number}</h3>
                    <div class="order-meta">
                        <span class="order-date"><i class="far fa-calendar"></i> ${createdDate}</span>
                        <span class="order-status-badge ${this.getStatusClass(orderStatus)}">
                            ${this.formatStatus(orderStatus)}
                        </span>
                        <span class="order-updated">Last updated: ${updatedDate}</span>
                    </div>
                </div>
                <div class="order-header-right">
                    <div class="order-payment-info">
                        <span class="payment-method">${this.formatPaymentMethod(orderInfo.payment_method)}</span>
                        <span class="payment-status ${orderInfo.payment_status === 'PAYMENT_PAID' ? 'paid' : 'pending'}">
                            ${orderInfo.payment_status === 'PAYMENT_PAID' ? 'Paid' : 'Payment Pending'}
                        </span>
                    </div>
                    <div class="order-total-amount">
                        <span class="total-label">Total Order Value</span>
                        <span class="total-value">₹${parseFloat(orderInfo.total || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Shipping Information -->
            <div class="details-section">
                <h4 class="section-title"><i class="fas fa-truck"></i> Customer & Shipping Information</h4>
                <div class="shipping-info-grid">
                    <div class="info-item">
                        <span class="info-label">Customer Name</span>
                        <span class="info-value">${orderInfo.shipping.name || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone Number</span>
                        <span class="info-value">${orderInfo.shipping.phone || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email Address</span>
                        <span class="info-value">${orderInfo.shipping.email || 'N/A'}</span>
                    </div>
                    <div class="info-item full-width">
                        <span class="info-label">Shipping Address</span>
                        <span class="info-value">
                            ${orderInfo.shipping.address_1 || ''}${orderInfo.shipping.address_2 ? ', ' + orderInfo.shipping.address_2 : ''}<br>
                            ${orderInfo.shipping.city || ''}, ${orderInfo.shipping.state || ''} - ${orderInfo.shipping.pincode || ''}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Order Items -->
            <div class="details-section">
                <h4 class="section-title"><i class="fas fa-shopping-bag"></i> Order Items (${itemCount} items)</h4>
                
                ${items.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-box-open"></i>
                        <p>No items found in this order</p>
                    </div>
                ` : `
                    <div class="order-items-list">
                        ${items.map((item, index) => {
                            const itemImage = item.variant_primary_image && item.variant_primary_image.image 
                                ? item.variant_primary_image.image 
                                : null;
                            
                            return `
                                <div class="order-item-card" data-item-id="${item.item_id}">
                                    <div class="item-image">
                                        ${itemImage ? 
                                            `<img src="${itemImage}" alt="${item.product_name || 'Product'}" class="item-thumbnail">` : 
                                            `<div class="item-image-placeholder">
                                                <i class="fas fa-box"></i>
                                            </div>`
                                        }
                                    </div>
                                    
                                    <div class="item-details">
                                        <div class="item-header">
                                            <h5 class="item-name">${item.product_name || 'Unnamed Product'}</h5>
                                            <div class="item-badges">
                                                <span class="item-sku">SKU: ${item.sku || 'N/A'}</span>
                                                <span class="item-status ${this.getStatusClass(item.status)}">
                                                    ${this.formatStatus(item.status)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div class="item-info-grid">
                                            <div class="item-info">
                                                <span class="info-label">Unit Price</span>
                                                <span class="info-value">₹${parseFloat(item.price || 0).toFixed(2)}</span>
                                            </div>
                                            <div class="item-info">
                                                <span class="info-label">Quantity</span>
                                                <span class="info-value">${item.quantity || 0}</span>
                                            </div>
                                            <div class="item-info">
                                                <span class="info-label">Subtotal</span>
                                                <span class="info-value">₹${parseFloat(item.subtotal || 0).toFixed(2)}</span>
                                            </div>
                                            
                                        </div>
                                        
                                        ${item.tracking_number || item.delivered_at ? `
                                            <div class="item-meta">
                                                ${item.tracking_number ? `
                                                    <div class="tracking-info">
                                                        <i class="fas fa-shipping-fast"></i>
                                                        <span>${item.courier_name || 'Courier'}: ${item.tracking_number}</span>
                                                    </div>
                                                ` : ''}
                                                ${item.delivered_at ? `
                                                    <div class="delivery-info">
                                                        <i class="fas fa-check-circle"></i>
                                                        <span>Delivered: ${new Date(item.delivered_at).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}</span>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        ` : ''}
                                    </div>
                                    
                                    <div class="item-financial">
                                        <div class="financial-breakdown">
                                            <div class="financial-item">
                                                <span class="financial-label">Tax Amount</span>
                                                <span class="financial-value">₹${parseFloat(item.tax_amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div class="financial-item">
                                                <span class="financial-label">Commission</span>
                                                <span class="financial-value">₹${parseFloat(item.commission_amount || 0).toFixed(2)}</span>
                                            </div>
                                            <div class="financial-item total">
                                                <span class="financial-label">Your Earnings</span>
                                                <span class="financial-value">₹${parseFloat(item.vendor_earning || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        
                                        ${item.refunded_amount && parseFloat(item.refunded_amount) > 0 ? `
                                            <div class="refund-info">
                                                <i class="fas fa-undo"></i>
                                                <span>Refunded: ₹${parseFloat(item.refunded_amount).toFixed(2)}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>

            <!-- Order Summary -->
            <div class="details-section">
                <h4 class="section-title"><i class="fas fa-file-invoice-dollar"></i> Financial Summary</h4>
                <div class="order-summary">
                    <div class="summary-row">
                        <span class="summary-label">Subtotal (${itemCount} items)</span>
                        <span class="summary-value">₹${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Total Tax</span>
                        <span class="summary-value">₹${taxAmount.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Platform Commission</span>
                        <span class="summary-value">-₹${commission.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span class="summary-label">Total Vendor Earnings</span>
                        <span class="summary-value">₹${vendorEarning.toFixed(2)}</span>
                    </div>
                    
                    ${orderInfo.refunded_amount && parseFloat(orderInfo.refunded_amount) > 0 ? `
                        <div class="summary-row refund">
                            <span class="summary-label">Total Refunded</span>
                            <span class="summary-value">-₹${parseFloat(orderInfo.refunded_amount).toFixed(2)}</span>
                        </div>
                        <div class="summary-row net-total">
                            <span class="summary-label">Net Earnings</span>
                            <span class="summary-value">₹${(vendorEarning - parseFloat(orderInfo.refunded_amount || 0)).toFixed(2)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Order Actions -->
            <div class="details-section">
                <div class="order-actions-buttons">
                    <button class="btn btn-primary" onclick="dashboard.updateOrderStatus('${orderInfo.order_number}')">
                        <i class="fas fa-edit"></i> Update Status
                    </button>
                    <button class="btn btn-secondary" onclick="dashboard.printOrderDetails('${orderInfo.order_number}')">
                        <i class="fas fa-print"></i> Print Invoice
                    </button>
                    <button class="btn btn-outline" onclick="dashboard.closeModal('order-details-modal')">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    `;

    // Update modal title
    const titleElement = document.getElementById('order-details-title');
    if (titleElement) {
        titleElement.textContent = `Order #${orderInfo.order_number}`;
    }
}

printOrderDetails(orderNumber) {
    const orderData = this.orders.filter(order => order.order_number === orderNumber);
    if (orderData.length === 0) {
        this.showNotification('Order not found for printing', 'error');
        return;
    }

    const orderInfo = orderData[0];
    const allItems = [];
    orderData.forEach(order => {
        allItems.push(...order.items);
    });

    const printContent = this.generatePrintContent(orderInfo, allItems);
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for images to load before printing
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };
}

generatePrintContent(orderInfo, items) {
    const createdDate = new Date(orderInfo.created_at).toLocaleString('en-IN');
    const subtotal = items.reduce((total, item) => total + parseFloat(item.subtotal || 0), 0);
    const taxAmount = items.reduce((total, item) => total + parseFloat(item.tax_amount || 0), 0);
    const vendorEarning = items.reduce((total, item) => total + parseFloat(item.vendor_earning || 0), 0);

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - Order #${orderInfo.order_number}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .order-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .total-row { font-weight: bold; }
                .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
                .logo { font-size: 28px; font-weight: bold; color: #4f46e5; }
            </style>
        </head>
        <body>
            <div class="invoice-header">
                <div class="logo">CoinWorth</div>
                <div class="invoice-title">INVOICE</div>
                <div>Order #${orderInfo.order_number}</div>
                <div>Date: ${createdDate}</div>
            </div>
            
            <div class="order-info">
                <div>
                    <strong>Shipping To:</strong><br>
                    ${orderInfo.shipping.name}<br>
                    ${orderInfo.shipping.address_1}${orderInfo.shipping.address_2 ? ', ' + orderInfo.shipping.address_2 : ''}<br>
                    ${orderInfo.shipping.city}, ${orderInfo.shipping.state} - ${orderInfo.shipping.pincode}<br>
                    Phone: ${orderInfo.shipping.phone}<br>
                    Email: ${orderInfo.shipping.email}
                </div>
                <div>
                    <strong>Vendor:</strong><br>
                    ${this.vendorInfo?.business_name || 'Your Store'}<br>
                    Status: ${this.formatStatus(this.calculateOrderStatus(items))}<br>
                    Payment: ${this.formatPaymentMethod(orderInfo.payment_method)}<br>
                    Payment Status: ${orderInfo.payment_status === 'PAYMENT_PAID' ? 'Paid' : 'Pending'}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Order Items</div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.product_name || 'Product'}</td>
                                <td>${item.sku || 'N/A'}</td>
                                <td>${item.quantity}</td>
                                <td>₹${parseFloat(item.price || 0).toFixed(2)}</td>
                                <td>₹${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                                <td>${this.formatStatus(item.status)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <div class="section-title">Payment Summary</div>
                <table>
                    <tr>
                        <td>Subtotal (${items.length} items)</td>
                        <td>₹${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Tax Amount</td>
                        <td>₹${taxAmount.toFixed(2)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Total Vendor Earnings</td>
                        <td>₹${vendorEarning.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="footer">
                Thank you for your business!<br>
                This is a computer-generated invoice.
            </div>
        </body>
        </html>
    `;
}

async updateOrderStatus(orderNumber) {
    try {
        this.currentOrder = orderNumber;
        
        // Get current status of items in this order
        const orderItems = [];
        this.orders.forEach(order => {
            if (order.order_number === orderNumber) {
                orderItems.push(...order.items);
            }
        });

        // Pre-fill the form
        const statusSelect = document.getElementById('new-status-select');
        const trackingGroup = document.getElementById('tracking-info-group');
        
        // Show/hide tracking fields based on status
        statusSelect.addEventListener('change', (e) => {
            if (e.target.value === 'SHIPPED') {
                trackingGroup.style.display = 'block';
            } else {
                trackingGroup.style.display = 'none';
            }
        });

        // Reset form
        document.getElementById('update-status-form').reset();
        
        this.showModal('update-status-modal');

    } catch (error) {
        console.error('Error preparing status update:', error);
        this.showNotification('Failed to prepare status update', 'error');
    }
}

async submitStatusUpdate(e) {
    e.preventDefault();
    
    const newStatus = document.getElementById('new-status-select').value;
    const trackingNumber = document.getElementById('tracking-number').value;
    const courierName = document.getElementById('courier-name').value;
    
    if (!newStatus) {
        this.showNotification('Please select a status', 'error');
        return;
    }

    try {
        this.showLoading(true);
        
        // Here you would call your backend API to update order status
        // For now, we'll simulate with a notification
        this.showNotification(`Order status updated to ${this.formatStatus(newStatus)}`, 'success');
        
        // Close modal
        this.closeModal('update-status-modal');
        
        // Reload orders to reflect changes
        setTimeout(() => {
            this.loadOrders();
        }, 1000);
        
    } catch (error) {
        console.error('Error updating order status:', error);
        this.showNotification('Failed to update order status', 'error');
    } finally {
        this.showLoading(false);
    }
}

printOrder(orderNumber) {
    const orderData = this.orders.filter(order => order.order_number === orderNumber);
    if (orderData.length === 0) return;

    // Create printable content
    const printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="text-align: center;">Invoice - Order #${orderNumber}</h2>
            <p style="text-align: center;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
            <hr>
            
            <div style="margin-top: 20px;">
                <h4>Order Items:</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #000; padding: 8px;">Product</th>
                            <th style="border: 1px solid #000; padding: 8px;">Qty</th>
                            <th style="border: 1px solid #000; padding: 8px;">Price</th>
                            <th style="border: 1px solid #000; padding: 8px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orderData[0].items.map(item => `
                            <tr>
                                <td style="border: 1px solid #000; padding: 8px;">${item.product_name}</td>
                                <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.quantity}</td>
                                <td style="border: 1px solid #000; padding: 8px;">₹${parseFloat(item.price).toFixed(2)}</td>
                                <td style="border: 1px solid #000; padding: 8px;">₹${parseFloat(item.subtotal).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Invoice - ${orderNumber}</title>
            </head>
            <body>
                ${printContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Placeholder functions for order actions
// viewOrder(orderId) {
//     this.showNotification('View order functionality coming soon!', 'info');
//     console.log('Viewing order:', orderId);
// }

updateOrderStatus(orderId) {
    this.showNotification('Update order status functionality coming soon!', 'info');
    console.log('Updating order status for:', orderId);
}

renderSampleOrders() {
    const sampleOrders = [
        {
            id: 1,
            order_id: 'ORD-2023-001',
            order_date: new Date().toISOString(),
            status: 'pending',
            customer_name: 'Aman Kumar Panika',
            item_count: 3,
            total_amount: 2450.00
        },
        {
            id: 2,
            order_id: 'ORD-2023-002',
            order_date: new Date(Date.now() - 86400000).toISOString(),
            status: 'processing',
            customer_name: 'Sachin Yadav',
            item_count: 2,
            total_amount: 1899.00
        },
        {
            id: 3,
            order_id: 'ORD-2023-003',
            order_date: new Date(Date.now() - 172800000).toISOString(),
            status: 'delivered',
            customer_name: 'Pradeep Kumar Tiwari',
            item_count: 1,
            total_amount: 899.00
        }
    ];

    this.renderOrders(sampleOrders);
}

async loadAnalytics() {
    try {
        this.showLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch(`${this.baseURL}/vendor/analytics/`, {
            headers: this.getHeaders()
        });

        if (response.ok) {
            const analytics = await response.json();
            this.renderAnalytics(analytics);
        } else {
            // For now, show sample analytics
            this.renderSampleAnalytics();
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        this.renderSampleAnalytics(); // Fallback to sample data
    } finally {
        this.showLoading(false);
    }
}

renderAnalytics(analytics) {
    // This is where you would populate actual analytics data
    // For now, we'll just show that the section is functional
    console.log('Analytics loaded:', analytics);
}

renderSampleAnalytics() {
    // Update the top products list with actual data if available
    const topProductsContainer = document.getElementById('top-products');
    if (topProductsContainer && this.products.length > 0) {
        const topProducts = this.products.slice(0, 3); // Top 3 products
        topProductsContainer.innerHTML = topProducts.map(product => `
            <div class="top-product-item">
                <div class="top-product-image">
                    ${product.variants?.[0]?.images?.[0]?.image ?
                        `<img src="${product.variants[0].images[0].image}" alt="${product.title}">` :
                        `<i class="fas fa-box"></i>`
                    }
                </div>
                <div class="top-product-info">
                    <div class="top-product-name">${product.title}</div>
                    <div class="top-product-stats">
                        <span>₹${parseFloat(product.base_price).toFixed(2)}</span>
                        <span>${product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0} in stock</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

async loadSettings() {
    try {
        this.showLoading(true);
        
        // Load vendor settings
        const vendorInfo = this.vendorInfo;
        if (vendorInfo) {
            this.populateSettingsForm(vendorInfo);
        }
        
        // Initialize settings tabs
        this.initializeSettingsTabs();
        
    } catch (error) {
        console.error('Error loading settings:', error);
    } finally {
        this.showLoading(false);
    }
}

populateSettingsForm(vendorInfo) {
    // Populate form with vendor info
    document.getElementById('store-name').value = vendorInfo.business_name || '';
    document.getElementById('store-description').value = vendorInfo.business_description || '';
    document.getElementById('store-email').value = vendorInfo.business_email || '';
    document.getElementById('store-phone').value = vendorInfo.business_phone || '';
    document.getElementById('store-address').value = vendorInfo.business_address || '';
}

initializeSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const tabContents = document.querySelectorAll('.settings-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.target.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-settings`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Handle save settings button
    document.getElementById('save-settings')?.addEventListener('click', (e) => {
        e.preventDefault();
        this.saveSettings();
    });
}

async saveSettings() {
    try {
        this.showLoading(true);
        
        const settingsData = {
            business_name: document.getElementById('store-name').value,
            business_description: document.getElementById('store-description').value,
            business_email: document.getElementById('store-email').value,
            business_phone: document.getElementById('store-phone').value,
            business_address: document.getElementById('store-address').value
        };
        
        // Replace with your actual API endpoint
        const response = await fetch(`${this.vendorBaseURL}/update-profile/`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(settingsData)
        });
        
        if (response.ok) {
            this.showNotification('Settings saved successfully!', 'success');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        this.showNotification('Failed to save settings', 'error');
    } finally {
        this.showLoading(false);
    }
}

// Add empty state for orders
getEmptyState(type, title, message) {
    const icons = {
        products: 'fa-box-open',
        variants: 'fa-list',
        orders: 'fa-shopping-bag',
        analytics: 'fa-chart-line',
        settings: 'fa-cog',
        general: 'fa-inbox'
    };

    return `
        <div class="empty-state">
            <i class="fas ${icons[type] || icons.general}"></i>
            <h3>${title}</h3>
            <p>${message}</p>
            ${type === 'products' ?
                '<button class="btn btn-primary" onclick="dashboard.switchPage(\'add-product\')">Add Your First Product</button>' :
            type === 'variants' ?
                '<button class="btn btn-primary" onclick="dashboard.showAddVariantModal()">Add Your First Variant</button>' :
            type === 'orders' ?
                '<button class="btn btn-primary" onclick="dashboard.loadOrders()">Refresh Orders</button>' :
                ''
            }
        </div>
    `;
}


    async loadCategories() {
    try {
        console.log("Loading categories...");
        this.showLoading(true);
        
        // Change the endpoint to get categories with hierarchy
        const response = await fetch(`${this.baseURL}/categories/with-parents/`, {
            headers: this.getHeaders()
        });
        
        // If the above endpoint doesn't exist, fall back to the original
        if (!response.ok && response.status === 404) {
            console.log("⚠️ Categories with parents endpoint not found, using leaf nodes");
            const fallbackResponse = await fetch(`${this.baseURL}/categories/leaf-nodes/`, {
                headers: this.getHeaders()
            });
            
            if (fallbackResponse.ok) {
                const data = await fallbackResponse.json();
                this.categories = Array.isArray(data) ? data : [];
                this.populateCategoryDropdown();
                this.showNotification('Categories loaded successfully', 'success');
            } else {
                throw new Error(`HTTP ${fallbackResponse.status}: ${await fallbackResponse.text()}`);
            }
        } else if (response.ok) {
            const data = await response.json();
            console.log("Categories with parents:", data);
            this.categories = Array.isArray(data) ? data : [];
            this.populateCategoryDropdown();
            this.showNotification('Categories loaded successfully', 'success');
        } else {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        this.showNotification(`Failed to load categories: ${error.message}`, 'error');
    } finally {
        this.showLoading(false);
    }
}

    populateCategoryDropdown() {
    const dropdown = document.getElementById('product-category');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Category</option>';

    // Group categories by parent
    const categoriesByParent = {};
    this.categories.forEach(category => {
        const parentId = category.parent_id || 'root';
        if (!categoriesByParent[parentId]) {
            categoriesByParent[parentId] = [];
        }
        categoriesByParent[parentId].push(category);
    });

    // Function to render categories recursively
    const renderCategories = (parentId, level = 0) => {
        const categories = categoriesByParent[parentId];
        if (!categories) return '';

        return categories.map(category => {
            const indent = '  '.repeat(level);
            const hasChildren = categoriesByParent[category.id];
            
            let html = `<option value="${category.id}">${indent}${category.name}</option>`;
            
            // Recursively render children
            if (hasChildren) {
                html += renderCategories(category.id, level + 1);
            }
            
            return html;
        }).join('');
    };

    // Start rendering from root categories
    dropdown.innerHTML += renderCategories('root');
}

    async loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading products...</p></div>';

    try {
        this.showLoading(true);
        const response = await fetch(`${this.baseURL}/vendor/get/products/`, {
            headers: this.getHeaders()
        });

        if (response.ok) {
            const data = await response.json();
            
            // Handle different response formats including "no active product found"
            if (Array.isArray(data)) {
                this.products = data;
            } else if (data.products && Array.isArray(data.products)) {
                this.products = data.products;
            } else if (data.results && Array.isArray(data.results)) {
                this.products = data.results;
            } else if (data.message === 'no active product found') {
                console.log('ℹ️ No active products found - showing empty state');
                this.products = [];
            } else {
                console.warn('⚠️ Unexpected products response format:', data);
                this.products = [];
            }

            console.log(`✅ Loaded ${this.products.length} products`);
            this.renderProducts();
            this.updateProductsCount();
            this.updateDashboardStats();
        } else if (response.status === 404) {
            const errorData = await response.json();
            if (errorData.message === 'no active product found') {
                console.log('ℹ️ No active products found');
                this.products = [];
                this.renderProducts();
                this.updateProductsCount();
                this.updateDashboardStats();
            } else {
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } else {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error loading products:', error);
        this.showNotification(`Failed to load products: ${error.message}`, 'error');
        container.innerHTML = this.getErrorState('products', error.message);
    } finally {
        this.showLoading(false);
    }
}


    renderProducts(products = this.products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = this.getEmptyState('products', 'No products found', 'Start by adding your first product');
        return;
    }

    container.innerHTML = products.map(product => {
        const variantCount = product.variants?.length || 0;
        const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || 0;
        
        // FIXED: Get category name using category_id from product
        const categoryName = this.getCategoryNameById(product.category_id) || 'Uncategorized';

        // Get the primary image from variants
        let productImage = null;
        if (product.variants && product.variants.length > 0) {
            for (let variant of product.variants) {
                if (variant.images && variant.images.length > 0) {
                    const primaryImage = variant.images.find(img => img.is_primary) || variant.images[0];
                    if (primaryImage) {
                        productImage = primaryImage.image;
                        break;
                    }
                }
            }
        }

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${productImage ?
                `<img src="${productImage}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
                `<i class="fas fa-box-open"></i>`
            }
                </div>
                <div class="product-content">
                    <div class="product-header">
                        <div>
                            <h3 class="product-title">${this.escapeHtml(product.title)}</h3>
                            <div class="product-price">₹${parseFloat(product.base_price).toFixed(2)}</div>
                            <small style="color: var(--secondary-color);">${categoryName}</small>
                        </div>
                        <span class="product-status status-${product.status}">${product.status}</span>
                    </div>
                    <p class="product-description">${this.escapeHtml(product.description)}</p>
                    <div class="product-meta">
                        <small>${variantCount} variant${variantCount !== 1 ? 's' : ''}</small>
                        <small>Stock: ${totalStock}</small>
                        <small>Created: ${new Date(product.created_at).toLocaleDateString()}</small>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-secondary" onclick="dashboard.editProductModal(${product.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-primary" onclick="dashboard.showVariantsModal(${product.id})">
                            <i class="fas fa-list"></i> Variants
                        </button>
                        <button class="btn btn-danger" onclick="dashboard.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Add this new method to get category name by ID
getCategoryNameById(categoryId) {
    if (!categoryId || !this.categories || this.categories.length === 0) {
        console.log('❌ No category ID or categories not loaded');
        return null;
    }

    console.log('🔍 Looking for category ID:', categoryId, 'in categories:', this.categories);
    
    const category = this.categories.find(cat => cat.id === categoryId);
    
    if (category) {
        console.log('✅ Found category:', category.name);
        return category.name;
    } else {
        console.log('❌ Category not found for ID:', categoryId);
        return null;
    }
}


    // Add this method to store category ID when product is created
storeCurrentCategory(categoryId) {
    this.currentCategoryId = categoryId;
    console.log('💾 Stored current category ID:', categoryId);
}

    async addProduct(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const productData = {
        title: formData.get('title'),
        description: formData.get('description'),
        base_price: parseFloat(formData.get('base_price')),
        category_id: parseInt(formData.get('category_id'))
    };

    if (!productData.title || !productData.description || !productData.base_price || !productData.category_id) {
        this.showNotification('Please fill all required fields', 'error');
        return;
    }

    try {
        this.showLoading(true);
        
        // Store category ID BEFORE making the API call
        this.currentCategoryId = productData.category_id;
        console.log('💾 Stored category ID:', this.currentCategoryId);

        const response = await fetch(`${this.baseURL}/add-product/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(productData)
        });

        console.log("Add product called.");    

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Product added successfully:', result);
            
            // Store the current product ID
            this.currentProductId = result.id || result.product_id;
            console.log('📝 Current Product ID set to:', this.currentProductId);

            this.showNotification('Product added successfully! Now add variants.', 'success');
            form.reset();

            // Load products to refresh the list (but don't wait for it)
            this.loadProducts().catch(error => {
                console.warn('Products load failed but continuing:', error);
            });
            
            // Switch to products page
            this.switchPage('products');

            // Auto-open the add variant modal after a short delay
            setTimeout(() => {
                this.showAddVariantModal();
            }, 800); // Increased delay to ensure everything is ready

        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        this.showNotification(`Failed to add product: ${error.message}`, 'error');
    } finally {
        this.showLoading(false);
    }
}

    async editProductModal(productId) {
        try {
            this.showLoading(true);
            const product = this.products.find(p => p.id === productId);
            if (!product) {
                this.showNotification('Product not found', 'error');
                return;
            }

            // Populate form with product data
            document.getElementById('edit-product-title').value = product.title;
            document.getElementById('edit-product-price').value = product.base_price;
            document.getElementById('edit-product-description').value = product.description;
            document.getElementById('edit-product-status').value = product.status;

            this.currentProductId = productId;
            this.showModal('edit-product-modal');
        } catch (error) {
            console.error('Error opening edit product modal:', error);
            this.showNotification('Error loading product details', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async editProduct(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const productData = {
            title: formData.get('title'),
            description: formData.get('description'),
            base_price: parseFloat(formData.get('base_price')),
            status: formData.get('status')
        };

        if (!productData.title || !productData.description || !productData.base_price || !productData.status) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/update/product/${this.currentProductId}/`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Product updated successfully!', 'success');
                this.closeModal('edit-product-modal');
                this.loadProducts();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            this.showNotification(`Failed to update product: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/delete/product/${productId}/`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.ok) {
                this.showNotification('Product deleted successfully!', 'success');
                this.loadProducts();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification(`Failed to delete product: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async showVariantsModal(productId) {
        this.currentProductId = productId;
        const container = document.getElementById('variants-container');
        if (!container) return;

        container.innerHTML = '<div class="empty-state"><div class="spinner"></div><p>Loading variants...</p></div>';

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/vendor/get/${productId}/`, {
                headers: this.getHeaders()
            });

            if (response.ok) {
                const productData = await response.json();
                const product = Array.isArray(productData) ? productData[0] : productData;
                this.renderVariants(product);
                this.showModal('variants-modal');
            } else {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
        } catch (error) {
            console.error('Error loading variants:', error);
            this.showNotification(`Failed to load variants: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderVariants(product) {
        const container = document.getElementById('variants-container');
        if (!container) return;

        const variants = product.variants || [];

        if (variants.length === 0) {
            container.innerHTML = this.getEmptyState('variants', 'No Variants Added', 'Add your first variant to start selling');
            return;
        }

        container.innerHTML = variants.map(variant => {
            const variantName = variant.attributes && variant.attributes.length > 0
                ? variant.attributes.map(attr => `${attr.value}`).join(' - ')
                : 'Unnamed Variant';

            const primaryImage = variant.images && variant.images.length > 0
                ? variant.images.find(img => img.is_primary) || variant.images[0]
                : null;

            return `
                <div class="variant-card-compact">
                    <div class="variant-main-info">
                        <div class="variant-image-compact">
                            ${primaryImage ?
                    `<img src="${primaryImage.image}" alt="${variantName}" class="variant-thumb">` :
                    `<div class="variant-thumb-placeholder">
                                    <i class="fas fa-image"></i>
                                </div>`
                }
                        </div>
                        
                        <div class="variant-details-compact">
                            <div class="variant-header-compact">
                                <h4 class="variant-title-compact">${this.escapeHtml(variantName)}</h4>
                                <div class="variant-price-compact">₹${parseFloat(variant.adjusted_price).toLocaleString('en-IN')}</div>
                            </div>
                            
                            <div class="variant-meta-compact">
                                <span class="stock-badge ${variant.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                                    ${variant.stock} in stock
                                </span>
                                <span class="status-badge ${variant.is_active ? 'active' : 'inactive'}">
                                    ${variant.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            
                            <div class="variant-attributes-compact">
                                ${(variant.attributes || []).map(attr =>
                    `<span class="attr-pill">
                                        <strong>${this.escapeHtml(attr.attribute)}:</strong> ${this.escapeHtml(attr.value)}
                                    </span>`
                ).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="variant-actions-compact">
                        <button class="btn btn-sm btn-outline" onclick="dashboard.editVariantModal(${variant.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger-outline" onclick="dashboard.deleteVariant(${variant.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // async showAddVariantModal() {
    //     try {
    //         this.showLoading(true);
    //         const product = this.products.find(p => p.id === this.currentProductId);

    //         if (!product) {
    //             this.showNotification('Product not found', 'error');
    //             return;
    //         }

    //         let categoryId = product.category_id;

    //         const response = await fetch(`${this.baseURL}/category/${categoryId}/attributes/`, {
    //             headers: this.getHeaders()
    //         });

    //         if (response.ok) {
    //             const attributesData = await response.json();
    //             this.currentProductAttributes = attributesData.attribute || [];

    //             // Reset the form before rendering new fields
    //             this.resetAddVariantForm();
    //             this.renderAttributeFields();
    //             this.showModal('add-variant-modal');
    //         } else {
    //             const errorText = await response.text();
    //             throw new Error(`Failed to load attributes: HTTP ${response.status}`);
    //         }
    //     } catch (error) {
    //         console.error('Error loading attributes:', error);
    //         this.showNotification(`Failed to load attributes: ${error.message}`, 'error');
    //     } finally {
    //         this.showLoading(false);
    //     }
    // }


    async showAddVariantModal() {
    try {
        this.showLoading(true);
        
        // Check if we have a current product ID
        if (!this.currentProductId) {
            this.showNotification('Please select a product first', 'error');
            return;
        }

        console.log('🔍 Looking for product with ID:', this.currentProductId);
        
        let product = null;
        let categoryId = null;
        let productTitle = 'New Product';

        // Try to find the product in our current products list
        product = this.products.find(p => p.id === this.currentProductId);
        
        if (product) {
            // Product found in current list
            categoryId = product.category_id;
            productTitle = product.title;
            console.log('✅ Product found in current list, category ID:', categoryId);
        } else {
            // Product not found in current list (might be inactive or 500 error)
            console.log('⚠️ Product not found in current list');
            
            // Use stored category ID as primary fallback
            if (this.currentCategoryId) {
                categoryId = this.currentCategoryId;
                console.log('🔄 Using stored category ID:', categoryId);
            } else {
                // If no stored category ID, try to fetch product details
                try {
                    console.log('🔄 Attempting to fetch product details from server...');
                    const productResponse = await fetch(`${this.baseURL}/vendor/get/${this.currentProductId}/`, {
                        headers: this.getHeaders()
                    });
                    
                    if (productResponse.ok) {
                        const productData = await productResponse.json();
                        const specificProduct = Array.isArray(productData) ? productData[0] : productData;
                        
                        if (specificProduct) {
                            product = specificProduct;
                            categoryId = specificProduct.category_id;
                            productTitle = specificProduct.title;
                            console.log('✅ Found product via direct API call, category ID:', categoryId);
                        } else {
                            console.warn('⚠️ Product data structure unexpected:', productData);
                            throw new Error('Product data format unexpected');
                        }
                    } else if (productResponse.status === 500) {
                        console.warn('⚠️ Server error when fetching product, using fallback');
                        // Don't throw error, we'll use the stored category ID below
                    } else {
                        console.warn('⚠️ Failed to fetch product details:', productResponse.status);
                        throw new Error(`Server returned ${productResponse.status}`);
                    }
                } catch (fetchError) {
                    console.error('Error fetching product:', fetchError);
                    // Continue with fallback approach
                }
            }
        }

        // Final fallback - if we still don't have categoryId, show error
        if (!categoryId) {
            throw new Error('Unable to determine product category. Please try adding the product again or contact support.');
        }

        console.log('🎯 Final category ID for attributes:', categoryId);

        // Load attributes for the category
        const response = await fetch(`${this.baseURL}/category/${categoryId}/attributes/`, {
            headers: this.getHeaders()
        });

        if (response.ok) {
            const attributesData = await response.json();
            this.currentProductAttributes = attributesData.attribute || [];
            console.log('📋 Loaded attributes:', this.currentProductAttributes.length);

            // Reset the form before rendering new fields
            this.resetAddVariantForm();
            this.renderAttributeFields();
            
            // Safely update modal title
            const modalTitle = document.getElementById('variant-modal-title');
            if (modalTitle) {
                modalTitle.textContent = `Add Variant to: ${productTitle}`;
            } else {
                console.warn('⚠️ Modal title element not found');
            }
            
            this.showModal('add-variant-modal');
            console.log('✅ Variant modal opened successfully');
        } else {
            const errorText = await response.text();
            console.error('❌ Failed to load attributes:', response.status, errorText);
            
            if (response.status === 404) {
                this.showNotification('No attributes found for this category. Please contact support.', 'warning');
                this.currentProductAttributes = [];
                this.renderAttributeFields();
                this.showModal('add-variant-modal');
            } else {
                throw new Error(`Failed to load attributes: HTTP ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Error in showAddVariantModal:', error);
        this.showNotification(`Failed to load variant form: ${error.message}`, 'error');
    } finally {
        this.showLoading(false);
    }
}

    resetAddVariantForm() {
        // Reset form fields
        const form = document.getElementById('add-variant-form');
        if (form) {
            form.reset();
        }

        // Clear image previews
        const primaryPreview = document.getElementById('primary-image-preview');
        const additionalPreview = document.getElementById('additional-images-preview');
        if (primaryPreview) primaryPreview.innerHTML = '';
        if (additionalPreview) additionalPreview.innerHTML = '';

        // Clear file inputs
        const primaryInput = document.getElementById('primary-image');
        const additionalInput = document.getElementById('additional-images');
        if (primaryInput) primaryInput.value = '';
        if (additionalInput) additionalInput.value = '';

        // Clear attribute fields container
        const attributesContainer = document.getElementById('variant-attributes-container');
        if (attributesContainer) {
            attributesContainer.innerHTML = '';
        }
    }

    renderAttributeFields() {
        const container = document.getElementById('variant-attributes-container');
        if (!container) return;

        if (!this.currentProductAttributes || this.currentProductAttributes.length === 0) {
            container.innerHTML = '<p class="empty-state">No attributes found for this category.</p>';
            return;
        }

        container.innerHTML = this.currentProductAttributes.map(attr => `
            <div class="attribute-field">
                <label class="form-label">${attr.name} ${attr.is_required ? '<span class="required">*</span>' : ''}</label>
                ${this.renderAttributeInput(attr)}
            </div>
        `).join('');
    }

    renderAttributeInput(attribute) {
        if (attribute.values && attribute.values.length > 0) {
            return `
                <select name="attr_${attribute.id}" class="form-select" ${attribute.is_required ? 'required' : ''}>
                    <option value="">Select ${attribute.name}</option>
                    ${attribute.values.map(value =>
                `<option value="${value.id}">${value.value}</option>`
            ).join('')}
                </select>
            `;
        }

        switch (attribute.input_type) {
            case 'text':
                return `<input type="text" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
            case 'int':
                return `<input type="number" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
            case 'decimal':
                return `<input type="number" step="0.01" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
            case 'boolean':
                return `
                    <select name="attr_${attribute.id}" class="form-select" ${attribute.is_required ? 'required' : ''}>
                        <option value="">Select ${attribute.name}</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                `;
            default:
                return `<input type="text" name="attr_${attribute.id}" class="form-input" ${attribute.is_required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
        }
    }

    async addVariant(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        // Collect attribute values
        const attribute_and_value = [];
        this.currentProductAttributes.forEach(attr => {
            const value = formData.get(`attr_${attr.id}`);
            if (value) {
                attribute_and_value.push({
                    attribute_id: attr.id,
                    value_id: parseInt(value)
                });
            }
        });

        console.log('🔍 Collected attributes:', attribute_and_value);

        if (attribute_and_value.length === 0) {
            this.showNotification('Please fill at least one attribute', 'error');
            return;
        }

        // Get checkbox value
        const isActiveCheckbox = document.getElementById('variant-active');
        const isActive = isActiveCheckbox ? isActiveCheckbox.checked : false;

        // Get image files
        const primaryImageFile = document.getElementById('primary-image').files[0];
        const additionalImageFiles = document.getElementById('additional-images').files;

        if (!primaryImageFile) {
            this.showNotification('Primary image is required', 'error');
            return;
        }

        // Create the variant data object
        const variantData = {
            adjusted_price: parseFloat(formData.get('adjusted_price')) || 0,
            stock: parseInt(formData.get('stock')) || 0,
            attribute_and_value: attribute_and_value,
            is_active: isActive,
            product_id: this.currentProductId
        };

        // Handle file uploads
        const formDataToSend = new FormData();

        // Append ALL data as individual form fields
        formDataToSend.append('adjusted_price', variantData.adjusted_price);
        formDataToSend.append('stock', variantData.stock);
        formDataToSend.append('is_active', variantData.is_active);
        formDataToSend.append('product_id', variantData.product_id);

        // Append attribute data as JSON string
        formDataToSend.append('attribute_and_value', JSON.stringify(variantData.attribute_and_value));

        // Append primary image
        formDataToSend.append('images', primaryImageFile);

        // Append additional images
        for (let i = 0; i < additionalImageFiles.length; i++) {
            formDataToSend.append('images', additionalImageFiles[i]);
        }

        try {
            this.showLoading(true);
            const accessToken = localStorage.getItem('vendor_access_token');
            const response = await fetch(`${this.baseURL}/add-variants/${this.currentProductId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formDataToSend
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Variant added successfully!', 'success');
                this.closeModal('add-variant-modal');
                this.showVariantsModal(this.currentProductId);
                // Reload products to update images
                this.loadProducts();
            } else {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.detail || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error adding variant:', error);
            this.showNotification(`Failed to add variant: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async editVariantModal(variantId) {
        try {
            this.showLoading(true);

            // Find the variant in the current product
            let variant = null;
            let product = null;

            for (const p of this.products) {
                if (p.variants) {
                    const foundVariant = p.variants.find(v => v.id === variantId);
                    if (foundVariant) {
                        variant = foundVariant;
                        product = p;
                        break;
                    }
                }
            }

            if (!variant) {
                this.showNotification('Variant not found', 'error');
                return;
            }

            this.currentVariantId = variantId;
            this.currentProductId = product.id;
            
            // Initialize deleted images array for this variant
            this.deletedImages = [];
            this.newPrimaryImage = null;
            this.existingPrimaryImageId = null;

            // Populate the edit form
            document.getElementById('edit-variant-price').value = variant.adjusted_price;
            document.getElementById('edit-variant-stock').value = variant.stock;
            document.getElementById('edit-variant-active').checked = variant.is_active;

            // Display attributes as view-only
            const attributesContainer = document.getElementById('edit-variant-attributes');
            if (attributesContainer) {
                attributesContainer.innerHTML = (variant.attributes || [])
                    .map(attr => `
                        <div class="attribute-item">
                            <strong>${this.escapeHtml(attr.attribute)}:</strong> 
                            ${this.escapeHtml(attr.value)}
                        </div>
                    `).join('');
            }

            // Display existing images
            const existingContainer = document.getElementById('existing-images');
            if (existingContainer) {
                existingContainer.innerHTML = '';
                if (variant.images && variant.images.length > 0) {
                    variant.images.forEach((img, index) => {
                        const imgElement = document.createElement('div');
                        imgElement.className = 'existing-image';
                        imgElement.innerHTML = `
                            <img src="${img.image}" alt="${img.alt_text || 'Variant image'}">
                            <div class="image-info">
                                <span class="image-status ${img.is_primary ? 'primary' : ''}">
                                    ${img.is_primary ? 'Primary' : 'Secondary'}
                                </span>
                            </div>
                            ${!img.is_primary ? 
                                `<button type="button" class="remove-image" onclick="dashboard.removeExistingImage(${img.id})">
                                    <i class="fas fa-times"></i>
                                </button>` : 
                                `<button type="button" class="remove-image disabled" title="Cannot delete primary image - replace it instead">
                                    <i class="fas fa-lock"></i>
                                </button>`
                            }
                        `;
                        existingContainer.appendChild(imgElement);
                        
                        // Store primary image ID
                        if (img.is_primary) {
                            this.existingPrimaryImageId = img.id;
                        }
                    });
                }
            }

            // Clear new image previews
            const primaryPreview = document.getElementById('edit-primary-image-preview');
            const additionalPreview = document.getElementById('edit-additional-images-preview');
            const primaryInput = document.getElementById('edit-primary-image');
            const additionalInput = document.getElementById('edit-additional-images');
            
            if (primaryPreview) primaryPreview.innerHTML = '';
            if (additionalPreview) additionalPreview.innerHTML = '';
            if (primaryInput) primaryInput.value = '';
            if (additionalInput) additionalInput.value = '';

            this.showModal('edit-variant-modal');

        } catch (error) {
            console.error('Error opening edit variant modal:', error);
            this.showNotification('Error loading variant details', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async removeExistingImage(imageId) {
        // Check if this is the primary image
        if (imageId === this.existingPrimaryImageId) {
            this.showNotification('Cannot delete primary image. Please replace it with a new image instead.', 'warning');
            return;
        }

        if (!confirm('Are you sure you want to remove this image?')) {
            return;
        }

        try {
            // Add to deleted images array
            if (!this.deletedImages.includes(imageId)) {
                this.deletedImages.push(imageId);
            }
            
            // Remove from UI
            const existingImages = document.getElementById('existing-images');
            const imageElement = existingImages.querySelector(`[onclick*="${imageId}"]`)?.closest('.existing-image');
            if (imageElement) {
                imageElement.remove();
            }
            
            this.showNotification('Image marked for deletion. Save changes to confirm.', 'success');
            
        } catch (error) {
            console.error('Error removing image:', error);
            this.showNotification(`Failed to remove image: ${error.message}`, 'error');
        }
    }

    async editVariant(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const variantData = {
            adjusted_price: parseFloat(formData.get('adjusted_price')) || 0,
            stock: parseInt(formData.get('stock')) || 0,
            is_active: formData.get('is_active') === 'on'
        };

        console.log('📦 Variant data to update:', variantData);

        // Get new image files
        const primaryImageFile = document.getElementById('edit-primary-image').files[0];
        const additionalImageFiles = document.getElementById('edit-additional-images').files;

        console.log('🖼️ Image files:', {
            primary: primaryImageFile,
            additional: additionalImageFiles.length
        });

        try {
            this.showLoading(true);
            const accessToken = localStorage.getItem('vendor_access_token');
            
            // Prepare FormData for the request
            const formDataToSend = new FormData();
            formDataToSend.append('adjusted_price', variantData.adjusted_price);
            formDataToSend.append('stock', variantData.stock);
            formDataToSend.append('is_active', variantData.is_active);
            
            // Handle deleted images
            if (this.deletedImages && this.deletedImages.length > 0) {
                formDataToSend.append('deleted_images_id', JSON.stringify(this.deletedImages));
            }
            
            // Handle primary image
            if (primaryImageFile) {
                // If new primary image is uploaded, send it as primary_image
                formDataToSend.append('primary_image', primaryImageFile);
            } else {
                // If no new primary image, send the existing primary image ID
                formDataToSend.append('primary_image_id', this.existingPrimaryImageId);
            }
            
            // Append additional images
            for (let i = 0; i < additionalImageFiles.length; i++) {
                formDataToSend.append('images', additionalImageFiles[i]);
            }

            // Debug: Log what we're sending
            console.log('📤 Sending FormData:');
            console.log('Deleted Images:', this.deletedImages);
            console.log('Primary Image ID:', this.existingPrimaryImageId);
            console.log('Has New Primary Image:', !!primaryImageFile);
            
            for (let pair of formDataToSend.entries()) {
                console.log(pair[0] + ': ', pair[1]);
            }

            const response = await fetch(`${this.baseURL}/update/variant/${this.currentProductId}/${this.currentVariantId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: formDataToSend
            });

            console.log('📊 Update response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Update successful:', result);
                this.showNotification('Variant updated successfully!', 'success');
                
                // Reset deleted images array
                this.deletedImages = [];
                this.existingPrimaryImageId = null;
                
                this.closeModal('edit-variant-modal');
                this.showVariantsModal(this.currentProductId);
                this.loadProducts();
            } else {
                // Get the detailed error from backend
                const errorData = await response.json();
                console.error('❌ Backend validation errors:', errorData["errors"]);
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Error updating variant:', error);
            this.showNotification(`Failed to update variant: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async deleteVariant(variantId) {
        if (!confirm('Are you sure you want to delete this variant? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/delete/variant/${this.currentProductId}/${variantId}/`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.ok) {
                this.showNotification('Variant deleted successfully!', 'success');
                this.showVariantsModal(this.currentProductId);
                this.loadProducts();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting variant:', error);
            this.showNotification(`Failed to delete variant: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    filterProducts(searchTerm) {
        const filtered = this.products.filter(product =>
            product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderProducts(filtered);
    }

    filterProductsByStatus(status) {
        const filtered = status ? this.products.filter(product => product.status === status) : this.products;
        this.renderProducts(filtered);
    }

    // updateDashboardStats() {
    //     const totalProducts = this.products.length;
    //     const totalStock = this.products.reduce((sum, product) =>
    //         sum + (product.variants?.reduce((vSum, variant) => vSum + (variant.stock || 0), 0) || 0), 0);
    //     const activeProducts = this.products.filter(p => p.status === 'active').length;
    //     const totalRevenue = this.products.reduce((sum, product) =>
    //         sum + (parseFloat(product.base_price) * (product.variants?.reduce((vSum, variant) => vSum + (variant.stock || 0), 0) || 0)), 0);

    //     document.getElementById('total-products').textContent = totalProducts;
    //     document.getElementById('products-count').textContent = totalProducts;

    //     // Update other stats
    //     const statCards = document.querySelectorAll('.stat-card');
    //     if (statCards[1]) statCards[1].querySelector('h3').textContent = totalStock;
    //     if (statCards[2]) statCards[2].querySelector('h3').textContent = activeProducts;
    //     if (statCards[3]) statCards[3].querySelector('h3').textContent = `₹${totalRevenue.toFixed(2)}`;

    //     this.updateRecentProducts();
    // }

    updateDashboardStats() {
    // 1. Total Products (from products)
    const totalProducts = this.products.length;
    
    // 2. Orders Today (from orders)
    const ordersToday = this.calculateOrdersToday();
    
    // 3. Product Views (placeholder - you can connect to backend analytics later)
    const productViews = 10; // Default placeholder
    
    // 4. Total Revenue (from orders, not from product base price)
    const totalRevenue = this.calculateTotalRevenue();
    
    // Update the dashboard stats
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('products-count').textContent = totalProducts;
    
    // Update all stat cards
    const statCards = document.querySelectorAll('.stat-card');
    
    // Card 1: Total Products (already updated)
    if (statCards[0]) {
        statCards[0].querySelector('h3').textContent = totalProducts;
        // Keep existing trend
        const trendElement = statCards[0].querySelector('.stat-trend span');
        if (trendElement) {
            trendElement.textContent = '+12%';
            trendElement.className = 'trend-up';
        }
    }
    
    // Card 2: Orders Today (CHANGED from totalStock to ordersToday)
    if (statCards[1]) {
        statCards[1].querySelector('h3').textContent = ordersToday;
        // Keep existing trend
        const trendElement = statCards[1].querySelector('.stat-trend span');
        if (trendElement) {
            trendElement.textContent = '+8%';
            trendElement.className = 'trend-up';
        }
    }
    
    // Card 3: Product Views (CHANGED from activeProducts to productViews)
    if (statCards[2]) {
        statCards[2].querySelector('h3').textContent = productViews.toLocaleString();
        // Keep existing trend
        const trendElement = statCards[2].querySelector('.stat-trend span');
        if (trendElement) {
            trendElement.textContent = '+15%';
            trendElement.className = 'trend-up';
        }
    }
    
    // Card 4: Total Revenue (CHANGED - now shows real revenue from orders)
    if (statCards[3]) {
        statCards[3].querySelector('h3').textContent = `₹${totalRevenue.toFixed(2)}`;
        // Keep existing trend
        const trendElement = statCards[3].querySelector('.stat-trend span');
        if (trendElement) {
            trendElement.textContent = '+22%';
            trendElement.className = 'trend-up';
        }
    }

    this.updateRecentProducts();
}

// Helper method to calculate orders today
calculateOrdersToday() {
    if (!this.orders || this.orders.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get unique order numbers for today
    const todayOrders = new Set();
    
    this.orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        
        if (orderDate.getTime() === today.getTime()) {
            todayOrders.add(order.order_number);
        }
    });
    
    return todayOrders.size;
}

// Helper method to calculate total revenue from orders
calculateTotalRevenue() {
    if (!this.orders || this.orders.length === 0) return 0;
    
    // Calculate total from all orders (avoid duplicates)
    const orderTotals = {};
    
    this.orders.forEach(order => {
        if (!orderTotals[order.order_number]) {
            orderTotals[order.order_number] = parseFloat(order.total || 0);
        }
    });
    
    // Sum up all unique order totals
    return Object.values(orderTotals).reduce((sum, total) => sum + total, 0);
}

    updateRecentProducts() {
        const container = document.getElementById('recent-products');
        if (!container) return;

        const recentProducts = this.products.slice(0, 5);

        if (recentProducts.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No products yet</p></div>';
            return;
        }

        container.innerHTML = recentProducts.map(product => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${this.escapeHtml(product.title)}</div>
                    <div class="activity-description">₹${parseFloat(product.base_price).toFixed(2)} • ${product.status}</div>
                </div>
                <div class="activity-time">${new Date(product.created_at).toLocaleDateString()}</div>
                

            </div>
        `).join('');
    }

    updateProductsCount() {
        const count = this.products.length;
        const countElement = document.getElementById('products-count');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    getHeaders() {
        const accessToken = localStorage.getItem('vendor_access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        };
    }

    handleTokenExpired() {
        this.showNotification('Session expired. Please sign in again.', 'error');
        setTimeout(() => {
            this.clearSession();
            window.location.href = '../Authentication/SignIn/SignIn.html';
        }, 2000);
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.clearSession();
            this.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = '../Authentication/SignIn/SignIn.html';
            }, 1000);
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'block' : 'none';
        }
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    getEmptyState(type, title, message) {
        const icons = {
            products: 'fa-box-open',
            variants: 'fa-list',
            general: 'fa-inbox'
        };

        return `
            <div class="empty-state">
                <i class="fas ${icons[type] || icons.general}"></i>
                <h3>${title}</h3>
                <p>${message}</p>
                
            
            </div>
        `;
    }

    getErrorState(type, message) {
        return `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                <h3>Error Loading ${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                <p>${message}</p>
                <button class="btn btn-secondary" onclick="dashboard.loadProducts()">Try Again</button>
            </div>
        `;
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new VendorDashboard();
});