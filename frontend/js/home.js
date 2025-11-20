const API_BASE = window.API_BASE;

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


// Ads
const adsContainer = document.getElementById('adsContainer');

console.log('[home.js] adsContainer:', adsContainer);

async function loadAds() {
  try {
    if (!adsContainer) {
      console.error('[home.js] adsContainer not found!');
      return;
    }

    console.log('[home.js] Loading ads from', API_BASE + '/api/attractions');
    
    const res = await fetch(`${API_BASE}/api/attractions`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    console.log('[home.js] Ads response status:', res.status);

    if (res.status === 200) {
      const data = await res.json();
      console.log('[home.js] Ads data:', data);

      if (Array.isArray(data) && data.length > 0) {
        adsContainer.innerHTML = data.map(ad => `
          <div class="ad-card">
            <h3>${ad.name || 'Bez naslova'}</h3>
            <p>${ad.description || 'Nema opisa'}</p>
            <p><strong>Lokacija:</strong> ${ad.location || '-'}</p>
          </div>
        `).join('');
      } else {
        adsContainer.innerHTML = '<p style="text-align: center; color: #999;">Nema dostupnih oglasa</p>';
      }
    } else {
      adsContainer.innerHTML = '<p style="text-align: center; color: red;">Greška pri učitavanju oglasa (Status: ' + res.status + ')</p>';
    }
  } catch (err) {
    console.error('Error loading ads:', err);
    if (adsContainer) {
      adsContainer.innerHTML = '<p style="text-align: center; color: red;">Greška: ' + err.message + '</p>';
    }
  }
}

// Load ads on page load
console.log('[home.js] Calling loadAds()');
loadAds();
