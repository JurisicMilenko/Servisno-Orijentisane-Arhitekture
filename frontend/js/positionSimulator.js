const API_BASE = window.API_BASE || 'http://localhost:4000';
const TOURS_BASE = window.TOURS_BASE;

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[createBlog.js] Token found');

// Navigation
const homeBtn = document.getElementById('homeBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Map variables
let map;
var marker = null;
let polyline = null;
let tempMarker = null;

homeBtn?.addEventListener('click', () => {
  const ts = Date.now();
  window.location.href = `./home.html?v=${ts}`;
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


window.onload = async function() {
    const res1 = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data1 = await res1.json();
    const res = await fetch(`${TOURS_BASE}/api/tours/position/users/`+data1.id, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    var userId = data[0].userId
    var positionId = data[0]._id
    if(data[0].userId == null){
        const res = await fetch(`${TOURS_BASE}/api/tours/position/`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        userId = data[0].userId
        positionId = data[0]._id
    }
    initMap(userId,positionId);
    marker = L.marker([data[0].latitude, data[0].longitude]).addTo(map);
// You can use native DOM methods to insert the fragment:
    
};

function initMap(userId,positionId) {
  // Center on Novi Sad, Serbia
  map = L.map('map').setView([45.2671, 19.8335], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Click event to add key point
  map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    updatePosition(lat, lng, userId, positionId);
  });
}

async function updatePosition(lat,lng, userId, positionId){
    const body = {
        id : positionId,
        userId : userId,
        latitude: lat,
        longitude: lng
    }

    const res = await fetch(`${TOURS_BASE}/api/tours/position/`+positionId, {
      method: 'PUT',
      headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    
}

