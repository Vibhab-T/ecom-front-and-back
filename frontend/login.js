// ===============================
// LOGIN / REGISTER PAGE LOGIC
// ===============================
import { showToast } from './config';
let isLoginMode = true;

document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('login-form');
	const registerForm = document.getElementById('register-form');
	const toggleLink = document.getElementById('toggle-link');
	const authTitle = document.getElementById('auth-title');
	const toggleText = document.getElementById('toggle-text');

	if (loginForm) {
		loginForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const email = document.getElementById('login-email').value.trim();
			const password = document.getElementById('login-password').value;
			const errorDiv = document.getElementById('login-error');
			errorDiv.textContent = '';

			try {
				await login(email, password);
				// redirect handled by login()
			} catch (err) {
				errorDiv.textContent = err.message || 'Login failed';
			}
		});
	}

	if (registerForm) {
		registerForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const name = document.getElementById('register-name').value.trim();
			const email = document.getElementById('register-email').value.trim();
			const password = document.getElementById('register-password').value;
			const errorDiv = document.getElementById('register-error');
			errorDiv.textContent = '';

			if (password.length < 6) {
				errorDiv.textContent = 'Password must be at least 6 characters';
				return;
			}

			try {
				await register(name, email, password);
			} catch (err) {
				errorDiv.textContent = err.message || 'Registration failed';
			}
		});
	}

	if (toggleLink) {
		toggleLink.addEventListener('click', (e) => {
			e.preventDefault();
			isLoginMode = !isLoginMode;

			if (isLoginMode) {
				loginForm.style.display = 'block';
				registerForm.style.display = 'none';
				authTitle.textContent = 'Login';
				toggleText.innerHTML =
					"Don't have an account? <a href='#' id='toggle-link'>Register</a>";
			} else {
				loginForm.style.display = 'none';
				registerForm.style.display = 'block';
				authTitle.textContent = 'Register';
				toggleText.innerHTML =
					"Already have an account? <a href='#' id='toggle-link'>Login</a>";
			}

			// re-bind new link inside toggleText
			const newToggle = document.getElementById('toggle-link');
			if (newToggle)
				newToggle.addEventListener('click', (ev) => {
					ev.preventDefault();
					toggleLink.click();
				});
		});
	}

	// If already logged in, redirect home
	if (typeof currentUser !== 'undefined' && currentUser) {
		showToast('You are already logged in', 'success');
		setTimeout(() => {
			window.location.href = 'index.html';
		}, 700);
	}
});
