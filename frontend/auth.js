// ===============================
// AUTH MANAGEMENT (frontend)
// ===============================

let currentUser = null;

// Check if logged-in by asking backend
async function checkAuth() {
	try {
		const data = await apiCall(API_ENDPOINTS.ME);
		currentUser = data.user || null;
		updateAuthUI();
		return true;
	} catch {
		currentUser = null;
		updateAuthUI();
		return false;
	}
}

// Update Navbar auth link
function updateAuthUI() {
	const authLink = document.getElementById('auth-link');
	if (!authLink) return;

	if (currentUser) {
		authLink.textContent = 'Logout';
		authLink.href = '#';
		authLink.onclick = (e) => {
			e.preventDefault();
			logout();
		};
	} else {
		authLink.textContent = 'Login';
		authLink.href = 'login.html';
		authLink.onclick = null;
	}
}

// Login (calls backend, backend should set httpOnly cookie and return user)
async function login(email, password) {
	const data = await apiCall(API_ENDPOINTS.LOGIN, {
		method: 'POST',
		body: JSON.stringify({ email, password }),
	});

	// backend should include user in response; if not, we'll call /me
	if (data.user) {
		currentUser = data.user;
	} else {
		// fetch user from /me to be safe
		try {
			const me = await apiCall(API_ENDPOINTS.ME);
			currentUser = me.user || null;
		} catch {
			currentUser = null;
		}
	}

	updateAuthUI();
	showToast('Login successful!', 'success');

	// redirect quickly
	setTimeout(() => {
		window.location.href = 'index.html';
	}, 700);
}

// Register
async function register(name, email, password) {
	const data = await apiCall(API_ENDPOINTS.REGISTER, {
		method: 'POST',
		body: JSON.stringify({ name, email, password }),
	});

	if (data.user) {
		currentUser = data.user;
	} else {
		try {
			const me = await apiCall(API_ENDPOINTS.ME);
			currentUser = me.user || null;
		} catch {
			currentUser = null;
		}
	}

	updateAuthUI();
	showToast('Registration successful!', 'success');

	setTimeout(() => {
		window.location.href = 'index.html';
	}, 700);
}

// Logout
async function logout() {
	try {
		await apiCall(API_ENDPOINTS.LOGOUT, { method: 'POST' });
	} catch {
		// even if logout endpoint fails, clear client state
	}

	currentUser = null;
	updateAuthUI();
	showToast('Logged out', 'success');

	setTimeout(() => {
		window.location.href = 'index.html';
	}, 500);
}

// REQUIRE AUTH (the important fix)
// This asks backend directly (so it's safe across page refreshes)
async function requireAuth() {
	try {
		const data = await apiCall(API_ENDPOINTS.ME);
		currentUser = data.user || null;
		updateAuthUI();
		return true;
	} catch (err) {
		currentUser = null;
		updateAuthUI();
		showToast('Please login to continue', 'error');
		setTimeout(() => (window.location.href = 'login.html'), 800);
		return false;
	}
}

// Update cart count (reads from backend)
async function updateCartCount() {
	try {
		const data = await apiCall(API_ENDPOINTS.CART);
		const count = data.cart?.items?.length || 0;
		document.querySelectorAll('#cart-count').forEach((el) => {
			el.textContent = count;
		});
	} catch {
		// silent
	}
}

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', async () => {
	await checkAuth();
	if (currentUser) updateCartCount();
});
