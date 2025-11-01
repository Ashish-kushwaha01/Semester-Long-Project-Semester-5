// otp.js
document.addEventListener('DOMContentLoaded', function() {
    // Check if email is stored from signup
    const email = localStorage.getItem('verifyEmail');
    if (!email) {
        alert('No email found. Please sign up first.');
        window.location.href = 'signup.html';
        return;
    }

    // Display the email
    document.getElementById('emailDisplay').textContent = email;

    // Start resend timer
    startResendTimer();

    // OTP form submission
    document.getElementById('otpForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await verifyOtp();
    });

    // Resend OTP button
    document.getElementById('resendBtn').addEventListener('click', async function() {
        await resendOtp();
    });

    // Auto-submit when OTP is 6 digits
    document.getElementById('otp').addEventListener('input', function() {
        if (this.value.length === 6) {
            document.getElementById('otpForm').dispatchEvent(new Event('submit'));
        }
    });
});

async function verifyOtp() {
    const otp = document.getElementById('otp').value.trim();
    const email = localStorage.getItem('verifyEmail');

    // Validate OTP
    if (!otp || otp.length !== 6) {
        showError('otp', 'Please enter a valid 6-digit OTP');
        return;
    }

    // Show loading
    showLoading(true);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/account/verify-email/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                otp: otp
            })
        });

        const result = await response.json();
        console.log('Verify OTP Response:', result);

        if (response.ok) {
            // Success - redirect to success page or login
            alert('Email verified successfully! You can now login.');
            localStorage.removeItem('verifyEmail'); // Clean up
            window.location.href = '../signIn.html'; // Change to your login page
        } else {
            // Handle errors
            if (result.detail) {
                showError('otp', result.detail);
            } else if (result.otp) {
                showError('otp', result.otp[0]);
            } else {
                showError('otp', 'Verification failed. Please try again.');
            }
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        showError('otp', 'Network error. Please check your connection.');
    } finally {
        showLoading(false);
    }
}

async function resendOtp() {
    const email = localStorage.getItem('verifyEmail');
    const resendBtn = document.getElementById('resendBtn');
    const timer = document.getElementById('resendTimer');

    // Disable resend button and show timer
    resendBtn.disabled = true;
    timer.style.display = 'block';
    startResendTimer();

    try {
        const response = await fetch('http://127.0.0.1:8000/api/account/resend-otp/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            alert('OTP resent successfully! Please check your email.');
        } else {
            alert('Failed to resend OTP: ' + (result.detail || 'Please try again.'));
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        alert('Network error. Please check your connection.');
    }
}

function startResendTimer() {
    const resendBtn = document.getElementById('resendBtn');
    const timer = document.getElementById('resendTimer');
    const countdownElement = document.getElementById('countdown');
    
    let timeLeft = 60;
    resendBtn.disabled = true;
    timer.style.display = 'block';

    const countdown = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            resendBtn.disabled = false;
            timer.style.display = 'none';
        }
    }, 1000);
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function showLoading(show) {
    const btn = document.getElementById('verifyBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    if (show) {
        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
    } else {
        btn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
}