class SellerSignIn {
    constructor() {
        this.emailOTP = null;
        this.mobileOTP = null;
        this.emailTimer = null;
        this.mobileTimer = null;
        this.userData = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupOTPInputs();
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

        // Back to credentials
        document.getElementById('back-to-credentials').addEventListener('click', () => {
            this.showStep('credentials');
        });

        // OTP verification
        document.getElementById('verify-otp').addEventListener('click', () => {
            this.verifyOTP();
        });

        // Resend OTP
        document.getElementById('resend-email-otp').addEventListener('click', () => {
            this.resendEmailOTP();
        });

        document.getElementById('resend-mobile-otp').addEventListener('click', () => {
            this.resendMobileOTP();
        });

        // Go to dashboard
        document.getElementById('go-to-dashboard').addEventListener('click', () => {
            this.goToDashboard();
        });
    }

    // async handleSignIn() {
    //     const loginId = document.getElementById('login-id').value.trim();
    //     const password = document.getElementById('password').value;
    //     const signinBtn = document.getElementById('signin-btn');

    //     if (!loginId || !password) {
    //         this.showNotification('Please enter both login ID and password', 'error');
    //         return;
    //     }

    //     this.setButtonLoading(signinBtn, true, 'Signing in...');

    //     try {
    //         // Simulate API call for authentication
    //         await this.simulateAPICall(1500);
            
    //         // Mock user data based on login ID
    //         this.userData = this.getMockUserData(loginId);
            
    //         if (this.userData) {
    //             // Send OTP to email and mobile
    //             await this.sendOTPVerification();
    //             this.showStep('otp');
    //         } else {
    //             throw new Error('Invalid credentials');
    //         }
    //     } catch (error) {
    //         this.showNotification('Invalid login credentials. Please try again.', 'error');
    //     } finally {
    //         this.setButtonLoading(signinBtn, false, '<i class="fas fa-sign-in-alt"></i> Sign In');
    //     }
    // }


    async handleSignIn() {
    const loginId = document.getElementById('login-id').value.trim();
    const password = document.getElementById('password').value;
    const signinBtn = document.getElementById('signin-btn');

    if (!loginId || !password) {
        this.showNotification('Please enter both login ID and password', 'error');
        return;
    }

    this.setButtonLoading(signinBtn, true, 'Signing in...');

    try {
        // API call for authentication - USING YOUR FORMAT
        const data = {
            email: loginId, // or use loginId directly if it can be email/mobile/username
            password: password
        };

        const response = await fetch("http://127.0.0.1:8000/api/vendors/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            this.userData = {
                name: result.first_name || result.name,
                email: result.email,
                mobile: result.mobile, // make sure your API returns mobile
                business: result.seller_name || result.business,
                userId: result.id || result.user_id,
                token: result.token // if your API returns token
            };
            
            // Send OTP to email and mobile
            await this.sendOTPVerification();
            this.showStep('otp');
        } else {
            throw new Error(result.detail || result.error || JSON.stringify(result));
        }
    } catch (error) {
        this.showNotification('Login failed: ' + error.message, 'error');
    } finally {
        this.setButtonLoading(signinBtn, false, '<i class="fas fa-sign-in-alt"></i> Sign In');
    }
}

    // getMockUserData(loginId) {
    //     // Mock user data for demonstration
    //     const users = {
    //         'seller@figkart.com': {
    //             name: 'Ashish Kumar',
    //             email: 'seller@figkart.com',
    //             mobile: '+918726112768',
    //             business: 'Ashish Electronics'
    //         },
    //         '9876543210': {
    //             name: 'Ashish Kumar',
    //             email: 'seller@figkart.com',
    //             mobile: '+919876543210',
    //             business: 'Ashish Electronics'
    //         },
    //         'ashish_seller': {
    //             name: 'Ashish Kumar',
    //             email: 'seller@figkart.com',
    //             mobile: '+918726112768',
    //             business: 'Ashish Electronics'
    //         }
    //     };

    //     return users[loginId] || null;
    // }


    

    // async sendOTPVerification() {
    //     if (!this.userData) return;

    //     // Show loading
    //     this.showLoading(true);

    //     try {
    //         // Simulate OTP sending
    //         await this.simulateAPICall(1000);
            
    //         // Generate OTPs
    //         this.emailOTP = this.generateOTP();
    //         this.mobileOTP = this.generateOTP();
            
    //         console.log(`Email OTP for ${this.userData.email}: ${this.emailOTP}`);
    //         console.log(`Mobile OTP for ${this.userData.mobile}: ${this.mobileOTP}`);
            
    //         // Update OTP targets
    //         document.getElementById('email-otp-target').textContent = this.maskEmail(this.userData.email);
    //         document.getElementById('mobile-otp-target').textContent = this.maskMobile(this.userData.mobile);
            
    //         // Start timers
    //         this.startTimer('email');
    //         this.startTimer('mobile');
            
    //         this.showNotification('Verification codes sent to your email and mobile', 'success');
    //     } catch (error) {
    //         this.showNotification('Failed to send verification codes. Please try again.', 'error');
    //     } finally {
    //         this.showLoading(false);
    //     }
    // }




    async sendOTPVerification() {
    if (!this.userData) return;

    this.showLoading(true);

    try {
        // API call to send OTP - USING YOUR FORMAT
        const data = {
            email: this.userData.email,
            mobile: this.userData.mobile,
            user_id: this.userData.userId
        };

        const response = await fetch("http://127.0.0.1:8000/api/vendors/send-otp/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                // Add authorization if needed: "Authorization": `Bearer ${this.userData.token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // If your API returns OTPs for verification (optional)
            this.emailOTP = result.email_otp; 
            this.mobileOTP = result.mobile_otp;
            
            // Update OTP targets
            document.getElementById('email-otp-target').textContent = this.maskEmail(this.userData.email);
            document.getElementById('mobile-otp-target').textContent = this.maskMobile(this.userData.mobile);
            
            // Start timers
            this.startTimer('email');
            this.startTimer('mobile');
            
            this.showNotification('Verification codes sent to your email and mobile', 'success');
        } else {
            throw new Error(result.detail || result.error || JSON.stringify(result));
        }
    } catch (error) {
        this.showNotification('Failed to send OTP: ' + error.message, 'error');
    } finally {
        this.showLoading(false);
    }
}

    // async verifyOTP() {
    //     const emailOTP = this.getEnteredOTP('email');
    //     const mobileOTP = this.getEnteredOTP('mobile');
    //     const verifyBtn = document.getElementById('verify-otp');

    //     if (emailOTP.length !== 6 || mobileOTP.length !== 6) {
    //         this.showNotification('Please enter complete verification codes', 'error');
    //         return;
    //     }

    //     this.setButtonLoading(verifyBtn, true, 'Verifying...');

    //     try {
    //         await this.simulateAPICall(1500);
            
    //         if (emailOTP === this.emailOTP && mobileOTP === this.mobileOTP) {
    //             // Update success details
    //             document.getElementById('success-user').textContent = this.userData.name;
    //             document.getElementById('success-time').textContent = new Date().toLocaleString();
                
    //             this.showStep('success');
    //             this.showNotification('Sign in successful!', 'success');
    //         } else {
    //             throw new Error('Invalid OTP');
    //         }
    //     } catch (error) {
    //         this.showNotification('Invalid verification codes. Please try again.', 'error');
    //     } finally {
    //         this.setButtonLoading(verifyBtn, false, '<i class="fas fa-check-circle"></i> Verify & Continue');
    //     }
    // }




    async verifyOTP() {
    const emailOTP = this.getEnteredOTP('email');
    const mobileOTP = this.getEnteredOTP('mobile');
    const verifyBtn = document.getElementById('verify-otp');

    if (emailOTP.length !== 6 || mobileOTP.length !== 6) {
        this.showNotification('Please enter complete verification codes', 'error');
        return;
    }

    this.setButtonLoading(verifyBtn, true, 'Verifying...');

    try {
        // API call to verify OTP - USING YOUR FORMAT
        const data = {
            email_otp: emailOTP,
            mobile_otp: mobileOTP,
            user_id: this.userData.userId,
            email: this.userData.email
        };

        const response = await fetch("http://127.0.0.1:8000/api/vendors/verify-otp/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                // "Authorization": `Bearer ${this.userData.token}` // if needed
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Update success details
            document.getElementById('success-user').textContent = this.userData.name;
            document.getElementById('success-time').textContent = new Date().toLocaleString();
            
            // Store token if API returns it
            if (result.token) {
                localStorage.setItem('sellerToken', result.token);
            }
            
            this.showStep('success');
            this.showNotification('Sign in successful!', 'success');
        } else {
            throw new Error(result.detail || result.error || JSON.stringify(result));
        }
    } catch (error) {
        this.showNotification('OTP verification failed: ' + error.message, 'error');
    } finally {
        this.setButtonLoading(verifyBtn, false, '<i class="fas fa-check-circle"></i> Verify & Continue');
    }
}

    // resendEmailOTP() {
    //     this.emailOTP = this.generateOTP();
    //     console.log(`New Email OTP: ${this.emailOTP}`);
    //     this.startTimer('email');
    //     this.showNotification('New verification code sent to your email', 'success');
    // }

    // resendMobileOTP() {
    //     this.mobileOTP = this.generateOTP();
    //     console.log(`New Mobile OTP: ${this.mobileOTP}`);
    //     this.startTimer('mobile');
    //     this.showNotification('New verification code sent to your mobile', 'success');
    // }



    async resendEmailOTP() {
    try {
        // API call to resend email OTP - USING YOUR FORMAT
        const data = {
            email: this.userData.email,
            type: 'email'
        };

        const response = await fetch("http://127.0.0.1:8000/api/vendors/resend-otp/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            this.emailOTP = result.otp; // if API returns the new OTP
            this.startTimer('email');
            this.showNotification('New verification code sent to your email', 'success');
        } else {
            throw new Error(result.detail || result.error || JSON.stringify(result));
        }
    } catch (error) {
        this.showNotification('Failed to resend OTP: ' + error.message, 'error');
    }
}

async resendMobileOTP() {
    try {
        // API call to resend mobile OTP - USING YOUR FORMAT
        const data = {
            mobile: this.userData.mobile,
            type: 'mobile'
        };

        const response = await fetch("http://127.0.0.1:8000/api/vendors/resend-otp/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            this.mobileOTP = result.otp; // if API returns the new OTP
            this.startTimer('mobile');
            this.showNotification('New verification code sent to your mobile', 'success');
        } else {
            throw new Error(result.detail || result.error || JSON.stringify(result));
        }
    } catch (error) {
        this.showNotification('Failed to resend OTP: ' + error.message, 'error');
    }
}
    setupOTPInputs() {
        const inputs = document.querySelectorAll('.otp-digit');
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
                
                if (value && index < inputs.length - 1) {
                    // Find next input of same type
                    const type = input.getAttribute('data-type');
                    const nextInput = document.querySelector(`.otp-digit[data-type="${type}"][data-index="${index + 1}"]`);
                    if (nextInput) nextInput.focus();
                }
                
                this.updateVerifyButtonState();
                this.updateOTPStatus(input.getAttribute('data-type'));
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    // Find previous input of same type
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
                
                this.updateVerifyButtonState();
                this.updateOTPStatus(type);
            });
        });
    }

    getEnteredOTP(type) {
        const inputs = document.querySelectorAll(`.otp-digit[data-type="${type}"]`);
        return Array.from(inputs).map(input => input.value).join('');
    }

    updateVerifyButtonState() {
        const emailOTP = this.getEnteredOTP('email');
        const mobileOTP = this.getEnteredOTP('mobile');
        const verifyBtn = document.getElementById('verify-otp');
        
        verifyBtn.disabled = !(emailOTP.length === 6 && mobileOTP.length === 6);
    }

    updateOTPStatus(type) {
        const enteredOTP = this.getEnteredOTP(type);
        const statusElement = document.getElementById(`${type}-otp-status`);
        
        if (enteredOTP.length === 6) {
            const correctOTP = type === 'email' ? this.emailOTP : this.mobileOTP;
            
            if (enteredOTP === correctOTP) {
                statusElement.textContent = '✓ Verified';
                statusElement.className = 'otp-status verified';
            } else {
                statusElement.textContent = '✗ Invalid';
                statusElement.className = 'otp-status error';
            }
        } else {
            statusElement.textContent = '';
            statusElement.className = 'otp-status';
        }
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
                resendBtn.innerHTML = `<i class="fas fa-redo"></i> Resend code`;
            }
        }, 1000);
    }

    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show target step
        document.getElementById(`step-${step}`).classList.add('active');
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

    goToDashboard() {
        // Redirect to seller dashboard
        window.location.href = 'seller-dashboard.html';
    }

    // Utility Methods
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    maskEmail(email) {
        const [username, domain] = email.split('@');
        return `${username.substring(0, 2)}***@${domain}`;
    }

    maskMobile(mobile) {
        return `${mobile.substring(0, 4)}****${mobile.substring(8)}`;
    }

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
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: white;
            padding: 20px 25px;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            border-left: 4px solid ${type === 'success' ? 'var(--success)' : 'var(--error)'};
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.4s ease;
            max-width: 350px;
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

    async simulateAPICall(duration) {
        return new Promise((resolve) => {
            setTimeout(resolve, duration);
        });
    }
}

// Initialize the sign in system
document.addEventListener('DOMContentLoaded', function() {
    new SellerSignIn();
    console.log('Seller Sign In System Initialized');
});