// Shared utilities: sample product database + cart helpers
const SAMPLE_PRODUCTS = [
    { id: 'p1', title: 'Wireless Noise-Cancelling Headphones', price: 119.99, rating: 4.6, img: 'https://picsum.photos/seed/p1/600/400', category: 'Electronics', desc: 'High-quality over-ear headphones with active noise cancellation.' },
    { id: 'p2', title: 'Smartwatch Series 5', price: 149.99, rating: 4.4, img: 'https://picsum.photos/seed/p2/600/400', category: 'Wearables', desc: 'Fitness tracking, heart-rate monitoring and notifications.' },
    { id: 'p3', title: 'Stainless Steel Water Bottle 1L', price: 19.99, rating: 4.8, img: 'https://picsum.photos/seed/p3/600/400', category: 'Home', desc: 'Keeps drinks cold for 24 hours.' },
    { id: 'p4', title: 'Gaming Mechanical Keyboard', price: 89.99, rating: 4.3, img: 'https://picsum.photos/seed/p4/600/400', category: 'Computers', desc: 'RGB, tactile switches and ergonomic layout.' },
    { id: 'p5', title: '4K Action Camera', price: 199.99, rating: 4.5, img: 'https://picsum.photos/seed/p5/600/400', category: 'Cameras', desc: 'Waterproof and rugged for outdoor use.' },
    { id: 'p6', title: 'Classic Leather Wallet', price: 29.99, rating: 4.2, img: 'https://picsum.photos/seed/p6/600/400', category: 'Fashion', desc: 'Slim profile with RFID blocking.' },
    { id: 'p7', title: 'LED Desk Lamp with USB', price: 34.99, rating: 4.1, img: 'https://picsum.photos/seed/p7/600/400', category: 'Home', desc: 'Adjustable brightness and color temperature.' },
    { id: 'p8', title: 'Wireless Charger Pad', price: 24.99, rating: 4.0, img: 'https://picsum.photos/seed/p8/600/400', category: 'Accessories', desc: 'Fast charge compatible with Qi devices.' }
];

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

// init
document.addEventListener('DOMContentLoaded', () => {
    const y = new Date().getFullYear();
    document.querySelectorAll('#year').forEach(el => el.textContent = y);
    updateCartCount();

    // wire search box placeholder behavior
    const sf = document.getElementById('searchForm');
    if (sf) {
        sf.addEventListener('submit', (e) => {
            // default form works; we keep it
        });
        const params = new URLSearchParams(location.search);
        const q = params.get('q');
        if (q) document.getElementById('searchInput').value = q;
    }
});
