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
const adminBtn = document.getElementById('adminBtn');
const logoutBtn = document.getElementById('logoutBtn');

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

checkAdminRole();

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

adminBtn?.addEventListener('click', () => {
  console.log('[home.js] Admin Panel clicked');
  const ts = Date.now();
  window.location.href = `./adminUserOverview.html?v=${ts}`;
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
        toursGrid.innerHTML = tours.map(tour => `
          <div class="tour-card" onclick="viewTourDetails('${tour._id || tour.id}')">
            <div class="tour-card-header">
              <h3>${tour.name}</h3>
              <span class="status-badge status-published">Objavljena</span>
            </div>
            <div class="tour-card-body">
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
          </div>
        `).join('');
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

// Load published tours on page load
console.log('[home.js] Calling loadPublishedTours()');
loadPublishedTours();
