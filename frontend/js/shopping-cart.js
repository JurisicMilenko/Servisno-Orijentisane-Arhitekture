const API_BASE = window.API_BASE || 'http://localhost:4000';

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[shopping-cart.js] Loading cart...');

const cartContent = document.getElementById('cartContent');
const message = document.getElementById('message');
const clearCartBtn = document.getElementById('clearCartBtn');

let currentCart = null;

function showMessage(msg, type = 'info') {
  if (message) {
    message.textContent = msg;
    message.className = `message ${type}`;
    message.style.display = 'block';
    setTimeout(() => {
      message.style.display = 'none';
    }, 5000);
  }
}

function hideMessage() {
  if (message) {
    message.style.display = 'none';
  }
}

async function loadCart() {
  try {
    const res = await fetch(`${API_BASE}/api/purchase/cart`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 200) {
      currentCart = await res.json();
      console.log('[shopping-cart.js] Cart loaded:', currentCart);
      renderCart();
    } else {
      showMessage('Greška pri učitavanju korpe', 'error');
      renderEmptyCart('Greška pri učitavanju korpe');
    }
  } catch (err) {
    console.error('Error loading cart:', err);
    showMessage('Greška: ' + err.message, 'error');
    renderEmptyCart('Greška pri učitavanju korpe');
  }
}

function renderCart() {
  if (!currentCart || currentCart.items.length === 0) {
    renderEmptyCart();
    clearCartBtn.style.display = 'none';
    return;
  }

  clearCartBtn.style.display = 'inline-block';

  const cartHTML = `
    <div class="cart-items">
      ${currentCart.items.map(item => `
        <div class="cart-item" data-tour-id="${item.tourId}">
          <div class="item-info">
            <div class="item-name">${item.tourName}</div>
            <div class="item-price">${item.price} RSD</div>
          </div>
          <button class="remove-btn" onclick="removeFromCart('${item.tourId}')">
            🗑️ Ukloni
          </button>
        </div>
      `).join('')}
    </div>
    
    <div class="cart-summary">
      <div class="summary-row">
        <span>Ukupno stavki:</span>
        <span>${currentCart.items.length}</span>
      </div>
      <div class="summary-row summary-total">
        <span>Ukupna cena:</span>
        <span>${currentCart.totalPrice} RSD</span>
      </div>
      
      <div class="cart-actions">
        <button class="checkout-btn" onclick="checkout()">
          ✅ Kupi sve ture (${currentCart.items.length})
        </button>
      </div>
    </div>
  `;

  cartContent.innerHTML = cartHTML;
  hideMessage();
}

function renderEmptyCart(msg = 'Korpa je prazna') {
  cartContent.innerHTML = `
    <div class="empty-cart">
      <div class="empty-cart-icon">🛒</div>
      <p>${msg}</p>
      <a href="./home.html" class="back-btn">Vrati se na početnu stranicu</a>
    </div>
  `;
}

async function removeFromCart(tourId) {
  try {
    const res = await fetch(`${API_BASE}/api/purchase/cart/${tourId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 200) {
      showMessage('Tura uklonjena iz korpe', 'success');
      await loadCart();
    } else {
      const error = await res.json();
      showMessage(error.error || 'Greška pri uklanjanju', 'error');
    }
  } catch (err) {
    console.error('Error removing from cart:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

async function clearCart() {
  if (!confirm('Da li ste sigurni da želite da ispraznite korpu?')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/purchase/cart`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 200) {
      showMessage('Korpa ispražnjena', 'success');
      await loadCart();
    } else {
      const error = await res.json();
      showMessage(error.error || 'Greška', 'error');
    }
  } catch (err) {
    console.error('Error clearing cart:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

async function checkout() {
  if (!currentCart || currentCart.items.length === 0) {
    showMessage('Korpa je prazna', 'error');
    return;
  }

  if (!confirm(`Da li želite da kupite ${currentCart.items.length} turu/e za ${currentCart.totalPrice} RSD?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/purchase/checkout`, {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 200) {
      const result = await res.json();
      showMessage(`Uspešno ste kupili ${result.purchasedCount} turu/e! 🎉`, 'success');
      setTimeout(() => {
        window.location.href = './home.html';
      }, 2000);
    } else {
      const error = await res.json();
      showMessage(error.error || 'Greška pri kupovini', 'error');
    }
  } catch (err) {
    console.error('Error during checkout:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

// Event listeners
clearCartBtn?.addEventListener('click', clearCart);

// Load cart on page load
loadCart();
