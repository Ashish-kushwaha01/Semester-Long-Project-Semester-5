// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Check if user is already logged in
    checkAuthentication();
    
    // Initialize forms
    initializeLoginForm();
    initializeSignupForm();
    initializeForgotPassword();
    initializeSocialButtons();
}

function checkAuthentication() {
    const user = localStorage.getItem('currentUser');
    if (user && window.location.pathname.includes('login.html')) {
        // If user is already logged in and trying to access login page
        window.location.href = 'index.html';
    }
}

function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // Real-time validation
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateEmail(this.value, 'emailError');
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value, 'passwordError');
        });
    }
}

function initializeSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSignup();
    });

    // Real-time validation
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (firstNameInput) {
        firstNameInput.addEventListener('input', function() {
            validateName(this.value, 'firstNameError', 'First name');
        });
    }

    if (lastNameInput) {
        lastNameInput.addEventListener('input', function() {
            validateName(this.value, 'lastNameError', 'Last name');
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateEmail(this.value, 'signupEmailError');
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this.value, 'signupPasswordError');
            updatePasswordStrength(this.value);
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validateConfirmPassword(this.value, document.getElementById('signupPassword').value, 'confirmPasswordError');
        });
    }
}

function initializeForgotPassword() {
    // Forgot password modal
    const forgotPasswordLink = document.querySelector('.forgot-password');
    const modal = document.getElementById('forgotPasswordModal');
    const closeModal = document.querySelector('.close-modal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    if (forgotPasswordLink && modal) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'block';
        });
    }

    if (closeModal && modal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
}

function initializeSocialButtons() {
    // Google login
    const googleButtons = document.querySelectorAll('.btn-google');
    googleButtons.forEach(button => {
        button.addEventListener('click', function() {
            handleSocialLogin('google');
        });
    });

    // Facebook login
    const facebookButtons = document.querySelectorAll('.btn-facebook');
    facebookButtons.forEach(button => {
        button.addEventListener('click', function() {
            handleSocialLogin('facebook');
        });
    });
}

// Validation Functions
function validateEmail(email, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showError(errorElement, 'Email is required');
        return false;
    }
    
    if (!emailRegex.test(email)) {
        showError(errorElement, 'Please enter a valid email address');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateName(name, errorElementId, fieldName) {
    const errorElement = document.getElementById(errorElementId);
    
    if (!name) {
        showError(errorElement, `${fieldName} is required`);
        return false;
    }
    
    if (name.length < 2) {
        showError(errorElement, `${fieldName} must be at least 2 characters`);
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validatePassword(password, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    
    if (!password) {
        showError(errorElement, 'Password is required');
        return false;
    }
    
    if (password.length < 8) {
        showError(errorElement, 'Password must be at least 8 characters');
        return false;
    }
    
    // Check for strong password (at least one uppercase, one lowercase, one number)
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongRegex.test(password)) {
        showError(errorElement, 'Include uppercase, lowercase, and numbers');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function validateConfirmPassword(confirmPassword, password, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    
    if (!confirmPassword) {
        showError(errorElement, 'Please confirm your password');
        return false;
    }
    
    if (confirmPassword !== password) {
        showError(errorElement, 'Passwords do not match');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let text = 'Weak';
    let className = 'strength-weak';
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    if (strength >= 75) {
        text = 'Strong';
        className = 'strength-strong';
    } else if (strength >= 50) {
        text = 'Medium';
        className = 'strength-medium';
    } else if (strength >= 25) {
        text = 'Weak';
        className = 'strength-weak';
    } else {
        text = 'Very Weak';
        className = 'strength-weak';
    }
    
    strengthBar.className = 'strength-fill ' + className;
    strengthText.textContent = text;
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function hideError(element) {
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
    }
}

// Form Handlers
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;
    const loginBtn = document.getElementById('loginBtn');
    
    // Validate inputs
    if (!validateEmail(email, 'emailError') || !validatePassword(password, 'passwordError')) {
        return;
    }
    
    // Show loading state
    setButtonLoading(loginBtn, true);
    
    // Simulate API call
    setTimeout(() => {
        // Check if user exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Successful login
            localStorage.setItem('currentUser', JSON.stringify({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }));
            
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            showSuccess('Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // Failed login
            showError(document.getElementById('passwordError'), 'Invalid email or password');
            setButtonLoading(loginBtn, false);
        }
    }, 1500);
}

function handleSignup() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const signupBtn = document.getElementById('signupBtn');
    
    // Validate all inputs
    if (!validateName(firstName, 'firstNameError', 'First name') ||
        !validateName(lastName, 'lastNameError', 'Last name') ||
        !validateEmail(email, 'signupEmailError') ||
        !validatePassword(password, 'signupPasswordError') ||
        !validateConfirmPassword(confirmPassword, password, 'confirmPasswordError')) {
        return;
    }
    
    if (!agreeTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return;
    }
    
    // Show loading state
    setButtonLoading(signupBtn, true);
    
    // Simulate API call
    setTimeout(() => {
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showError(document.getElementById('signupEmailError'), 'Email already registered');
            setButtonLoading(signupBtn, false);
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email,
            password, // In real app, this should be hashed
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto-login
        localStorage.setItem('currentUser', JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
        }));
        
        showSuccess('Account created successfully! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }, 1500);
}

function handleForgotPassword() {
    const email = document.getElementById('resetEmail').value;
    const modal = document.getElementById('forgotPasswordModal');
    
    if (!validateEmail(email, '')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate sending reset email
    setTimeout(() => {
        modal.style.display = 'none';
        alert('Password reset link has been sent to your email!');
    }, 1000);
}

function handleSocialLogin(provider) {
    // Simulate social login
    setButtonLoading(document.querySelector(`.btn-${provider}`), true);
    
    setTimeout(() => {
        alert(`In a real application, this would redirect to ${provider} authentication`);
        setButtonLoading(document.querySelector(`.btn-${provider}`), false);
    }, 1500);
}

// Utility Functions
function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        button.disabled = true;
        btnText.style.visibility = 'hidden';
        btnLoader.style.display = 'flex';
    } else {
        button.disabled = false;
        btnText.style.visibility = 'visible';
        btnLoader.style.display = 'none';
    }
}

function showSuccess(message) {
    // Create success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Insert at the beginning of the form
    const form = document.querySelector('.auth-form');
    if (form) {
        form.insertBefore(successDiv, form.firstChild);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
}

// Logout function (can be used in other pages)
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberMe');
    window.location.href = 'login.html';
}

// Check authentication status on other pages
function checkAuthStatus() {
    const user = localStorage.getItem('currentUser');
    if (!user && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
        window.location.href = 'login.html';
    }
    return user ? JSON.parse(user) : null;
}