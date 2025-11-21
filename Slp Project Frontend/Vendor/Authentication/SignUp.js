// Complete Onboarding System with Product Management
class OnboardingSystem {
    constructor() {
    this.verificationStatus = {
        'mobile-email': false,
        'password-setup': false,  // Now second
        'id-signature': false,     // Now third
        'store-pickup': false,     // Now fourth
        'listing-stock': false     // Now fifth
    };
    
    this.mobileOTP = null;
    this.emailOTP = null;
    this.mobileTimer = null;
    this.emailTimer = null;
    this.products = [];
    this.currentProductId = null;
    this.currentEditProductId = null; // Add this line
    this.currentProductAttributes = [];
    this.currentVariants = [];
    
    this.init();
}

    init() {
        this.bindEvents();
        this.setupNavigation();
        this.setupSignatureCanvas();
        this.setupFileUpload();
        this.setupPasswordValidation();
        this.updateProductsCount();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const targetId = item.getAttribute('data-target');
                this.navigateToSection(targetId, item);
            });
        });

        // Complete onboarding button
        document.getElementById('complete-onboarding').addEventListener('click', () => {
            this.handleCompleteOnboarding();
        });

        // Mobile OTP
        document.getElementById('send-mobile-otp').addEventListener('click', () => this.sendMobileOTP());
        document.getElementById('verify-mobile-otp').addEventListener('click', () => this.verifyMobileOTP());
        document.getElementById('resend-mobile-otp').addEventListener('click', () => this.resendMobileOTP());
        document.getElementById('change-mobile-number').addEventListener('click', () => this.changeMobileNumber());
        document.getElementById('mobile-edit').addEventListener('click', () => this.editMobileNumber());

        // Email OTP
        document.getElementById('send-email-otp').addEventListener('click', () => this.sendEmailOTP());
        document.getElementById('verify-email-otp').addEventListener('click', () => this.verifyEmailOTP());
        document.getElementById('resend-email-otp').addEventListener('click', () => this.resendEmailOTP());
        document.getElementById('change-email-address').addEventListener('click', () => this.changeEmailAddress());
        document.getElementById('email-edit').addEventListener('click', () => this.editEmailAddress());

        // ID & Signature
        document.getElementById('save-id-signature').addEventListener('click', (e) => {
            e.preventDefault();
            this.completeIdSignature();
        });

        document.getElementById('verify-gstin').addEventListener('click', () => {
            this.verifyGSTIN();
        });

        // Store & Pickup
        document.getElementById('save-store-pickup').addEventListener('click', (e) => {
            e.preventDefault();
            this.completeStorePickup();
        });

        // Password Setup
        document.getElementById('save-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.savePassword();
        });

        // Product Management
        document.getElementById('add-product-form').addEventListener('submit', (e) => this.addProduct(e));
        document.getElementById('complete-listing').addEventListener('click', () => this.completeListingStock());
        document.getElementById('add-variant-form').addEventListener('submit', (e) => this.addVariant(e));
        document.getElementById('finish-variants').addEventListener('click', () => this.finishVariants());


        // Product Edit Modal events
        document.getElementById('edit-product-form').addEventListener('submit', (e) => this.handleEditProduct(e));
        document.getElementById('cancel-edit-product').addEventListener('click', () => {
            this.closeModal('edit-product-modal');
        });

        // Display name check
        document.getElementById('display-name').addEventListener('input', (e) => {
            this.checkDisplayName(e.target.value);
        });

        // Modal events
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.closeAllModals());
        });

        document.getElementById('close-completion-modal').addEventListener('click', () => {
            this.closeModal('completion-modal');
        });

        document.getElementById('close-incomplete-modal').addEventListener('click', () => {
            this.closeModal('incomplete-modal');
        });

        document.getElementById('continue-verification').addEventListener('click', () => {
            this.closeModal('incomplete-modal');
        });

        document.getElementById('go-to-dashboard').addEventListener('click', () => {
            this.goToDashboard();
        });

        // OTP input handling
        this.setupOTPInputs('mobile');
        this.setupOTPInputs('email');

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    setupNavigation() {
        console.log('Navigation setup complete');
    }

    navigateToSection(sectionId, menuItem) {
        // Remove active class from all menu items
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));

        // Add active class to clicked item
        menuItem.classList.add('active');

        // Hide all content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Mobile OTP Methods
    async sendMobileOTP() {
        const mobileInput = document.getElementById('mobile-number');
        const mobileNumber = mobileInput.value.trim();

        if (!this.validateMobileNumber(mobileNumber)) {
            this.showError(mobileInput, 'Please enter a valid 10-digit mobile number starting with 6-9');
            return;
        }

        const sendBtn = document.getElementById('send-mobile-otp');
        this.setButtonLoading(sendBtn, true, 'Sending...');

        try {
            await this.simulateAPICall(1200);

            this.mobileOTP = this.generateOTP();
            console.log(`Mobile OTP for ${mobileNumber}: ${this.mobileOTP}`);

            this.showStep('mobile', 2);
            this.updateMobileDisplay(mobileNumber);
            this.startTimer('mobile');
            this.clearError(mobileInput);

            setTimeout(() => {
                const firstOtpInput = document.querySelector('#mobile-step-2 .otp-digit[data-index="0"]');
                firstOtpInput?.focus();
            }, 300);

            this.showNotification('Verification code sent to your mobile number', 'success');
        } catch (error) {
            this.showError(mobileInput, 'Failed to send verification code. Please try again.');
        } finally {
            this.setButtonLoading(sendBtn, false, '<i class="fas fa-paper-plane"></i> Send Verification Code');
        }
    }

    async verifyMobileOTP() {
        const enteredOTP = this.getEnteredOTP('mobile');
        const verifyBtn = document.getElementById('verify-mobile-otp');

        if (enteredOTP.length !== 6) {
            this.showError(verifyBtn, 'Please enter the complete 6-digit code');
            return;
        }

        this.setButtonLoading(verifyBtn, true, 'Verifying...');
        this.updateStatus('mobile', 'verifying');

        try {
            await this.simulateAPICall(1500);

            if (enteredOTP === this.mobileOTP) {
                this.showStep('mobile', 3);
                this.updateStatus('mobile', 'verified');
                this.checkMobileEmailCompletion();
                this.showNotification('Mobile number verified successfully!', 'success');
            } else {
                throw new Error('Invalid OTP');
            }
        } catch (error) {
            this.showError(verifyBtn, 'Invalid verification code. Please try again.');
            this.clearOTPInputs('mobile');
            this.updateStatus('mobile', 'pending');
        } finally {
            this.setButtonLoading(verifyBtn, false, '<i class="fas fa-check-circle"></i> Verify Code');
        }
    }

    // Email OTP Methods
    async sendEmailOTP() {
        const emailInput = document.getElementById('email-address');
        const email = emailInput.value.trim();

        if (!this.validateEmail(email)) {
            this.showError(emailInput, 'Please enter a valid email address');
            return;
        }

        const sendBtn = document.getElementById('send-email-otp');
        this.setButtonLoading(sendBtn, true, 'Sending...');

        try {
            await this.simulateAPICall(1200);

            this.emailOTP = this.generateOTP();
            console.log(`Email OTP for ${email}: ${this.emailOTP}`);

            this.showStep('email', 2);
            this.updateEmailDisplay(email);
            this.startTimer('email');
            this.clearError(emailInput);

            setTimeout(() => {
                const firstOtpInput = document.querySelector('#email-step-2 .otp-digit[data-index="0"]');
                firstOtpInput?.focus();
            }, 300);

            this.showNotification('Verification code sent to your email address', 'success');
        } catch (error) {
            this.showError(emailInput, 'Failed to send verification code. Please try again.');
        } finally {
            this.setButtonLoading(sendBtn, false, '<i class="fas fa-paper-plane"></i> Send Verification Code');
        }
    }

    async verifyEmailOTP() {
        const enteredOTP = this.getEnteredOTP('email');
        const verifyBtn = document.getElementById('verify-email-otp');

        if (enteredOTP.length !== 6) {
            this.showError(verifyBtn, 'Please enter the complete 6-digit code');
            return;
        }

        this.setButtonLoading(verifyBtn, true, 'Verifying...');
        this.updateStatus('email', 'verifying');

        try {
            await this.simulateAPICall(1500);

            if (enteredOTP === this.emailOTP) {
                this.showStep('email', 3);
                this.updateStatus('email', 'verified');
                this.checkMobileEmailCompletion();
                this.showNotification('Email address verified successfully!', 'success');
            } else {
                throw new Error('Invalid OTP');
            }
        } catch (error) {
            this.showError(verifyBtn, 'Invalid verification code. Please try again.');
            this.clearOTPInputs('email');
            this.updateStatus('email', 'pending');
        } finally {
            this.setButtonLoading(verifyBtn, false, '<i class="fas fa-check-circle"></i> Verify Code');
        }
    }

    checkMobileEmailCompletion() {
        const mobileVerified = document.getElementById('mobile-status').classList.contains('verified');
        const emailVerified = document.getElementById('email-status').classList.contains('verified');

        if (mobileVerified && emailVerified) {
            this.verificationStatus['mobile-email'] = true;
            this.updateStepStatus('mobile-email', true);
        }
    }

    // Other verification methods
    completeIdSignature() {
        const gstin = document.getElementById('gstin').value.trim();
        const categorySelected = document.querySelector('input[name="category"]:checked');
        const signatureProvided = this.hasSignature();

        let isValid = true;

        if (!gstin) {
            this.showError(document.getElementById('gstin'), 'Please enter GSTIN number');
            isValid = false;
        }

        if (!categorySelected) {
            this.showNotification('Please select a product category', 'error');
            isValid = false;
        }

        if (!signatureProvided) {
            this.showNotification('Please provide your signature', 'error');
            isValid = false;
        }

        if (!isValid) return;

        this.setButtonLoading(document.getElementById('save-id-signature'), true, 'Saving...');

        setTimeout(() => {
            this.verificationStatus['id-signature'] = true;
            this.updateStepStatus('id-signature', true);
            this.setButtonLoading(document.getElementById('save-id-signature'), false, '<i class="fas fa-save"></i> Save & Mark Complete');
            this.showNotification('ID & Signature verification completed!', 'success');
        }, 1500);
    }

    completeStorePickup() {
        const requiredFields = [
            'full-name', 'display-name', 'address-line1', 'city', 'state', 'pincode'
        ];

        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                this.showError(field, `Please fill in ${field.previousElementSibling?.textContent || 'this field'}`);
                isValid = false;
            }
        });

        if (!isValid) return;

        this.setButtonLoading(document.getElementById('save-store-pickup'), true, 'Saving...');

        setTimeout(() => {
            this.verificationStatus['store-pickup'] = true;
            this.updateStepStatus('store-pickup', true);
            this.setButtonLoading(document.getElementById('save-store-pickup'), false, '<i class="fas fa-save"></i> Save & Mark Complete');
            this.showNotification('Store & Pickup details saved!', 'success');
        }, 1500);
    }

    setupPasswordValidation() {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const togglePasswordBtn = document.getElementById('toggle-password');
        const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');

        // Toggle password visibility
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });

        toggleConfirmPasswordBtn.addEventListener('click', () => {
            const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
            confirmPasswordInput.type = type;
            toggleConfirmPasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });

        // Password strength validation
        passwordInput.addEventListener('input', (e) => {
            this.validatePasswordStrength(e.target.value);
            this.checkPasswordMatch();
        });

        confirmPasswordInput.addEventListener('input', () => {
            this.checkPasswordMatch();
        });
    }

    validatePasswordStrength(password) {
        const strengthBar = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');
        const requirements = {
            length: document.getElementById('req-length'),
            uppercase: document.getElementById('req-uppercase'),
            lowercase: document.getElementById('req-lowercase'),
            number: document.getElementById('req-number'),
            special: document.getElementById('req-special')
        };

        let strength = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        // Update requirement indicators
        Object.keys(checks).forEach(key => {
            if (checks[key]) {
                requirements[key].classList.add('valid');
                strength += 20;
            } else {
                requirements[key].classList.remove('valid');
            }
        });

        // Update strength bar and text
        strengthBar.style.width = `${strength}%`;

        if (strength < 40) {
            strengthBar.style.background = '#ef4444';
            strengthText.textContent = 'Weak';
            strengthText.style.color = '#ef4444';
        } else if (strength < 80) {
            strengthBar.style.background = '#f59e0b';
            strengthText.textContent = 'Medium';
            strengthText.style.color = '#f59e0b';
        } else {
            strengthBar.style.background = '#10b981';
            strengthText.textContent = 'Strong';
            strengthText.style.color = '#10b981';
        }
    }

    checkPasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const matchIndicator = document.getElementById('password-match');

        if (confirmPassword === '') {
            matchIndicator.style.display = 'none';
            return;
        }

        if (password === confirmPassword && password !== '') {
            matchIndicator.style.display = 'flex';
        } else {
            matchIndicator.style.display = 'none';
        }
    }

    savePassword() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!password || !confirmPassword) {
            this.showNotification('Please fill in both password fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        // Check password strength
        const strength = this.calculatePasswordStrength(password);
        if (strength < 60) {
            this.showNotification('Please choose a stronger password', 'error');
            return;
        }

        this.setButtonLoading(document.getElementById('save-password'), true, 'Saving...');

        setTimeout(() => {
            this.verificationStatus['password-setup'] = true;
            this.updateStepStatus('password-setup', true);
            this.setButtonLoading(document.getElementById('save-password'), false, '<i class="fas fa-save"></i> Save Password');
            this.showNotification('Password saved successfully!', 'success');
        }, 1500);
    }

    calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength += 20;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;
        return strength;
    }

    // Product Management Methods
    addProduct(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const productData = {
            id: Date.now(), // Temporary ID
            title: formData.get('title'),
            description: formData.get('description'),
            base_price: parseFloat(formData.get('base_price')),
            category: formData.get('category'),
            variants: []
        };

        if (!productData.title || !productData.description || !productData.base_price || !productData.category) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        // Check if we've reached the maximum number of products
        if (this.products.length >= 5) {
            this.showNotification('Maximum 5 products allowed for onboarding', 'error');
            return;
        }

        this.products.push(productData);
        this.renderProducts();
        this.updateProductsCount();

        // Show variants modal
        this.currentProductId = productData.id;
        this.showVariantsModal(productData);

        // Reset form
        form.reset();

        this.showNotification('Product added successfully! Now add variants.', 'success');
    }

    showVariantsModal(product) {
        document.getElementById('variant-product-title').textContent = product.title;

        // Load existing variants from the product, not reset to empty array
        this.currentVariants = product.variants || [];
        this.currentProductId = product.id;

        this.renderVariantAttributes(product.category);
        this.renderVariantsList();
        this.setupVariantFileUpload();
        this.showModal('variants-modal');

        console.log('Opening variants modal for product:', product.id);
        console.log('Current variants:', this.currentVariants);
    }

    renderVariantAttributes(category) {
        const container = document.getElementById('variant-attributes-container');

        // Simulate different attributes based on category
        const attributes = this.getAttributesForCategory(category);

        container.innerHTML = attributes.map(attr => `
            <div class="attribute-field">
                <label class="form-label">${attr.name} ${attr.required ? '<span class="required">*</span>' : ''}</label>
                ${this.renderAttributeInput(attr)}
            </div>
        `).join('');
    }

    getAttributesForCategory(category) {
        const attributeTemplates = {
            electronics: [
                { name: 'Color', type: 'select', required: true, options: ['Black', 'White', 'Silver', 'Blue', 'Red'] },
                { name: 'Storage', type: 'select', required: true, options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
                { name: 'Model', type: 'text', required: false }
            ],
            clothing: [
                { name: 'Size', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
                { name: 'Color', type: 'select', required: true, options: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow'] },
                { name: 'Material', type: 'text', required: false }
            ],
            home: [
                { name: 'Color', type: 'select', required: true, options: ['White', 'Black', 'Silver', 'Wood', 'Gray'] },
                { name: 'Size', type: 'select', required: true, options: ['Small', 'Medium', 'Large', 'Extra Large'] },
                { name: 'Material', type: 'text', required: false }
            ],
            books: [
                { name: 'Format', type: 'select', required: true, options: ['Paperback', 'Hardcover', 'E-book'] },
                { name: 'Language', type: 'select', required: true, options: ['English', 'Hindi', 'Spanish', 'French'] }
            ],
            sports: [
                { name: 'Size', type: 'select', required: true, options: ['Small', 'Medium', 'Large', 'One Size'] },
                { name: 'Color', type: 'select', required: true, options: ['Black', 'Blue', 'Red', 'Green', 'Multi-color'] },
                { name: 'Material', type: 'text', required: false }
            ]
        };

        return attributeTemplates[category] || attributeTemplates.electronics;
    }

    renderAttributeInput(attribute) {
        if (attribute.type === 'select') {
            return `
                <select name="attr_${attribute.name.toLowerCase()}" class="form-select" ${attribute.required ? 'required' : ''}>
                    <option value="">Select ${attribute.name}</option>
                    ${attribute.options.map(option =>
                `<option value="${option}">${option}</option>`
            ).join('')}
                </select>
            `;
        } else {
            return `<input type="text" name="attr_${attribute.name.toLowerCase()}" class="form-input" ${attribute.required ? 'required' : ''} placeholder="Enter ${attribute.name}">`;
        }
    }

    setupVariantFileUpload() {
        const uploadArea = document.getElementById('variant-images-upload-area');
        const fileInput = document.getElementById('variant-images');
        const previewContainer = document.getElementById('variant-images-preview');

        uploadArea.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            this.previewVariantImages(e.target.files);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
            uploadArea.style.background = 'rgba(37, 99, 235, 0.05)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border)';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border)';
            uploadArea.style.background = '';
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                this.previewVariantImages(fileInput.files);
            }
        });
    }

    previewVariantImages(files) {
        const previewContainer = document.getElementById('variant-images-preview');
        previewContainer.innerHTML = '';

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

    addVariant(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        // Collect attribute values
        const attributes = {};
        const attributeInputs = form.querySelectorAll('[name^="attr_"]');
        attributeInputs.forEach(input => {
            if (input.value) {
                const attrName = input.name.replace('attr_', '');
                attributes[attrName] = input.value;
            }
        });

        if (Object.keys(attributes).length === 0) {
            this.showNotification('Please fill at least one attribute', 'error');
            return;
        }

        const variantData = {
            id: Date.now(),
            adjusted_price: parseFloat(formData.get('adjusted_price')) || 0,
            stock: parseInt(formData.get('stock')) || 0,
            attributes: attributes,
            images: this.getVariantImages()
        };

        this.currentVariants.push(variantData);
        this.renderVariantsList();

        // Reset form
        form.reset();
        document.getElementById('variant-images-preview').innerHTML = '';
        document.getElementById('variant-images').value = '';

        this.showNotification('Variant added successfully!', 'success');
    }

    getVariantImages() {
        const fileInput = document.getElementById('variant-images');
        const images = [];

        if (fileInput.files.length > 0) {
            Array.from(fileInput.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        images.push(e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        return images;
    }

    renderVariantsList() {
        const container = document.getElementById('variants-list-container');

        if (this.currentVariants.length === 0) {
            container.innerHTML = `
            <div class="empty-variants">
                <i class="fas fa-box-open"></i>
                <h4>No Variants Added</h4>
                <p>Add your first variant to get started</p>
            </div>
        `;
            return;
        }

        container.innerHTML = `
        <div class="variants-section-header">
            <h4 class="variants-count">Added Variants (${this.currentVariants.length})</h4>
            <button class="add-variant-btn" onclick="document.getElementById('add-variant-form').scrollIntoView({ behavior: 'smooth' })">
                <i class="fas fa-plus"></i>
                Add Another Variant
            </button>
        </div>
        <div class="variants-grid">
            ${this.currentVariants.map(variant => `
                <div class="variant-card">
                    <div class="variant-header">
                        <h5 class="variant-title">${Object.values(variant.attributes).join(' - ')}</h5>
                        <div class="variant-price">₹${variant.adjusted_price}</div>
                    </div>
                    
                    <div>
                        <span class="variant-stock">${variant.stock} IN STOCK</span>
                        <span class="variant-status">INACTIVE</span>
                    </div>
                    
                    <div class="variant-attributes">
                        ${Object.entries(variant.attributes).map(([key, value]) => `
                            <div class="attribute-item">
                                <span class="attribute-label">${key}:</span>
                                <span class="attribute-value">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="variant-actions">
                        <button class="btn-danger" onclick="onboarding.removeVariant(${variant.id})">
                            <i class="fas fa-trash"></i>
                            Remove
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    }

    removeVariant(variantId) {
        this.currentVariants = this.currentVariants.filter(v => v.id !== variantId);
        this.renderVariantsList();
        this.showNotification('Variant removed', 'success');
    }

    finishVariants() {
        if (this.currentVariants.length === 0) {
            this.showNotification('Please add at least one variant', 'error');
            return;
        }

        // Update the product with variants
        const productIndex = this.products.findIndex(p => p.id === this.currentProductId);
        if (productIndex !== -1) {
            this.products[productIndex].variants = [...this.currentVariants]; // Create a new array reference
        }

        this.renderProducts();
        this.saveToLocalStorage();
        this.closeModal('variants-modal');
        this.showNotification('Variants added successfully!', 'success');
    }

    renderProducts() {
        const container = document.getElementById('products-container');

        if (this.products.length === 0) {
            container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No Products Added</h3>
                <p>Add your first product to get started</p>
            </div>
        `;
            return;
        }

        container.innerHTML = this.products.map(product => {
            const variantCount = product.variants ? product.variants.length : 0;
            const totalStock = product.variants ? product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0) : 0;
            const primaryImage = product.variants && product.variants.length > 0 && product.variants[0].images.length > 0
                ? product.variants[0].images[0]
                : null;

            return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${primaryImage ?
                    `<img src="${primaryImage}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
                    `<i class="fas fa-box-open"></i>`
                }
                </div>
                <div class="product-content">
                    <div class="product-header">
                        <div>
                            <h3 class="product-title">${this.escapeHtml(product.title)}</h3>
                            <div class="product-price">₹${parseFloat(product.base_price).toFixed(2)}</div>
                        </div>
                        <span class="product-category">${product.category}</span>
                    </div>
                    <p class="product-description">${this.escapeHtml(product.description)}</p>
                    
                    <div class="product-variants">
                        <div class="variants-count">${variantCount} variant${variantCount !== 1 ? 's' : ''} • ${totalStock} in stock</div>
                        ${variantCount > 0 ? `
                            <div class="variants-list">
                                ${product.variants.slice(0, 3).map(variant =>
                    `<span class="variant-tag">${Object.values(variant.attributes).join('/')}</span>`
                ).join('')}
                                ${variantCount > 3 ? `<span class="variant-tag">+${variantCount - 3} more</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-secondary" onclick="onboarding.editProduct(${product.id})">
        <i class="fas fa-edit"></i> Edit
    </button>
    <button class="btn btn-primary" onclick="onboarding.showVariantsModal(onboarding.products.find(p => p.id === ${product.id}))">
        <i class="fas fa-list"></i> Variants
    </button>
    <button class="btn btn-danger" onclick="onboarding.deleteProduct(${product.id})">
        <i class="fas fa-trash"></i> Delete
    </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    // Replace the editProduct method with this:
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.currentEditProductId = productId;
            this.showEditProductModal(product);
        }
    }

    // Add this new method to show the edit modal
    showEditProductModal(product) {
        // Populate form with product data
        document.getElementById('edit-product-title').value = product.title;
        document.getElementById('edit-product-price').value = product.base_price;
        document.getElementById('edit-product-description').value = product.description;
        document.getElementById('edit-product-category').value = product.category;

        this.showModal('edit-product-modal');
    }

    // Add this method to handle the edit form submission
    handleEditProduct(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const productData = {
            title: formData.get('title'),
            description: formData.get('description'),
            base_price: parseFloat(formData.get('base_price')),
            category: formData.get('category')
        };

        if (!productData.title || !productData.description || !productData.base_price || !productData.category) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }

        // Find and update the product
        const productIndex = this.products.findIndex(p => p.id === this.currentEditProductId);
        if (productIndex !== -1) {
            // Keep the existing ID and variants, only update the other fields
            this.products[productIndex] = {
                ...this.products[productIndex], // Keep existing data (id, variants, etc.)
                ...productData // Update with new data
            };
        }

        this.renderProducts();
        this.updateProductsCount();
        this.saveToLocalStorage();
        this.closeModal('edit-product-modal');
        this.showNotification('Product updated successfully!', 'success');
    }

    deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        this.products = this.products.filter(p => p.id !== productId);
        this.renderProducts();
        this.updateProductsCount();
        this.showNotification('Product deleted successfully', 'success');
    }

    updateProductsCount() {
        const count = this.products.length;
        const countElement = document.getElementById('products-count');
        const completeButton = document.getElementById('complete-listing');

        if (countElement) {
            countElement.textContent = count;
        }

        if (completeButton) {
            completeButton.disabled = count < 1;
        }

        // Update completion status
        if (count >= 1) {
            this.verificationStatus['listing-stock'] = true;
            this.updateStepStatus('listing-stock', true);
        } else {
            this.verificationStatus['listing-stock'] = false;
            this.updateStepStatus('listing-stock', false);
        }
    }

    completeListingStock() {
        if (this.products.length < 1) {
            this.showNotification('Please add at least 1 product', 'error');
            return;
        }

        this.verificationStatus['listing-stock'] = true;
        this.updateStepStatus('listing-stock', true);
        this.showNotification('Product listing completed!', 'success');
    }

    // Helper Methods
    validateMobileNumber(number) {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(number);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    showStep(type, step) {
        for (let i = 1; i <= 3; i++) {
            const stepEl = document.getElementById(`${type}-step-${i}`);
            if (stepEl) stepEl.classList.remove('active');
        }

        const targetStep = document.getElementById(`${type}-step-${step}`);
        if (targetStep) targetStep.classList.add('active');
    }

    updateStatus(type, status) {
        const statusEl = document.getElementById(`${type}-status`);
        if (statusEl) {
            statusEl.className = `verification-status ${status}`;
            const icon = status === 'verified' ? 'fa-check-circle' : 'fa-clock';
            const text = status === 'verified' ? 'Verified' : 'Pending';
            statusEl.innerHTML = `<i class="fas ${icon}"></i><span>${text}</span>`;
        }
    }

    updateStepStatus(step, completed) {
        const statusIndicator = document.getElementById(`${step}-status`);
        const menuItem = document.querySelector(`.menu-item[data-target="${step}"]`);

        if (statusIndicator && menuItem) {
            if (completed) {
                statusIndicator.classList.remove('pending');
                statusIndicator.classList.add('completed');
                statusIndicator.innerHTML = '<i class="fas fa-check"></i>';
                menuItem.classList.add('completed');
            } else {
                statusIndicator.classList.remove('completed');
                statusIndicator.classList.add('pending');
                statusIndicator.innerHTML = '<i class="fas fa-clock"></i>';
                menuItem.classList.remove('completed');
            }
        }

        this.updateProgress();
    }

    updateMobileDisplay(mobile) {
        const maskedMobile = `+91 ${mobile.substring(0, 3)}•••${mobile.substring(6)}`;
        document.getElementById('mobile-display').textContent = maskedMobile;
        document.getElementById('verified-mobile').textContent = `+91 ${mobile}`;
    }

    updateEmailDisplay(email) {
        const [username, domain] = email.split('@');
        const maskedEmail = `${username.substring(0, 2)}•••@${domain}`;
        document.getElementById('email-display').textContent = maskedEmail;
        document.getElementById('verified-email').textContent = email;
    }

    startTimer(type) {
        let timeLeft = 30;
        const timerEl = document.getElementById(`${type}-timer`);
        const resendBtn = document.getElementById(`resend-${type}-otp`);

        if (this[`${type}Timer`]) {
            clearInterval(this[`${type}Timer`]);
        }

        resendBtn.disabled = true;

        this[`${type}Timer`] = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(this[`${type}Timer`]);
                resendBtn.disabled = false;
                resendBtn.innerHTML = '<i class="fas fa-redo"></i> Resend code';
            }
        }, 1000);
    }

    resendMobileOTP() {
        this.sendMobileOTP();
    }

    resendEmailOTP() {
        this.sendEmailOTP();
    }

    changeMobileNumber() {
        this.showStep('mobile', 1);
        this.clearOTPInputs('mobile');
        this.updateStatus('mobile', 'pending');
    }

    changeEmailAddress() {
        this.showStep('email', 1);
        this.clearOTPInputs('email');
        this.updateStatus('email', 'pending');
    }

    editMobileNumber() {
        this.changeMobileNumber();
    }

    editEmailAddress() {
        this.changeEmailAddress();
    }

    setupOTPInputs(type) {
        const inputs = document.querySelectorAll(`#${type}-step-2 .otp-digit`);

        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;

                if (value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }

                this.updateVerifyButtonState(type);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
        });
    }

    getEnteredOTP(type) {
        const inputs = document.querySelectorAll(`#${type}-step-2 .otp-digit`);
        return Array.from(inputs).map(input => input.value).join('');
    }

    clearOTPInputs(type) {
        const inputs = document.querySelectorAll(`#${type}-step-2 .otp-digit`);
        inputs.forEach(input => {
            input.value = '';
        });
        this.updateVerifyButtonState(type);
    }

    updateVerifyButtonState(type) {
        const verifyBtn = document.getElementById(`verify-${type}-otp`);
        const otp = this.getEnteredOTP(type);
        verifyBtn.disabled = otp.length !== 6;
    }

    verifyGSTIN() {
        const gstinInput = document.getElementById('gstin');
        const gstin = gstinInput.value.trim();
        const resultElement = document.getElementById('gstin-result');

        if (!gstin) {
            this.showError(gstinInput, 'Please enter GSTIN number');
            return;
        }

        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

        this.setButtonLoading(document.getElementById('verify-gstin'), true, 'Verifying...');

        setTimeout(() => {
            this.setButtonLoading(document.getElementById('verify-gstin'), false, '<i class="fas fa-check"></i> Verify');

            if (gstinRegex.test(gstin)) {
                gstinInput.style.borderColor = 'var(--success)';
                resultElement.innerHTML = '<i class="fas fa-check-circle"></i> GSTIN verified successfully';
                resultElement.className = 'verification-result success';
                this.showNotification('GSTIN verified successfully!', 'success');
            } else {
                gstinInput.style.borderColor = 'var(--error)';
                resultElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid GSTIN format';
                resultElement.className = 'verification-result error';
                this.showNotification('Invalid GSTIN format', 'error');
            }
        }, 1000);
    }

    checkDisplayName(name) {
        const statusElement = document.getElementById('display-name-status');

        if (name.length < 3) {
            statusElement.style.display = 'none';
            return;
        }

        setTimeout(() => {
            const isAvailable = name.length >= 3;
            if (isAvailable) {
                statusElement.style.display = 'flex';
                statusElement.style.color = 'var(--success)';
            }
        }, 500);
    }

    hasSignature() {
        const uploadArea = document.getElementById('signature-upload');
        const canvas = document.getElementById('signatureCanvas');

        const fileInput = uploadArea.querySelector('input[type="file"]');
        if (fileInput.files.length > 0) return true;

        if (canvas) {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            return !imageData.data.every(channel => channel === 0);
        }

        return false;
    }

    setupSignatureCanvas() {
        const canvas = document.getElementById('signatureCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;

            function resizeCanvas() {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;

                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }

            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            function startDrawing(e) {
                isDrawing = true;
                [lastX, lastY] = getCoordinates(e);
            }

            function draw(e) {
                if (!isDrawing) return;

                const [x, y] = getCoordinates(e);

                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();

                [lastX, lastY] = [x, y];
            }

            function stopDrawing() {
                isDrawing = false;
            }

            function getCoordinates(e) {
                let x, y;
                if (e.type.includes('touch')) {
                    x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
                    y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
                } else {
                    x = e.offsetX;
                    y = e.offsetY;
                }
                return [x, y];
            }

            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);

            document.getElementById('clear-signature').addEventListener('click', function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });

            document.getElementById('save-signature').addEventListener('click', () => {
                const statusElement = document.getElementById('signature-status');
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Signature saved successfully';
                statusElement.className = 'signature-status success';
                this.showNotification('Signature saved successfully!', 'success');
            });
        }
    }

    setupFileUpload() {
        const uploadArea = document.getElementById('signature-upload');
        const fileInput = uploadArea.querySelector('input[type="file"]');
        const statusElement = document.getElementById('upload-status');

        uploadArea.addEventListener('click', function () {
            fileInput.click();
        });

        fileInput.addEventListener('change', function () {
            if (this.files.length > 0) {
                const file = this.files[0];
                const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
                const maxSize = 5 * 1024 * 1024;

                if (!validTypes.includes(file.type)) {
                    statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please upload PNG, JPG, or PDF file';
                    statusElement.className = 'upload-status error';
                    return;
                }

                if (file.size > maxSize) {
                    statusElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> File size must be less than 5MB';
                    statusElement.className = 'upload-status error';
                    return;
                }

                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> File uploaded successfully';
                statusElement.className = 'upload-status success';
                this.showNotification('Signature file uploaded successfully!', 'success');
            }
        }.bind(this));
    }

    updateProgress() {
        const completedCount = Object.values(this.verificationStatus).filter(status => status).length;
        const totalCount = Object.keys(this.verificationStatus).length;
        const progressPercent = Math.round((completedCount / totalCount) * 100);

        const progressFill = document.querySelector('.progress-fill');
        const progressPercentEl = document.querySelector('.progress-percent');

        if (progressFill) {
            progressFill.style.width = progressPercent + '%';
        }
        if (progressPercentEl) {
            progressPercentEl.textContent = progressPercent + '%';
        }
    }

    handleCompleteOnboarding() {
        const allCompleted = Object.values(this.verificationStatus).every(status => status);

        if (allCompleted) {
            this.showCompletionModal();
        } else {
            this.showIncompleteModal();
        }
    }

    showCompletionModal() {
        this.showModal('completion-modal');
    }

    showIncompleteModal() {
        const incompleteStepsList = document.getElementById('incomplete-steps-list');
        incompleteStepsList.innerHTML = '';

        Object.keys(this.verificationStatus).forEach(step => {
            if (!this.verificationStatus[step]) {
                const stepName = this.getStepDisplayName(step);
                const listItem = document.createElement('div');
                listItem.className = 'incomplete-step';
                listItem.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${stepName}</span>
                `;
                listItem.addEventListener('click', () => {
                    const menuItem = document.querySelector(`.menu-item[data-target="${step}"]`);
                    this.navigateToSection(step, menuItem);
                    this.closeModal('incomplete-modal');
                });
                incompleteStepsList.appendChild(listItem);
            }
        });

        this.showModal('incomplete-modal');
    }

    getStepDisplayName(step) {
        const names = {
            'mobile-email': 'Mobile & Email Verification',
            'id-signature': 'ID & Signature Verification',
            'store-pickup': 'Store & Pickup Details',
            'password-setup': 'Password Setup',
            'listing-stock': 'Product Listing & Stock'
        };
        return names[step] || step;
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
    this.currentEditProductId = null; // Reset the edit ID when closing modals
}

    goToDashboard() {
        this.showNotification('Redirecting to seller dashboard...', 'success');

        // Collect all data
        const onboardingData = {
            mobile: document.getElementById('mobile-number').value,
            email: document.getElementById('email-address').value,
            gstin: document.getElementById('gstin').value,
            fullName: document.getElementById('full-name').value,
            displayName: document.getElementById('display-name').value,
            address: {
                line1: document.getElementById('address-line1').value,
                line2: document.getElementById('address-line2').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                pincode: document.getElementById('pincode').value
            },
            password: document.getElementById('password').value,
            products: this.products
        };

        console.log('Onboarding completed with data:', onboardingData);

        setTimeout(() => {
            alert('🎉 Onboarding complete! You can now login with your email and password.');
            // In a real application, you would redirect to the dashboard
            // window.location.href = 'vendor-dashboard.html';
        }, 2000);
    }

    // Utility Methods
    setButtonLoading(button, isLoading, text = '') {
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

    showNotification(message, type = 'success') {
        const notification = document.getElementById(`${type}-notification`);
        const messageEl = notification.querySelector('.notification-text');

        if (messageEl) {
            messageEl.textContent = message;
        }

        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    showError(element, message) {
        this.clearError(element);

        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        element.parentNode.appendChild(errorEl);
    }

    clearError(element) {
        const errorEl = element.parentNode.querySelector('.error-message');
        if (errorEl) {
            errorEl.remove();
        }
    }

    async simulateAPICall(duration) {
        return new Promise((resolve) => {
            setTimeout(resolve, duration);
        });
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    window.onboarding = new OnboardingSystem();
    console.log('Onboarding System Initialized');
});