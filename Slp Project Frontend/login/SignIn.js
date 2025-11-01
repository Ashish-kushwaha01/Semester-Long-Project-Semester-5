// // signin.js - Handles user login with OTP verification
// document.addEventListener('DOMContentLoaded', function() {
//     initializeSignin();
// });

// function initializeSignin() {
//     // Check if user is already logged in
//     checkAuthentication();
    
//     const loginForm = document.getElementById('loginForm');
//     if (!loginForm) return;

//     loginForm.addEventListener('submit', function(e) {
//         e.preventDefault();
//         handleLogin();
//     });

//     // Real-time validation
//     const emailInput = document.getElementById('loginEmail');
//     const passwordInput = document.getElementById('loginPassword');

//     if (emailInput) {
//         emailInput.addEventListener('input', function() {
//             validateEmail(this.value, 'emailError');
//         });
//     }

//     if (passwordInput) {
//         passwordInput.addEventListener('input', function() {
//             validatePassword(this.value, 'passwordError');
//         });
//     }

//     // Initialize forgot password
//     initializeForgotPassword();
// }

// function checkAuthentication() {
//     const user = localStorage.getItem('currentUser');
//     if (user && window.location.pathname.includes('signin.html')) {
//         window.location.href = '../index.html';
//     }
// }

// async function handleLogin() {
//     const email = document.getElementById('loginEmail').value;
//     const password = document.getElementById('loginPassword').value;
//     const rememberMe = document.getElementById('rememberMe')?.checked;
//     const loginBtn = document.getElementById('loginBtn');
    
//     // Validate inputs
//     if (!validateEmail(email, 'emailError') || !validatePassword(password, 'passwordError')) {
//         return;
//     }
    
//     // Show loading state
//     setButtonLoading(loginBtn, true);
    
//     try {
//         // API call for login with OTP request
//         const data = {
//             email: email,
//             password: password
//         };

//         console.log('Sending login data:', data);

//         const response = await fetch("http://127.0.0.1:8000/api/account/request-login-otp/", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(data)
//         });

//         const result = await response.json();
//         console.log('Login API response:', result);

//         if (response.ok) {
//             // Store user data for OTP verification
//             const otpData = {
//                 email: email,
//                 isSignUp: false,
//                 rememberMe: rememberMe
//             };
//             localStorage.setItem('otpVerificationData', JSON.stringify(otpData));
            
//             showSuccess('Verification code sent to your email! Redirecting...');
            
//             // Redirect to OTP verification page after short delay
//             setTimeout(() => {
//                 window.location.href = 'otp-verification.html';
//             }, 1500);
            
//         } else {
//             throw new Error(result.detail || result.error || JSON.stringify(result));
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         showError(document.getElementById('passwordError'), error.message);
//         setButtonLoading(loginBtn, false);
//     }
// }

// function initializeForgotPassword() {
//     const forgotPasswordLink = document.querySelector('.forgot-password');
//     const modal = document.getElementById('forgotPasswordModal');
//     const closeModal = document.querySelector('.close-modal');
//     const forgotPasswordForm = document.getElementById('forgotPasswordForm');

//     if (forgotPasswordLink && modal) {
//         forgotPasswordLink.addEventListener('click', function(e) {
//             e.preventDefault();
//             modal.style.display = 'block';
//         });
//     }

//     if (closeModal && modal) {
//         closeModal.addEventListener('click', function() {
//             modal.style.display = 'none';
//         });
//     }

//     window.addEventListener('click', function(e) {
//         if (e.target === modal) {
//             modal.style.display = 'none';
//         }
//     });

//     if (forgotPasswordForm) {
//         forgotPasswordForm.addEventListener('submit', function(e) {
//             e.preventDefault();
//             handleForgotPassword();
//         });
//     }
// }

// async function handleForgotPassword() {
//     const email = document.getElementById('resetEmail').value;
//     const modal = document.getElementById('forgotPasswordModal');
    
//     if (!validateEmail(email, '')) {
//         alert('Please enter a valid email address');
//         return;
//     }
    
//     try {
//         // API call for forgot password
//         const response = await fetch("http://127.0.0.1:8000/api/account/forgot-password/", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email: email })
//         });

//         const result = await response.json();

//         if (response.ok) {
//             modal.style.display = 'none';
//             alert('Password reset link has been sent to your email!');
//         } else {
//             throw new Error(result.detail || result.error || 'Failed to send reset link');
//         }
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

// // Validation Functions for Signin
// function validateEmail(email, errorElementId) {
//     const errorElement = document.getElementById(errorElementId);
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
//     if (!email) {
//         showError(errorElement, 'Email is required');
//         return false;
//     }
    
//     if (!emailRegex.test(email)) {
//         showError(errorElement, 'Please enter a valid email address');
//         return false;
//     }
    
//     hideError(errorElement);
//     return true;
// }

// function validatePassword(password, errorElementId) {
//     const errorElement = document.getElementById(errorElementId);
    
//     if (!password) {
//         showError(errorElement, 'Password is required');
//         return false;
//     }
    
//     if (password.length < 6) {
//         showError(errorElement, 'Password must be at least 6 characters');
//         return false;
//     }
    
//     hideError(errorElement);
//     return true;
// }

// // Utility Functions (same as signup but kept separate)
// function showError(element, message) {
//     if (element) {
//         element.textContent = message;
//         element.style.display = 'block';
//     }
// }

// function hideError(element) {
//     if (element) {
//         element.textContent = '';
//         element.style.display = 'none';
//     }
// }

// function setButtonLoading(button, isLoading) {
//     if (!button) return;
    
//     const btnText = button.querySelector('.btn-text');
//     const btnLoader = button.querySelector('.btn-loader');
    
//     if (isLoading) {
//         button.disabled = true;
//         btnText.style.visibility = 'hidden';
//         btnLoader.style.display = 'flex';
//     } else {
//         button.disabled = false;
//         btnText.style.visibility = 'visible';
//         btnLoader.style.display = 'none';
//     }
// }

// function showSuccess(message) {
//     const successDiv = document.createElement('div');
//     successDiv.className = 'success-message';
//     successDiv.textContent = message;
//     successDiv.style.cssText = `
//         background: #d1fae5;
//         color: #065f46;
//         padding: 12px 16px;
//         border-radius: 8px;
//         margin-bottom: 16px;
//         font-size: 14px;
//         font-weight: 500;
//     `;
    
//     const form = document.querySelector('.auth-form');
//     if (form) {
//         form.insertBefore(successDiv, form.firstChild);
        
//         setTimeout(() => {
//             successDiv.remove();
//         }, 3000);
//     }
// }

// function togglePassword(inputId) {
//     const input = document.getElementById(inputId);
//     const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
//     input.setAttribute('type', type);
// }




















// signin.js - Handles user login
document.addEventListener('DOMContentLoaded', function() {
    initializeSignin();
});

function initializeSignin() {
    // Check if user is already logged in
    checkAuthentication();
    
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

    // Initialize forgot password
    initializeForgotPassword();
}

function checkAuthentication() {
    const token = localStorage.getItem('accessToken');
    if (token && window.location.pathname.includes('signin.html')) {
        window.location.href = '../index.html';
    }
}

async function handleLogin() {
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
    
    try {
        const loginData = {
            email: email,
            password: password
        };

        console.log('Sending login data:', { ...loginData, password: '***' });

        const response = await fetch("http://127.0.0.1:8000/api/account/login/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        console.log('Login API response:', result);

        if (response.ok) {
            // Login successful - store tokens and user data
            const { access, refresh, user } = result.data;
            
            // Store tokens in localStorage
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // If remember me is checked, store for longer duration
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to home page after short delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            
        } else {
            // Handle different types of errors from backend
            let errorMessage = 'Login failed';
            
            if (result.errors) {
                // Handle field-specific errors from serializer
                if (result.errors.email) {
                    errorMessage = result.errors.email[0];
                } else if (result.errors.password) {
                    errorMessage = result.errors.password[0];
                } else if (result.errors.non_field_errors) {
                    errorMessage = result.errors.non_field_errors[0];
                } else {
                    errorMessage = Object.values(result.errors)[0][0];
                }
            } else if (result.detail) {
                errorMessage = result.detail;
            } else if (result.message && result.message !== "Invalid Data") {
                errorMessage = result.message;
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(document.getElementById('passwordError'), error.message);
    } finally {
        setButtonLoading(loginBtn, false);
    }
}

function initializeForgotPassword() {
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

async function handleForgotPassword() {
    const email = document.getElementById('resetEmail').value;
    const modal = document.getElementById('forgotPasswordModal');
    
    if (!validateEmail(email, '')) {
        alert('Please enter a valid email address');
        return;
    }
    
    try {
        // First request OTP for password reset
        const otpResponse = await fetch("http://127.0.0.1:8000/api/account/request-otp/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        const otpResult = await otpResponse.json();

        if (otpResponse.ok) {
            // Store email for the password reset process
            localStorage.setItem('passwordResetEmail', email);
            
            modal.style.display = 'none';
            alert('OTP has been sent to your email! Please check your email and use the OTP to reset your password.');
            
            // Optionally redirect to a password reset page with OTP verification
            // window.location.href = 'reset-password.html';
        } else {
            throw new Error(otpResult.detail || otpResult.error || 'Failed to send OTP');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Validation Functions for Signin
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

function validatePassword(password, errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    
    if (!password) {
        showError(errorElement, 'Password is required');
        return false;
    }
    
    if (password.length < 6) {
        showError(errorElement, 'Password must be at least 6 characters');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

// Utility Functions
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

function setButtonLoading(button, isLoading) {
    if (!button) return;
    
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (isLoading) {
        button.disabled = true;
        if (btnText) btnText.style.visibility = 'hidden';
        if (btnLoader) btnLoader.style.display = 'flex';
    } else {
        button.disabled = false;
        if (btnText) btnText.style.visibility = 'visible';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        background: #d1fae5;
        color: #065f46;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        font-weight: 500;
    `;
    
    const form = document.querySelector('.auth-form');
    if (form) {
        form.insertBefore(successDiv, form.firstChild);
        
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

// Add this function to check authentication on other pages
function checkAuthStatus() {
    const token = localStorage.getItem('accessToken');
    const currentUser = localStorage.getItem('currentUser');
    
    if (!token || !currentUser) {
        // Redirect to login if not authenticated
        if (!window.location.pathname.includes('signin.html') && 
            !window.location.pathname.includes('signup.html')) {
            window.location.href = 'auth/signin.html';
        }
    }
    
    return { token, user: currentUser ? JSON.parse(currentUser) : null };
}

// Call this on other pages to check authentication
// checkAuthStatus();