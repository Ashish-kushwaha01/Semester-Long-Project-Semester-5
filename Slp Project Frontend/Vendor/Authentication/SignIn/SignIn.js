class SellerSignIn {
    constructor() {
        this.baseURL = 'http://localhost:8000/api/vendor';
        this.currentVendorData = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkExistingSession();
        this.setupModalScrolling();
    }

    bindEvents() {
        // Form submission
        document.getElementById('signin-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignIn();
        });

        // Password toggle
        document.getElementById('toggle-password').addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Modal controls
        document.getElementById('close-continue-onboarding').addEventListener('click', () => {
            this.closeModal('continue-onboarding-modal');
        });
        document.getElementById('cancel-onboarding').addEventListener('click', () => {
            this.closeModal('continue-onboarding-modal');
            this.redirectToDashboard();
        });
        document.getElementById('continue-onboarding').addEventListener('click', () => {
            this.redirectToOnboarding();
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    checkExistingSession() {
        const accessToken = localStorage.getItem('vendor_access_token');
        const vendorInfo = localStorage.getItem('vendor_info');
        
        if (accessToken && vendorInfo) {
            try {
                const vendor = JSON.parse(vendorInfo);
                if (vendor.is_onboarding_complete) {
                    window.location.href = '../../html/vendor-dashboard.html';
                }
            } catch (error) {
                console.error('Error parsing vendor info:', error);
                this.clearSession();
            }
        }
    }

    async handleSignIn() {
        const businessEmail = document.getElementById('business_email').value.trim();
        const password = document.getElementById('password').value;
        const signinBtn = document.getElementById('signin-btn');

        if (!businessEmail || !password) {
            this.showNotification('Please enter both email and password', 'error');
            return;
        }

        this.setButtonLoading(signinBtn, true, 'Signing in...');
        this.showLoading(true);

        try {
            const response = await fetch(`${this.baseURL}/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    business_email: businessEmail,
                    password: password
                })
            });

            const result = await response.json();

            if (response.ok) {
                // Store tokens and vendor info
                localStorage.setItem('vendor_access_token', result.access);
                localStorage.setItem('vendor_refresh_token', result.refresh);
                localStorage.setItem('vendor_info', JSON.stringify(result.vendor));
                
                // Store auth info for onboarding
                const authInfo = {
                    is_authenticated: true,
                    vendor_id: result.vendor.id,
                    business_email: result.vendor.business_email,
                    access_token: result.access
                };
                localStorage.setItem('vendor_auth_info', JSON.stringify(authInfo));
                
                this.showNotification('Sign in successful!', 'success');
                
                // Check onboarding status AFTER successful login
                await this.checkOnboardingStatusAfterLogin(result.vendor);
                
            } else {
                throw new Error(result.message || result.detail || result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed: ' + error.message, 'error');
        } finally {
            this.setButtonLoading(signinBtn, false, '<i class="fas fa-sign-in-alt"></i> Sign In');
            this.showLoading(false);
        }
    }

    async checkOnboardingStatusAfterLogin(vendorData) {
        try {
            const token = localStorage.getItem('vendor_access_token');
            
            if (vendorData.is_onboarding_complete) {
                setTimeout(() => {
                    window.location.href = '../../html/vendor-dashboard.html';
                }, 1000);
            } else {
                const response = await fetch(`${this.baseURL}/onboarding/state/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                    console
                if (response.ok) {
                    const onboardingData = await response.json();
                    this.showIncompleteSteps(onboardingData, vendorData);
                } else {
                    this.redirectToSignUpWithProgress(vendorData);
                }
            }
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            this.redirectToSignUpWithProgress(vendorData);
        }
    }

    showIncompleteSteps(onboardingData, vendorData) {
        const incompleteSteps = [];

        if (!onboardingData.is_registered) {
            incompleteSteps.push({
                step: 'mobile-email',
                title: 'Email & Mobile Verification',
                description: 'Verify your email and mobile number'
            });
        }

        if (!onboardingData.is_document_uploaded) {
            incompleteSteps.push({
                step: 'id-signature',
                title: 'ID & Signature Verification',
                description: 'Upload your documents and signature'
            });
        }

        if (!onboardingData.is_pickup_address_uploaded) {
            incompleteSteps.push({
                step: 'store-pickup',
                title: 'Store & Pickup Details',
                description: 'Set up your store information and pickup location'
            });
        }

        if (!onboardingData.is_initial_listing) {
            incompleteSteps.push({
                step: 'listing-stock',
                title: 'Product Listing & Stock',
                description: 'Add your products (1-5 required)'
            });
        }

        if (incompleteSteps.length > 0) {
            this.renderIncompleteSteps(incompleteSteps, vendorData);
            this.showModal('continue-onboarding-modal');
            
            // Auto-scroll to modal after a short delay
            setTimeout(() => {
                document.getElementById('continue-onboarding-modal').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 500);
        } else {
            this.redirectToDashboard();
        }
    }

    renderIncompleteSteps(steps, vendorData) {
        const container = document.getElementById('incomplete-steps-list');
        
        if (steps.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <i class="fas fa-check-circle" style="font-size: 48px; color: var(--success); margin-bottom: 15px;"></i>
                    <p>All onboarding steps are completed! You're ready to start selling.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = steps.map((step, index) => `
            <div class="incomplete-step" data-step="${step.step}">
                <i class="fas fa-exclamation-circle"></i>
                <div class="step-info">
                    <h4>${index + 1}. ${step.title}</h4>
                    <p>${step.description}</p>
                </div>
            </div>
        `).join('');

        // Store vendor data for redirection
        this.currentVendorData = vendorData;

        // Add click handlers to navigate directly to specific steps
        container.querySelectorAll('.incomplete-step').forEach(step => {
            step.addEventListener('click', () => {
                const stepId = step.dataset.step;
                this.redirectToSpecificStep(stepId);
            });
        });
        
        // Auto-scroll to top of modal content
        setTimeout(() => {
            container.scrollTop = 0;
        }, 100);
    }

    setupModalScrolling() {
        const modal = document.getElementById('continue-onboarding-modal');
        const modalBody = modal.querySelector('.modal-body');
        
        // Prevent body scrolling when modal is open
        modal.addEventListener('show', () => {
            document.body.style.overflow = 'hidden';
        });
        
        modal.addEventListener('hide', () => {
            document.body.style.overflow = 'auto';
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                this.closeModal('continue-onboarding-modal');
            }
        });
    }

    redirectToSignUpWithProgress(vendorData) {
        console.log('🔄 Redirecting to onboarding with existing progress...');
        
        const authInfo = {
            is_authenticated: true,
            vendor_id: vendorData.id,
            business_email: vendorData.business_email,
            access_token: localStorage.getItem('vendor_access_token')
        };
        
        localStorage.setItem('vendor_auth_info', JSON.stringify(authInfo));
        
        // Redirect to SignUp page
        window.location.href = '../SignUp.html';
    }

    redirectToOnboarding() {
        if (this.currentVendorData) {
            this.redirectToSignUpWithProgress(this.currentVendorData);
        } else {
            localStorage.removeItem('vendor_onboarding_progress');
            window.location.href = '../SignUp.html';
        }
    }

    redirectToSpecificStep(stepId) {
        if (!this.currentVendorData) return;

        const progress = {
            currentStep: stepId,
            userData: {},
            completedSteps: this.getCompletedStepsBefore(stepId),
            vendorData: this.currentVendorData
        };
        localStorage.setItem('vendor_onboarding_progress', JSON.stringify(progress));
        this.redirectToSignUpWithProgress(this.currentVendorData);
    }

    redirectToDashboard() {
        console.log('📊 Redirecting to dashboard...');
        window.location.href = '../../html/vendor-dashboard.html';
    }

    getCompletedStepsBefore(stepId) {
        const steps = ['mobile-email', 'password-setup', 'id-signature', 'store-pickup', 'listing-stock'];
        const stepIndex = steps.indexOf(stepId);
        return steps.slice(0, stepIndex);
    }

    clearSession() {
        localStorage.removeItem('vendor_access_token');
        localStorage.removeItem('vendor_refresh_token');
        localStorage.removeItem('vendor_info');
        localStorage.removeItem('vendor_auth_info');
        localStorage.removeItem('vendor_onboarding_progress');
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('toggle-password');
        const icon = toggleBtn.querySelector('i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    // UI Helper Methods
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

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            if (show) {
                overlay.classList.add('show');
            } else {
                overlay.classList.remove('show');
            }
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.transition = 'opacity 0.3s ease';
            }, 10);
            
            modal.dispatchEvent(new Event('show'));
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
            
            modal.dispatchEvent(new Event('hide'));
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: white;
            padding: 20px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.4s ease;
            max-width: 350px;
        `;

        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" 
                   style="color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 4000);
    }
}

// Initialize the sign in system
document.addEventListener('DOMContentLoaded', function () {
    window.sellerSignIn = new SellerSignIn();
    console.log('Seller Sign In System Initialized - No auto-redirect on page load');
});