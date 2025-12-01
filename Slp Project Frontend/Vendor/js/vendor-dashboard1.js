class VendorDashboard {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/product';
        this.vendorBaseURL = 'http://localhost:8000/api/vendors';
        this.currentProductId = null;
        this.currentVariantId = null;
        this.categories = [];
        this.products = [];
        this.currentProductAttributes = [];
        this.vendorInfo = null;
        this.deletedImages = [];
        this.existingPrimaryImageId = null;
        this.newPrimaryImage = null;

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

        if (page === 'products') {
            this.loadProducts();
        } else if (page === 'dashboard') {
            this.updateDashboardStats();
        }
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

    updateDashboardStats() {
        const totalProducts = this.products.length;
        const totalStock = this.products.reduce((sum, product) =>
            sum + (product.variants?.reduce((vSum, variant) => vSum + (variant.stock || 0), 0) || 0), 0);
        const activeProducts = this.products.filter(p => p.status === 'active').length;
        const totalRevenue = this.products.reduce((sum, product) =>
            sum + (parseFloat(product.base_price) * (product.variants?.reduce((vSum, variant) => vSum + (variant.stock || 0), 0) || 0)), 0);

        document.getElementById('total-products').textContent = totalProducts;
        document.getElementById('products-count').textContent = totalProducts;

        // Update other stats
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards[1]) statCards[1].querySelector('h3').textContent = totalStock;
        if (statCards[2]) statCards[2].querySelector('h3').textContent = activeProducts;
        if (statCards[3]) statCards[3].querySelector('h3').textContent = `₹${totalRevenue.toFixed(2)}`;

        this.updateRecentProducts();
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
                ${type === 'products' ?
                '<button class="btn btn-primary" onclick="dashboard.switchPage(\'add-product\')">Add Your First Product</button>' :
                '<button class="btn btn-primary" onclick="dashboard.showAddVariantModal()">Add Your First Variant</button>'
            }
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