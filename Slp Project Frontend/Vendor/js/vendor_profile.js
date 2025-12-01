class VendorProfile {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/vendors';
        this.productsURL = 'http://localhost:8000/api/product';
        this.vendorInfo = null;
        this.businessStats = null;
        this.newAvatarFile = null;

        this.init();
    }

    init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            return;
        }

        this.bindEvents();
        this.loadVendorProfile();
        this.loadBusinessStats();
        this.loadRecentActivity();
        this.setupUserDropdown();
    }

    checkAuthentication() {
        const accessToken = localStorage.getItem('vendor_access_token');
        const vendorInfo = localStorage.getItem('vendor_info');

        if (!accessToken || !vendorInfo) {
            this.showNotification('Please sign in to access your profile', 'error');
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

    bindEvents() {
        console.log('🔧 Binding vendor profile events...');

        // Edit profile button
        document.getElementById('edit-profile-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showEditProfileModal();
        });

        // Change avatar button
        document.getElementById('change-avatar-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showChangeAvatarModal();
        });

        // Forms
        document.getElementById('edit-profile-form')?.addEventListener('submit', (e) => this.updateProfile(e));
        
        // Avatar upload
        this.setupAvatarUpload();

        // Modal controls
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.closeAllModals());
        });

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        console.log('✅ Vendor profile events bound successfully');
    }

    setupUserDropdown() {
        const userInfo = document.getElementById('user-info-dropdown');
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
                    ${this.getAvatarHTML()}
                </div>
                <div class="dropdown-user-info">
                    <div class="dropdown-name">${this.vendorInfo?.business_name || this.vendorInfo?.seller_name || 'Vendor'}</div>
                    <div class="dropdown-email">${vendorEmail}</div>
                </div>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" onclick="window.location.href='vendor-dashboard.html'">
                <i class="fas fa-chart-line"></i>
                <span>Dashboard</span>
            </div>
            <div class="dropdown-item" onclick="window.location.href='vendor-products.html'">
                <i class="fas fa-box"></i>
                <span>Products</span>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" onclick="window.location.href='vendor-settings.html'">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
            </div>
            <div class="dropdown-item logout-item" onclick="vendorProfile.logout()">
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

    getAvatarHTML() {
        if (this.vendorInfo?.business_logo) {
            return `<img src="${this.vendorInfo.business_logo}" alt="Business Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
        
        const businessName = this.vendorInfo?.business_name || 'Vendor';
        const initials = businessName
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);

        return initials || '<i class="fas fa-store"></i>';
    }

    async loadVendorProfile() {
        try {
            this.showLoading(true);
            
            // Update header vendor name immediately
            this.updateHeaderVendorName();

            // Fetch fresh data from API
            const response = await fetch(`${this.baseURL}/profile/`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (response.ok) {
                const vendorData = await response.json();
                this.vendorInfo = vendorData;
                localStorage.setItem('vendor_info', JSON.stringify(vendorData));
                this.updateProfileUI(vendorData);
                this.showNotification('Profile loaded successfully', 'success');
            } else if (response.status === 401) {
                this.handleTokenExpired();
            } else {
                console.warn('Failed to fetch vendor profile, using stored data');
                if (!this.vendorInfo) {
                    this.showFallbackProfileUI();
                }
            }
        } catch (error) {
            console.error('Error loading vendor profile:', error);
            if (!this.vendorInfo) {
                this.showFallbackProfileUI();
            }
            this.showNotification('Error loading profile data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updateHeaderVendorName() {
        const vendorNameElement = document.getElementById('vendor-name');
        if (vendorNameElement && this.vendorInfo) {
            const vendorName = 
                this.vendorInfo.business_name || 
                this.vendorInfo.seller_name || 
                (this.vendorInfo.business_email ? this.vendorInfo.business_email.split('@')[0] : 'Vendor Account');
            vendorNameElement.textContent = vendorName;
        }
    }

    updateProfileUI(vendor) {
        console.log('🔄 Updating profile UI with:', vendor);
        
        // Update header vendor name
        this.updateHeaderVendorName();

        // Update profile information
        this.updateElementText('business-name', vendor.business_name || 'Not set');
        this.updateElementText('business-email', vendor.business_email || 'Not set');
        this.updateElementText('business-phone', vendor.phone_number || 'Not set');
        this.updateElementText('business-address', vendor.business_address || 'Not set');
        this.updateElementText('business-type', this.formatBusinessType(vendor.business_type));
        this.updateElementText('tax-id', vendor.tax_id || 'Not provided');

        // Update avatar
        this.updateProfileAvatar(vendor);

        // Update account status
        this.updateAccountStatus(vendor);

        // Populate edit form
        this.populateEditForm(vendor);
    }

    updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    formatBusinessType(type) {
        if (!type) return 'Not specified';
        
        const typeMap = {
            'individual': 'Individual',
            'partnership': 'Partnership',
            'private_limited': 'Private Limited Company',
            'public_limited': 'Public Limited Company',
            'llc': 'Limited Liability Company'
        };
        
        return typeMap[type] || type;
    }

    updateProfileAvatar(vendor) {
        const avatarElement = document.getElementById('profile-avatar');
        if (!avatarElement) return;

        // Clear existing content
        avatarElement.innerHTML = '';

        if (vendor.business_logo) {
            // Use business logo if available
            const img = document.createElement('img');
            img.src = vendor.business_logo;
            img.alt = vendor.business_name || 'Business Logo';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            avatarElement.appendChild(img);
        } else {
            // Use business name initials or default icon
            const businessName = vendor.business_name || 'Business';
            const initials = businessName
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .substring(0, 2);

            if (initials.length > 0) {
                const initialsElement = document.createElement('div');
                initialsElement.className = 'avatar-initials';
                initialsElement.textContent = initials;
                initialsElement.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-weight: bold;
                    font-size: 2rem;
                    border-radius: 50%;
                `;
                avatarElement.appendChild(initialsElement);
            } else {
                // Fallback to store icon
                avatarElement.innerHTML = '<i class="fas fa-store"></i>';
            }
        }
    }

    updateAccountStatus(vendor) {
        // Update email verification status
        const emailStatus = document.getElementById('email-status');
        if (emailStatus) {
            emailStatus.textContent = vendor.is_email_verified ? 'Verified' : 'Not Verified';
            emailStatus.style.color = vendor.is_email_verified ? 'var(--success-color)' : 'var(--warning-color)';
        }

        // Update document verification status
        const docStatus = document.getElementById('doc-status');
        if (docStatus) {
            let statusText = 'Pending Review';
            let statusColor = 'var(--warning-color)';
            
            if (vendor.is_document_verified) {
                statusText = 'Verified';
                statusColor = 'var(--success-color)';
            } else if (vendor.document_rejection_reason) {
                statusText = 'Rejected';
                statusColor = 'var(--danger-color)';
            }
            
            docStatus.textContent = statusText;
            docStatus.style.color = statusColor;
        }

        // Update store status
        const storeStatus = document.getElementById('store-status');
        if (storeStatus) {
            const isActive = vendor.is_onboarding_complete && vendor.is_document_verified;
            storeStatus.textContent = isActive ? 'Active' : 'Inactive';
            storeStatus.style.color = isActive ? 'var(--success-color)' : 'var(--danger-color)';
        }

        // Update main account status badge
        const accountStatus = document.getElementById('account-status');
        if (accountStatus) {
            const isActive = vendor.is_onboarding_complete && vendor.is_document_verified;
            accountStatus.textContent = isActive ? 'Active' : 'Inactive';
            accountStatus.className = `status-badge ${isActive ? 'active' : 'inactive'}`;
        }
    }

    populateEditForm(vendor) {
        document.getElementById('edit-business-name').value = vendor.business_name || '';
        document.getElementById('edit-business-email').value = vendor.business_email || '';
        document.getElementById('edit-business-phone').value = vendor.phone_number || '';
        document.getElementById('edit-business-address').value = vendor.business_address || '';
        document.getElementById('edit-business-type').value = vendor.business_type || 'individual';
        document.getElementById('edit-tax-id').value = vendor.tax_id || '';
    }

    showFallbackProfileUI() {
        console.log('🔄 Showing fallback profile UI');
        
        // Update with basic information from localStorage
        const vendorInfoStr = localStorage.getItem('vendor_info');
        if (vendorInfoStr) {
            try {
                const vendor = JSON.parse(vendorInfoStr);
                this.updateProfileUI(vendor);
            } catch (e) {
                console.error('Error parsing stored vendor info:', e);
                this.showEmptyProfileState();
            }
        } else {
            this.showEmptyProfileState();
        }
    }

    showEmptyProfileState() {
        this.updateElementText('business-name', 'Profile not loaded');
        this.updateElementText('business-email', 'Please refresh the page');
        this.updateElementText('business-phone', 'N/A');
        this.updateElementText('business-address', 'N/A');
        this.updateElementText('business-type', 'N/A');
        this.updateElementText('tax-id', 'N/A');
    }

    async loadBusinessStats() {
        try {
            // In a real application, you would fetch this from your API
            // For now, we'll simulate with mock data
            this.businessStats = {
                total_products: 24,
                total_orders: 156,
                total_revenue: 45678.50,
                customer_rating: 4.7
            };

            this.updateBusinessStatsUI();
        } catch (error) {
            console.error('Error loading business stats:', error);
            // Use fallback stats
            this.businessStats = {
                total_products: 0,
                total_orders: 0,
                total_revenue: 0,
                customer_rating: 0.0
            };
            this.updateBusinessStatsUI();
        }
    }

    updateBusinessStatsUI() {
        if (!this.businessStats) return;

        this.updateElementText('total-products', this.businessStats.total_products.toString());
        this.updateElementText('total-orders', this.businessStats.total_orders.toString());
        this.updateElementText('total-revenue', `₹${this.businessStats.total_revenue.toLocaleString('en-IN')}`);
        this.updateElementText('customer-rating', this.businessStats.customer_rating.toFixed(1));
    }

    async loadRecentActivity() {
        try {
            // Simulate API call for recent activity
            const activities = [
                {
                    id: 1,
                    type: 'product_added',
                    title: 'New Product Added',
                    description: 'You added "Wireless Bluetooth Headphones" to your catalog',
                    time: '2 hours ago',
                    icon: 'fas fa-box'
                },
                {
                    id: 2,
                    type: 'order_received',
                    title: 'New Order Received',
                    description: 'Order #ORD-12345 for ₹2,499.00',
                    time: '5 hours ago',
                    icon: 'fas fa-shopping-bag'
                },
                {
                    id: 3,
                    type: 'review_received',
                    title: 'New Customer Review',
                    description: 'Customer rated your product 5 stars',
                    time: '1 day ago',
                    icon: 'fas fa-star'
                },
                {
                    id: 4,
                    type: 'payment_received',
                    title: 'Payment Processed',
                    description: '₹12,456.00 has been credited to your account',
                    time: '2 days ago',
                    icon: 'fas fa-rupee-sign'
                }
            ];

            this.renderRecentActivity(activities);
        } catch (error) {
            console.error('Error loading recent activity:', error);
            this.renderRecentActivity([]);
        }
    }

    renderRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    showEditProfileModal() {
        this.showModal('edit-profile-modal');
    }

    showChangeAvatarModal() {
        this.newAvatarFile = null;
        
        // Reset avatar preview
        const preview = document.getElementById('avatar-preview');
        if (preview) {
            preview.innerHTML = '';
            this.updateAvatarPreview(this.vendorInfo, preview);
        }
        
        // Disable save button initially
        const saveBtn = document.getElementById('save-avatar-btn');
        if (saveBtn) {
            saveBtn.disabled = true;
        }
        
        this.showModal('change-avatar-modal');
    }

    setupAvatarUpload() {
        const uploadArea = document.getElementById('avatar-upload-area');
        const fileInput = document.getElementById('avatar-file');
        const saveBtn = document.getElementById('save-avatar-btn');

        if (!uploadArea || !fileInput || !saveBtn) return;

        uploadArea.addEventListener('click', () => fileInput.click());

        // Drag and drop functionality
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
                this.handleAvatarSelection(fileInput.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleAvatarSelection(e.target.files[0]);
            }
        });

        saveBtn.addEventListener('click', () => this.updateAvatar());
    }

    handleAvatarSelection(file) {
        if (!file || !file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('Image size should be less than 2MB', 'error');
            return;
        }

        this.newAvatarFile = file;

        // Update preview
        const preview = document.getElementById('avatar-preview');
        if (preview) {
            preview.innerHTML = '';
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Business Logo Preview';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '50%';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }

        // Enable save button
        const saveBtn = document.getElementById('save-avatar-btn');
        if (saveBtn) {
            saveBtn.disabled = false;
        }
    }

    async updateAvatar() {
        if (!this.newAvatarFile) {
            this.showNotification('Please select an image first', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            const formData = new FormData();
            formData.append('business_logo', this.newAvatarFile);

            const response = await fetch(`${this.baseURL}/profile/update/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('vendor_access_token')}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Business logo updated successfully!', 'success');
                
                // Update local vendor info
                this.vendorInfo.business_logo = result.business_logo;
                localStorage.setItem('vendor_info', JSON.stringify(this.vendorInfo));
                
                // Update UI
                this.updateProfileAvatar(this.vendorInfo);
                
                this.closeModal('change-avatar-modal');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
            this.showNotification(`Failed to update logo: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async updateProfile(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const profileData = {
            business_name: formData.get('business_name'),
            business_email: formData.get('business_email'),
            phone_number: formData.get('phone_number'),
            business_address: formData.get('business_address'),
            business_type: formData.get('business_type'),
            tax_id: formData.get('tax_id')
        };

        // Validate required fields
        if (!profileData.business_name || !profileData.business_email || !profileData.phone_number || !profileData.business_address) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.baseURL}/profile/update/`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Profile updated successfully!', 'success');
                
                // Update local vendor info
                this.vendorInfo = { ...this.vendorInfo, ...profileData };
                localStorage.setItem('vendor_info', JSON.stringify(this.vendorInfo));
                
                // Update UI
                this.updateProfileUI(this.vendorInfo);
                
                this.closeModal('edit-profile-modal');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification(`Failed to update profile: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updateAvatarPreview(vendor, previewElement) {
        if (vendor.business_logo) {
            const img = document.createElement('img');
            img.src = vendor.business_logo;
            img.alt = vendor.business_name || 'Business Logo';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '50%';
            previewElement.appendChild(img);
        } else {
            const businessName = vendor.business_name || 'Business';
            const initials = businessName
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .substring(0, 2);

            if (initials.length > 0) {
                const initialsElement = document.createElement('div');
                initialsElement.className = 'avatar-initials';
                initialsElement.textContent = initials;
                initialsElement.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-weight: bold;
                    font-size: 2rem;
                    border-radius: 50%;
                `;
                previewElement.appendChild(initialsElement);
            } else {
                previewElement.innerHTML = '<i class="fas fa-store"></i>';
            }
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
}

// Initialize vendor profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vendorProfile = new VendorProfile();
});