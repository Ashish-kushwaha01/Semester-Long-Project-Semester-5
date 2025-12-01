class VendorOnboarding {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/vendor';
        this.productBaseURL = 'http://localhost:8000/api/product';
        this.currentStep = 'mobile-email';
        this.currentToken = null;
        this.categories = [];
        this.products = [];
        this.currentProductId = null;
        this.currentCategoryId = null;
        this.currentVariantId = null;
        this.currentProductAttributes = [];
        this.userData = {
            business_email: null,
            phone: null,
            password: null,
            full_name: null,
            seller_name: null,
            gst: null,
            signature: null,
            gst_certificate: null,
            address: {},
            products: []
        };
        this.completedSteps = new Set();
        this.isReturningUser = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Vendor Onboarding System...');
        
        try {
            await this.initializeOnboardingState();
            this.bindEvents();
            this.setupSignatureCanvas();
            this.setupOTPInputs();
            this.setupPageUnloadHandler();
            this.setupFileUpload();
            
            this.loadCategories();
            
            console.log('✅ Vendor Onboarding System Initialized Successfully');
        } catch (error) {
            console.error('❌ Error initializing onboarding:', error);
        }
    }

    async initializeOnboardingState() {
        console.log('🔍 Checking onboarding state...');
        
        const authInfo = localStorage.getItem('vendor_auth_info');
        
        if (authInfo) {
            // User came from SignIn - existing vendor
            try {
                const authData = JSON.parse(authInfo);
                this.isReturningUser = true;
                console.log('👤 Returning user detected:', authData);

                if (authData.is_authenticated) {
                    await this.fetchAndDisplayExistingProgress(authData);
                }
            } catch (error) {
                console.error('Error parsing auth info:', error);
                this.showCleanInitialState();
            }
        } else {
            // New user - clear any previous progress
            console.log('🆕 New user - showing clean state');
            this.showCleanInitialState();
        }
    }

    async fetchAndDisplayExistingProgress(authData) {
        try {
            const response = await fetch(`${this.baseURL}/onboarding/state/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authData.access_token}`
                }
            });

            if (response.ok) {
                const progressData = await response.json();
                this.updateUIWithExistingProgress(progressData);
            } else {
                console.log('Failed to fetch onboarding state:', response.status);
                this.showCleanInitialState();
            }
        } catch (error) {
            console.error('Error fetching onboarding progress:', error);
            this.showCleanInitialState();
        }
    }

    updateUIWithExistingProgress(progressData) {
        console.log('🔄 Displaying existing progress:', progressData);

        // Mark completed steps based on backend data
        if (progressData.is_registered) {
            this.markStepAsCompleted('mobile-email');
            this.markStepAsCompleted('password-setup');

            // Pre-fill email if available
            if (progressData.business_email) {
                const emailInput = document.getElementById('email-address');
                if (emailInput) {
                    emailInput.value = progressData.business_email;
                    this.userData.business_email = progressData.business_email;
                    
                    // Show mobile verification card if email is verified
                    const mobileCard = document.getElementById('mobile-verification-card');
                    if (mobileCard) {
                        mobileCard.style.display = 'block';
                        mobileCard.classList.add('show');
                    }
                }
            }
        }
        
        if (progressData.is_document_uploaded) {
            this.markStepAsCompleted('id-signature');

            // Pre-fill basic info if available
            if (progressData.full_name) {
                const fullNameInput = document.getElementById('full-name');
                if (fullNameInput) fullNameInput.value = progressData.full_name;
            }
            if (progressData.seller_name) {
                const displayNameInput = document.getElementById('display-name');
                if (displayNameInput) displayNameInput.value = progressData.seller_name;
            }
        }
        
        if (progressData.is_pickup_address_uploaded) {
            this.markStepAsCompleted('store-pickup');
        }
        
        if (progressData.is_initial_listing) {
            this.markStepAsCompleted('listing-stock');
        }

        // Navigate to first incomplete step
        this.navigateToFirstIncompleteStep(progressData);
    }

    navigateToFirstIncompleteStep(progressData) {
        if (!progressData.is_registered) {
            this.switchSection('mobile-email');
        } else if (!progressData.is_document_uploaded) {
            this.switchSection('id-signature');
        } else if (!progressData.is_pickup_address_uploaded) {
            this.switchSection('store-pickup');
        } else if (!progressData.is_initial_listing) {
            this.switchSection('listing-stock');
        } else {
            this.switchSection('mobile-email');
        }
    }

    // IMPROVED getHeaders METHOD WITH BETTER TOKEN HANDLING
    getHeaders() {
        // Get token from multiple sources with priority
        const token = localStorage.getItem('vendor_access_token') || this.currentToken;
        
        console.log('🔑 Token being used:', token ? 'Token exists' : 'No token found');
        
        if (!token) {
            console.warn('⚠️ No authentication token available');
            return {
                'Content-Type': 'application/json'
            };
        }
        
        // Validate token format
        if (typeof token !== 'string' || token.trim() === '') {
            console.error('❌ Invalid token format');
            return {
                'Content-Type': 'application/json'
            };
        }
        
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.trim()}`
        };
    }

    // DEBUG METHOD TO CHECK AUTH STATUS
    debugAuthStatus() {
        console.log('🔐 DEBUG AUTH STATUS:');
        console.log('- Local Storage Token:', localStorage.getItem('vendor_access_token'));
        console.log('- Current Token:', this.currentToken);
        
        const headers = this.getHeaders();
        console.log('- Final Headers:', headers);
        console.log('- Authorization Header:', headers['Authorization']);
    }

    // VENDOR-DASHBOARD STYLE CATEGORY LOADING
    async loadCategories() {
        try {
            console.log("Loading categories...");
            this.showLoading(true);
            
            const response = await fetch(`${this.productBaseURL}/categories/leaf-nodes/`, {
                headers: this.getHeaders()
            });
            console.log("Categories called.")
            
            if (response.ok) {
                const data = await response.json();
                console.log(data)
                this.categories = Array.isArray(data) ? data : [];
                this.populateCategoryDropdown();
                this.showNotification('Categories loaded successfully', 'success');
            } else if (response.status === 401) {
                this.handleTokenExpired();
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

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            dropdown.appendChild(option);
        });
    }

    handleTokenExpired() {
        this.showNotification('Access token expired. Please update your tokens.', 'error');
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

    markStepAsCompleted(step) {
        this.completedSteps.add(step);
        
        // Update sidebar status
        const statusElement = document.getElementById(`${step}-status`);
        if (statusElement) {
            statusElement.innerHTML = '<i class="fas fa-check"></i>';
            statusElement.className = 'status-indicator completed';
        }

        // Update menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            if (item.dataset.target === step) {
                item.classList.add('completed');
                
                // Update menu status indicator
                const menuStatus = item.querySelector('.status-indicator');
                if (menuStatus) {
                    menuStatus.innerHTML = '<i class="fas fa-check"></i>';
                    menuStatus.className = 'status-indicator completed';
                }
            }
        });

        this.updateProgress();
    }

    showCleanInitialState() {
        console.log('🧹 Showing clean initial state');
        
        // Reset all UI elements to initial state
        this.resetAllStepsUI();
        
        // Clear form fields
        this.clearAllFormFields();
        
        // Switch to first step
        this.switchSection('mobile-email');

        // Clear any stored data
        this.userData = {
            business_email: null,
            phone: null,
            password: null,
            full_name: null,
            seller_name: null,
            gst: null,
            signature: null,
            gst_certificate: null,
            address: {},
            products: []
        };
        
        this.completedSteps.clear();
        this.currentToken = null;
        
        console.log('✅ Clean initial state ready');
    }

    resetAllStepsUI() {
        const steps = ['mobile-email', 'password-setup', 'id-signature', 'store-pickup', 'listing-stock'];
        
        steps.forEach(step => {
            const statusElement = document.getElementById(`${step}-status`);
            if (statusElement) {
                statusElement.innerHTML = '<i class="fas fa-clock"></i>';
                statusElement.className = 'status-indicator pending';
            }

            document.querySelectorAll('.menu-item').forEach(item => {
                if (item.dataset.target === step) {
                    item.classList.remove('completed', 'active');
                    
                    const menuStatus = item.querySelector('.status-indicator');
                    if (menuStatus) {
                        menuStatus.innerHTML = '<i class="fas fa-clock"></i>';
                        menuStatus.className = 'status-indicator pending';
                    }
                }
            });
        });

        // Reset progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progressPercent = document.querySelector('.progress-percent');
        if (progressFill) progressFill.style.width = '0%';
        if (progressPercent) progressPercent.textContent = '0%';
    }

    clearAllFormFields() {
        const fieldsToClear = [
            'email-address', 'mobile-number', 'password', 'confirm-password',
            'full-name', 'display-name', 'gstin', 'address-line1', 'address-line2',
            'city', 'pincode', 'product-title', 'product-price', 'product-description'
        ];
        
        fieldsToClear.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });
        
        // Clear OTP inputs
        document.querySelectorAll('.otp-digit').forEach(input => {
            input.value = '';
        });
        
        // Clear file inputs
        const signatureFile = document.getElementById('signature-file');
        const gstFile = document.getElementById('gst-certificate-file');
        if (signatureFile) signatureFile.value = '';
        if (gstFile) gstFile.value = '';
        
        // Clear signature canvas
        const canvas = document.getElementById('signatureCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Reset verification statuses
        document.querySelectorAll('.verification-status').forEach(status => {
            status.innerHTML = '<i class="fas fa-clock"></i><span>Pending</span>';
            status.className = 'verification-status pending';
        });
    }

    bindEvents() {
        console.log('🔗 Binding events...');
        
        try {
            // Navigation
            const menuItems = document.querySelectorAll('.menu-item');
            console.log('📋 Found menu items:', menuItems.length);
            
            menuItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    console.log('📍 Menu item clicked:', item.dataset.target);
                    const target = item.dataset.target;
                    this.switchSection(target);
                });
            });

            // Email Verification
            this.bindButton('send-email-otp', () => this.sendEmailOTP());
            this.bindButton('verify-email-otp', () => this.verifyEmailOTP());
            this.bindButton('resend-email-otp', () => this.resendEmailOTP());
            this.bindButton('change-email-address', () => this.changeEmail());
            this.bindButton('email-edit', () => this.changeEmail());

            // Mobile Verification
            this.bindButton('send-mobile-otp', () => this.sendMobileOTP());
            this.bindButton('verify-mobile-otp', () => this.verifyMobileOTP());
            this.bindButton('resend-mobile-otp', () => this.resendMobileOTP());
            this.bindButton('change-mobile-number', () => this.changeMobile());
            this.bindButton('mobile-edit', () => this.changeMobile());

            // Password Setup
            this.bindButton('save-password', (e) => {
                e.preventDefault();
                this.savePassword();
            });
            
            this.bindButton('toggle-password', () => this.togglePasswordVisibility('password'));
            this.bindButton('toggle-confirm-password', () => this.togglePasswordVisibility('confirm-password'));
            
            // Password strength check
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            if (passwordInput) passwordInput.addEventListener('input', () => this.checkPasswordStrength());
            if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', () => this.checkPasswordMatch());

            // ID & Signature
            this.bindButton('verify-gstin', () => this.verifyGSTIN());
            this.bindButton('save-id-signature', (e) => {
                e.preventDefault();
                this.saveIdSignature();
            });
            
            // File uploads
            this.bindFileUpload('signature-upload', 'signature-file');
            this.bindFileUpload('gst-certificate-upload', 'gst-certificate-file');
            
            const signatureFile = document.getElementById('signature-file');
            const gstFile = document.getElementById('gst-certificate-file');
            if (signatureFile) signatureFile.addEventListener('change', (e) => this.handleSignatureUpload(e));
            if (gstFile) gstFile.addEventListener('change', (e) => this.handleGSTCertificateUpload(e));

            // Store & Pickup
            this.bindButton('save-store-pickup', (e) => {
                e.preventDefault();
                this.saveStorePickup();
            });

            // Products
            const addProductForm = document.getElementById('add-product-form');
            if (addProductForm) {
                addProductForm.addEventListener('submit', (e) => this.addProduct(e));
            }

            // Variant modals
            this.bindButton('close-variant-modal', () => this.closeModal('add-variant-modal'));
            this.bindButton('add-variant-btn', (e) => this.addVariant(e));
            this.bindButton('close-edit-variant-modal', () => this.closeModal('edit-variant-modal'));
            this.bindButton('ads-variant-serial', () => this.showAddVariantModal());
            
            this.bindButton('complete-listing', () => this.completeListing());

            // Continue Later
            this.bindButton('complete-onboarding', () => this.showContinueModal());
            this.bindButton('confirm-continue-later', () => this.continueLater());
            this.bindButton('cancel-continue', () => this.closeModal('continue-later-modal'));
            this.bindButton('close-continue-modal', () => this.closeModal('continue-later-modal'));

            console.log('✅ All events bound successfully');
            
        } catch (error) {
            console.error('❌ Error binding events:', error);
        }
    }

    bindButton(buttonId, handler) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', handler);
            console.log(`🔘 Button bound: ${buttonId}`);
        } else {
            console.warn(`⚠️ Button not found: ${buttonId}`);
        }
    }

    bindFileUpload(uploadAreaId, fileInputId) {
        const uploadArea = document.getElementById(uploadAreaId);
        const fileInput = document.getElementById(fileInputId);
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            console.log(`📁 File upload bound: ${uploadAreaId} -> ${fileInputId}`);
        } else {
            console.warn(`⚠️ File upload elements not found: ${uploadAreaId} or ${fileInputId}`);
        }
    }

    setupSignatureCanvas() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) {
            console.warn('⚠️ Signature canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // Set styles
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Drawing functions
        const startDrawing = (e) => {
            isDrawing = true;
            [lastX, lastY] = [e.offsetX, e.offsetY];
        };

        const draw = (e) => {
            if (!isDrawing) return;
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            [lastX, lastY] = [e.offsetX, e.offsetY];
        };

        const stopDrawing = () => {
            isDrawing = false;
        };

        // Event listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });

        // Clear signature
        this.bindButton('clear-signature', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        // Save signature
        this.bindButton('save-signature', () => {
            if (canvas.width === 0 || canvas.height === 0) {
                this.showNotification('Please create a signature first', 'error');
                return;
            }

            canvas.toBlob((blob) => {
                this.userData.signature = blob;
                const signatureStatus = document.getElementById('signature-status');
                if (signatureStatus) {
                    signatureStatus.innerHTML = '<i class="fas fa-check-circle"></i> Signature saved successfully';
                    signatureStatus.className = 'signature-status success';
                }
            });
        });

        console.log('✅ Signature canvas setup complete');
    }

    setupOTPInputs() {
        const inputs = document.querySelectorAll('.otp-digit');
        console.log('🔢 Setting up OTP inputs:', inputs.length);

        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;

                if (value && index < inputs.length - 1) {
                    const type = input.getAttribute('data-type');
                    const nextInput = document.querySelector(`.otp-digit[data-type="${type}"][data-index="${index + 1}"]`);
                    if (nextInput) nextInput.focus();
                }

                this.updateVerifyButtonState(input.getAttribute('data-type'));
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    const type = input.getAttribute('data-type');
                    const prevInput = document.querySelector(`.otp-digit[data-type="${type}"][data-index="${index - 1}"]`);
                    if (prevInput) prevInput.focus();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                const type = input.getAttribute('data-type');
                
                pasteData.split('').forEach((char, i) => {
                    const targetInput = document.querySelector(`.otp-digit[data-type="${type}"][data-index="${i}"]`);
                    if (targetInput) {
                        targetInput.value = char;
                    }
                });
                
                this.updateVerifyButtonState(type);
            });
        });

        console.log('✅ OTP inputs setup complete');
    }

    setupPageUnloadHandler() {
        window.addEventListener('beforeunload', (e) => {
            const authInfo = localStorage.getItem('vendor_auth_info');
            const isOnboardingComplete = this.completedSteps.size === 5;

            // If user is not authenticated and hasn't completed onboarding, clear data
            if (!authInfo && !isOnboardingComplete) {
                console.log('🧹 Clearing progress for new user on page unload');
                this.clearAllProgress();
            }
        });
    }

    // VENDOR-DASHBOARD STYLE FILE UPLOAD
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
            default:
                return;
        }

        if (!previewContainer) return;

        // Clear previous previews for primary images (only one allowed)
        if (type === 'primary') {
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

    // AUTHENTICATION METHODS
    async sendEmailOTP() {
        const email = document.getElementById('email-address').value.trim();

        if (!this.validateEmail(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return;
        }

        this.setButtonLoading('send-email-otp', true, 'Sending...');

        try {
            const response = await fetch(`${this.baseURL}/register/email/otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    business_email: email
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentToken = data.access_token;
                this.userData.business_email = email;

                document.getElementById('email-display').textContent = this.maskEmail(email);
                this.showVerificationStep('email', 2);
                this.startTimer('email');
                this.showNotification('Verification code sent to your email', 'success');
            } else {
                throw new Error(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending email OTP:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading('send-email-otp', false, '<i class="fas fa-paper-plane"></i> Send Verification Code');
        }
    }

    async verifyEmailOTP() {
        const otp = this.getEnteredOTP('email');

        if (otp.length !== 6) {
            this.showNotification('Please enter the complete verification code', 'error');
            return;
        }

        this.setButtonLoading('verify-email-otp', true, 'Verifying...');

        try {
            const response = await fetch(`${this.baseURL}/register/email/verify/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentToken}`
                },
                body: JSON.stringify({
                    business_email: this.userData.business_email,
                    otp: otp
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store the new token from email verification
                if (data.access_token) {
                    this.saveToken(data.access_token);
                } else if (data.acess_token) { // Handle backend typo
                    this.saveToken(data.acess_token);
                }

                this.showVerificationStep('email', 3);
                this.markStepCompleted('email');
                this.showNotification('Email verified successfully!', 'success');

                // Show mobile verification after email is verified
                setTimeout(() => {
                    const mobileCard = document.getElementById('mobile-verification-card');
                    if (mobileCard) {
                        mobileCard.style.display = 'block';
                        mobileCard.classList.add('show');
                    }
                }, 1000);
            } else {
                throw new Error(data.message || 'Invalid verification code');
            }
        } catch (error) {
            console.error('Error verifying email OTP:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading('verify-email-otp', false, '<i class="fas fa-check-circle"></i> Verify Code');
        }
    }

    async sendMobileOTP() {
        const mobile = document.getElementById('mobile-number').value.trim();

        if (!this.validateMobile(mobile)) {
            this.showNotification('Please enter a valid 10-digit mobile number', 'error');
            return;
        }

        // Enhanced token validation
        if (!this.currentToken) {
            this.showNotification('Authentication token missing. Please go back and verify your email again.', 'error');
            console.error('No token available for mobile OTP request');
            return;
        }

        console.log('Using token for mobile OTP:', this.currentToken);

        this.setButtonLoading('send-mobile-otp', true, 'Sending...');

        try {
            const response = await fetch(`${this.baseURL}/register/phone/otp/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentToken}`
                },
                body: JSON.stringify({
                    phone: mobile,
                    business_email: this.userData.business_email
                })
            });

            console.log('Mobile OTP request status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. The token may have expired.');
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Mobile OTP response:', data);

            if (data.access_token) {
                // Store the new token from mobile OTP response
                this.currentToken = data.access_token;
                console.log('New token stored from mobile OTP:', this.currentToken);
            }

            this.userData.phone = mobile;

            document.getElementById('mobile-display').textContent = this.maskMobile(mobile);
            this.showVerificationStep('mobile', 2);
            this.startTimer('mobile');
            this.showNotification('Verification code sent to your mobile', 'success');

        } catch (error) {
            console.error('Error sending mobile OTP:', error);

            if (error.message.includes('401') || error.message.includes('Authentication failed')) {
                this.showNotification('Session expired. Please verify your email again.', 'error');
                // Optionally reset to email step
                setTimeout(() => {
                    this.showVerificationStep('email', 1);
                }, 2000);
            } else {
                this.showNotification(error.message, 'error');
            }
        } finally {
            this.setButtonLoading('send-mobile-otp', false, '<i class="fas fa-paper-plane"></i> Send Verification Code');
        }
    }

    async verifyMobileOTP() {
        const otp = this.getEnteredOTP('mobile');

        if (otp.length !== 6) {
            this.showNotification('Please enter the complete verification code', 'error');
            return;
        }

        this.setButtonLoading('verify-mobile-otp', true, 'Verifying...');

        try {
            const response = await fetch(`${this.baseURL}/register/phone/verify/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentToken}`
                },
                body: JSON.stringify({
                    phone: this.userData.phone,
                    otp: otp
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentToken = data.access_token;
                this.showVerificationStep('mobile', 3);
                this.markStepCompleted('mobile');
                this.showNotification('Mobile number verified successfully!', 'success');

                // Auto-navigate to password setup after 1 second
                setTimeout(() => {
                    this.switchSection('password-setup');
                }, 1000);
            } else {
                throw new Error(data.message || 'Invalid verification code');
            }
        } catch (error) {
            console.error('Error verifying mobile OTP:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading('verify-mobile-otp', false, '<i class="fas fa-check-circle"></i> Verify Code');
        }
    }

    // VENDOR-DASHBOARD STYLE PASSWORD SAVE WITH TOKEN STORAGE
    async savePassword() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!this.validatePassword(password)) {
            this.showNotification('Please meet all password requirements', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        this.setButtonLoading('save-password', true, 'Saving...');

        try {
            const response = await fetch(`${this.baseURL}/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentToken}`
                },
                body: JSON.stringify({
                    business_email: this.userData.business_email,
                    phone: this.userData.phone,
                    password: password,
                    confirm_password: confirmPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store the JWT tokens for future use (VENDOR-DASHBOARD STYLE)
                localStorage.setItem('vendor_access_token', data.access);
                localStorage.setItem('vendor_refresh_token', data.refresh);
                this.currentToken = data.access; // Also update currentToken
                
                console.log('✅ Tokens stored after registration:', {
                    access: data.access ? 'Exists' : 'Missing',
                    refresh: data.refresh ? 'Exists' : 'Missing'
                });

                this.markStepCompleted('password');
                this.showNotification('Registration completed successfully!', 'success');

                // Auto-navigate to ID & Signature after 1 second
                setTimeout(() => {
                    this.switchSection('id-signature');
                }, 1000);
            } else {
                throw new Error(data.message || 'Failed to save password');
            }
        } catch (error) {
            console.error('Error saving password:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading('save-password', false, '<i class="fas fa-save"></i> Save Password');
        }
    }

    async saveIdSignature() {
        // Get category selection
        const categoryRadios = document.querySelectorAll('input[name="category-type"]');
        let categoryType = '';
        
        categoryRadios.forEach(radio => {
            if (radio.checked) {
                categoryType = radio.value;
            }
        });

        const gstin = document.getElementById('gstin').value.trim();

        // Validate required fields
        if (!categoryType) {
            this.showNotification('Please select category type', 'error');
            return;
        }

        if (!gstin) {
            this.showNotification('Please enter GSTIN', 'error');
            return;
        }

        if (!this.userData.signature) {
            this.showNotification('Please upload or create your signature', 'error');
            return;
        }

        if (!this.userData.gst_certificate) {
            this.showNotification('Please upload GST certificate', 'error');
            return;
        }

        this.setButtonLoading('save-id-signature', true, 'Saving...');

        try {
            const formData = new FormData();
            formData.append('gst', gstin);
            formData.append('signeture', this.userData.signature);
            formData.append('gst_img', this.userData.gst_certificate);

            const token = localStorage.getItem('vendor_access_token');
            console.log('Sending document upload request with token:', token);

            const response = await fetch(`${this.baseURL}/upload/document/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            // Handle response
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const textResponse = await response.text();
                console.error('Server returned HTML instead of JSON:', textResponse.substring(0, 500));
                throw new Error('Server error: Please check backend logs');
            }

            console.log('Backend response:', data);

            if (response.ok) {
                this.userData.category_type = categoryType;
                this.userData.gst = gstin;

                this.markStepCompleted('id-signature');
                this.showNotification('Documents uploaded successfully!', 'success');

                setTimeout(() => {
                    this.switchSection('store-pickup');
                }, 1000);
            } else {
                throw new Error(data.message || 'Failed to upload documents');
            }
        } catch (error) {
            console.error('Error saving ID & signature:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading('save-id-signature', false, '<i class="fas fa-save"></i> Save & Continue');
        }
    }

    async saveStorePickup() {
        const fullName = document.getElementById('full-name').value.trim();
        const sellerName = document.getElementById('display-name').value.trim();
        const addressLine1 = document.getElementById('address-line1').value.trim();
        const city = document.getElementById('city').value.trim();
        const state = document.getElementById('state').value;
        const pincode = document.getElementById('pincode').value.trim();

        if (!fullName || !sellerName || !addressLine1 || !city || !state || !pincode) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        this.setButtonLoading('save-store-pickup', true, 'Saving...');

        try {
            const token = localStorage.getItem('vendor_access_token');
            const response = await fetch(`${this.baseURL}/add/pickup-address/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    full_name: fullName,
                    seller_name: sellerName,
                    address_line_1: addressLine1,
                    address_line_2: document.getElementById('address-line2').value.trim(),
                    city: city,
                    state: state,
                    pincode: pincode
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.userData.full_name = fullName;
                this.userData.seller_name = sellerName;
                this.userData.address = {
                    address_line_1: addressLine1,
                    address_line_2: document.getElementById('address-line2').value.trim(),
                    city: city,
                    state: state,
                    pincode: pincode
                };

                this.markStepCompleted('store-pickup');
                this.showNotification('Address saved successfully!', 'success');

                // Auto-navigate to Product Listing after 1 second
                setTimeout(() => {
                    this.switchSection('listing-stock');
                }, 1000);
            } else {
                throw new Error(data.message || 'Failed to save address');
            }
        } catch (error) {
            console.error('Error saving store pickup:', error);
            this.showNotification(error.message, 'error');
        } finally {
            this.setButtonLoading('save-store-pickup', false, '<i class="fas fa-save"></i> Save & Continue');
        }
    }



    /// IMPROVED addProduct method with vendor-dashboard logic
async addProduct(e) {
    e.preventDefault();

    this.debugAuthStatus();

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
        
        console.log('📤 Sending product data:', productData);
        
        const response = await fetch(`${this.productBaseURL}/add-product/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(productData)
        });

        console.log('📥 Response status:', response.status);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Product added successfully:', result);
            
            // Store product IDs - use same logic as vendor-dashboard
            this.currentProductId = result.id || result.product_id;
            this.currentCategoryId = result.category_id || productData.category_id;
            
            console.log('📝 Stored Product ID:', this.currentProductId);
            console.log('📝 Stored Category ID:', this.currentCategoryId);
            
            this.showNotification('Product added successfully! Now add variants.', 'success');
            
            // Reset the product form
            form.reset();
            
            // Load products to update the UI - BUT don't wait for it
            this.loadProducts().catch(error => {
                console.warn('Products load failed but continuing:', error);
            });
            
            // IMMEDIATELY open variant modal (like vendor-dashboard)
            setTimeout(() => {
                this.showAddVariantModal();
            }, 300);
            
        } else if (response.status === 500) {
            const errorData = await response.json();
            if (errorData.details && errorData.details.includes('UNIQUE constraint failed')) {
                throw new Error('A product with this title already exists. Please use a different title.');
            } else {
                throw new Error(errorData.message || 'Server error occurred');
            }
        } else {
            const errorText = await response.text();
            console.error('❌ Server response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        this.showNotification(`Failed to add product: ${error.message}`, 'error');
    } finally {
        this.showLoading(false);
    }
}

    

    // ENHANCED: Show add variant modal with immediate opening
async showAddVariantModal() {
    if (!this.currentProductId) {
        this.showNotification('Please select a product first', 'error');
        return;
    }

    try {
        this.showLoading(true);
        
        console.log('🔄 Loading attributes for product:', this.currentProductId);
        
        // VENDOR-DASHBOARD STYLE: Find product in local cache first
        const product = this.products.find(p => p.id == this.currentProductId);
        
        let categoryId;
        
        if (product) {
            // Product found in cache - use its category
            categoryId = product.category_id || this.currentCategoryId;
            console.log('✅ Product found in cache, category ID:', categoryId);
        } else {
            // Product not in cache - use stored category ID (like vendor-dashboard)
            categoryId = this.currentCategoryId;
            console.log('⚠️ Product not in cache, using stored category ID:', categoryId);
            
            if (!categoryId) {
                throw new Error('Category information not available. Please try adding the product again.');
            }
        }

        if (!categoryId) {
            throw new Error('Category ID not found for this product');
        }

        // Load attributes for the category
        const response = await fetch(`${this.productBaseURL}/category/${categoryId}/attributes/`, {
            headers: this.getHeaders()
        });

        if (response.ok) {
            const attributesData = await response.json();
            this.currentProductAttributes = attributesData.attribute || [];
            console.log('📋 Loaded attributes:', this.currentProductAttributes);
            
            this.renderAttributeFields();
            
            // Update modal title
            const modalTitle = document.getElementById('variant-modal-title');
            if (modalTitle && product) {
                modalTitle.textContent = `Add Variant to: ${product.title}`;
            } else if (modalTitle) {
                modalTitle.textContent = `Add Variant to New Product`;
            }
            
            this.showModal('add-variant-modal');
        } else if (response.status === 404) {
            console.warn('⚠️ No attributes found for this category');
            this.currentProductAttributes = [];
            this.renderAttributeFields();
            this.showModal('add-variant-modal');
        } else {
            const errorText = await response.text();
            console.error('❌ Failed to load attributes:', errorText);
            throw new Error(`Failed to load attributes: HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading attributes:', error);
        this.showNotification(`Failed to load attributes: ${error.message}`, 'error');
    } finally {
        this.showLoading(false);
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

    clearImagePreviews() {
        console.log('🧹 Clearing image previews...');
        
        // Clear primary image preview
        const primaryPreview = document.getElementById('primary-image-preview');
        if (primaryPreview) {
            primaryPreview.innerHTML = '';
        }
        
        // Clear additional images preview
        const additionalPreview = document.getElementById('additional-images-preview');
        if (additionalPreview) {
            additionalPreview.innerHTML = '';
        }
        
        // Clear file inputs
        const primaryFileInput = document.getElementById('primary-image');
        const additionalFileInput = document.getElementById('additional-images');
        
        if (primaryFileInput) primaryFileInput.value = '';
        if (additionalFileInput) additionalFileInput.value = '';
        
        console.log('✅ Image previews cleared');
    }

     // ENHANCED: Add variant with automatic UI update
    async addVariant(e) {
        e.preventDefault();

        console.log('🔄 Starting addVariant process...');
        console.log('📝 Current Product ID:', this.currentProductId);
        
        if (!this.currentProductId) {
            this.showNotification('No product selected for variant', 'error');
            return;
        }

        const form = document.getElementById('add-variant-form');
        if (!form) {
            console.error('❌ Variant form not found');
            this.showNotification('Variant form not found', 'error');
            return;
        }

        const formData = new FormData(form);

        // Validate required fields
        const adjustedPrice = formData.get('adjusted_price');
        const stock = formData.get('stock');

        if (!adjustedPrice || !stock) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

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

        console.log('📋 Collected attributes:', attribute_and_value);

        // Get variant data
        const variantData = {
            adjusted_price: parseFloat(adjustedPrice),
            stock: parseInt(stock),
            attribute_and_value: attribute_and_value,
            is_active: true,
            product_id: this.currentProductId
        };

        console.log('📦 Variant data:', variantData);

        // Handle file uploads
        const formDataToSend = new FormData();
        formDataToSend.append('adjusted_price', variantData.adjusted_price);
        formDataToSend.append('stock', variantData.stock);
        formDataToSend.append('is_active', variantData.is_active);
        formDataToSend.append('product_id', variantData.product_id);
        formDataToSend.append('attribute_and_value', JSON.stringify(variantData.attribute_and_value));

        // Get image files
        const primaryImageFile = document.getElementById('primary-image').files[0];
        const additionalImageFiles = document.getElementById('additional-images').files;

        if (!primaryImageFile) {
            this.showNotification('Primary image is required', 'error');
            return;
        }

        // Append primary image
        formDataToSend.append('images', primaryImageFile);

        // Append additional images
        for (let i = 0; i < additionalImageFiles.length; i++) {
            formDataToSend.append('images', additionalImageFiles[i]);
        }

        try {
            this.showLoading(true);
            
            const token = localStorage.getItem('vendor_access_token') || this.currentToken;
            
            if (!token) {
                throw new Error('No authentication token available');
            }

            console.log('📤 Sending variant data for product:', this.currentProductId);
            
            const response = await fetch(`${this.productBaseURL}/add-variants/${this.currentProductId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend
            });

            console.log('📥 Variant response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Variant added successfully:', result);
                
                this.showNotification('Variant added successfully!', 'success');
                
                // Close modal and reset form
                this.closeModal('add-variant-modal');
                form.reset();
                
                // Clear image previews
                this.clearImagePreviews();
                
                // Reload products to update UI with new variant data and images
                await this.loadProducts();
                
            } else if (response.status === 403) {
                const errorText = await response.text();
                console.error('❌ 403 Forbidden for variant:', errorText);
                throw new Error('Permission denied for adding variant. Please complete vendor registration.');
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


// ENHANCED: Load products with vendor-specific filtering
async loadProducts() {
    try {
        console.log('🔄 Loading products...');
        this.showLoading(true);
        
        const token = localStorage.getItem('vendor_access_token');
        console.log('🔑 Token for products:', token ? 'Exists' : 'Missing');
        
        const response = await fetch(`${this.productBaseURL}/vendor/get/products/`, {
            headers: this.getHeaders()
        });

        console.log('📥 Products response status:', response.status);

        if (response.ok) {
            const productsData = await response.json();
            console.log('📦 Products loaded:', productsData);
            
            // Handle different response formats - same as vendor-dashboard
            if (Array.isArray(productsData)) {
                this.products = productsData;
            } else if (productsData.products && Array.isArray(productsData.products)) {
                this.products = productsData.products;
            } else if (productsData.results && Array.isArray(productsData.results)) {
                this.products = productsData.results;
            } else if (productsData.message === 'no active product found') {
                // Handle case where no active products exist yet
                console.log('ℹ️ No active products found - this is normal for new vendors');
                this.products = [];
            } else {
                console.warn('⚠️ Unexpected products response format:', productsData);
                this.products = [];
            }
            
            console.log(`✅ Loaded ${this.products.length} products`);
            this.updateProductsUI();
        } else if (response.status === 404 || response.status === 400) {
            const errorData = await response.json();
            if (errorData.message === 'no active product found') {
                console.log('ℹ️ No active products found - new vendor');
                this.products = [];
                this.updateProductsUI();
            } else {
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
        } else {
            console.error('❌ Failed to load products:', response.status);
            this.products = [];
            this.updateProductsUI();
            throw new Error(`Failed to load products: HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Error loading products:', error);
        this.products = [];
        this.updateProductsUI();
        
        // Don't show error for "no products" case
        if (!error.message.includes('no active product found')) {
            this.showNotification('Failed to load products. Please try again.', 'error');
        }
    } finally {
        this.showLoading(false);
    }
}


// ENHANCED: Update products UI to handle inactive products
updateProductsUI() {
    const addProductSection = document.getElementById('add-product-section');
    const productsContainer = document.getElementById('products-container');
    const completionStatus = document.getElementById('completion-status');
    
    if (!addProductSection || !productsContainer || !completionStatus) {
        console.error('❌ Required elements not found');
        return;
    }

    console.log('🔄 Updating products UI, count:', this.products.length);

    // Filter to show ALL products (including inactive) for the current vendor
    const vendorProducts = this.products.filter(product => {
        // In onboarding, we want to show all products the vendor just created
        // even if they're inactive (no variants yet)
        return true; // Show all products during onboarding
    });

    console.log('👤 Vendor products count:', vendorProducts.length);

    if (vendorProducts.length === 0) {
        addProductSection.style.display = 'block';
        productsContainer.style.display = 'none';
        completionStatus.style.display = 'none';
        
        // Show empty state
        productsContainer.innerHTML = this.getEmptyState('products', 'No Products Yet', 'Add your first product to get started');
    } else {
        addProductSection.style.display = 'block';
        productsContainer.style.display = 'grid';
        completionStatus.style.display = 'flex';
        
        this.renderProductsGrid(vendorProducts);
        this.updateCompletionStatus(vendorProducts);
    }
}

    
// ENHANCED: Render products grid showing inactive products too
renderProductsGrid(productsToRender = this.products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    if (productsToRender.length === 0) {
        container.innerHTML = this.getEmptyState('products', 'No Products Yet', 'Add your first product to get started');
        return;
    }

    container.innerHTML = productsToRender.map(product => {
        const primaryImage = this.getProductPrimaryImage(product);
        const variantsCount = product.variants_count || (product.variants ? product.variants.length : 0);
        const totalStock = this.calculateTotalStock(product);
        const hasVariants = variantsCount > 0;
        const isActive = product.status === 'active';

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${primaryImage ? 
                        `<img src="${primaryImage}" alt="${product.title}" class="product-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` :
                        ''
                    }
                    <div class="product-image-placeholder" style="${primaryImage ? 'display: none;' : ''}">
                        <i class="fas fa-box"></i>
                    </div>
                    ${hasVariants ? 
                        `<div class="variant-badge">${variantsCount} variant${variantsCount !== 1 ? 's' : ''}</div>` : 
                        `<div class="variant-badge no-variants">No variants</div>`
                    }
                    ${!isActive ? `<div class="status-badge inactive">Inactive</div>` : ''}
                </div>
                <div class="product-content">
                    <div class="product-header">
                        <h3 class="product-title">${this.escapeHtml(product.title || 'No Title')}</h3>
                        <div class="product-price">₹${(product.base_price || 0).toFixed(2)}</div>
                    </div>
                    <div class="product-category">${this.escapeHtml(product.category_name || 'Uncategorized')}</div>
                    <p class="product-description">${this.escapeHtml(product.description || 'No description available')}</p>
                    
                    <div class="product-meta">
                        <span class="meta-item">
                        variant${variantsCount !== 1 ? 's' : ''}: ${variantsCount}${","}
                        </span>
                    
                        <span class="meta-item">
                            
                            Stock: ${totalStock}
                        </span>
                        <span class="meta-item status ${isActive ? 'active' : 'inactive'}">
                            <i class="fas fa-circle"></i>
                            ${isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    
                    ${hasVariants ? this.renderVariantPreview(product) : this.renderNoVariantsMessage()}
                    
                    <div class="product-actions">
                        <button class="btn btn-primary add-variant-btn" data-product-id="${product.id}">
                            <i class="fas fa-plus"></i> Add Variant
                        </button>
                        ${hasVariants ? `
                            <button class="btn btn-outline view-variants" data-product-id="${product.id}">
                                <i class="fas fa-layer-group"></i> View Variants
                            </button>
                        ` : ''}
                        <button class="btn btn-danger delete-product" data-product-id="${product.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Bind action buttons
    this.bindProductActions();
}

// NEW: Render message when no variants exist
renderNoVariantsMessage() {
    return `
        <div class="no-variants-message">
            <i class="fas fa-exclamation-triangle"></i>
            <span>No variants added yet. Add at least one variant to make this product active.</span>
        </div>
    `;
}


    // ENHANCED: Get primary image from product variants with better fallbacks
getProductPrimaryImage(product) {
    if (!product) return null;

    // Check if product has direct image
    if (product.image) {
        return product.image;
    }

    // Check variants for images
    if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
            if (variant.images && variant.images.length > 0) {
                // Find primary image or first image
                const primaryImage = variant.images.find(img => img.is_primary) || variant.images[0];
                if (primaryImage && primaryImage.image) {
                    return primaryImage.image;
                }
            }
        }
    }

    // Check for image in product data
    if (product.images && product.images.length > 0) {
        const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
        return primaryImage.image || primaryImage;
    }

    return null;
}



    // NEW: Calculate total stock across all variants
    calculateTotalStock(product) {
        if (!product.variants || product.variants.length === 0) {
            return 0;
        }

        return product.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
    }

    // NEW: Render variant preview for product
    renderVariantPreview(product) {
        if (!product.variants || product.variants.length === 0) {
            return '';
        }

        // Show first 2 variants as preview
        const previewVariants = product.variants.slice(0, 2);
        
        return `
            <div class="variant-preview">
                <h4>Variants:</h4>
                ${previewVariants.map(variant => {
                    const variantName = variant.attributes && variant.attributes.length > 0
                        ? variant.attributes.map(attr => `${attr.value}`).join(' - ')
                        : 'Default Variant';
                    
                    return `
                        <div class="variant-preview-item">
                            <span class="variant-name">${this.escapeHtml(variantName)}</span>
                            <span class="variant-price">₹${parseFloat(variant.adjusted_price).toFixed(2)}</span>
                            <span class="variant-stock ${variant.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                                ${variant.stock} in stock
                            </span>
                        </div>
                    `;
                }).join('')}
                ${product.variants.length > 2 ? 
                    `<div class="more-variants">+${product.variants.length - 2} more variants</div>` : 
                    ''
                }
            </div>
        `;
    }


   // ENHANCED: Update completion status logic
updateCompletionStatus(products = this.products) {
    const productsCount = document.getElementById('products-count');
    const completeBtn = document.getElementById('complete-listing');
    
    if (productsCount) {
        productsCount.textContent = products.length;
    }
    
    if (completeBtn) {
        // Enable complete button only if we have at least 1 product WITH variants
        const hasProductsWithVariants = products.some(product => {
            const variantsCount = product.variants_count || (product.variants ? product.variants.length : 0);
            return variantsCount > 0;
        });
        
        completeBtn.disabled = !hasProductsWithVariants;
        
        if (hasProductsWithVariants) {
            completeBtn.innerHTML = '<i class="fas fa-check-circle"></i> Complete Product Setup';
            this.markStepCompleted('listing-stock');
        } else {
            completeBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Add Variants to Complete';
        }
    }
}

// NEW: Empty state method (like vendor-dashboard)
getEmptyState(type, title, message) {
    const icons = {
        products: 'fa-box-open',
        variants: 'fa-list',
        general: 'fa-inbox'
    };

    return `
        <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
            <i class="fas ${icons[type] || icons.general}" style="font-size: 4rem; margin-bottom: 20px; opacity: 0.5;"></i>
            <h3 style="margin-bottom: 12px; color: var(--text-secondary);">${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

// NEW: Render no variants message
renderNoVariantsMessage() {
    return `
        <div class="no-variants-message">
            <i class="fas fa-exclamation-triangle"></i>
            <span>No variants added yet. Add at least one variant to activate this product.</span>
        </div>
    `;
}


    // ENHANCED: Bind product actions including add variant
    bindProductActions() {
        // Edit buttons
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('button').dataset.productId;
                this.editProduct(productId);
            });
        });

        // Add Variant buttons
        document.querySelectorAll('.add-variant-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('button').dataset.productId;
                this.setCurrentProductForVariant(productId);
                this.showAddVariantModal();
            });
        });

        // Variants buttons
        document.querySelectorAll('.view-variants').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('button').dataset.productId;
                this.viewVariants(productId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('button').dataset.productId;
                this.deleteProduct(productId);
            });
        });
    }

    // NEW: Set current product for variant addition
    setCurrentProductForVariant(productId) {
        const product = this.products.find(p => p.id == productId);
        if (product) {
            this.currentProductId = productId;
            this.currentCategoryId = product.category_id;
            console.log('📝 Set current product for variant:', this.currentProductId);
        }
    }

    // NEW: Handle product deletion
    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.productBaseURL}/products/${productId}/`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.ok) {
                this.showNotification('Product deleted successfully!', 'success');
                await this.loadProducts(); // Reload the list
            } else {
                throw new Error(`Failed to delete product: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification(`Failed to delete product: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // NEW: Placeholder methods for product actions
    editProduct(productId) {
        console.log('Editing product:', productId);
        this.showNotification('Edit functionality coming soon!', 'info');
    }

    viewVariants(productId) {
        console.log('Viewing variants for product:', productId);
        this.showNotification('Variants view coming soon!', 'info');
    }

    // UPDATED: Switch section to load products when needed
    switchSection(sectionId) {
        console.log('🔄 Switching to section:', sectionId);
        
        try {
            // Update menu items
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.target === sectionId) {
                    item.classList.add('active');
                    console.log('✅ Activated menu item:', sectionId);
                }
            });

            // Update content sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                    console.log('✅ Activated content section:', sectionId);
                }
            });

            // Load products when switching to listing-stock section
            if (sectionId === 'listing-stock') {
                this.loadProducts();
            }

            this.currentStep = sectionId;
            this.saveProgress();
            
        } catch (error) {
            console.error('❌ Error switching section:', error);
        }
    }

    // UPDATED: completeListing method
    completeListing() {
        const productsCount = document.getElementById('products-count');
        const completeBtn = document.getElementById('complete-listing');
        
        if (productsCount && completeBtn) {
            const hasProductsWithVariants = this.products.some(product => 
                (product.variants_count && product.variants_count > 0) || 
                (product.variants && product.variants.length > 0)
            );
            
            if (hasProductsWithVariants) {
                completeBtn.disabled = false;
                this.markStepCompleted('listing-stock');
                this.showNotification('Product listing completed!', 'success');

                // Show completion options
                setTimeout(() => {
                    this.showContinueModal();
                }, 1000);
            } else {
                this.showNotification('Please add at least one variant to a product before completing', 'warning');
            }
        }
    }


    // UTILITY METHODS
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateMobile(mobile) {
        return /^\d{10}$/.test(mobile);
    }

    validatePassword(password) {
        const strongPassword = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#_\-])[A-Za-z\d@$!%*?&#_\-]{8,15}$/;
        return strongPassword.test(password);
    }

    maskEmail(email) {
        const [username, domain] = email.split('@');
        return `${username.substring(0, 2)}***@${domain}`;
    }

    maskMobile(mobile) {
        return `${mobile.substring(0, 4)}****${mobile.substring(8)}`;
    }

    getEnteredOTP(type) {
        const inputs = document.querySelectorAll(`.otp-digit[data-type="${type}"]`);
        return Array.from(inputs).map(input => input.value).join('');
    }

    updateVerifyButtonState(type) {
        const otp = this.getEnteredOTP(type);
        const verifyBtn = document.getElementById(`verify-${type}-otp`);
        if (verifyBtn) {
            verifyBtn.disabled = otp.length !== 6;
        }
    }

    showVerificationStep(type, step) {
        // Hide all steps for this type
        document.querySelectorAll(`.verification-step[id^="${type}-step-"]`).forEach(step => {
            step.classList.remove('active');
        });

        // Show target step
        const targetStep = document.getElementById(`${type}-step-${step}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }

        // Update status
        if (step === 3) {
            const statusElement = document.getElementById(`${type}-status`);
            if (statusElement) {
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i><span>Verified</span>';
                statusElement.className = 'verification-status verified';
            }
        }
    }

    startTimer(type) {
        let timeLeft = 30;
        const timerEl = document.getElementById(`${type}-timer`);
        const resendBtn = document.getElementById(`resend-${type}-otp`);

        if (!timerEl || !resendBtn) return;

        resendBtn.disabled = true;

        const timer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                resendBtn.disabled = false;
                resendBtn.innerHTML = `<i class="fas fa-redo"></i> Resend code`;
            }
        }, 1000);
    }

    markStepCompleted(step) {
        this.completedSteps.add(step);

        // Update UI
        this.markStepAsCompleted(step);

        // Save progress
        this.saveProgress();

        // Auto-navigate to next step
        setTimeout(() => {
            this.autoNavigateToNextStep(step);
        }, 1000);
    }

    autoNavigateToNextStep(currentStep) {
        const steps = ['mobile-email', 'password-setup', 'id-signature', 'store-pickup', 'listing-stock'];
        const currentIndex = steps.indexOf(currentStep);

        if (currentIndex < steps.length - 1) {
            const nextStep = steps[currentIndex + 1];
            if (!this.completedSteps.has(nextStep)) {
                this.switchSection(nextStep);
            }
        }
    }

    completeOnboarding() {
        console.log('🎉 Completing onboarding process...');
        
        // Mark all steps as completed
        const allSteps = ['mobile-email', 'password-setup', 'id-signature', 'store-pickup', 'listing-stock'];
        allSteps.forEach(step => this.markStepAsCompleted(step));

        this.showNotification('Onboarding completed successfully!', 'success');

        // Clear local storage for new users
        const authInfo = localStorage.getItem('vendor_auth_info');
        if (!authInfo) {
            console.log('🧹 Clearing progress for new user after completion');
            this.clearAllProgress();
        } else {
            console.log('💾 Keeping progress for returning user');
        }

        // Redirect to dashboard after a delay
        setTimeout(() => {
            console.log('📊 Redirecting to dashboard...');
            window.location.href = '../../html/vendor-dashboard.html';
        }, 2000);
    }

    updateProgress() {
        const totalSteps = 5;
        const completed = this.completedSteps.size;
        const progress = (completed / totalSteps) * 100;

        const progressFill = document.querySelector('.progress-fill');
        const progressPercent = document.querySelector('.progress-percent');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
    }

    saveProgress() {
        // Only save progress if user is authenticated (returning vendor)
        const authInfo = localStorage.getItem('vendor_auth_info');
        if (!authInfo) {
            return; // Don't save progress for new users until they complete onboarding
        }

        const progress = {
            completedSteps: Array.from(this.completedSteps),
            userData: this.userData,
            currentStep: this.currentStep,
            isReturningUser: this.isReturningUser
        };
        localStorage.setItem('vendor_onboarding_progress', JSON.stringify(progress));
    }

    loadProgress() {
        const authInfo = localStorage.getItem('vendor_auth_info');
        if (!authInfo) {
            this.clearAllProgress();
            return;
        }

        const saved = localStorage.getItem('vendor_onboarding_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            if (progress.isReturningUser) {
                this.completedSteps = new Set(progress.completedSteps);
                this.userData = { ...this.userData, ...progress.userData };
                this.currentStep = progress.currentStep || 'mobile-email';
                this.isReturningUser = true;

                // Restore UI state
                this.completedSteps.forEach(step => this.markStepAsCompleted(step));
                this.switchSection(this.currentStep);
            }
        }
    }

    clearAllProgress() {
        localStorage.removeItem('vendor_onboarding_progress');
        localStorage.removeItem('vendor_onboarding_token');
        this.completedSteps.clear();
        this.currentToken = null;
    }

    saveToken(token) {
        this.currentToken = token;
        localStorage.setItem('vendor_onboarding_token', token);
        console.log('💾 Token saved:', token);
    }

    loadToken() {
        const savedToken = localStorage.getItem('vendor_onboarding_token');
        if (savedToken) {
            this.currentToken = savedToken;
            console.log('📥 Token loaded from storage:', this.currentToken);
        }
    }

    clearToken() {
        this.currentToken = null;
        localStorage.removeItem('vendor_onboarding_token');
        console.log('🧹 Token cleared');
    }

    showContinueModal() {
        // Update progress in modal
        const steps = ['mobile-email', 'password-setup', 'id-signature', 'store-pickup', 'listing-stock'];
        steps.forEach((step, index) => {
            const stepElement = document.getElementById(`continue-step-${index + 1}`);
            if (stepElement && this.completedSteps.has(step)) {
                stepElement.innerHTML = '<i class="fas fa-check"></i><span>' + stepElement.textContent + '</span>';
                stepElement.className = 'progress-step completed';
            }
        });

        this.showModal('continue-later-modal');
    }

    continueLater() {
        this.saveProgress();
        window.location.href = './SignIn/SignIn.html';
    }

    // File handling methods
    handleSignatureUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (this.validateFile(file, ['png', 'jpg', 'jpeg', 'pdf'], 5)) {
                this.userData.signature = file;
                const uploadStatus = document.getElementById('upload-status');
                if (uploadStatus) {
                    uploadStatus.innerHTML = '<i class="fas fa-check-circle"></i> Signature uploaded successfully';
                    uploadStatus.className = 'upload-status success';
                }
            } else {
                this.showNotification('Please upload a valid signature file (PNG, JPG, PDF, max 5MB)', 'error');
            }
        }
    }

    handleGSTCertificateUpload(e) {
        const file = e.target.files[0];
        if (file) {
            if (this.validateFile(file, ['png', 'jpg', 'jpeg', 'pdf'], 5)) {
                this.userData.gst_certificate = file;
                const gstStatus = document.getElementById('gst-certificate-status');
                if (gstStatus) {
                    gstStatus.innerHTML = '<i class="fas fa-check-circle"></i> GST certificate uploaded successfully';
                    gstStatus.className = 'upload-status success';
                }
            } else {
                this.showNotification('Please upload a valid GST certificate (PNG, JPG, PDF, max 5MB)', 'error');
            }
        }
    }

    validateFile(file, allowedTypes, maxSizeMB) {
        const extension = file.name.split('.').pop().toLowerCase();
        const sizeInMB = file.size / (1024 * 1024);

        return allowedTypes.includes(extension) && sizeInMB <= maxSizeMB;
    }

    // Password strength methods
    checkPasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthBar = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');

        if (!password || !strengthBar || !strengthText) return;

        let strength = 0;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&#_\-]/.test(password)
        };

        // Update requirement indicators
        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(`req-${req}`);
            if (element) {
                if (requirements[req]) {
                    element.classList.add('valid');
                    strength++;
                } else {
                    element.classList.remove('valid');
                }
            }
        });

        // Update strength bar and text
        const percentage = (strength / 5) * 100;
        strengthBar.style.width = `${percentage}%`;

        if (strength <= 2) {
            strengthBar.style.background = 'var(--error)';
            strengthText.textContent = 'Weak';
            strengthText.style.color = 'var(--error)';
        } else if (strength <= 4) {
            strengthBar.style.background = 'var(--warning)';
            strengthText.textContent = 'Medium';
            strengthText.style.color = 'var(--warning)';
        } else {
            strengthBar.style.background = 'var(--success)';
            strengthText.textContent = 'Strong';
            strengthText.style.color = 'var(--success)';
        }
    }

    checkPasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const matchElement = document.getElementById('password-match');

        if (!matchElement) return;

        if (confirmPassword && password === confirmPassword) {
            matchElement.style.display = 'flex';
        } else {
            matchElement.style.display = 'none';
        }
    }

    togglePasswordVisibility(field) {
        const input = document.getElementById(field);
        const toggleBtn = document.getElementById(`toggle-${field}`);
        
        if (!input || !toggleBtn) return;
        
        const icon = toggleBtn.querySelector('i');

        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    // UI Helper Methods
    setButtonLoading(buttonId, isLoading, text = '') {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        if (isLoading) {
            button.classList.add('btn-loading');
            button.disabled = true;
            if (text) {
                button.innerHTML = text;
            }
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
            if (text) {
                button.innerHTML = text;
            }
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

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Placeholder methods for additional functionality
    changeEmail() {
        this.showVerificationStep('email', 1);
        const emailStatus = document.getElementById('email-status');
        if (emailStatus) {
            emailStatus.innerHTML = '<i class="fas fa-clock"></i><span>Pending</span>';
            emailStatus.className = 'verification-status pending';
        }
    }

    changeMobile() {
        this.showVerificationStep('mobile', 1);
        const mobileStatus = document.getElementById('mobile-status');
        if (mobileStatus) {
            mobileStatus.innerHTML = '<i class="fas fa-clock"></i><span>Pending</span>';
            mobileStatus.className = 'verification-status pending';
        }
    }

    resendEmailOTP() {
        this.sendEmailOTP();
    }

    resendMobileOTP() {
        this.sendMobileOTP();
    }

    verifyGSTIN() {
        const gstin = document.getElementById('gstin').value.trim().toUpperCase();
        const resultElement = document.getElementById('gstin-result');
        
        if (!gstin) {
            this.showNotification('Please enter GSTIN', 'error');
            return;
        }

        // Enhanced GSTIN validation
        const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        
        if (gstPattern.test(gstin)) {
            if (resultElement) {
                resultElement.innerHTML = '<i class="fas fa-check-circle"></i> Valid GSTIN format';
                resultElement.className = 'verification-result success';
            }
            
            // Store GSTIN in user data
            this.userData.gst = gstin;
            
            // Enable save button or show next action
            const saveButton = document.getElementById('save-id-signature');
            if (saveButton) saveButton.disabled = false;
        } else {
            if (resultElement) {
                resultElement.innerHTML = '<i class="fas fa-times-circle"></i> Invalid GSTIN format. Format: 07AABCU9603R1ZM';
                resultElement.className = 'verification-result error';
            }
            const saveButton = document.getElementById('save-id-signature');
            if (saveButton) saveButton.disabled = true;
        }
    }
}

// Initialize onboarding when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    window.onboarding = new VendorOnboarding();
    console.log('🎯 Vendor Onboarding System Initialized');
});