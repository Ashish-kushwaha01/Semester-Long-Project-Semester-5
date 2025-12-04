// // js/login/SignIn.js

// document.addEventListener('DOMContentLoaded', function() {
//     initializeSignin();
// });

// function initializeSignin() {
//     checkAuthentication();
    
//     const loginForm = document.getElementById('loginForm');
//     if (!loginForm) return;

//     loginForm.addEventListener('submit', function(e) {
//         e.preventDefault();
//         handleLogin();
//     });

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

//     initializeForgotPassword();
// }

// function checkAuthentication() {
//     if (authManager.isAuthenticated() && window.location.pathname.includes('signIn.html')) {
//         window.location.href = '../index.html';
//     }
// }

// async function handleLogin() {
//     const email = document.getElementById('loginEmail').value;
//     const password = document.getElementById('loginPassword').value;
//     const rememberMe = document.getElementById('rememberMe')?.checked;
//     const loginBtn = document.getElementById('loginBtn');
    
//     if (!validateEmail(email, 'emailError') || !validatePassword(password, 'passwordError')) {
//         return;
//     }
    
//     setButtonLoading(loginBtn, true);
    
//     try {
//         const loginData = {
//             email: email,
//             password: password
//         };

//         console.log('Sending login data:', { ...loginData, password: '***' });

//         const response = await fetch("http://127.0.0.1:8000/api/account/login/", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(loginData)
//         });

//         const result = await response.json();
//         console.log('Login API response:', result);

//         if (response.ok) {
//             const { access, refresh, user } = result.data;
            
//             authManager.handleLogin(user, { access, refresh });
            
//         } else {
//             let errorMessage = 'Login failed';
            
//             if (result.errors) {
//                 if (result.errors.email) {
//                     errorMessage = result.errors.email[0];
//                 } else if (result.errors.password) {
//                     errorMessage = result.errors.password[0];
//                 } else if (result.errors.non_field_errors) {
//                     errorMessage = result.errors.non_field_errors[0];
//                 } else {
//                     errorMessage = Object.values(result.errors)[0][0];
//                 }
//             } else if (result.detail) {
//                 errorMessage = result.detail;
//             } else if (result.message && result.message !== "Invalid Data") {
//                 errorMessage = result.message;
//             }
            
//             throw new Error(errorMessage);
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
//         const response = await fetch("http://127.0.0.1:8000/api/account/request-otp/", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email: email })
//         });

//         const result = await response.json();

//         if (response.ok) {
//             localStorage.setItem('passwordResetEmail', email);
//             modal.style.display = 'none';
//             alert('OTP has been sent to your email! Please check your email and use the OTP to reset your password.');
//         } else {
//             throw new Error(result.detail || result.error || 'Failed to send OTP');
//         }
//     } catch (error) {
//         alert('Error: ' + error.message);
//     }
// }

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
//         if (btnText) btnText.style.visibility = 'hidden';
//         if (btnLoader) btnLoader.style.display = 'flex';
//     } else {
//         button.disabled = false;
//         if (btnText) btnText.style.visibility = 'visible';
//         if (btnLoader) btnLoader.style.display = 'none';
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

















// js/login/SignIn.js

document.addEventListener('DOMContentLoaded', function() {
    initializeSignin();
});

function initializeSignin() {
    checkAuthentication();
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

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

    initializeForgotPassword();
}

function checkAuthentication() {
    if (authManager.isAuthenticated() && window.location.pathname.includes('signIn.html')) {
        window.location.href = '../index.html';
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe')?.checked;
    const loginBtn = document.getElementById('loginBtn');
    
    if (!validateEmail(email, 'emailError') || !validatePassword(password, 'passwordError')) {
        return;
    }
    
    setButtonLoading(loginBtn, true);
    
    try {
        const loginData = {
            email: email,
            password: password
        };

        console.log('Sending login data:', { ...loginData, password: '***' });

        const response = await fetch("http://127.0.0.1:8000/api/account/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        console.log('Login API response:', result);

        if (response.ok) {
            const { access, refresh, user } = result.data;
            
            authManager.handleLogin(user, { access, refresh });
            
        } else {
            let errorMessage = 'Login failed';
            
            if (result.errors) {
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
        setButtonLoading(loginBtn, false);
    }
}

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
//             resetForgotPasswordForm();
//         });
//     }

//     window.addEventListener('click', function(e) {
//         if (e.target === modal) {
//             modal.style.display = 'none';
//             resetForgotPasswordForm();
//         }
//     });

//     if (forgotPasswordForm) {
//         forgotPasswordForm.addEventListener('submit', function(e) {
//             e.preventDefault();
//             handleForgotPassword();
//         });
//     }
// }

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
            resetForgotPasswordForm();
        });
    }

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            resetForgotPasswordForm();
        }
    });

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }
}

// function resetForgotPasswordForm() {
//     const form = document.getElementById('forgotPasswordForm');
//     if (form) {
//         form.reset();
//     }
    
//     // Remove any success/error messages
//     const messages = document.querySelectorAll('.forgot-password-message');
//     messages.forEach(msg => msg.remove());
// }

function resetForgotPasswordForm() {
    const form = document.getElementById('forgotPasswordForm');
    if (form) {
        form.reset();
    }
    
    // Reset submit button to original state
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    }
    
    // Remove any success/error messages
    const messages = document.querySelectorAll('.forgot-password-message');
    messages.forEach(msg => msg.remove());
}

// async function handleForgotPassword() {
//     const email = document.getElementById('resetEmail').value;
//     const modal = document.getElementById('forgotPasswordModal');
//     const form = document.getElementById('forgotPasswordForm');
    
//     if (!validateEmail(email, '')) {
//         showForgotPasswordMessage('Please enter a valid email address', 'error');
//         return;
//     }
    
//     try {
//         const response = await fetch("http://127.0.0.1:8000/api/account/request-otp/", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email: email })
//         });

//         const result = await response.json();

//         if (response.ok) {
//             localStorage.setItem('passwordResetEmail', email);
//             showForgotPasswordMessage('OTP has been sent to your email! Please check your email and use the OTP to reset your password.', 'success');
            
//             // Close modal after 3 seconds and redirect to password reset page
//             setTimeout(() => {
//                 modal.style.display = 'none';
//                 resetForgotPasswordForm();
//                 window.location.href = 'passwordReset.html';
//             }, 3000);
//         } else {
//             throw new Error(result.detail || result.error || 'Failed to send OTP');
//         }
//     } catch (error) {
//         showForgotPasswordMessage('Error: ' + error.message, 'error');
//     }
// }


async function handleForgotPassword() {
    const email = document.getElementById('resetEmail').value;
    const modal = document.getElementById('forgotPasswordModal');
    const form = document.getElementById('forgotPasswordForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!validateEmail(email, '')) {
        showForgotPasswordMessage('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Disable submit button and show processing state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        const response = await fetch("http://127.0.0.1:8000/api/account/request-otp/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        const result = await response.json();

        if (response.ok) {
            localStorage.setItem('passwordResetEmail', email);
            showForgotPasswordMessage('OTP has been sent to your email! Please check your email and use the OTP to reset your password.', 'success');
            
            // Change button text to indicate success before redirect
            submitBtn.textContent = 'Redirecting...';
            
            // Close modal after 3 seconds and redirect to password reset page
            setTimeout(() => {
                modal.style.display = 'none';
                resetForgotPasswordForm();
                window.location.href = 'passwordReset.html';
            }, 3000);
        } else {
            throw new Error(result.detail || result.error || 'Failed to send OTP');
        }
    } catch (error) {
        showForgotPasswordMessage('Error: ' + error.message, 'error');
        // Re-enable submit button on error
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Reset Link';
    }
}


function showForgotPasswordMessage(message, type) {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.forgot-password-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `forgot-password-message ${type === 'success' ? 'success-message' : 'error-message'}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        margin: 16px 0;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
    `;
    
    const form = document.getElementById('forgotPasswordForm');
    if (form) {
        form.insertBefore(messageDiv, form.firstChild);
    }
}

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