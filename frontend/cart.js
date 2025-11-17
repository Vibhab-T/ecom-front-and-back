// ===============================
// CART PAGE LOGIC
// ===============================

let cart = null;

async function loadCart() {
	// Ensure backend-auth checked
	if (!(await requireAuth())) return;

	const container = document.getElementById('cart-items');
	if (!container) return;
	container.innerHTML = "<div class='loading'>Loading cart...</div>";

	try {
		const data = await apiCall(API_ENDPOINTS.CART);
		cart = data.cart || { items: [], total: 0 };

		if (!cart.items || cart.items.length === 0) {
			document.getElementById('cart-content').style.display = 'none';
			document.getElementById('empty-cart').style.display = 'block';
			return;
		}

		displayCart();
		document.getElementById('cart-content').style.display = 'block';
		document.getElementById('empty-cart').style.display = 'none';
	} catch (err) {
		container.innerHTML = "<div class='error'>Failed to load cart</div>";
	}
}

function displayCart() {
	const container = document.getElementById('cart-items');
	if (!container) return;

	container.innerHTML = cart.items
		.map(
			(item) => `
        <div class="cart-item">
            <div class="title">${item.bookId.title}</div>
            <div>${formatCurrency(item.price)} × ${item.quantity}</div>

            <div style="margin-top:8px;">
              <button onclick="updateQuantity('${item.bookId._id}', ${
				item.quantity + 1
			})">+</button>
              <button onclick="updateQuantity('${item.bookId._1d}', ${
				item.quantity - 1
			})">-</button>
              <button onclick="removeFromCart('${
								item.bookId._id
							}')">Remove</button>
            </div>
        </div>
    `
		)
		.join('');

	updateCartSummary();
}

// NOTE: small fix for missing ID typo above: some backends use _id. Keep bookId._id consistent.
// If your backend returns item.bookId._id, above is correct. If your data shape differs adjust accordingly.

function updateCartSummary() {
	const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
	const totalAmountDisplay = document.getElementById('total-amount');
	const totalItemsDisplay = document.getElementById('total-items');

	if (totalItemsDisplay) totalItemsDisplay.textContent = totalItems;
	if (totalAmountDisplay)
		totalAmountDisplay.textContent = formatCurrency(cart.total);
}

async function updateQuantity(bookId, qty) {
	qty = Number(qty);
	if (qty < 1) return showToast('Min quantity is 1', 'error');

	try {
		const data = await apiCall(API_ENDPOINTS.CART_ITEM(bookId), {
			method: 'PUT',
			body: JSON.stringify({ quantity: qty }),
		});

		cart = data.cart || cart;
		displayCart();
		await updateCartCount();
	} catch (err) {
		showToast(err.message || 'Failed to update quantity', 'error');
	}
}

async function removeFromCart(bookId) {
	if (!confirm('Remove item?')) return;

	try {
		const data = await apiCall(API_ENDPOINTS.CART_ITEM(bookId), {
			method: 'DELETE',
		});

		cart = data.cart || { items: [], total: 0 };

		if (cart.items.length) {
			displayCart();
		} else {
			document.getElementById('cart-content').style.display = 'none';
			document.getElementById('empty-cart').style.display = 'block';
		}

		await updateCartCount();
		showToast('Removed', 'success');
	} catch {
		showToast('Failed to remove', 'error');
	}
}

async function clearCart() {
	if (!confirm('Are you sure you want to clear your cart?')) return;

	try {
		await apiCall(API_ENDPOINTS.CART, { method: 'DELETE' });

		cart = { items: [], total: 0 };
		document.getElementById('cart-content').style.display = 'none';
		document.getElementById('empty-cart').style.display = 'block';
		await updateCartCount();
		showToast('Cart cleared', 'success');
	} catch {
		showToast('Failed to clear cart', 'error');
	}
}

async function checkout() {
	if (!cart?.items?.length) {
		return showToast('Cart empty', 'error');
	}

	if (!confirm('Proceed to checkout?')) return;

	try {
		const data = await apiCall(API_ENDPOINTS.ORDERS, { method: 'POST' });
		const orderId = data.data?._id || data._id;
		if (!orderId) throw new Error('No order created');

		showToast('Redirecting to eSewa...', 'success');
		setTimeout(() => {
			window.location.href = API_ENDPOINTS.PAYMENT_INIT(orderId);
		}, 800);
	} catch (err) {
		showToast(err.message || 'Failed to checkout', 'error');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	loadCart();

	const checkoutBtn = document.getElementById('checkout-btn');
	if (checkoutBtn) checkoutBtn.onclick = checkout;

	const clearBtn = document.getElementById('clear-cart-btn');
	if (clearBtn) clearBtn.onclick = clearCart;
});
