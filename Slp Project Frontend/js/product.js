(function () {
    function getQueryParam(name) {
        return new URLSearchParams(location.search).get(name);
    }
    const id = getQueryParam('id') || 'p1';
    const product = findProductById(id) || SAMPLE_PRODUCTS[0];

    // build detail
    const detail = document.getElementById('productDetail');
    if (detail) {
        detail.innerHTML = `
        <div class="card" style="padding:18px">
            <div class="gallery">
            <div class="gallery-main">
                <img id="mainImage" src="${product.img}" alt="${product.title}">
                <div class="gallery-thumbs">
                <img src="${product.img}" class="active" data-src="${product.img}">
                <img src="https://picsum.photos/seed/${product.id}a/600/400" data-src="https://picsum.photos/seed/${product.id}a/600/400">
                <img src="https://picsum.photos/seed/${product.id}b/600/400" data-src="https://picsum.photos/seed/${product.id}b/600/400">
                </div>
            </div>
            <div style="flex:1">
                <h2>${product.title}</h2>
                <div class="muted">${product.category} • ${product.rating} ★</div>
                <p style="margin-top:12px">${product.desc}</p>
                <h3 style="margin-top:10px">$${product.price.toFixed(2)}</h3>
            </div>
            </div>
        </div>
    `;
        // thumb clicks
        detail.querySelectorAll('.gallery-thumbs img').forEach(img => {
            img.addEventListener('click', (e) => {
                document.querySelectorAll('.gallery-thumbs img').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById('mainImage').src = e.currentTarget.dataset.src || e.currentTarget.src;
            });
        });
    }

    // buy box
    const buyBox = document.getElementById('buyBox');
    if (buyBox) {
        buyBox.innerHTML = `
        <div>
            <div class="muted">Price</div>
            <div class="price">$${product.price.toFixed(2)}</div>
            <div class="muted" style="margin-top:6px">Free delivery — mock</div>
            <div class="qty"><label>Qty</label><input id="qtyInput" type="number" min="1" value="1" /></div>
                <div style="display:flex;gap:8px;margin-top:10px">
                <button id="addCartBtn" class="btn btn-primary">Add to cart</button>
                <a href="cart.html" class="btn">Go to cart</a>
                </div>
        </div>
    `;
        document.getElementById('addCartBtn').addEventListener('click', () => {
            const qty = Number(document.getElementById('qtyInput').value) || 1;
            addToCart(product.id, qty);
            document.getElementById('addCartBtn').textContent = 'Added ✓';
            setTimeout(() => document.getElementById('addCartBtn').textContent = 'Add to cart', 1200);
        });
    }
})();
