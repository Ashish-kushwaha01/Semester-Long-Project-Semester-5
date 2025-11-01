// js/pages/profile.js

document.addEventListener('DOMContentLoaded', function() {
    if (!authManager.isAuthenticated()) {
        window.location.href = 'auth/signin.html';
        return;
    }

    loadUserProfile();
});

function loadUserProfile() {
    const user = authManager.getCurrentUser();
    
    document.getElementById('profileContent').innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                ${user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2>${user.first_name} ${user.last_name}</h2>
            <p class="user-email">${user.email}</p>
        </div>
        
        <div class="profile-details">
            <div class="detail-card">
                <h3>Personal Information</h3>
                <div class="detail-item">
                    <label>First Name:</label>
                    <span>${user.first_name}</span>
                </div>
                <div class="detail-item">
                    <label>Last Name:</label>
                    <span>${user.last_name}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${user.email}</span>
                </div>
                <div class="detail-item">
                    <label>Account Status:</label>
                    <span class="status-badge verified">✓ Verified</span>
                </div>
            </div>
        </div>
        
        <div class="profile-actions">
            <button class="btn btn-primary" onclick="editProfile()">Edit Profile</button>
            <button class="btn btn-secondary" onclick="changePassword()">Change Password</button>
        </div>
    `;
}

function editProfile() {
    alert('Edit profile functionality coming soon!');
}

function changePassword() {
    alert('Change password functionality coming soon!');
}