const TOURS_BASE = window.TOURS_BASE;

const token = localStorage.getItem('token');
const messageArea = document.getElementById('messageArea');
const tourInfo = document.getElementById('tourInfo');

// Get tour ID from URL
const urlParams = new URLSearchParams(window.location.search);
const tourId = urlParams.get('id');

if (!tourId) {
  showMessage('Greška: ID ture nije pronađen', 'error');
  setTimeout(() => {
    window.location.href = './myTours.html';
  }, 2000);
}

if (!token) {
  showMessage('Morate biti prijavljeni', 'error');
  setTimeout(() => {
    window.location.href = './index.html';
  }, 2000);
}

// Map variables
let map;
let markers = [];
let tempMarker = null;
let keyPoints = [];
let currentTour = null;

// Navigation
document.getElementById('backBtn')?.addEventListener('click', () => {
  window.history.back();
});

document.getElementById('homeBtn')?.addEventListener('click', () => {
  window.location.href = './home.html';
});

function showMessage(msg, type = 'info') {
  messageArea.textContent = msg;
  messageArea.className = `message ${type}`;
  messageArea.style.display = 'block';
  setTimeout(() => {
    messageArea.style.display = 'none';
  }, 5000);
}

// Initialize map
function initMap() {
  // Center on Novi Sad, Serbia
  map = L.map('map').setView([45.2671, 19.8335], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // Click event to add key point
  map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    openModalForNewKeyPoint(lat, lng);
  });
}

// Load tour details
async function loadTourDetails() {
  try {
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      showMessage('Greška pri učitavanju ture', 'error');
      return;
    }

    currentTour = await res.json();
    
    // Check if user is author
    const userRes = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const user = await userRes.json();
    
    if (currentTour.authorId !== user.id) {
      showMessage('Samo autor ture može upravljati kontrolnim tačkama', 'error');
      setTimeout(() => {
        window.location.href = './myTours.html';
      }, 2000);
      return;
    }

    document.getElementById('tourName').textContent = currentTour.name;
    document.getElementById('tourDescription').textContent = currentTour.description;
    
    tourInfo.style.display = 'block';
    
    // Check if tour is published
    if (currentTour.status === 'published') {
      showMessage('⚠️ Ova tura je objavljena. Kontrolne tačke se ne mogu menjati. Preusmeriću vas na prikaz detalja...', 'info');
      setTimeout(() => {
        window.location.href = `./tourDetails.html?id=${tourId}`;
      }, 3000);
      return;
    }
    
    // Load key points
    await loadKeyPoints();
    
  } catch (err) {
    console.error('Error loading tour:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

// Load key points
async function loadKeyPoints() {
  try {
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/keypoints`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      showMessage('Greška pri učitavanju kontrolnih tačaka', 'error');
      return;
    }

    keyPoints = await res.json();
    keyPoints.sort((a, b) => a.order - b.order);
    
    displayKeyPoints();
    drawKeyPointsOnMap();
    
  } catch (err) {
    console.error('Error loading key points:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

// Display key points in list
function displayKeyPoints() {
  const list = document.getElementById('keyPointsList');
  const count = document.getElementById('keyPointsCount');
  
  count.textContent = keyPoints.length;
  
  if (keyPoints.length === 0) {
    list.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">Nema kontrolnih tačaka. Kliknite na mapu da dodate prvu.</p>';
    return;
  }

  list.innerHTML = keyPoints.map((kp, index) => `
    <div class="key-point-item">
      <div class="key-point-number">${kp.order || index + 1}</div>
      <div class="key-point-content">
        <h4>${kp.name}</h4>
        <p>${kp.description || 'Nema opisa'}</p>
        <span class="key-point-coords">📍 ${kp.latitude.toFixed(6)}, ${kp.longitude.toFixed(6)}</span>
      </div>
      <div class="key-point-actions">
        <button class="btn btn-secondary btn-sm" onclick="editKeyPoint('${kp._id}')">✏️ Izmeni</button>
        <button class="btn btn-danger btn-sm" onclick="deleteKeyPoint('${kp._id}')">🗑️ Obriši</button>
      </div>
    </div>
  `).join('');
}

// Draw key points on map
function drawKeyPointsOnMap() {
  // Clear existing markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  // Add markers for each key point
  keyPoints.forEach((kp, index) => {
    const marker = L.marker([kp.latitude, kp.longitude], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #667eea; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${kp.order || index + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    }).addTo(map);

    marker.bindPopup(`
      <div style="min-width: 200px;">
        <h4 style="margin: 0 0 0.5rem 0;">${kp.name}</h4>
        <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">${kp.description || 'Nema opisa'}</p>
        ${kp.imageUrl ? `<img src="${kp.imageUrl}" style="width: 100%; border-radius: 4px; margin-top: 0.5rem;" onerror="this.style.display='none'">` : ''}
      </div>
    `);

    markers.push(marker);
  });

  // Draw polyline connecting key points
  if (keyPoints.length > 1) {
    const latLngs = keyPoints.map(kp => [kp.latitude, kp.longitude]);
    L.polyline(latLngs, {
      color: '#667eea',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(map);
  }

  // Fit map to show all markers
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

// Modal functions
function openModalForNewKeyPoint(lat, lng) {
  const modal = document.getElementById('keyPointModal');
  const form = document.getElementById('keyPointForm');
  
  // Reset form
  form.reset();
  document.getElementById('keyPointId').value = '';
  document.getElementById('keyPointLat').value = lat;
  document.getElementById('keyPointLng').value = lng;
  document.getElementById('displayLat').textContent = lat.toFixed(6);
  document.getElementById('displayLng').textContent = lng.toFixed(6);
  document.getElementById('modalTitle').textContent = 'Dodaj Kontrolnu Tačku';
  
  // Show temporary marker
  if (tempMarker) {
    map.removeLayer(tempMarker);
  }
  tempMarker = L.marker([lat, lng], {
    icon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }).addTo(map);
  
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('keyPointModal');
  modal.style.display = 'none';
  
  // Remove temporary marker
  if (tempMarker) {
    map.removeLayer(tempMarker);
    tempMarker = null;
  }
}

// Edit key point
window.editKeyPoint = function(keyPointId) {
  const kp = keyPoints.find(k => k._id === keyPointId);
  if (!kp) return;

  const modal = document.getElementById('keyPointModal');
  
  document.getElementById('keyPointId').value = kp._id;
  document.getElementById('keyPointName').value = kp.name;
  document.getElementById('keyPointDescription').value = kp.description || '';
  document.getElementById('keyPointImage').value = kp.imageUrl || '';
  document.getElementById('keyPointLat').value = kp.latitude;
  document.getElementById('keyPointLng').value = kp.longitude;
  document.getElementById('displayLat').textContent = kp.latitude.toFixed(6);
  document.getElementById('displayLng').textContent = kp.longitude.toFixed(6);
  document.getElementById('modalTitle').textContent = 'Izmeni Kontrolnu Tačku';
  
  // Center map on this point
  map.setView([kp.latitude, kp.longitude], 15);
  
  modal.style.display = 'block';
};

// Delete key point
window.deleteKeyPoint = async function(keyPointId) {
  if (!confirm('Da li ste sigurni da želite da obrišete ovu kontrolnu tačku?')) {
    return;
  }

  try {
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/keypoints/${keyPointId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) {
      const data = await res.json();
      showMessage('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      return;
    }

    showMessage('Kontrolna tačka uspešno obrisana', 'success');
    await loadKeyPoints();
    
  } catch (err) {
    console.error('Error deleting key point:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
};

// Form submit
document.getElementById('keyPointForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const keyPointId = document.getElementById('keyPointId').value;
  const name = document.getElementById('keyPointName').value;
  const description = document.getElementById('keyPointDescription').value;
  const latitude = parseFloat(document.getElementById('keyPointLat').value);
  const longitude = parseFloat(document.getElementById('keyPointLng').value);
  const imageUrl = document.getElementById('keyPointImage').value;

  const body = {
    name,
    description,
    latitude,
    longitude,
    imageUrl: imageUrl || undefined,
    order: keyPoints.length + 1
  };

  try {
    let res;
    
    if (keyPointId) {
      // Update existing key point
      res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/keypoints/${keyPointId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } else {
      // Create new key point
      res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/keypoints`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    }

    if (!res.ok) {
      const data = await res.json();
      showMessage('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      return;
    }

    showMessage(keyPointId ? 'Kontrolna tačka uspešno izmenjena' : 'Kontrolna tačka uspešno dodata', 'success');
    closeModal();
    await loadKeyPoints();
    
  } catch (err) {
    console.error('Error saving key point:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
});

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('keyPointModal');
  if (event.target === modal) {
    closeModal();
  }
};

// Initialize
initMap();
loadTourDetails();
