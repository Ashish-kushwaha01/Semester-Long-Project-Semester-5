document.addEventListener('DOMContentLoaded', function() {
    initializePasswordReset();
});

function initializePasswordReset() {
    // Pre-fill email
    const savedEmail = localStorage.getItem('passwordResetEmail');
    const emailInput = document.getElementById('resetEmail');
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
    }

    // Setup OTP inputs
    setupOTPInputs();

    // Form submission
    const form = document.getElementById('passwordResetForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handlePasswordReset();
        });
    }

    // Password validation
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', validatePassword);
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
}

function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const hiddenOtpInput = document.getElementById('otp');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Move to next input
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            
            // Update hidden input
            updateHiddenOTP();
        });
        
        input.addEventListener('keydown', function(e) {
            // Move to previous input on backspace
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
    
    function updateHiddenOTP() {
        let otp = '';
        otpInputs.forEach(input => {
            otp += input.value;
        });
        hiddenOtpInput.value = otp;
    }
}

function validatePassword() {
    const password = document.getElementById('newPassword').value;
    const errorElement = document.getElementById('newPasswordError');
    
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

function validatePasswordMatch() {
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (confirmPassword && password !== confirmPassword) {
        showError(errorElement, 'Passwords do not match');
        return false;
    }
    
    hideError(errorElement);
    return true;
}

async function handlePasswordReset() {
    const email = document.getElementById('resetEmail').value;
    const otp = document.getElementById('otp').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const resetBtn = document.getElementById('resetBtn');
    
    // Validate
    if (otp.length !== 6) {
        showError(document.getElementById('otpError'), 'Please enter 6-digit OTP');
        return;
    }
    
    if (!validatePassword() || !validatePasswordMatch()) {
        return;
    }
    
    // Show loading
    resetBtn.disabled = true;
    resetBtn.innerHTML = 'Resetting...';
    
    try {
        const resetData = {
            email: email,
            otp: otp,
            password: newPassword,
            confirm_password: confirmPassword
        };

        const response = await fetch("http://127.0.0.1:8000/api/account/forgot-password/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resetData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Password reset successfully!');
            localStorage.removeItem('passwordResetEmail');
            window.location.href = 'signIn.html';
        } else {
            let errorMessage = 'Password reset failed';
            
            if (result.errors) {
                errorMessage = Object.values(result.errors)[0][0];
            } else if (result.detail) {
                errorMessage = result.detail;
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        resetBtn.disabled = false;
        resetBtn.innerHTML = 'Reset Password';
    }
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
    }
}

function hideError(element) {
    if (element) {
        element.textContent = '';
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
}