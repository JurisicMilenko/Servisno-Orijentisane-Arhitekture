const API_BASE = 'http://localhost:3000';

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[home.js] Token found, loading page...');

// Navigation
const userDetailsBtn = document.getElementById('userDetailsBtn');
const logoutBtn = document.getElementById('logoutBtn');

console.log('[home.js] userDetailsBtn:', userDetailsBtn);
console.log('[home.js] logoutBtn:', logoutBtn);

if (!userDetailsBtn || !logoutBtn) {
  console.error('[home.js] ERROR: Navigation buttons not found!');
}

userDetailsBtn?.addEventListener('click', () => {
  console.log('[home.js] Moj Profil clicked');
  const ts = Date.now();
  window.location.href = `./userDetails.html?v=${ts}`;
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
