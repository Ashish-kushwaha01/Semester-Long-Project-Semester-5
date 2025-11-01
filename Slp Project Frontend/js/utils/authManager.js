// js/utils/authManager.js

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthState();
        window.addEventListener('storage', this.handleStorageEvent.bind(this));
    }

    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('currentUser');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            return true;
        }
        return false;
    }

    getCurrentUser() {
        if (!this.currentUser && this.isAuthenticated()) {
            this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        }
        return this.currentUser;
    }

    updateUIBasedOnAuth() {
        const navActions = document.querySelector('.nav-actions');
        
        if (!navActions) return;

        if (this.isAuthenticated()) {
            const user = this.getCurrentUser();
            navActions.innerHTML = this.getLoggedInUI(user);
            this.initDropdown();
        } else {
            navActions.innerHTML = this.getLoggedOutUI();
        }
    }

    getLoggedOutUI() {
        return `
            <a href="cart.html" class="nav-item">Cart <span id="cartCount" class="cart-count">0</span></a>
            <a href="login/signIn.html" class="nav-item">Sign in</a>
        `;
    }

    getLoggedInUI(user) {
        const userInitial = user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U';
        
        return `
            <a href="cart.html" class="nav-item">Cart <span id="cartCount" class="cart-count">0</span></a>
            <div class="user-dropdown" id="userDropdown">
                <div class="user-avatar">${userInitial}</div>
                <span class="user-name">Hi, ${user.first_name}</span>
                <div class="dropdown-menu" id="dropdownMenu">
                    <a href="profile.html" class="dropdown-item">My Profile</a>
                    <a href="#" class="dropdown-item">My Orders</a>
                    <a href="#" class="dropdown-item">Settings</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item" id="logoutBtn">Logout</a>
                </div>
            </div>
        `;
    }

    initDropdown() {
        const dropdown = document.getElementById('userDropdown');
        const menu = document.getElementById('dropdownMenu');
        const logoutBtn = document.getElementById('logoutBtn');

        if (dropdown && menu) {
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                menu.classList.remove('show');
            });

            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        }
    }

    handleLogin(userData, tokens) {
        localStorage.setItem('accessToken', tokens.access);
        localStorage.setItem('refreshToken', tokens.refresh);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        this.currentUser = userData;
        this.updateUIBasedOnAuth();
        
        this.showSuccessMessage('Login successful!');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00b341;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    logout() {
        this.callLogoutAPI();
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        
        this.currentUser = null;
        this.updateUIBasedOnAuth();
        
        this.showSuccessMessage('Logged out successfully!');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    async callLogoutAPI() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await fetch('http://127.0.0.1:8000/api/account/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        }
    }

    checkAuthState() {
        this.updateUIBasedOnAuth();
    }

    handleStorageEvent(e) {
        if (e.key === 'accessToken' || e.key === 'currentUser') {
            this.checkAuthState();
        }
    }
}

const authManager = new AuthManager();