// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded, initializing...');
    
    // Force cart count update immediately
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Check if user is logged in
    if (!authManager.isAuthenticated()) {
        alert('Please login to view your profile!');
        window.location.href = 'login/signIn.html';
        return;
    }

    // Load user profile
    const user = authManager.getCurrentUser();
    
    // Update header user info
    updateHeaderUserInfo(user);

    document.getElementById('profileContent').innerHTML = `
        <div class="profile-info">
            <div class="profile-avatar-section">
                <div class="profile-avatar">
                    ${user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2 style="color: #111827; margin-bottom: 8px;">${user.first_name} ${user.last_name}</h2>
                <p style="color: var(--muted);">${user.email}</p>
            </div>

            <div class="profile-details">
                <div class="detail-section">
                    <h3>Personal Information</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">First Name</span>
                            <span class="detail-value">${user.first_name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Last Name</span>
                            <span class="detail-value">${user.last_name}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Email Address</span>
                            <span class="detail-value">${user.email}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Account Status</span>
                            <span class="status-badge verified">✓ Verified</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Member Since</span>
                            <span class="detail-value">Just now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="profile-actions">
            <button class="btn btn-edit" onclick="editProfile()">Edit Profile</button>
            <button class="btn btn-secondary" onclick="changePassword()">Change Password</button>
            <button class="btn btn-secondary" onclick="authManager.logout()">Logout</button>
        </div>
    `;
    
    // Final cart count update after profile is loaded
    setTimeout(() => {
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    }, 100);
});

// Update header with user information
function updateHeaderUserInfo(user) {
    const userDropdown = document.getElementById('userDropdown');
    const signInLink = document.getElementById('signInLink');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (user && userDropdown && signInLink) {
        userDropdown.style.display = 'flex';
        signInLink.style.display = 'none';
        
        if (userAvatar) {
            userAvatar.textContent = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
        }
        
        if (userName) {
            userName.textContent = user.first_name || 'User';
        }
        
        // Add dropdown toggle functionality
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdownMenu = document.getElementById('dropdownMenu');
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('show');
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            const dropdownMenu = document.getElementById('dropdownMenu');
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        });
        
        // Close dropdown when clicking on dropdown items
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function() {
                const dropdownMenu = document.getElementById('dropdownMenu');
                if (dropdownMenu) {
                    dropdownMenu.classList.remove('show');
                }
            });
        });
    }
}

function editProfile() {
    alert('Edit profile functionality coming soon!');
}

function changePassword() {
    alert('Change password functionality coming soon!');
}

// Ensure cart count updates when page becomes visible
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && typeof updateCartCount === 'function') {
        updateCartCount();
    }
});

// Update cart count when page gains focus
window.addEventListener('focus', function() {
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
});