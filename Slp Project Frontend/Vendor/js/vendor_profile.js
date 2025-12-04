// class VendorProfile {
//     constructor() {
//         this.baseURL = 'http://localhost:8000/api/vendors';
//         this.productsURL = 'http://localhost:8000/api/product';
//         this.vendorInfo = null;
//         this.businessStats = null;
//         this.newAvatarFile = null;

//         this.init();
//     }

//     init() {
//         // Check authentication first
//         if (!this.checkAuthentication()) {
//             return;
//         }

//         this.bindEvents();
//         this.loadVendorProfile();
//         this.loadBusinessStats();
//         this.loadRecentActivity();
//         this.setupUserDropdown();
//     }

//     checkAuthentication() {
//         const accessToken = localStorage.getItem('vendor_access_token');
//         const vendorInfo = localStorage.getItem('vendor_info');

//         if (!accessToken || !vendorInfo) {
//             this.showNotification('Please sign in to access your profile', 'error');
//             setTimeout(() => {
//                 window.location.href = '../Authentication/SignIn/SignIn.html';
//             }, 2000);
//             return false;
//         }

//         try {
//             this.vendorInfo = JSON.parse(vendorInfo);
//             console.log('🔐 Vendor authenticated:', this.vendorInfo);
//             return true;
//         } catch (error) {
//             console.error('Error parsing vendor info:', error);
//             this.clearSession();
//             window.location.href = '../Authentication/SignIn/SignIn.html';
//             return false;
//         }
//     }

//     clearSession() {
//         localStorage.removeItem('vendor_access_token');
//         localStorage.removeItem('vendor_refresh_token');
//         localStorage.removeItem('vendor_info');
//         localStorage.removeItem('vendor_auth_info');
//     }

//     bindEvents() {
//         console.log('🔧 Binding vendor profile events...');

//         // Edit profile button
//         document.getElementById('edit-profile-btn')?.addEventListener('click', (e) => {
//             e.preventDefault();
//             this.showEditProfileModal();
//         });

//         // Change avatar button
//         document.getElementById('change-avatar-btn')?.addEventListener('click', (e) => {
//             e.preventDefault();
//             this.showChangeAvatarModal();
//         });

//         // Forms
//         document.getElementById('edit-profile-form')?.addEventListener('submit', (e) => this.updateProfile(e));
        
//         // Avatar upload
//         this.setupAvatarUpload();

//         // Modal controls
//         document.querySelectorAll('.close').forEach(close => {
//             close.addEventListener('click', () => this.closeAllModals());
//         });

//         document.querySelectorAll('.close-modal').forEach(btn => {
//             btn.addEventListener('click', () => this.closeAllModals());
//         });

//         // Close modals on outside click
//         window.addEventListener('click', (e) => {
//             if (e.target.classList.contains('modal')) {
//                 this.closeAllModals();
//             }
//         });

//         // Logout button
//         document.getElementById('logout-btn')?.addEventListener('click', (e) => {
//             e.preventDefault();
//             this.logout();
//         });

//         console.log('✅ Vendor profile events bound successfully');
//     }

//     setupUserDropdown() {
//         const userInfo = document.getElementById('user-info-dropdown');
//         if (userInfo) {
//             userInfo.addEventListener('click', (e) => {
//                 e.stopPropagation();
//                 this.toggleUserDropdown();
//             });
//         }

//         // Close dropdown when clicking outside
//         document.addEventListener('click', () => {
//             this.closeUserDropdown();
//         });
//     }

//     toggleUserDropdown() {
//         const dropdown = document.querySelector('.user-dropdown');
//         if (!dropdown) {
//             this.createUserDropdown();
//         } else {
//             dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
//         }
//     }

//     closeUserDropdown() {
//         const dropdown = document.querySelector('.user-dropdown');
//         if (dropdown) {
//             dropdown.style.display = 'none';
//         }
//     }

//     createUserDropdown() {
//         const userSection = document.querySelector('.user-section');
//         const existingDropdown = document.querySelector('.user-dropdown');
        
//         if (existingDropdown) {
//             existingDropdown.remove();
//         }

//         const dropdown = document.createElement('div');
//         dropdown.className = 'user-dropdown';
//         dropdown.style.cssText = `
//             position: absolute;
//             top: 100%;
//             right: 0;
//             background: white;
//             border-radius: 8px;
//             box-shadow: 0 4px 20px rgba(0,0,0,0.15);
//             padding: 1rem;
//             min-width: 200px;
//             z-index: 1000;
//             margin-top: 0.5rem;
//             border: 1px solid #e9ecef;
//         `;

//         // Get vendor email for display
//         const vendorEmail = this.vendorInfo?.business_email || '';

//         dropdown.innerHTML = `
//             <div class="user-dropdown-header">
//                 <div class="dropdown-avatar">
//                     ${this.getAvatarHTML()}
//                 </div>
//                 <div class="dropdown-user-info">
//                     <div class="dropdown-name">${this.vendorInfo?.business_name || this.vendorInfo?.seller_name || 'Vendor'}</div>
//                     <div class="dropdown-email">${vendorEmail}</div>
//                 </div>
//             </div>
//             <div class="dropdown-divider"></div>
//             <div class="dropdown-item" onclick="window.location.href='vendor-dashboard.html'">
//                 <i class="fas fa-chart-line"></i>
//                 <span>Dashboard</span>
//             </div>
//             <div class="dropdown-item" onclick="window.location.href='vendor-products.html'">
//                 <i class="fas fa-box"></i>
//                 <span>Products</span>
//             </div>
//             <div class="dropdown-divider"></div>
//             <div class="dropdown-item" onclick="window.location.href='vendor-settings.html'">
//                 <i class="fas fa-cog"></i>
//                 <span>Settings</span>
//             </div>
//             <div class="dropdown-item logout-item" onclick="vendorProfile.logout()">
//                 <i class="fas fa-sign-out-alt"></i>
//                 <span>Logout</span>
//             </div>
//         `;

//         // Add styles for dropdown
//         const style = document.createElement('style');
//         style.textContent = `
//             .user-dropdown-header {
//                 display: flex;
//                 align-items: center;
//                 gap: 0.75rem;
//                 padding: 0.5rem 0;
//                 margin-bottom: 0.5rem;
//             }
//             .dropdown-avatar {
//                 width: 40px;
//                 height: 40px;
//                 border-radius: 50%;
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                 color: white;
//                 font-weight: bold;
//                 font-size: 14px;
//             }
//             .dropdown-user-info {
//                 flex: 1;
//                 min-width: 0;
//             }
//             .dropdown-name {
//                 font-weight: 600;
//                 color: #2d3748;
//                 margin-bottom: 0.25rem;
//                 white-space: nowrap;
//                 overflow: hidden;
//                 text-overflow: ellipsis;
//             }
//             .dropdown-email {
//                 font-size: 0.875rem;
//                 color: #718096;
//                 white-space: nowrap;
//                 overflow: hidden;
//                 text-overflow: ellipsis;
//             }
//             .dropdown-item {
//                 display: flex;
//                 align-items: center;
//                 gap: 0.75rem;
//                 padding: 0.75rem 1rem;
//                 cursor: pointer;
//                 border-radius: 6px;
//                 transition: background-color 0.2s;
//                 color: #4a5568;
//             }
//             .dropdown-item:hover {
//                 background-color: #f7fafc;
//                 color: #2d3748;
//             }
//             .dropdown-divider {
//                 height: 1px;
//                 background-color: #e2e8f0;
//                 margin: 0.5rem 0;
//             }
//             .logout-item {
//                 color: #e53e3e;
//             }
//             .logout-item:hover {
//                 background-color: #fed7d7;
//                 color: #c53030;
//             }
//         `;
        
//         // Only add style once
//         if (!document.querySelector('#user-dropdown-styles')) {
//             style.id = 'user-dropdown-styles';
//             document.head.appendChild(style);
//         }

//         userSection.style.position = 'relative';
//         userSection.appendChild(dropdown);
//         dropdown.style.display = 'block';
//     }

//     getAvatarHTML() {
//         if (this.vendorInfo?.business_logo) {
//             return `<img src="${this.vendorInfo.business_logo}" alt="Business Logo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
//         }
        
//         const businessName = this.vendorInfo?.business_name || 'Vendor';
//         const initials = businessName
//             .split(' ')
//             .map(word => word.charAt(0))
//             .join('')
//             .toUpperCase()
//             .substring(0, 2);

//         return initials || '<i class="fas fa-store"></i>';
//     }

//     async loadVendorProfile() {
//         try {
//             this.showLoading(true);
            
//             // Update header vendor name immediately
//             this.updateHeaderVendorName();

//             // Fetch fresh data from API
//             const response = await fetch(`${this.baseURL}/profile/`, {
//                 method: 'GET',
//                 headers: this.getHeaders()
//             });

//             if (response.ok) {
//                 const vendorData = await response.json();
//                 this.vendorInfo = vendorData;
//                 localStorage.setItem('vendor_info', JSON.stringify(vendorData));
//                 this.updateProfileUI(vendorData);
//                 this.showNotification('Profile loaded successfully', 'success');
//             } else if (response.status === 401) {
//                 this.handleTokenExpired();
//             } else {
//                 console.warn('Failed to fetch vendor profile, using stored data');
//                 if (!this.vendorInfo) {
//                     this.showFallbackProfileUI();
//                 }
//             }
//         } catch (error) {
//             console.error('Error loading vendor profile:', error);
//             if (!this.vendorInfo) {
//                 this.showFallbackProfileUI();
//             }
//             this.showNotification('Error loading profile data', 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     updateHeaderVendorName() {
//         const vendorNameElement = document.getElementById('vendor-name');
//         if (vendorNameElement && this.vendorInfo) {
//             const vendorName = 
//                 this.vendorInfo.business_name || 
//                 this.vendorInfo.seller_name || 
//                 (this.vendorInfo.business_email ? this.vendorInfo.business_email.split('@')[0] : 'Vendor Account');
//             vendorNameElement.textContent = vendorName;
//         }
//     }

//     updateProfileUI(vendor) {
//         console.log('🔄 Updating profile UI with:', vendor);
        
//         // Update header vendor name
//         this.updateHeaderVendorName();

//         // Update profile information
//         this.updateElementText('business-name', vendor.business_name || 'Not set');
//         this.updateElementText('business-email', vendor.business_email || 'Not set');
//         this.updateElementText('business-phone', vendor.phone_number || 'Not set');
//         this.updateElementText('business-address', vendor.business_address || 'Not set');
//         this.updateElementText('business-type', this.formatBusinessType(vendor.business_type));
//         this.updateElementText('tax-id', vendor.tax_id || 'Not provided');

//         // Update avatar
//         this.updateProfileAvatar(vendor);

//         // Update account status
//         this.updateAccountStatus(vendor);

//         // Populate edit form
//         this.populateEditForm(vendor);
//     }

//     updateElementText(elementId, text) {
//         const element = document.getElementById(elementId);
//         if (element) {
//             element.textContent = text;
//         }
//     }

//     formatBusinessType(type) {
//         if (!type) return 'Not specified';
        
//         const typeMap = {
//             'individual': 'Individual',
//             'partnership': 'Partnership',
//             'private_limited': 'Private Limited Company',
//             'public_limited': 'Public Limited Company',
//             'llc': 'Limited Liability Company'
//         };
        
//         return typeMap[type] || type;
//     }

//     updateProfileAvatar(vendor) {
//         const avatarElement = document.getElementById('profile-avatar');
//         if (!avatarElement) return;

//         // Clear existing content
//         avatarElement.innerHTML = '';

//         if (vendor.business_logo) {
//             // Use business logo if available
//             const img = document.createElement('img');
//             img.src = vendor.business_logo;
//             img.alt = vendor.business_name || 'Business Logo';
//             img.style.width = '100%';
//             img.style.height = '100%';
//             img.style.objectFit = 'cover';
//             img.style.borderRadius = '50%';
//             avatarElement.appendChild(img);
//         } else {
//             // Use business name initials or default icon
//             const businessName = vendor.business_name || 'Business';
//             const initials = businessName
//                 .split(' ')
//                 .map(word => word.charAt(0))
//                 .join('')
//                 .toUpperCase()
//                 .substring(0, 2);

//             if (initials.length > 0) {
//                 const initialsElement = document.createElement('div');
//                 initialsElement.className = 'avatar-initials';
//                 initialsElement.textContent = initials;
//                 initialsElement.style.cssText = `
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     width: 100%;
//                     height: 100%;
//                     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                     color: white;
//                     font-weight: bold;
//                     font-size: 2rem;
//                     border-radius: 50%;
//                 `;
//                 avatarElement.appendChild(initialsElement);
//             } else {
//                 // Fallback to store icon
//                 avatarElement.innerHTML = '<i class="fas fa-store"></i>';
//             }
//         }
//     }

//     updateAccountStatus(vendor) {
//         // Update email verification status
//         const emailStatus = document.getElementById('email-status');
//         if (emailStatus) {
//             emailStatus.textContent = vendor.is_email_verified ? 'Verified' : 'Not Verified';
//             emailStatus.style.color = vendor.is_email_verified ? 'var(--success-color)' : 'var(--warning-color)';
//         }

//         // Update document verification status
//         const docStatus = document.getElementById('doc-status');
//         if (docStatus) {
//             let statusText = 'Pending Review';
//             let statusColor = 'var(--warning-color)';
            
//             if (vendor.is_document_verified) {
//                 statusText = 'Verified';
//                 statusColor = 'var(--success-color)';
//             } else if (vendor.document_rejection_reason) {
//                 statusText = 'Rejected';
//                 statusColor = 'var(--danger-color)';
//             }
            
//             docStatus.textContent = statusText;
//             docStatus.style.color = statusColor;
//         }

//         // Update store status
//         const storeStatus = document.getElementById('store-status');
//         if (storeStatus) {
//             const isActive = vendor.is_onboarding_complete && vendor.is_document_verified;
//             storeStatus.textContent = isActive ? 'Active' : 'Inactive';
//             storeStatus.style.color = isActive ? 'var(--success-color)' : 'var(--danger-color)';
//         }

//         // Update main account status badge
//         const accountStatus = document.getElementById('account-status');
//         if (accountStatus) {
//             const isActive = vendor.is_onboarding_complete && vendor.is_document_verified;
//             accountStatus.textContent = isActive ? 'Active' : 'Inactive';
//             accountStatus.className = `status-badge ${isActive ? 'active' : 'inactive'}`;
//         }
//     }

//     populateEditForm(vendor) {
//         document.getElementById('edit-business-name').value = vendor.business_name || '';
//         document.getElementById('edit-business-email').value = vendor.business_email || '';
//         document.getElementById('edit-business-phone').value = vendor.phone_number || '';
//         document.getElementById('edit-business-address').value = vendor.business_address || '';
//         document.getElementById('edit-business-type').value = vendor.business_type || 'individual';
//         document.getElementById('edit-tax-id').value = vendor.tax_id || '';
//     }

//     showFallbackProfileUI() {
//         console.log('🔄 Showing fallback profile UI');
        
//         // Update with basic information from localStorage
//         const vendorInfoStr = localStorage.getItem('vendor_info');
//         if (vendorInfoStr) {
//             try {
//                 const vendor = JSON.parse(vendorInfoStr);
//                 this.updateProfileUI(vendor);
//             } catch (e) {
//                 console.error('Error parsing stored vendor info:', e);
//                 this.showEmptyProfileState();
//             }
//         } else {
//             this.showEmptyProfileState();
//         }
//     }

//     showEmptyProfileState() {
//         this.updateElementText('business-name', 'Profile not loaded');
//         this.updateElementText('business-email', 'Please refresh the page');
//         this.updateElementText('business-phone', 'N/A');
//         this.updateElementText('business-address', 'N/A');
//         this.updateElementText('business-type', 'N/A');
//         this.updateElementText('tax-id', 'N/A');
//     }

//     async loadBusinessStats() {
//         try {
//             // In a real application, you would fetch this from your API
//             // For now, we'll simulate with mock data
//             this.businessStats = {
//                 total_products: 24,
//                 total_orders: 156,
//                 total_revenue: 45678.50,
//                 customer_rating: 4.7
//             };

//             this.updateBusinessStatsUI();
//         } catch (error) {
//             console.error('Error loading business stats:', error);
//             // Use fallback stats
//             this.businessStats = {
//                 total_products: 0,
//                 total_orders: 0,
//                 total_revenue: 0,
//                 customer_rating: 0.0
//             };
//             this.updateBusinessStatsUI();
//         }
//     }

//     updateBusinessStatsUI() {
//         if (!this.businessStats) return;

//         this.updateElementText('total-products', this.businessStats.total_products.toString());
//         this.updateElementText('total-orders', this.businessStats.total_orders.toString());
//         this.updateElementText('total-revenue', `₹${this.businessStats.total_revenue.toLocaleString('en-IN')}`);
//         this.updateElementText('customer-rating', this.businessStats.customer_rating.toFixed(1));
//     }

//     async loadRecentActivity() {
//         try {
//             // Simulate API call for recent activity
//             const activities = [
//                 {
//                     id: 1,
//                     type: 'product_added',
//                     title: 'New Product Added',
//                     description: 'You added "Wireless Bluetooth Headphones" to your catalog',
//                     time: '2 hours ago',
//                     icon: 'fas fa-box'
//                 },
//                 {
//                     id: 2,
//                     type: 'order_received',
//                     title: 'New Order Received',
//                     description: 'Order #ORD-12345 for ₹2,499.00',
//                     time: '5 hours ago',
//                     icon: 'fas fa-shopping-bag'
//                 },
//                 {
//                     id: 3,
//                     type: 'review_received',
//                     title: 'New Customer Review',
//                     description: 'Customer rated your product 5 stars',
//                     time: '1 day ago',
//                     icon: 'fas fa-star'
//                 },
//                 {
//                     id: 4,
//                     type: 'payment_received',
//                     title: 'Payment Processed',
//                     description: '₹12,456.00 has been credited to your account',
//                     time: '2 days ago',
//                     icon: 'fas fa-rupee-sign'
//                 }
//             ];

//             this.renderRecentActivity(activities);
//         } catch (error) {
//             console.error('Error loading recent activity:', error);
//             this.renderRecentActivity([]);
//         }
//     }

//     renderRecentActivity(activities) {
//         const container = document.getElementById('recent-activity');
//         if (!container) return;

//         if (activities.length === 0) {
//             container.innerHTML = `
//                 <div class="empty-state">
//                     <i class="fas fa-inbox"></i>
//                     <p>No recent activity</p>
//                 </div>
//             `;
//             return;
//         }

//         container.innerHTML = activities.map(activity => `
//             <div class="activity-item">
//                 <div class="activity-icon">
//                     <i class="${activity.icon}"></i>
//                 </div>
//                 <div class="activity-content">
//                     <div class="activity-title">${activity.title}</div>
//                     <div class="activity-description">${activity.description}</div>
//                 </div>
//                 <div class="activity-time">${activity.time}</div>
//             </div>
//         `).join('');
//     }

//     showEditProfileModal() {
//         this.showModal('edit-profile-modal');
//     }

//     showChangeAvatarModal() {
//         this.newAvatarFile = null;
        
//         // Reset avatar preview
//         const preview = document.getElementById('avatar-preview');
//         if (preview) {
//             preview.innerHTML = '';
//             this.updateAvatarPreview(this.vendorInfo, preview);
//         }
        
//         // Disable save button initially
//         const saveBtn = document.getElementById('save-avatar-btn');
//         if (saveBtn) {
//             saveBtn.disabled = true;
//         }
        
//         this.showModal('change-avatar-modal');
//     }

//     setupAvatarUpload() {
//         const uploadArea = document.getElementById('avatar-upload-area');
//         const fileInput = document.getElementById('avatar-file');
//         const saveBtn = document.getElementById('save-avatar-btn');

//         if (!uploadArea || !fileInput || !saveBtn) return;

//         uploadArea.addEventListener('click', () => fileInput.click());

//         // Drag and drop functionality
//         uploadArea.addEventListener('dragover', (e) => {
//             e.preventDefault();
//             uploadArea.style.borderColor = 'var(--primary-color)';
//             uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
//         });

//         uploadArea.addEventListener('dragleave', () => {
//             uploadArea.style.borderColor = 'var(--border-color)';
//             uploadArea.style.background = '';
//         });

//         uploadArea.addEventListener('drop', (e) => {
//             e.preventDefault();
//             uploadArea.style.borderColor = 'var(--border-color)';
//             uploadArea.style.background = '';
//             if (e.dataTransfer.files.length > 0) {
//                 fileInput.files = e.dataTransfer.files;
//                 this.handleAvatarSelection(fileInput.files[0]);
//             }
//         });

//         fileInput.addEventListener('change', (e) => {
//             if (e.target.files.length > 0) {
//                 this.handleAvatarSelection(e.target.files[0]);
//             }
//         });

//         saveBtn.addEventListener('click', () => this.updateAvatar());
//     }

//     handleAvatarSelection(file) {
//         if (!file || !file.type.startsWith('image/')) {
//             this.showNotification('Please select a valid image file', 'error');
//             return;
//         }

//         // Check file size (max 2MB)
//         if (file.size > 2 * 1024 * 1024) {
//             this.showNotification('Image size should be less than 2MB', 'error');
//             return;
//         }

//         this.newAvatarFile = file;

//         // Update preview
//         const preview = document.getElementById('avatar-preview');
//         if (preview) {
//             preview.innerHTML = '';
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 const img = document.createElement('img');
//                 img.src = e.target.result;
//                 img.alt = 'Business Logo Preview';
//                 img.style.width = '100%';
//                 img.style.height = '100%';
//                 img.style.objectFit = 'cover';
//                 img.style.borderRadius = '50%';
//                 preview.appendChild(img);
//             };
//             reader.readAsDataURL(file);
//         }

//         // Enable save button
//         const saveBtn = document.getElementById('save-avatar-btn');
//         if (saveBtn) {
//             saveBtn.disabled = false;
//         }
//     }

//     async updateAvatar() {
//         if (!this.newAvatarFile) {
//             this.showNotification('Please select an image first', 'error');
//             return;
//         }

//         try {
//             this.showLoading(true);
            
//             const formData = new FormData();
//             formData.append('business_logo', this.newAvatarFile);

//             const response = await fetch(`${this.baseURL}/profile/update/`, {
//                 method: 'PUT',
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem('vendor_access_token')}`
//                 },
//                 body: formData
//             });

//             if (response.ok) {
//                 const result = await response.json();
//                 this.showNotification('Business logo updated successfully!', 'success');
                
//                 // Update local vendor info
//                 this.vendorInfo.business_logo = result.business_logo;
//                 localStorage.setItem('vendor_info', JSON.stringify(this.vendorInfo));
                
//                 // Update UI
//                 this.updateProfileAvatar(this.vendorInfo);
                
//                 this.closeModal('change-avatar-modal');
//             } else {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `HTTP ${response.status}`);
//             }
//         } catch (error) {
//             console.error('Error updating avatar:', error);
//             this.showNotification(`Failed to update logo: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     async updateProfile(e) {
//         e.preventDefault();

//         const form = e.target;
//         const formData = new FormData(form);

//         const profileData = {
//             business_name: formData.get('business_name'),
//             business_email: formData.get('business_email'),
//             phone_number: formData.get('phone_number'),
//             business_address: formData.get('business_address'),
//             business_type: formData.get('business_type'),
//             tax_id: formData.get('tax_id')
//         };

//         // Validate required fields
//         if (!profileData.business_name || !profileData.business_email || !profileData.phone_number || !profileData.business_address) {
//             this.showNotification('Please fill all required fields', 'error');
//             return;
//         }

//         try {
//             this.showLoading(true);
//             const response = await fetch(`${this.baseURL}/profile/update/`, {
//                 method: 'PUT',
//                 headers: this.getHeaders(),
//                 body: JSON.stringify(profileData)
//             });

//             if (response.ok) {
//                 const result = await response.json();
//                 this.showNotification('Profile updated successfully!', 'success');
                
//                 // Update local vendor info
//                 this.vendorInfo = { ...this.vendorInfo, ...profileData };
//                 localStorage.setItem('vendor_info', JSON.stringify(this.vendorInfo));
                
//                 // Update UI
//                 this.updateProfileUI(this.vendorInfo);
                
//                 this.closeModal('edit-profile-modal');
//             } else {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `HTTP ${response.status}`);
//             }
//         } catch (error) {
//             console.error('Error updating profile:', error);
//             this.showNotification(`Failed to update profile: ${error.message}`, 'error');
//         } finally {
//             this.showLoading(false);
//         }
//     }

//     updateAvatarPreview(vendor, previewElement) {
//         if (vendor.business_logo) {
//             const img = document.createElement('img');
//             img.src = vendor.business_logo;
//             img.alt = vendor.business_name || 'Business Logo';
//             img.style.width = '100%';
//             img.style.height = '100%';
//             img.style.objectFit = 'cover';
//             img.style.borderRadius = '50%';
//             previewElement.appendChild(img);
//         } else {
//             const businessName = vendor.business_name || 'Business';
//             const initials = businessName
//                 .split(' ')
//                 .map(word => word.charAt(0))
//                 .join('')
//                 .toUpperCase()
//                 .substring(0, 2);

//             if (initials.length > 0) {
//                 const initialsElement = document.createElement('div');
//                 initialsElement.className = 'avatar-initials';
//                 initialsElement.textContent = initials;
//                 initialsElement.style.cssText = `
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     width: 100%;
//                     height: 100%;
//                     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                     color: white;
//                     font-weight: bold;
//                     font-size: 2rem;
//                     border-radius: 50%;
//                 `;
//                 previewElement.appendChild(initialsElement);
//             } else {
//                 previewElement.innerHTML = '<i class="fas fa-store"></i>';
//             }
//         }
//     }

//     getHeaders() {
//         const accessToken = localStorage.getItem('vendor_access_token');
//         return {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`
//         };
//     }

//     handleTokenExpired() {
//         this.showNotification('Session expired. Please sign in again.', 'error');
//         setTimeout(() => {
//             this.clearSession();
//             window.location.href = '../Authentication/SignIn/SignIn.html';
//         }, 2000);
//     }

//     logout() {
//         if (confirm('Are you sure you want to logout?')) {
//             this.clearSession();
//             this.showNotification('Logged out successfully', 'success');
//             setTimeout(() => {
//                 window.location.href = '../Authentication/SignIn/SignIn.html';
//             }, 1000);
//         }
//     }

//     showModal(modalId) {
//         const modal = document.getElementById(modalId);
//         if (modal) {
//             modal.style.display = 'block';
//         }
//     }

//     closeModal(modalId) {
//         const modal = document.getElementById(modalId);
//         if (modal) {
//             modal.style.display = 'none';
//         }
//     }

//     closeAllModals() {
//         document.querySelectorAll('.modal').forEach(modal => {
//             modal.style.display = 'none';
//         });
//     }

//     showLoading(show) {
//         const overlay = document.getElementById('loading-overlay');
//         if (overlay) {
//             overlay.style.display = show ? 'block' : 'none';
//         }
//     }

//     showNotification(message, type = 'success') {
//         const container = document.getElementById('notification-container');
//         if (!container) return;

//         const notification = document.createElement('div');
//         notification.className = `notification ${type}`;
//         notification.innerHTML = `
//             <div class="notification-content">
//                 <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
//                 <span>${message}</span>
//             </div>
//         `;

//         container.appendChild(notification);

//         setTimeout(() => {
//             notification.remove();
//         }, 5000);
//     }
// }

// // Initialize vendor profile when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//     window.vendorProfile = new VendorProfile();
// });























class VendorProfile {
    constructor() {
        // Make sure this matches your actual backend URL structure
        this.baseURL = 'http://localhost:8000/api/vendor';
        this.vendorInfo = null;
        this.profileData = null;
        
        this.init();
    }

    init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            return;
        }

        this.bindEvents();
        this.loadVendorProfile();
    }

    checkAuthentication() {
        const accessToken = localStorage.getItem('vendor_access_token');
        const vendorInfo = localStorage.getItem('vendor_info');

        if (!accessToken) {
            this.showNotification('Please sign in to access your profile', 'error');
            setTimeout(() => {
                window.location.href = '../Authentication/SignIn/SignIn.html';
            }, 2000);
            return false;
        }

        try {
            if (vendorInfo) {
                this.vendorInfo = JSON.parse(vendorInfo);
                console.log('🔐 Vendor authenticated:', this.vendorInfo);
            }
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

        // Edit buttons
        document.getElementById('edit-personal-info')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showEditProfileModal();
        });

        document.getElementById('edit-address')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showEditProfileModal('address');
        });

        // Change avatar button
        document.getElementById('change-avatar-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showChangeAvatarModal();
        });

        // Upload documents button
        document.getElementById('upload-documents')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'vendor-onboarding.html?step=documents';
        });

        // View document buttons
        document.getElementById('view-gst')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.profileData?.gst_docs?.gst_certificate) {
                window.open(this.profileData.gst_docs.gst_certificate, '_blank');
            } else {
                this.showNotification('GST Certificate not available', 'warning');
            }
        });

        document.getElementById('view-signature')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.profileData?.gst_docs?.signature) {
                window.open(this.profileData.gst_docs.signature, '_blank');
            } else {
                this.showNotification('Signature not available', 'warning');
            }
        });

        document.getElementById('view-status')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showStatusDetails();
        });

        // Form submission
        document.getElementById('edit-profile-form')?.addEventListener('submit', (e) => this.updateProfile(e));
        
        // Avatar upload
        this.setupAvatarUpload();

        // Modal controls
        document.querySelectorAll('.close, .close-modal, .close-edit-modal').forEach(close => {
            close.addEventListener('click', () => this.closeAllModals());
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Tab switching in edit modal
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchEditTab(tabName);
            });
        });

        console.log('✅ Vendor profile events bound successfully');
    }

    async loadVendorProfile() {
        try {
            this.showLoading(true);
            
            // Update header vendor name from localStorage first
            this.updateHeaderVendorName();

            // Fetch profile data from API
            console.log('📡 Fetching profile from:', `${this.baseURL}/get-profile/`);
            
            const response = await fetch(`${this.baseURL}/get-profile/`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            console.log('🔍 Response status:', response.status);
            
            // First check if we got HTML instead of JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                // We got HTML, probably a 404 page
                const htmlText = await response.text();
                console.error('❌ Received HTML instead of JSON. Response:', htmlText.substring(0, 500));
                throw new Error(`API endpoint returned HTML. Check if endpoint exists. Status: ${response.status}`);
            }

            if (response.ok) {
                const profileData = await response.json();
                this.profileData = profileData;
                console.log('📊 Profile data loaded:', profileData);
                this.updateProfileUI(profileData);
                this.showNotification('Profile loaded successfully', 'success');
            } else if (response.status === 401) {
                // Handle unauthorized - token might be expired
                this.handleUnauthorized();
            } else {
                // Try to parse error message
                let errorMsg = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    // If not JSON, get text
                    const text = await response.text();
                    if (text) errorMsg = `${errorMsg}: ${text.substring(0, 100)}`;
                }
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('❌ Error loading vendor profile:', error);
            
            // Show fallback UI with stored data
            this.showFallbackProfileUI();
            
            // Show user-friendly error message
            if (error.message.includes('HTML') || error.message.includes('404')) {
                this.showNotification('Profile API endpoint not found. Using stored data.', 'warning');
            } else {
                this.showNotification('Error loading profile data: ' + error.message, 'error');
            }
        } finally {
            this.showLoading(false);
        }
    }

    handleUnauthorized() {
        this.showNotification('Session expired. Please login again.', 'error');
        this.clearSession();
        setTimeout(() => {
            window.location.href = '../Authentication/SignIn/SignIn.html';
        }, 2000);
    }

    updateProfileUI(profileData) {
        console.log('🔄 Updating profile UI with:', profileData);
        
        // Update header vendor name
        this.updateHeaderVendorName();

        // Update profile header
        const sellerName = profileData.personal_info?.seller_name || profileData.personal_info?.full_name || 'Vendor Store';
        const businessEmail = profileData.personal_info?.business_email || 'Not set';
        const joinYear = profileData.member_year || '2024';
        
        document.getElementById('vendor-display-name').textContent = sellerName;
        document.getElementById('vendor-email').textContent = businessEmail;
        document.getElementById('join-date').textContent = joinYear;

        // Update account status
        this.updateAccountStatus(profileData);

        // Update statistics
        this.updateStatistics(profileData);

        // Update personal information
        this.updatePersonalInfo(profileData);

        // Update address information
        this.updateAddressInfo(profileData);

        // Update document verification status
        this.updateDocumentStatus(profileData);

        // Update avatar
        this.updateProfileAvatar(profileData);

        // Populate edit form
        this.populateEditForm(profileData);
    }

    updateHeaderVendorName() {
        const vendorNameElement = document.getElementById('vendor-name');
        if (vendorNameElement) {
            if (this.vendorInfo?.seller_name || this.vendorInfo?.full_name) {
                vendorNameElement.textContent = this.vendorInfo.seller_name || this.vendorInfo.full_name || 'Vendor Account';
            } else if (this.profileData?.personal_info?.seller_name) {
                vendorNameElement.textContent = this.profileData.personal_info.seller_name;
            }
        }
    }

    updateAccountStatus(profileData) {
        const statusElement = document.getElementById('account-status');
        const verificationElement = document.getElementById('verification-status');
        
        const status = profileData.status || 'DRAFT';
        const isVerified = profileData.gst_docs?.is_verified || false;
        
        // Update account status badge
        const statusMap = {
            'APPROVED': { text: 'Active', className: 'active' },
            'REJECTED': { text: 'Rejected', className: 'inactive' },
            'SUSPENDED': { text: 'Suspended', className: 'inactive' },
            'IN_REVIEW': { text: 'In Review', className: 'pending' },
            'PENDING_KYC': { text: 'Pending KYC', className: 'pending' },
            'DRAFT': { text: 'Draft', className: 'pending' }
        };
        
        const statusInfo = statusMap[status] || { text: status, className: 'pending' };
        statusElement.textContent = statusInfo.text;
        statusElement.className = `status-badge ${statusInfo.className}`;
        
        // Update verification badge
        if (isVerified) {
            verificationElement.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
            verificationElement.className = 'verification-badge';
        } else {
            verificationElement.innerHTML = '<i class="fas fa-clock"></i> Pending';
            verificationElement.className = 'verification-badge pending';
        }
    }

    updateStatistics(profileData) {
        if (profileData.stats) {
            // Calculate total products
            const totalProducts = (profileData.stats.active_products || 0) + 
                                (profileData.stats.inactive_products || 0) + 
                                (profileData.stats.not_verified_products || 0);
            
            // Update top stats
            document.getElementById('total-products').textContent = totalProducts;
            document.getElementById('total-orders').textContent = profileData.stats.total_order_items || 0;
            document.getElementById('total-revenue').textContent = 
                `₹${(profileData.stats.total_earning || 0).toLocaleString('en-IN')}`;
            document.getElementById('rating').textContent = '4.5'; // Default rating

            // Update detailed stats
            document.getElementById('active-products').textContent = profileData.stats.active_products || 0;
            document.getElementById('inactive-products').textContent = profileData.stats.inactive_products || 0;
            document.getElementById('pending-products').textContent = profileData.stats.not_verified_products || 0;
            document.getElementById('stats-total-orders').textContent = profileData.stats.total_order_items || 0;
        } else {
            // If no stats, set defaults
            document.getElementById('total-products').textContent = '0';
            document.getElementById('total-orders').textContent = '0';
            document.getElementById('total-revenue').textContent = '₹0';
            document.getElementById('rating').textContent = '0.0';
            
            document.getElementById('active-products').textContent = '0';
            document.getElementById('inactive-products').textContent = '0';
            document.getElementById('pending-products').textContent = '0';
            document.getElementById('stats-total-orders').textContent = '0';
        }
    }

    updatePersonalInfo(profileData) {
        const personalInfo = profileData.personal_info || {};
        
        document.getElementById('full-name').textContent = personalInfo.full_name || 'Not set';
        document.getElementById('seller-name').textContent = personalInfo.seller_name || 'Not set';
        document.getElementById('business-email').textContent = personalInfo.business_email || 'Not set';
        document.getElementById('phone-number').textContent = personalInfo.phone || 'Not set';
        document.getElementById('gstin').textContent = personalInfo.gst || 'Not provided';
        
        // Account type - you might want to add this to your backend
        document.getElementById('account-type').textContent = 'Individual';
    }

    updateAddressInfo(profileData) {
        const address = profileData.pickup_address || {};
        
        document.getElementById('address-line-1').textContent = address.address_line_1 || 'Not set';
        document.getElementById('address-line-2').textContent = address.address_line_2 || '';
        document.getElementById('address-city').textContent = address.city || 'Not set';
        document.getElementById('address-state').textContent = address.state || 'Not set';
        document.getElementById('address-pincode').textContent = address.pincode || 'Not set';
    }

    updateDocumentStatus(profileData) {
        const docs = profileData.gst_docs || {};
        const vendorStatus = profileData.status || 'DRAFT';
        
        // GST status
        const gstStatusElement = document.getElementById('gst-status');
        if (docs.gst_certificate && docs.is_verified) {
            gstStatusElement.className = 'document-status verified';
            gstStatusElement.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
        } else if (docs.gst_certificate && !docs.is_verified) {
            gstStatusElement.className = 'document-status pending';
            gstStatusElement.innerHTML = '<i class="fas fa-clock"></i> Pending Review';
        } else {
            gstStatusElement.className = 'document-status pending';
            gstStatusElement.innerHTML = '<i class="fas fa-times-circle"></i> Not Uploaded';
        }

        // Signature status
        const signatureStatusElement = document.getElementById('signature-status');
        if (docs.signature && docs.is_verified) {
            signatureStatusElement.className = 'document-status verified';
            signatureStatusElement.innerHTML = '<i class="fas fa-check-circle"></i> Verified';
        } else if (docs.signature && !docs.is_verified) {
            signatureStatusElement.className = 'document-status pending';
            signatureStatusElement.innerHTML = '<i class="fas fa-clock"></i> Pending Review';
        } else {
            signatureStatusElement.className = 'document-status pending';
            signatureStatusElement.innerHTML = '<i class="fas fa-times-circle"></i> Not Uploaded';
        }

        // Vendor status
        const vendorStatusElement = document.getElementById('vendor-status');
        if (vendorStatus === 'APPROVED') {
            vendorStatusElement.className = 'document-status verified';
            vendorStatusElement.innerHTML = '<i class="fas fa-check-circle"></i> Approved';
        } else if (vendorStatus === 'REJECTED') {
            vendorStatusElement.className = 'document-status rejected';
            vendorStatusElement.innerHTML = '<i class="fas fa-times-circle"></i> Rejected';
        } else if (vendorStatus === 'SUSPENDED') {
            vendorStatusElement.className = 'document-status rejected';
            vendorStatusElement.innerHTML = '<i class="fas fa-ban"></i> Suspended';
        } else if (vendorStatus === 'IN_REVIEW') {
            vendorStatusElement.className = 'document-status pending';
            vendorStatusElement.innerHTML = '<i class="fas fa-clock"></i> In Review';
        } else {
            vendorStatusElement.className = 'document-status pending';
            vendorStatusElement.innerHTML = '<i class="fas fa-clock"></i> ' + (vendorStatus || 'Pending');
        }
    }

    updateProfileAvatar(profileData) {
        const avatarElement = document.getElementById('profile-avatar');
        if (!avatarElement) return;

        // For now, use initials or default icon
        const sellerName = profileData.personal_info?.seller_name || profileData.personal_info?.full_name || 'Vendor';
        this.updateAvatarWithInitials(avatarElement, sellerName);
    }

    updateAvatarWithInitials(element, name) {
        element.innerHTML = '';
        
        const initials = name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);

        if (initials.length > 0) {
            const initialsElement = document.createElement('div');
            initialsElement.className = 'avatar-initials';
            initialsElement.textContent = initials;
            element.appendChild(initialsElement);
        } else {
            element.innerHTML = '<i class="fas fa-store"></i>';
        }
    }

    populateEditForm(profileData) {
        const personalInfo = profileData.personal_info || {};
        const address = profileData.pickup_address || {};
        
        // Personal info
        document.getElementById('edit-full-name').value = personalInfo.full_name || '';
        document.getElementById('edit-seller-name').value = personalInfo.seller_name || '';
        document.getElementById('edit-phone').value = personalInfo.phone || '';
        document.getElementById('edit-gstin').value = personalInfo.gst || '';

        // Address info
        document.getElementById('edit-address-line1').value = address.address_line_1 || '';
        document.getElementById('edit-address-line2').value = address.address_line_2 || '';
        document.getElementById('edit-city').value = address.city || '';
        document.getElementById('edit-state').value = address.state || '';
        document.getElementById('edit-pincode').value = address.pincode || '';
    }

    showFallbackProfileUI() {
        console.log('🔄 Showing fallback profile UI');
        
        // Update with basic information from localStorage
        if (this.vendorInfo) {
            const fallbackData = {
                personal_info: {
                    full_name: this.vendorInfo.full_name || 'Not set',
                    seller_name: this.vendorInfo.seller_name || 'Not set',
                    business_email: this.vendorInfo.business_email || 'Not set',
                    phone: this.vendorInfo.phone || 'Not set',
                    gst: this.vendorInfo.gst || 'Not provided'
                },
                status: this.vendorInfo.status || 'DRAFT',
                stats: {
                    active_products: 0,
                    inactive_products: 0,
                    not_verified_products: 0,
                    total_order_items: 0,
                    total_earning: 0
                },
                pickup_address: {
                    address_line_1: 'Not configured',
                    address_line_2: '',
                    city: '',
                    state: '',
                    pincode: ''
                },
                gst_docs: {
                    is_verified: false
                },
                member_year: new Date().getFullYear()
            };
            
            this.updateProfileUI(fallbackData);
        } else {
            this.showEmptyProfileState();
        }
    }

    showEmptyProfileState() {
        document.getElementById('full-name').textContent = 'Profile not loaded';
        document.getElementById('seller-name').textContent = 'Please refresh the page';
        document.getElementById('business-email').textContent = 'N/A';
        document.getElementById('phone-number').textContent = 'N/A';
        document.getElementById('gstin').textContent = 'N/A';
        
        // Update stats to show zeros
        document.getElementById('total-products').textContent = '0';
        document.getElementById('total-orders').textContent = '0';
        document.getElementById('total-revenue').textContent = '₹0';
        document.getElementById('rating').textContent = '0.0';
        
        document.getElementById('active-products').textContent = '0';
        document.getElementById('inactive-products').textContent = '0';
        document.getElementById('pending-products').textContent = '0';
        document.getElementById('stats-total-orders').textContent = '0';
    }

    showEditProfileModal(defaultTab = 'personal') {
        // Switch to the specified tab
        this.switchEditTab(defaultTab);
        
        // Show modal
        this.showModal('edit-profile-modal');
    }

    switchEditTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab content
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) {
            tabContent.classList.add('active');
        }
        
        // Activate selected tab button
        const tabButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (tabButton) {
            tabButton.classList.add('active');
        }
    }

    showChangeAvatarModal() {
        // Reset avatar preview
        const preview = document.getElementById('avatar-preview');
        if (preview) {
            preview.innerHTML = '';
            if (this.profileData?.personal_info?.seller_name) {
                this.updateAvatarWithInitials(preview, this.profileData.personal_info.seller_name);
            } else {
                preview.innerHTML = '<i class="fas fa-store"></i>';
            }
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
            uploadArea.style.borderColor = '#4299e1';
            uploadArea.style.background = 'rgba(66, 153, 225, 0.05)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#e2e8f0';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#e2e8f0';
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

            // Note: You'll need to create this endpoint in your backend
            // For now, we'll just show a success message
            this.showNotification('Logo upload feature coming soon!', 'success');
            this.closeModal('change-avatar-modal');
            
            // If you have the endpoint:
            /*
            const response = await fetch(`${this.baseURL}/profile/update-logo/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('vendor_access_token')}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Business logo updated successfully!', 'success');
                
                // Reload profile data
                await this.loadVendorProfile();
                
                this.closeModal('change-avatar-modal');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
            */
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

        // Extract data based on active tab
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
        
        let updateData = {};
        let endpoint = '';
        
        if (activeTab === 'personal') {
            updateData = {
                full_name: formData.get('full_name'),
                seller_name: formData.get('seller_name'),
                phone: formData.get('phone'),
                gst: formData.get('gst')
            };
            // Use your existing endpoint for updating vendor info
            endpoint = `${this.baseURL}/profile/update/`; // This should match your backend
        } else if (activeTab === 'address') {
            updateData = {
                address_line_1: formData.get('address_line_1'),
                address_line_2: formData.get('address_line_2'),
                city: formData.get('city'),
                state: formData.get('state'),
                pincode: formData.get('pincode')
            };
            // Use your existing endpoint for updating address
            endpoint = `${this.baseURL}/add/pickup-address/`; // This should match your backend
        }

        // Validate required fields
        if (activeTab === 'personal') {
            if (!updateData.full_name || !updateData.seller_name || !updateData.phone) {
                this.showNotification('Please fill all required fields', 'error');
                return;
            }
        } else if (activeTab === 'address') {
            if (!updateData.address_line_1 || !updateData.city || !updateData.state || !updateData.pincode) {
                this.showNotification('Please fill all required fields', 'error');
                return;
            }
        }

        try {
            this.showLoading(true);
            
            console.log('📤 Sending update to:', endpoint, 'Data:', updateData);
            
            const response = await fetch(endpoint, {
                method: 'POST', // or 'PUT' based on your backend
                headers: this.getHeaders(),
                body: JSON.stringify(updateData)
            });

            console.log('🔍 Update response status:', response.status);
            
            // Check content type
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('API endpoint returned HTML instead of JSON');
            }

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Profile updated successfully!', 'success');
                
                // Reload profile data
                await this.loadVendorProfile();
                
                this.closeModal('edit-profile-modal');
            } else {
                let errorMsg = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.detail || errorMsg;
                } catch (e) {
                    const text = await response.text();
                    if (text) errorMsg = `${errorMsg}: ${text.substring(0, 100)}`;
                }
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showNotification(`Failed to update profile: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showStatusDetails() {
        const status = this.profileData?.status || 'DRAFT';
        const isVerified = this.profileData?.gst_docs?.is_verified || false;
        
        let message = '';
        let title = 'Account Status Details';
        
        const statusMessages = {
            'APPROVED': '✅ Your vendor account has been approved and is fully active.',
            'IN_REVIEW': '⏳ Your vendor account is currently under review by our team.',
            'PENDING_KYC': '📋 KYC verification is pending.',
            'REJECTED': '❌ Your vendor application has been rejected.',
            'SUSPENDED': '⛔ Your vendor account has been suspended.',
            'DRAFT': '📝 Your vendor account is in draft status.'
        };
        
        message = statusMessages[status] || 'Your account status is: ' + status;
        
        if (status === 'APPROVED') {
            message += '\n\nYou can now:\n';
            message += '• List and sell products\n';
            message += '• Receive orders from customers\n';
            message += '• Process payments and shipments\n';
            
            if (isVerified) {
                message += '\n✅ Your documents have been verified.';
            } else {
                message += '\n⚠️ Note: Some documents are still pending verification.';
            }
        } else if (status === 'IN_REVIEW') {
            message += '\n\nPlease wait while we verify your documents and information.';
            message += '\nThis process typically takes 2-3 business days.';
            message += '\n\nYou will be notified once the review is complete.';
        }
        
        alert(`${title}\n\n${message}`);
    }

    getHeaders() {
        const accessToken = localStorage.getItem('vendor_access_token');
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        return headers;
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
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) {
            // Create notification container if it doesn't exist
            const newContainer = document.createElement('div');
            newContainer.id = 'notification-container';
            newContainer.style.cssText = `
                position: fixed;
                top: 1rem;
                right: 1rem;
                z-index: 9999;
            `;
            document.body.appendChild(newContainer);
            container = newContainer;
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 1rem 1.5rem;
            margin-bottom: 0.75rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${type === 'success' ? '#48bb78' : type === 'warning' ? '#ed8936' : '#f56565'};
            animation: slideIn 0.3s ease;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <div class="notification-content" style="display: flex; align-items: center; gap: 0.75rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'}" 
                   style="font-size: 1.25rem; color: ${type === 'success' ? '#48bb78' : type === 'warning' ? '#ed8936' : '#f56565'}"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .fade-out {
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            }
        `;
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode === container) {
                    container.removeChild(notification);
                }
            }, 300);
        }, 5000);
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
}

// Initialize vendor profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vendorProfile = new VendorProfile();
});