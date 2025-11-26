const API_BASE = window.API_BASE;
const TOURS_BASE = window.TOURS_BASE;

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[myTours.js] Token found');

// Navigation
const homeBtn = document.getElementById('homeBtn');
const createTourBtn = document.getElementById('createTourBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');

homeBtn?.addEventListener('click', () => {
  const ts = Date.now();
  window.location.href = `./home.html?v=${ts}`;
});

createTourBtn?.addEventListener('click', () => {
  const ts = Date.now();
  window.location.href = `./createTour.html?v=${ts}`;
});

profileBtn?.addEventListener('click', () => {
  const ts = Date.now();
  window.location.href = `./userDetails.html?v=${ts}`;
});

logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('token');
  const ts = Date.now();
  window.location.href = `./index.html?v=${ts}`;
});

// Elements
const message = document.getElementById('message');
const toursGrid = document.getElementById('toursGrid');

let currentUserId = null;

function showMessage(msg, type = 'info') {
  message.textContent = msg;
  message.className = `message ${type}`;
  message.style.display = 'block';
}

function hideMessage() {
  message.style.display = 'none';
}

// Check if user is guide
async function checkGuideRole() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (res.status !== 200) {
      showMessage('Greška pri proveri korisnika', 'error');
      setTimeout(() => {
        window.location.href = './home.html';
      }, 2000);
      return false;
    }

    const data = await res.json();
    currentUserId = data.id;
    
    if (data.role !== 'guide') {
      showMessage('Samo vodiči mogu pregledati ture', 'error');
      setTimeout(() => {
        window.location.href = './home.html';
      }, 2000);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error checking role:', err);
    showMessage('Greška: ' + err.message, 'error');
    return false;
  }
}

// Load tours for current guide
async function loadMyTours() {
  try {
    hideMessage();
    toursGrid.innerHTML = '<p style="text-align: center; color: #999;">Učitavanje tura...</p>';

    const res = await fetch(`${TOURS_BASE}/api/tours/author/${currentUserId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status !== 200) {
      const data = await res.json();
      showMessage('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      toursGrid.innerHTML = '<p style="text-align: center; color: red;">Greška pri učitavanju tura</p>';
      return;
    }

    const tours = await res.json();
    
    if (!tours || tours.length === 0) {
      toursGrid.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <p style="color: #999; font-size: 1.2rem; margin-bottom: 1rem;">Nemate kreiranih tura</p>
          <button class="btn btn-primary" onclick="window.location.href='./createTour.html'">Kreiraj Prvu Turu</button>
        </div>
      `;
      return;
    }

    toursGrid.innerHTML = tours.map(tour => `
      <div class="tour-card" data-tour-id="${tour._id || tour.id}">
        <div class="tour-card-header">
          <h3>${tour.name}</h3>
          <span class="status-badge status-${tour.status}">${tour.status.toUpperCase()}</span>
        </div>
        <div class="tour-card-body">
          <p class="tour-description">${tour.description}</p>
          <div class="tour-meta">
            <span class="tour-meta-item">
              <strong>Težina:</strong> 
              ${tour.difficulty === 'easy' ? 'Lako' : tour.difficulty === 'medium' ? 'Srednje' : 'Teško'}
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
            <span>📍 ${tour.keyPoints?.length || 0} ključnih tačaka</span>
            ${tour.duration && tour.duration > 0 ? `<span>⏱️ ${tour.duration}h</span>` : ''}
            ${tour.distance && tour.distance > 0 ? `<span>📏 ${tour.distance}km</span>` : ''}
          </div>
        </div>
        <div class="tour-card-footer">
          <button class="btn btn-secondary btn-sm" onclick="viewTourDetails('${tour._id || tour.id}')">
            Detalji
          </button>
          ${tour.status.toLowerCase() === 'draft' ? `
            <button class="btn btn-primary btn-sm" onclick="editTour('${tour._id || tour.id}')">
              Izmeni
            </button>
            <button class="btn btn-success btn-sm" onclick="publishTour('${tour._id || tour.id}')">
              Objavi
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteTour('${tour._id || tour.id}')">
              Obriši
            </button>
          ` : tour.status.toLowerCase() === 'published' ? `
            <button class="btn btn-warning btn-sm" onclick="archiveTour('${tour._id || tour.id}')">
              🗄️ Arhiviraj
            </button>
            <span style="color: #28a745; font-weight: 600; padding: 0.5rem;">✓ Objavljena</span>
          ` : tour.status.toLowerCase() === 'archived' ? `
            <button class="btn btn-success btn-sm" onclick="reactivateTour('${tour._id || tour.id}')">
              🔄 Reaktiviraj
            </button>
            <span style="color: #6c757d; font-weight: 600; padding: 0.5rem;">📦 Arhivirana</span>
          ` : `
            <span style="color: #28a745; font-weight: 600; padding: 0.5rem;">✓ Objavljena</span>
          `}
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Error loading tours:', err);
    showMessage('Greška: ' + err.message, 'error');
    toursGrid.innerHTML = '<p style="text-align: center; color: red;">Greška pri učitavanju tura</p>';
  }
}

// View tour details
function viewTourDetails(tourId) {
  window.location.href = `./tourDetails.html?id=${tourId}`;
}

// Manage key points
function manageKeyPoints(tourId) {
  window.location.href = `./manageKeyPoints.html?id=${tourId}`;
}

// Edit tour
function editTour(tourId) {
  window.location.href = `./editTour.html?id=${tourId}`;
}

// Publish tour
async function publishTour(tourId) {
  if (!confirm('Da li želite da objavite ovu turu?')) return;
  
  try {
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/publish`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    if (res.status !== 200) {
      const data = await res.json();
      showMessage('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      return;
    }

    showMessage('Tura uspješno objavljena! ✓', 'success');
    setTimeout(() => loadMyTours(), 1500);
  } catch (err) {
    showMessage('Greška: ' + err.message, 'error');
  }
}

// Archive tour
async function archiveTour(tourId) {
  if (!confirm('Da li želite da arhivirate ovu turu? Arhivirane ture se ne prikazuju turistima.')) return;
  
  try {
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/archive`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    if (res.status !== 200) {
      const data = await res.json();
      showMessage('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      return;
    }

    showMessage('Tura uspješno arhivirana! 📦', 'success');
    setTimeout(() => loadMyTours(), 1500);
  } catch (err) {
    showMessage('Greška: ' + err.message, 'error');
  }
}

// Reactivate tour
async function reactivateTour(tourId) {
  if (!confirm('Da li želite da reaktivirate ovu turu? Tura će ponovo biti objavljena.')) return;
  
  try {
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/reactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    if (res.status !== 200) {
      const data = await res.json();
      showMessage('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      return;
    }

    showMessage('Tura uspješno reaktivirana! 🔄', 'success');
    setTimeout(() => loadMyTours(), 1500);
  } catch (err) {
    showMessage('Greška: ' + err.message, 'error');
  }
}

// Delete tour
async function deleteTour(tourId) {
  if (!confirm('Da li ste sigurni da želite da obrišete ovu turu?')) return;
  
  try {
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status !== 204 && res.status !== 200) {
      const data = await res.json();
      showMessage('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      return;
    }

    showMessage('Tura uspješno obrisana! ✓', 'success');
    setTimeout(() => loadMyTours(), 1500);
  } catch (err) {
    showMessage('Greška: ' + err.message, 'error');
  }
}

// Initial load
(async () => {
  const isGuide = await checkGuideRole();
  if (isGuide) {
    await loadMyTours();
  }
})();
