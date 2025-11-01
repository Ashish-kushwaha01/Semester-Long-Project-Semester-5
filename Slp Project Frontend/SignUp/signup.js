// // signup.js
// document.getElementById("signupForm").addEventListener("submit", async function (e) {
//     e.preventDefault();
    
//     // Reset error messages
//     resetErrorMessages();
    
//     // Validate form
//     if (!validateForm()) {
//         return;
//     }

//     // Show loading state
//     showLoading(true);

//     // Prepare data for API
//     const formData = {
//         email: document.getElementById("signupEmail").value.trim(),
//         password: document.getElementById("signupPassword").value,
//         confirm_password: document.getElementById("confirmPassword").value,
//         first_name: document.getElementById("firstName").value.trim(),
//         last_name: document.getElementById("lastName").value.trim()
//     };

//     console.log("Sending data to API:", { ...formData, password: "***", confirm_password: "***" });

//     try {
//         const response = await fetch("http://127.0.0.1:8000/api/account/request-otp/", {
//             method: "POST",
//             headers: { 
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(formData)
//         });

//         const result = await response.json();
//         console.log("API Response:", result);

//         if (response.ok) {
//             // Store email for OTP verification
//             localStorage.setItem('verifyEmail', formData.email);
            
//             // Show success message and redirect
//             alert("OTP sent successfully! Please check your email.");
//             window.location.href = "otp.html";
//         } else {
//             // Handle API errors
//             handleApiErrors(result);
//         }

//     } catch (error) {
//         console.error("Fetch error:", error);
//         showError("signupEmail", "Network error. Please check your connection and try again.");
//     } finally {
//         showLoading(false);
//     }
// });

// function validateForm() {
//     let isValid = true;

//     // Validate first name
//     const firstName = document.getElementById("firstName").value.trim();
//     if (!firstName) {
//         showError("firstName", "First name is required");
//         isValid = false;
//     }

//     // Validate last name
//     const lastName = document.getElementById("lastName").value.trim();
//     if (!lastName) {
//         showError("lastName", "Last name is required");
//         isValid = false;
//     }

//     // Validate email
//     const email = document.getElementById("signupEmail").value.trim();
//     if (!email) {
//         showError("signupEmail", "Email is required");
//         isValid = false;
//     } else if (!isValidEmail(email)) {
//         showError("signupEmail", "Please enter a valid email address");
//         isValid = false;
//     }

//     // Validate password
//     const password = document.getElementById("signupPassword").value;
//     if (!password) {
//         showError("signupPassword", "Password is required");
//         isValid = false;
//     } else if (password.length < 6) {
//         showError("signupPassword", "Password must be at least 6 characters long");
//         isValid = false;
//     }

//     // Validate confirm password
//     const confirmPassword = document.getElementById("confirmPassword").value;
//     if (!confirmPassword) {
//         showError("confirmPassword", "Please confirm your password");
//         isValid = false;
//     } else if (password !== confirmPassword) {
//         showError("confirmPassword", "Passwords do not match");
//         isValid = false;
//     }

//     // Validate terms agreement
//     const agreeTerms = document.getElementById("agreeTerms").checked;
//     if (!agreeTerms) {
//         alert("Please agree to the Terms of Service and Privacy Policy");
//         isValid = false;
//     }

//     return isValid;
// }

// function handleApiErrors(result) {
//     // Handle different types of API errors
//     if (result.email) {
//         showError("signupEmail", result.email[0]);
//     } else if (result.password) {
//         showError("signupPassword", result.password[0]);
//     } else if (result.non_field_errors) {
//         showError("signupPassword", result.non_field_errors[0]);
//     } else if (result.detail) {
//         showError("signupEmail", result.detail);
//     } else {
//         showError("signupEmail", "Registration failed. Please try again.");
//     }
// }

// function showError(fieldId, message) {
//     const errorElement = document.getElementById(fieldId + "Error");
//     if (errorElement) {
//         errorElement.textContent = message;
//         errorElement.style.display = "block";
//     }
// }

// function resetErrorMessages() {
//     const errorMessages = document.querySelectorAll('.error-message');
//     errorMessages.forEach(error => {
//         error.style.display = "none";
//         error.textContent = "";
//     });
// }

// function showLoading(show) {
//     const btn = document.getElementById("signupBtn");
//     const btnText = btn.querySelector(".btn-text");
//     const btnLoader = btn.querySelector(".btn-loader");
    
//     if (show) {
//         btn.disabled = true;
//         btnText.style.display = "none";
//         btnLoader.style.display = "flex";
//     } else {
//         btn.disabled = false;
//         btnText.style.display = "block";
//         btnLoader.style.display = "none";
//     }
// }

// function isValidEmail(email) {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
// }

// function togglePassword(fieldId) {
//     const field = document.getElementById(fieldId);
//     const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
//     field.setAttribute('type', type);
// }
















// signup.js
document.getElementById("signupForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    // Reset error messages
    resetErrorMessages();
    
    // Validate form
    if (!validateForm()) {
        return;
    }

    // Show loading state
    showLoading(true);

    // Prepare data for API
    const formData = {
        email: document.getElementById("signupEmail").value.trim(),
        password: document.getElementById("signupPassword").value,
        confirm_password: document.getElementById("confirmPassword").value,
        first_name: document.getElementById("firstName").value.trim(),
        last_name: document.getElementById("lastName").value.trim()
    };

    console.log("Sending data to API:", { ...formData, password: "***", confirm_password: "***" });

    try {
        const response = await fetch("http://127.0.0.1:8000/api/account/register/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            // Handle non-JSON response (HTML error page)
            const text = await response.text();
            console.error("Server returned HTML instead of JSON:", text.substring(0, 200));
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        console.log("API Response:", result);

        if (response.ok) {
            // Store email for OTP verification
            localStorage.setItem('verifyEmail', formData.email);
            
            // Show success message and redirect
            alert("OTP sent successfully! Please check your email.");
            window.location.href = "otp.html";
        } else {
            // Handle API errors
            handleApiErrors(result);
        }

    } catch (error) {
        console.error("Fetch error:", error);
        
        // More specific error message
        if (error.message.includes('Server error:')) {
            showError("signupEmail", "Server error. Please try again later.");
        } else {
            showError("signupEmail", "Network error. Please check your connection and try again.");
        }
    } finally {
        showLoading(false);
    }
});

function validateForm() {
    let isValid = true;

    // Validate first name
    const firstName = document.getElementById("firstName").value.trim();
    if (!firstName) {
        showError("firstName", "First name is required");
        isValid = false;
    }

    // Validate last name
    const lastName = document.getElementById("lastName").value.trim();
    if (!lastName) {
        showError("lastName", "Last name is required");
        isValid = false;
    }

    // Validate email
    const email = document.getElementById("signupEmail").value.trim();
    if (!email) {
        showError("signupEmail", "Email is required");
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError("signupEmail", "Please enter a valid email address");
        isValid = false;
    }

    // Validate password
    const password = document.getElementById("signupPassword").value;
    if (!password) {
        showError("signupPassword", "Password is required");
        isValid = false;
    } else if (password.length < 6) {
        showError("signupPassword", "Password must be at least 6 characters long");
        isValid = false;
    }

    // Validate confirm password
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (!confirmPassword) {
        showError("confirmPassword", "Please confirm your password");
        isValid = false;
    } else if (password !== confirmPassword) {
        showError("confirmPassword", "Passwords do not match");
        isValid = false;
    }

    // Validate terms agreement
    const agreeTerms = document.getElementById("agreeTerms").checked;
    if (!agreeTerms) {
        alert("Please agree to the Terms of Service and Privacy Policy");
        isValid = false;
    }

    return isValid;
}

function handleApiErrors(result) {
    // Handle different types of API errors
    if (result.email) {
        showError("signupEmail", result.email[0]);
    } else if (result.password) {
        showError("signupPassword", result.password[0]);
    } else if (result.confirm_password) {
        showError("confirmPassword", result.confirm_password[0]);
    } else if (result.first_name) {
        showError("firstName", result.first_name[0]);
    } else if (result.last_name) {
        showError("lastName", result.last_name[0]);
    } else if (result.non_field_errors) {
        showError("signupPassword", result.non_field_errors[0]);
    } else if (result.detail) {
        showError("signupEmail", result.detail);
    } else {
        showError("signupEmail", "Registration failed. Please try again.");
    }
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + "Error");
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }
}

function resetErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.style.display = "none";
        error.textContent = "";
    });
}

function showLoading(show) {
    const btn = document.getElementById("signupBtn");
    const btnText = btn.querySelector(".btn-text");
    const btnLoader = btn.querySelector(".btn-loader");
    
    if (show) {
        btn.disabled = true;
        btnText.style.display = "none";
        btnLoader.style.display = "flex";
    } else {
        btn.disabled = false;
        btnText.style.display = "block";
        btnLoader.style.display = "none";
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
    field.setAttribute('type', type);
    
    // Toggle eye icon
    const eyeIcon = document.querySelector(`[onclick="togglePassword('${fieldId}')"]`);
    if (eyeIcon) {
        if (type === 'text') {
            eyeIcon.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            eyeIcon.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
}

// Real-time validation for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Real-time email validation
    document.getElementById('signupEmail').addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !isValidEmail(email)) {
            showError("signupEmail", "Please enter a valid email address");
        }
    });

    // Real-time password confirmation
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = this.value;
        
        if (confirmPassword && password !== confirmPassword) {
            showError("confirmPassword", "Passwords do not match");
        } else if (confirmPassword) {
            resetErrorMessages();
        }
    });

    // Clear error on focus
    const inputs = document.querySelectorAll('#signupForm input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            const fieldId = this.id;
            const errorElement = document.getElementById(fieldId + "Error");
            if (errorElement) {
                errorElement.style.display = "none";
                errorElement.textContent = "";
            }
        });
    });
});