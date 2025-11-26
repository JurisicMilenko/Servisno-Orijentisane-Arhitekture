
const API_BASE = window.API_BASE || 'http://localhost:4000';
const TOURS_BASE = window.TOURS_BASE || 'http://localhost:4000';


const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[home.js] Token found, loading page...');

// Navigation
const userDetailsBtn = document.getElementById('userDetailsBtn');
const myToursBtn = document.getElementById('myToursBtn');
const createTourBtn = document.getElementById('createTourBtn');
const purchasedToursBtn = document.getElementById('purchasedToursBtn');
const adminBtn = document.getElementById('adminBtn');
const suggestedFollowersBtn = document.getElementById('suggestedFollowersBtn');
const cartBtn = document.getElementById('cartBtn');
const cartBadge = document.getElementById('cartBadge');
const logoutBtn = document.getElementById('logoutBtn');

// Cart sidebar elements
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartSidebarContent = document.getElementById('cartSidebarContent');

console.log('[home.js] userDetailsBtn:', userDetailsBtn);
console.log('[home.js] logoutBtn:', logoutBtn);

if (!userDetailsBtn || !logoutBtn) {
  console.error('[home.js] ERROR: Navigation buttons not found!');
}

// Check if user is admin and show admin button
async function checkAdminRole() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.status === 200) {
      const user = await res.json();
      console.log('[home.js] User data:', user);
      console.log('[home.js] User role:', user.role);
      console.log('[home.js] createTourBtn element:', createTourBtn);
      
      if (user.role === 'admin' && adminBtn) {
        adminBtn.style.display = 'inline-block';
      }
      if (user.role === 'guide' && createTourBtn) {
        console.log('[home.js] Showing Create Tour button for guide');
        createTourBtn.style.display = 'inline-block';
      }
      if (user.role === 'guide' && myToursBtn) {
        console.log('[home.js] Showing My Tours button for guide');
        myToursBtn.style.display = 'inline-block';
      }
    }
  } catch (err) {
    console.error('[home.js] Error checking admin role:', err);
  }
}

// Load cart count
async function loadCartCount() {
  try {
    const res = await fetch(`${API_BASE}/api/purchase/cart`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.status === 200) {
      const cart = await res.json();
      updateCartBadge(cart.items.length);
    }
  } catch (err) {
    console.error('[home.js] Error loading cart count:', err);
  }
}

function updateCartBadge(count) {
  if (cartBadge) {
    if (count > 0) {
      cartBadge.textContent = count;
      cartBadge.style.display = 'flex';
    } else {
      cartBadge.style.display = 'none';
    }
  }
}

checkAdminRole();
loadCartCount();

// Load purchased tours
let purchasedTourIds = [];

async function loadPurchasedTours() {
  try {
    const res = await fetch(`${API_BASE}/api/purchase/purchased`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.status === 200) {
      const purchases = await res.json();
      purchasedTourIds = purchases.map(p => p.tourId);
      console.log('[home.js] Purchased tour IDs:', purchasedTourIds);
    }
  } catch (err) {
    console.error('[home.js] Error loading purchased tours:', err);
  }
}

loadPurchasedTours();

userDetailsBtn?.addEventListener('click', () => {
  console.log('[home.js] Moj Profil clicked');
  const ts = Date.now();
  window.location.href = `./userDetails.html?v=${ts}`;
});

myToursBtn?.addEventListener('click', () => {
  console.log('[home.js] Moje Ture clicked');
  const ts = Date.now();
  window.location.href = `./myTours.html?v=${ts}`;
});

createTourBtn?.addEventListener('click', () => {
  console.log('[home.js] Kreiraj Turu clicked');
  const ts = Date.now();
  window.location.href = `./createTour.html?v=${ts}`;
});

purchasedToursBtn?.addEventListener('click', () => {
  console.log('[home.js] Kupljene Ture clicked');
  const ts = Date.now();
  window.location.href = `./purchasedTours.html?v=${ts}`;
});

createBlogBtn?.addEventListener('click', () => {
  console.log('[home.js] Kreiraj Blog clicked');
  const ts = Date.now();
  window.location.href = `./createBlog.html?v=${ts}`;
});

viewBlogBtn?.addEventListener('click', () => {
  console.log('[home.js] Pregledaj Blog clicked');
  const ts = Date.now();
  window.location.href = `./blogView.html?v=${ts}`;
});

posSimBtn?.addEventListener('click', () => {
  console.log('[home.js] Simulator Pozicije clicked');
  const ts = Date.now();
  window.location.href = `./positionSimulator.html?v=${ts}`;
});

adminBtn?.addEventListener('click', () => {
  console.log('[home.js] Admin Panel clicked');
  const ts = Date.now();
  window.location.href = `./adminUserOverview.html?v=${ts}`;
});

suggestedFollowersBtn?.addEventListener('click', () => {
  window.location.href = `./suggestedFollowers.html?v=${Date.now()}`;
});

cartBtn?.addEventListener('click', () => {
  console.log('[home.js] Cart clicked - opening sidebar');
  openCartSidebar();
});

closeCartBtn?.addEventListener('click', () => {
  closeCartSidebar();
});

cartOverlay?.addEventListener('click', () => {
  closeCartSidebar();
});

logoutBtn?.addEventListener('click', () => {
  console.log('[home.js] Logout clicked');
  localStorage.removeItem('token');
  const ts = Date.now();
  window.location.href = `./index.html?v=${ts}`;
});


// Tours
const toursGrid = document.getElementById('toursGrid');
const message = document.getElementById('message');

function showMessage(msg, type = 'info') {
  if (message) {
    message.textContent = msg;
    message.className = `message ${type}`;
    message.style.display = 'block';
  }
}

function hideMessage() {
  if (message) {
    message.style.display = 'none';
  }
}

function getDifficultyText(difficulty) {
  const map = {
    'easy': 'Lako',
    'medium': 'Srednje',
    'hard': 'Teško'
  };
  return map[difficulty] || difficulty;
}

async function loadPublishedTours() {
  try {
    if (!toursGrid) {
      console.error('[home.js] toursGrid not found!');
      return;
    }

    console.log('[home.js] Loading published tours from', TOURS_BASE + '/api/tours?status=published');
    
    const res = await fetch(`${TOURS_BASE}/api/tours?status=published`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    console.log('[home.js] Tours response status:', res.status);

    if (res.status === 200) {
      const tours = await res.json();
      console.log('[home.js] Tours data:', tours);

      if (Array.isArray(tours) && tours.length > 0) {
        toursGrid.innerHTML = tours.map(tour => {
          const tourId = tour._id || tour.id;
          const isPurchased = purchasedTourIds.includes(tourId);
          
          return `
          <div class="tour-card">
            <div class="tour-card-header">
              <h3>${tour.name}</h3>
              <span class="status-badge status-published">Objavljena</span>
              ${isPurchased ? '<span class="status-badge" style="background: #27ae60; margin-left: 0.5rem;">✓ Kupljena</span>' : ''}
            </div>
            <div class="tour-card-body" onclick="viewTourDetails('${tourId}')">
              <p class="tour-description">${tour.description || 'Nema opisa'}</p>
              <div class="tour-meta">
                <span class="tour-meta-item">
                  <strong>Težina:</strong> ${getDifficultyText(tour.difficulty)}
                </span>
                <span class="tour-meta-item">
                  <strong>Cena:</strong> ${tour.price || 0} RSD
                </span>
              </div>
              ${tour.tags && tour.tags.length > 0 ? `
                <div class="tour-tags">
                  ${tour.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
              ` : ''}
              <div class="tour-stats">
                <span>📍 ${tour.keyPoints?.length || 0} kontrolnih tačaka</span>
                ${tour.duration && tour.duration > 0 ? `<span>⏱️ ${tour.duration}h</span>` : ''}
                ${tour.distance && tour.distance > 0 ? `<span>📏 ${tour.distance}km</span>` : ''}
              </div>
              ${tour.keyPoints && tour.keyPoints.length > 0 ? `
                <div style="background: #f0f7ff; padding: 0.75rem; border-radius: 6px; margin-top: 0.75rem; border-left: 3px solid #667eea;">
                  <strong style="color: #667eea; font-size: 0.9rem;">Prva kontrolna tačka:</strong>
                  <p style="margin: 0.25rem 0 0 0; color: #333; font-size: 0.9rem;">📍 ${tour.keyPoints[0].name}</p>
                </div>
              ` : ''}
            </div>
            ${!isPurchased ? `
            <div style="padding: 0.75rem; border-top: 1px solid #eee;">
              <button onclick="addToCart(event, '${tourId}', '${tour.name.replace(/'/g, "\\'")}', ${tour.price || 0})" 
                      style="width: 100%; background: #27ae60; color: white; border: none; padding: 0.75rem; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                🛒 Dodaj u korpu
              </button>
            </div>
            ` : `
            <div style="padding: 0.75rem; border-top: 1px solid #eee; text-align: center;">
              <p style="color: #27ae60; font-weight: 600; margin: 0;">✓ Već ste kupili ovu turu</p>
            </div>
            `}
          </div>
        `;}).join('');
      } else {
        toursGrid.innerHTML = '<p style="text-align: center; color: #999;">Trenutno nema objavljenih tura</p>';
      }
      hideMessage();
    } else {
      showMessage('Greška pri učitavanju tura (Status: ' + res.status + ')', 'error');
      toursGrid.innerHTML = '<p style="text-align: center; color: red;">Greška pri učitavanju tura</p>';
    }
  } catch (err) {
    console.error('Error loading tours:', err);
    showMessage('Greška: ' + err.message, 'error');
    if (toursGrid) {
      toursGrid.innerHTML = '<p style="text-align: center; color: red;">Greška: ' + err.message + '</p>';
    }
  }
}

function viewTourDetails(tourId) {
  window.location.href = `./tourDetails.html?id=${tourId}`;
}

// Add tour to cart
async function addToCart(event, tourId, tourName, price) {
  event.stopPropagation(); // Prevent card click
  
  try {
    const res = await fetch(`${API_BASE}/api/purchase/cart`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tourId,
        tourName,
        price
      })
    });

    console.log('[addToCart] Response status:', res.status);
    console.log('[addToCart] Response headers:', res.headers);

    if (res.status === 200) {
      const data = await res.json();
      showMessage('Tura dodata u korpu! 🎉', 'success');
      await loadCartCount(); // Refresh cart badge
      // If sidebar is open, refresh it
      if (cartSidebar?.classList.contains('open')) {
        await loadCartSidebar();
      }
    } else {
      const text = await res.text();
      console.error('[addToCart] Error response:', text);
      try {
        const error = JSON.parse(text);
        if (error.error === 'Tour already in cart') {
          showMessage('Tura je već u korpi', 'error');
        } else if (error.error === 'Tour already purchased') {
          showMessage('Već ste kupili ovu turu', 'error');
        } else {
          showMessage(error.error || 'Greška pri dodavanju u korpu', 'error');
        }
      } catch (parseError) {
        showMessage('Greška servera: ' + text, 'error');
      }
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

// Cart sidebar functions
function openCartSidebar() {
  cartSidebar?.classList.add('open');
  cartOverlay?.classList.add('open');
  loadCartSidebar();
}

function closeCartSidebar() {
  cartSidebar?.classList.remove('open');
  cartOverlay?.classList.remove('open');
}

async function loadCartSidebar() {
  try {
    if (!cartSidebarContent) return;
    
    cartSidebarContent.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Učitavanje...</p>';
    
    const res = await fetch(`${API_BASE}/api/purchase/cart`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 200) {
      const cart = await res.json();
      renderCartSidebar(cart);
    } else {
      cartSidebarContent.innerHTML = '<p style="text-align: center; color: red; padding: 2rem;">Greška pri učitavanju korpe</p>';
    }
  } catch (err) {
    console.error('Error loading cart sidebar:', err);
    cartSidebarContent.innerHTML = '<p style="text-align: center; color: red; padding: 2rem;">Greška: ' + err.message + '</p>';
  }
}

function renderCartSidebar(cart) {
  if (!cart || cart.items.length === 0) {
    cartSidebarContent.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Korpa je prazna</p>
        <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">Dodajte ture da biste nastavili</p>
      </div>
    `;
    return;
  }

  const cartHTML = `
    <div>
      ${cart.items.map(item => `
        <div class="sidebar-cart-item">
          <div class="sidebar-item-header">
            <div class="sidebar-item-name">${item.tourName}</div>
            <div class="sidebar-item-price">${item.price} RSD</div>
          </div>
          <div class="sidebar-item-actions">
            <button class="sidebar-remove-btn" onclick="removeFromCartSidebar('${item.tourId}')">
              🗑️ Ukloni
            </button>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="cart-summary-sidebar">
      <div class="summary-row-sidebar">
        <span>Ukupno stavki:</span>
        <span>${cart.items.length}</span>
      </div>
      <div class="summary-row-sidebar summary-total-sidebar">
        <span>Ukupna cena:</span>
        <span>${cart.totalPrice} RSD</span>
      </div>
      
      <div class="cart-actions-sidebar">
        <button class="checkout-btn-sidebar" onclick="checkoutFromSidebar()">
          ✅ Kupi sve ture (${cart.items.length})
        </button>
        <button class="clear-cart-btn-sidebar" onclick="clearCartSidebar()">
          Isprazni korpu
        </button>
      </div>
    </div>
  `;

  cartSidebarContent.innerHTML = cartHTML;
}

async function removeFromCartSidebar(tourId) {
  try {
    const res = await fetch(`${API_BASE}/api/purchase/cart/${tourId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 200) {
      showMessage('Tura uklonjena iz korpe', 'success');
      await loadCartCount();
      await loadCartSidebar();
    } else {
      const error = await res.json();
      showMessage(error.error || 'Greška pri uklanjanju', 'error');
    }
  } catch (err) {
    console.error('Error removing from cart:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

async function clearCartSidebar() {
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
      await loadCartCount();
      await loadCartSidebar();
    } else {
      const error = await res.json();
      showMessage(error.error || 'Greška', 'error');
    }
  } catch (err) {
    console.error('Error clearing cart:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

async function checkoutFromSidebar() {
  try {
    const res = await fetch(`${API_BASE}/api/purchase/cart`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 200) {
      const cart = await res.json();
      
      if (!cart || cart.items.length === 0) {
        showMessage('Korpa je prazna', 'error');
        return;
      }

      if (!confirm(`Da li želite da kupite ${cart.items.length} turu/e za ${cart.totalPrice} RSD?`)) {
        return;
      }

      const checkoutRes = await fetch(`${API_BASE}/api/purchase/checkout`, {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });

      if (checkoutRes.status === 200) {
        const result = await checkoutRes.json();
        showMessage(`Uspešno ste kupili ${result.purchasedCount} turu/e! 🎉`, 'success');
        await loadCartCount();
        await loadCartSidebar();
        setTimeout(() => {
          closeCartSidebar();
        }, 1500);
      } else {
        const error = await checkoutRes.json();
        showMessage(error.error || 'Greška pri kupovini', 'error');
      }
    }
  } catch (err) {
    console.error('Error during checkout:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

// Load published tours on page load
console.log('[home.js] Calling loadPublishedTours()');
loadPublishedTours();
