(function () {
    function renderCart() {
        const cart = getCart();
        const ids = Object.keys(cart);
        const container = document.getElementById('cartContainer');
        const summary = document.getElementById('cartSummary');
        if (ids.length === 0) {
            container.innerHTML = '<div class="card">Your cart is empty. <a href="index.html">Continue shopping</a></div>';
            summary.innerHTML = '';
            return;
        }

        container.innerHTML = ids.map(id => {
            const product = findProductById(id);
            const qty = cart[id];
            const subtotal = (product.price * qty).toFixed(2);
            return `
            <div class="cart-item">
            <img src="${product.img}" alt="${product.title}" />
            <div style="flex:1">
                <div style="font-weight:700">${product.title}</div>
                <div class="muted">${product.category}</div>
                <div style="margin-top:8px">$${product.price.toFixed(2)} x <input onchange="onQtyChange('${id}', this.value)" type="number" min="0" value="${qty}" style="width:60px" /></div>
            </div>
            <div style="text-align:right">
                <div class="price">$${subtotal}</div>
                <button class="btn" onclick="onRemove('${id}')">Remove</button>
            </div>
            </div>
        `;
        }).join('');

        const total = ids.reduce((s, id) => s + (findProductById(id).price * cart[id]), 0);
        summary.innerHTML = `
        <div class="card cart-summary">
            <div style="display:flex;justify-content:space-between"><div>Subtotal</div><div class="price">$${total.toFixed(2)}</div></div>
            <div class="muted" style="margin-top:8px">Shipping & taxes calculated at checkout</div>
            <div style="margin-top:12px"><a class="btn btn-primary" href="checkout.html">Proceed to checkout</a></div>
        </div>
    `;
    }

    window.onQtyChange = function (id, value) {
        value = Number(value);
        updateCartItem(id, value);
        renderCart();
    };
    window.onRemove = function (id) {
        removeFromCart(id);
        renderCart();
    };

    renderCart();
})();
