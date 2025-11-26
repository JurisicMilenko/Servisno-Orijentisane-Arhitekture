const API_BASE = window.API_BASE || 'http://localhost:4000';

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[purchasedTours.js] Loading purchased tours...');

const purchasedToursGrid = document.getElementById('purchasedToursGrid');
const message = document.getElementById('message');
const stats = document.getElementById('stats');
const totalPurchased = document.getElementById('totalPurchased');
const totalSpent = document.getElementById('totalSpent');

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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('sr-RS', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function loadPurchasedTours() {
  try {
    if (!purchasedToursGrid) {
      console.error('[purchasedTours.js] purchasedToursGrid not found!');
      return;
    }

    console.log('[purchasedTours.js] Fetching purchased tours from', API_BASE + '/api/purchase/purchased');
    
    const res = await fetch(`${API_BASE}/api/purchase/purchased`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    console.log('[purchasedTours.js] Response status:', res.status);

    if (res.status === 200) {
      const purchases = await res.json();
      console.log('[purchasedTours.js] Purchased tours:', purchases);

      if (Array.isArray(purchases) && purchases.length > 0) {
        // Show stats
        stats.style.display = 'grid';
        totalPurchased.textContent = purchases.length;
        const total = purchases.reduce((sum, p) => sum + (p.price || 0), 0);
        totalSpent.textContent = `${total} RSD`;

        // Render tours
        purchasedToursGrid.innerHTML = purchases.map(purchase => `
          <div class="purchased-tour-card">
            <div class="purchased-tour-header">
              <h3 class="purchased-tour-name">${purchase.tourName}</h3>
              <span class="purchased-badge">✓ Kupljena</span>
            </div>
            
            <div class="purchased-tour-info">
              <div class="info-row">
                <span class="info-label">💰 Cena:</span>
                <span class="info-value">${purchase.price} RSD</span>
              </div>
              <div class="info-row">
                <span class="info-label">🎫 Token:</span>
                <span class="info-value" style="font-size: 0.75rem; word-break: break-all;">${purchase.token.substring(0, 16)}...</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Datum kupovine:</span>
                <span class="info-value">${formatDate(purchase.purchasedAt)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📊 Status:</span>
                <span class="info-value" style="color: ${purchase.status === 'active' ? '#27ae60' : '#e74c3c'};">
                  ${purchase.status === 'active' ? 'Aktivna' : purchase.status}
                </span>
              </div>
            </div>

            <button class="view-tour-btn" onclick="viewTourDetails('${purchase.tourId}')">
              👁️ Pogledaj turu i ključne tačke
            </button>
          </div>
        `).join('');
        
        hideMessage();
      } else {
        renderEmptyState();
        stats.style.display = 'none';
      }
    } else {
      showMessage('Greška pri učitavanju kupljenih tura (Status: ' + res.status + ')', 'error');
      renderEmptyState('Greška pri učitavanju tura');
    }
  } catch (err) {
    console.error('Error loading purchased tours:', err);
    showMessage('Greška: ' + err.message, 'error');
    renderEmptyState('Greška pri učitavanju tura');
  }
}

function renderEmptyState(msg = 'Još niste kupili nijednu turu') {
  purchasedToursGrid.innerHTML = `
    <div class="empty-purchased">
      <div class="empty-icon">🎫</div>
      <h3>${msg}</h3>
      <p style="color: #999; margin-top: 0.5rem;">Vratite se na početnu stranicu i istražite dostupne ture!</p>
      <a href="./home.html" class="back-btn" style="margin-top: 1.5rem;">← Nazad na početnu</a>
    </div>
  `;
}

function viewTourDetails(tourId) {
  window.location.href = `./tourDetails.html?id=${tourId}`;
}

// Load purchased tours on page load
console.log('[purchasedTours.js] Calling loadPurchasedTours()');
loadPurchasedTours();
