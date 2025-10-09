// Complete Onboarding System
class OnboardingSystem {
    constructor() {
        this.verificationStatus = {
            'mobile-email': false,
            'id-signature': false,
            'store-pickup': false,
            'listing-stock': false
        };
        
        this.mobileOTP = null;
        this.emailOTP = null;
        this.mobileTimer = null;
        this.emailTimer = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupNavigation();
        this.setupSignatureCanvas();
        this.setupFileUpload();
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

        // Listing & Stock
        document.getElementById('complete-listing-stock').addEventListener('click', (e) => {
            e.preventDefault();
            this.completeListingStock();
        });

        document.getElementById('create-listing').addEventListener('click', () => {
            this.setupListing();
        });

        document.getElementById('add-stock').addEventListener('click', () => {
            this.setupStock();
        });

        // Display name check
        document.getElementById('display-name').addEventListener('input', (e) => {
            this.checkDisplayName(e.target.value);
        });

        // Modal events
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
    }

    setupNavigation() {
        // Initial navigation setup
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

    completeListingStock() {
        this.verificationStatus['listing-stock'] = true;
        this.updateStepStatus('listing-stock', true);
        this.showNotification('Listing & Stock setup completed!', 'success');
    }

    setupListing() {
        const listingCard = document.querySelector('#listing-stock .status-card:nth-child(1)');
        const button = document.getElementById('create-listing');
        
        this.setButtonLoading(button, true, 'Creating...');
        
        setTimeout(() => {
            listingCard.classList.remove('pending');
            listingCard.classList.add('completed');
            listingCard.querySelector('.status-content p').textContent = 'Listing template created';
            this.setButtonLoading(button, false, 'Listing Created');
            button.disabled = true;
            this.showNotification('Product listing template created!', 'success');
        }, 2000);
    }

    setupStock() {
        const stockCard = document.querySelector('#listing-stock .status-card:nth-child(2)');
        const button = document.getElementById('add-stock');
        
        this.setButtonLoading(button, true, 'Setting up...');
        
        setTimeout(() => {
            stockCard.classList.remove('pending');
            stockCard.classList.add('completed');
            stockCard.querySelector('.status-content p').textContent = 'Stock management ready';
            this.setButtonLoading(button, false, 'Stock Added');
            button.disabled = true;
            this.showNotification('Stock management system ready!', 'success');
        }, 2000);
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
            
            document.getElementById('clear-signature').addEventListener('click', function() {
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
        
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
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
            'listing-stock': 'Listing & Stock Setup'
        };
        return names[step] || step;
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    goToDashboard() {
        this.showNotification('Redirecting to seller dashboard...', 'success');
        setTimeout(() => {
            alert('🎉 Onboarding complete! Redirecting to seller dashboard...');
        }, 1500);
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
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    new OnboardingSystem();
    console.log('Onboarding System Initialized');
});