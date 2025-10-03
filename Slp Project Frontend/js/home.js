


// Render categories on home page
function renderCategories() {
    // const categories = [...new Set(SAMPLE_PRODUCTS.map(p => p.category))];

        const productCategories = [...new Set(SAMPLE_PRODUCTS.map(p => p.category))];
    
    
    const allCategories = Object.keys(CATEGORY_IMAGES);
    
    // Use all categories from CATEGORY_IMAGES
    const categories = [...new Set([...productCategories, ...allCategories])];


    const container = document.getElementById('categoryGrid');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="category-card">
            <img src="${CATEGORY_IMAGES[cat] || 'assets/default-category.jpg'}" alt="${cat}" />
            <h3>${cat}</h3>
            <div class="muted">Explore ${cat}</div>
        </div>
    `).join('');
}

// Render products on home page
function renderProducts() {
    const container = document.getElementById('productGrid');
    if (!container) return;
    
    container.innerHTML = SAMPLE_PRODUCTS.map(p => `
        <div class="card">
            <a href="product.html?id=${p.id}" style="text-decoration:none;color:inherit">
                <img loading="lazy" src="${p.img}" alt="${p.title}">
                <div class="card-content">
                    <div class="card-title">${p.title}</div>
                    <div class="card-category">${p.category}</div>
                    <div class="card-footer">
                        <div class="price">₹${p.price.toLocaleString('en-IN')}</div>
                        <div class="rating">${p.rating} ★</div>
                    </div>
                </div>
            </a>
            <div class="card-actions">
                <button class="btn btn-primary" onclick="addToCart('${p.id}',1)">Add to cart</button>
                <a class="btn btn-secondary" href="product.html?id=${p.id}">Buy</a>
            </div>
        </div>
    `).join('');
}

// Initialize home page
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderProducts();
});