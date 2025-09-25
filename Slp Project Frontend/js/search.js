(function () {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    document.getElementById('resultsInfo').textContent = q ? `Results for "${q}"` : 'Showing all products';
    const results = searchProducts(q);

    const container = document.getElementById('resultsGrid');
    container.innerHTML = results.map(p => `
        <div class="card">
        <a href="product.html?id=${p.id}" style="text-decoration:none;color:inherit">
            <img src="${p.img}" alt="${p.title}">
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
})();
