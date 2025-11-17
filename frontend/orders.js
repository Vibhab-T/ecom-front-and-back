// ===============================
// ORDERS PAGE LOGIC
// ===============================

async function loadOrders() {
	if (!(await requireAuth())) return;

	try {
		const ordersList = document.getElementById('orders-list');
		if (!ordersList) return;
		ordersList.innerHTML = '<div class="loading">Loading orders...</div>';

		const data = await apiCall(API_ENDPOINTS.ORDERS);
		const orders = data.data || [];

		if (orders.length > 0) {
			displayOrders(orders);
			document.getElementById('orders-list').style.display = 'block';
			document.getElementById('no-orders').style.display = 'none';
		} else {
			document.getElementById('orders-list').style.display = 'none';
			document.getElementById('no-orders').style.display = 'block';
		}
	} catch (err) {
		console.error(err);
		const ordersList = document.getElementById('orders-list');
		if (ordersList)
			ordersList.innerHTML =
				'<div class="error">Failed to load orders. Please try again.</div>';
	}
}

function displayOrders(orders) {
	const ordersList = document.getElementById('orders-list');
	if (!ordersList) return;

	ordersList.innerHTML = orders
		.map(
			(order) => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order._id.slice(-8)}</div>
                    <div style="color: #7f8c8d; font-size: 14px; margin-top: 5px;">
                        ${formatDate(order.createdAt)}
                    </div>
                </div>
                <div>
                    <span class="order-status ${
											order.status
										}">${order.status.toUpperCase()}</span>
                </div>
            </div>
            
            <div class="order-items">
                ${order.items
									.map(
										(item) => `
                    <div class="order-item">
                        <div class="order-item-info">
                            <div style="font-weight: bold;">${
															item.bookId?.title || 'Book'
														}</div>
                            <div style="color: #7f8c8d;">Quantity: ${
															item.quantity
														}</div>
                            <div style="color: #27ae60; font-weight: bold;">${formatCurrency(
															item.price
														)} each</div>
                        </div>
                        <div style="font-weight: bold;">
                            ${formatCurrency(item.price * item.quantity)}
                        </div>
                    </div>
                `
									)
									.join('')}
            </div>
            
            <div class="order-total">
                Total: ${formatCurrency(order.totalAmount)}
            </div>

            ${
							order.paymentRefId
								? `<div style="margin-top:10px;color:#7f8c8d;font-size:14px;">Payment Reference: ${order.paymentRefId}</div>`
								: ''
						}
            
            ${
							order.status === 'pending'
								? `
                <div class="order-actions">
                    <button class="btn btn-primary btn-small" onclick="payOrder('${order._id}')">Pay Now</button>
                    <button class="btn btn-secondary btn-small" onclick="checkPaymentStatus('${order._id}')">Check Status</button>
                </div>
            `
								: ''
						}
        </div>
    `
		)
		.join('');
}

function payOrder(orderId) {
	if (confirm('Proceed to payment?')) {
		window.location.href = API_ENDPOINTS.PAYMENT_INIT(orderId);
	}
}

async function checkPaymentStatus(orderId) {
	try {
		showToast('Checking payment status...', 'success');
		const data = await apiCall(API_ENDPOINTS.PAYMENT_STATUS(orderId));
		showToast(
			`Payment status: ${data.data?.paymentStatus || 'unknown'}`,
			'success'
		);
		setTimeout(() => loadOrders(), 1200);
	} catch {
		showToast('Failed to check payment status', 'error');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	loadOrders();
});
