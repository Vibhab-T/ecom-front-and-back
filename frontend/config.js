// ===============================
// API CONFIGURATION & HELPERS
// ===============================

const API_BASE_URL = 'http://localhost:5000/api';

const API_ENDPOINTS = {
	LOGIN: API_BASE_URL + '/auth/login',
	REGISTER: API_BASE_URL + '/auth/register',
	LOGOUT: API_BASE_URL + '/auth/logout',
	ME: API_BASE_URL + '/auth/me',

	BOOKS: API_BASE_URL + '/books',
	BOOK_BY_ID: (id) => API_BASE_URL + '/books/' + id,
	SEARCH_BOOKS: API_BASE_URL + '/books/search',

	CART: API_BASE_URL + '/cart',
	CART_ITEMS: API_BASE_URL + '/cart/items',
	CART_ITEM: (id) => API_BASE_URL + '/cart/items/' + id,

	ORDERS: API_BASE_URL + '/orders',
	ORDER_BY_ID: (id) => API_BASE_URL + '/orders/' + id,

	PAYMENT_INIT: (orderId) => API_BASE_URL + '/payment/esewa/init/' + orderId,
	PAYMENT_STATUS: (orderId) =>
		API_BASE_URL + '/payment/esewa/status/' + orderId,
};

// GENERIC API CALL HELPER (always include cookies)
async function apiCall(url, options = {}) {
	try {
		const res = await fetch(url, {
			...options,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...(options.headers || {}),
			},
		});

		// If response has no JSON body, this may throw — handle gracefully
		let data;
		try {
			data = await res.json();
		} catch {
			data = {};
		}

		if (!res.ok) {
			// prefer message then error
			const message = data.message || data.error || 'Request failed';
			throw new Error(message);
		}

		return data;
	} catch (err) {
		// bubble up, callers will show toast if desired
		throw err;
	}
}

// SIMPLE TOAST (global)
export function showToast(message, type = 'success') {
	// remove any existing toast quickly to avoid stacking too many
	const old = document.querySelector('.app-toast');
	if (old) old.remove();

	const toast = document.createElement('div');
	toast.className = 'app-toast';
	toast.textContent = message;

	// style (minimal inline so you don't need CSS)
	toast.style.position = 'fixed';
	toast.style.top = '20px';
	toast.style.right = '20px';
	toast.style.padding = '10px 16px';
	toast.style.backgroundColor = type === 'success' ? '#27ae60' : '#e74c3c';
	toast.style.color = 'white';
	toast.style.borderRadius = '6px';
	toast.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
	toast.style.zIndex = 10000;
	toast.style.fontFamily =
		'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';

	document.body.appendChild(toast);

	setTimeout(() => {
		toast.style.transition = 'opacity 0.25s';
		toast.style.opacity = '0';
		setTimeout(() => toast.remove(), 250);
	}, 3000);
}

// Currency formatter
function formatCurrency(num) {
	if (num == null || Number.isNaN(Number(num))) return 'Rs. 0.00';
	return 'Rs. ' + Number(num).toFixed(2);
}

// Date formatter
function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}
