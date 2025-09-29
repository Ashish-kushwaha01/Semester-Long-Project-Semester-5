// populate categories and product grid on home
(function () {
    function renderCategories() {
        const categories = [...new Set(SAMPLE_PRODUCTS.map(p => p.category))];
        const container = document.getElementById('categoryGrid');
        if (!container) return;
        container.innerHTML = categories.map(cat => `
        <div class="category-card card">
            <img src="https://picsum.photos/seed/${cat.replace(/\s+/g, '')}/400/200" alt="${cat}" />
            <div style="font-weight:700">${cat}</div>
            <div class="muted">Explore ${cat}</div>
        </div>
    `).join('');
    }

    function renderProducts() {
        const container = document.getElementById('productGrid');
        if (!container) return;
            container.innerHTML = SAMPLE_PRODUCTS.map(p => `
        <div class="card">
            <a href="product.html?id=${p.id}" style="text-decoration:none;color:inherit">
            <img loading="lazy" src="${p.img}" alt="${p.title}">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="flex:1"><div style="font-weight:700;margin-top:8px">${p.title}</div><div class="muted">${p.category}</div></div>
                <div style="margin-left:8px;text-align:right"><div class="price">$${p.price.toFixed(2)}</div><div class="muted">${p.rating} ★</div></div>
            </div>
        </a>
            <div style="display:flex;gap:8px;margin-top:10px">
            <button class="btn" onclick="addToCart('${p.id}',1)">Add to cart</button>
            <a class="btn" href="product.html?id=${p.id}">View</a>
            </div>
        </div>
    `).join('');
    }

    renderCategories();
    renderProducts();
})();



