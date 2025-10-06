

// Enhanced product database with local image references
const SAMPLE_PRODUCTS = [
    { id: 'p1', title: 'Wireless Noise-Cancelling Headphones', price: 2999, rating: 4.6, img: 'assets/products/headphone.jpg', category: 'Electronics', desc: 'High-quality over-ear headphones with active noise cancellation.' },
    { id: 'p2', title: 'Smartwatch Series 5', price: 1099, rating: 4.4, img: 'assets/products/smartwatch.jpg', category: 'Wearables', desc: 'Fitness tracking, heart-rate monitoring and notifications.' },
    { id: 'p3', title: 'Stainless Steel Water Bottle 1L', price: 890, rating: 4.8, img: 'assets/products/steel water bottle.jpg', category: 'Home', desc: 'Keeps drinks cold for 24 hours.' },
    { id: 'p4', title: 'Gaming Mechanical Keyboard', price: 2000, rating: 4.3, img: 'assets/products/gaming keyboard.jpg', category: 'Computers', desc: 'RGB, tactile switches and ergonomic layout.' },
    { id: 'p5', title: '4K Action Camera', price: 36000, rating: 4.5, img: 'assets/products/4k action camera.jpg', category: 'Cameras', desc: 'Waterproof and rugged for outdoor use.' },
    { id: 'p6', title: 'Classic Leather Wallet', price: 480, rating: 4.2, img: 'assets/products/leather wallet.jpg', category: 'Fashion', desc: 'Slim profile with RFID blocking.' },
    { id: 'p7', title: 'LED Desk Lamp with USB', price: 350, rating: 4.1, img: 'assets/products/led_Desk_Lamp.jpg', category: 'Home', desc: 'Adjustable brightness and color temperature.' },
    { id: 'p8', title: 'Wireless Charger Pad', price: 1050, rating: 4.0, img: 'assets/products/wireless_charger_pad.jpg', category: 'Accessories', desc: 'Fast charge compatible with Qi devices.' },
    { id: 'p6', title: 'Classic Leather Wallet', price: 280, rating: 4.2, img: 'assets/products/leather wallet.jpg', category: 'Fashion', desc: 'Slim profile with RFID blocking.' },
    { id: 'p7', title: 'LED Desk Lamp with USB', price: 350, rating: 4.1, img: 'assets/products/led_Desk_Lamp.jpg', category: 'Sports', desc: 'Adjustable brightness and color temperature.' },
    { id: 'p8', title: 'Wireless Charger Pad', price: 1100, rating: 4.0, img: 'assets/products/wireless_charger_pad.jpg', category: 'Accessories', desc: 'Fast charge compatible with Qi devices.' }
];

// Category images mapping
const CATEGORY_IMAGES = {
    'Electronics': 'assets/electronics.jpeg',
    'Wearables': 'assets/wearables.jpeg',
    'Home': 'assets/products.jpg',
    'Computers': 'assets/electronics.jpeg',
    'Cameras': 'assets/camera.jpeg',
    'Fashion': 'assets/fashion.jpeg',
    'Accessories': 'assets/accessories.jpeg',
    'Sports': 'assets/sports.jpg'
};

// cart stored in localStorage under key 'amazon_clone_cart'
function getCart() {
    const raw = localStorage.getItem('amazon_clone_cart');
    return raw ? JSON.parse(raw) : {};
}

function saveCart(cart) {
    localStorage.setItem('amazon_clone_cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productId, qty = 1) {
    const cart = getCart();
    cart[productId] = (cart[productId] || 0) + Number(qty);
    saveCart(cart);
    
    // Show confirmation
    const product = findProductById(productId);
    if (product) {
        showToast(`${product.title} added to cart!`);
    }
}

function removeFromCart(productId) {
    const cart = getCart();
    delete cart[productId];
    saveCart(cart);
}

function updateCartItem(productId, qty) {
    const cart = getCart();
    if (qty <= 0) delete cart[productId];
    else cart[productId] = Number(qty);
    saveCart(cart);
}

function updateCartCount() {
    const cart = getCart();
    const count = Object.values(cart).reduce((s, n) => s + Number(n), 0);
    document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}

function findProductById(id) {
    return SAMPLE_PRODUCTS.find(p => p.id === id);
}

function searchProducts(query) {
    if (!query) return SAMPLE_PRODUCTS;
    const q = query.trim().toLowerCase();
    return SAMPLE_PRODUCTS.filter(p => (p.title + ' ' + p.category + ' ' + p.desc).toLowerCase().includes(q));
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            document.body.removeChild(toast);
        }
    }, 3000);
}

// Initialize common functionality
document.addEventListener('DOMContentLoaded', () => {
    const y = new Date().getFullYear();
    document.querySelectorAll('#year').forEach(el => el.textContent = y);
    updateCartCount();

    // Wire search box placeholder behavior
    const sf = document.getElementById('searchForm');
    if (sf) {
        sf.addEventListener('submit', (e) => {
            // Default form works; we keep it
        });
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) document.getElementById('searchInput').value = q;
    }
});
