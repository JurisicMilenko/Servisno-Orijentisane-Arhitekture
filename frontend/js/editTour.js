const API_BASE = window.API_BASE || 'http://localhost:4000';
const TOURS_BASE = window.TOURS_BASE || 'http://localhost:4000';

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

// Get tour ID from URL
const urlParams = new URLSearchParams(window.location.search);
const tourId = urlParams.get('id');

if (!tourId) {
  showMessage('Greška: ID ture nije pronađen', 'error');
  setTimeout(() => {
    window.location.href = './myTours.html';
  }, 2000);
}

// Map variables
let map;
let markers = [];
let polyline = null;
let tempMarker = null;
let keyPoints = [];
let currentTour = null;

// Navigation
const homeBtn = document.getElementById('homeBtn');
const myToursBtn = document.getElementById('myToursBtn');
const logoutBtn = document.getElementById('logoutBtn');
const cancelBtn = document.getElementById('cancelBtn');

homeBtn?.addEventListener('click', () => {
  window.location.href = './home.html';
});

myToursBtn?.addEventListener('click', () => {
  window.location.href = './myTours.html';
});

logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = './index.html';
});

cancelBtn?.addEventListener('click', () => {
  window.location.href = './myTours.html';
});

// Form elements
const editTourForm = document.getElementById('editTourForm');
const message = document.getElementById('message');

function showMessage(msg, type = 'info') {
  message.textContent = msg;
  message.className = `message ${type}`;
  message.style.display = 'block';
  setTimeout(() => {
    message.style.display = 'none';
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
      setTimeout(() => {
        window.location.href = './myTours.html';
      }, 2000);
      return;
    }

    currentTour = await res.json();
    
    // Check if user is author
    const userRes = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const user = await userRes.json();
    
    if (currentTour.authorId !== user.id) {
      showMessage('Samo autor ture može je izmeniti', 'error');
      setTimeout(() => {
        window.location.href = './myTours.html';
      }, 2000);
      return;
    }

    // Populate form
    document.getElementById('tourName').value = currentTour.name;
    document.getElementById('tourDescription').value = currentTour.description;
    document.getElementById('tourDifficulty').value = currentTour.difficulty;
    document.getElementById('tourTags').value = currentTour.tags ? currentTour.tags.join(', ') : '';
    document.getElementById('tourDuration').value = currentTour.duration || '';
    document.getElementById('tourPrice').value = currentTour.price || 0;

    // Populate transport durations
    if (currentTour.transportDurations) {
      document.getElementById('walkingDuration').value = currentTour.transportDurations.walking || '';
      document.getElementById('bicycleDuration').value = currentTour.transportDurations.bicycle || '';
      document.getElementById('carDuration').value = currentTour.transportDurations.car || '';
    }

    // Check if tour is published - disable editing
    if (currentTour.status === 'published') {
      showMessage('⚠️ Ova tura je objavljena i ne može se menjati. Možete samo videti detalje.', 'info');
      
      // Disable all form inputs
      document.querySelectorAll('#editTourForm input, #editTourForm textarea, #editTourForm select').forEach(input => {
        input.disabled = true;
      });
      
      // Hide submit button
      document.querySelector('#editTourForm button[type="submit"]').style.display = 'none';
      
      // Disable map clicking
      map.off('click');
      
      // Show message on key points section
      const keyPointsSection = document.querySelector('.key-points-section');
      keyPointsSection.insertAdjacentHTML('afterbegin', `
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 0.75rem; margin-bottom: 1rem; color: #856404;">
          <strong>⚠️ Napomena:</strong> Kontrolne tačke ne mogu biti izmenjene jer je tura objavljena.
        </div>
      `);
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
      console.error('Error loading key points');
      return;
    }

    keyPoints = await res.json();
    keyPoints.sort((a, b) => a.order - b.order);
    
    displayKeyPoints();
    drawKeyPointsOnMap();
    
  } catch (err) {
    console.error('Error loading key points:', err);
  }
}

// Display key points in list
function displayKeyPoints() {
  const list = document.getElementById('keyPointsList');
  const isPublished = currentTour && currentTour.status === 'published';
  
  if (keyPoints.length === 0) {
    list.innerHTML = `<p style="color: #999; text-align: center; padding: 1rem; margin-top: 1rem;">
      ${isPublished ? 'Nema kontrolnih tačaka.' : 'Nema kontrolnih tačaka. Kliknite na mapu da dodate.'}
    </p>`;
    return;
  }

  list.innerHTML = `
    <h4 style="margin: 1rem 0 0.5rem 0; font-size: 0.95rem; color: #666;">
      Ukupno: ${keyPoints.length} kontrolnih tačaka
    </h4>
  ` + keyPoints.map((kp, index) => `
    <div class="key-point-item">
      <div class="key-point-number">${kp.order || index + 1}</div>
      <div class="key-point-content">
        <h5>${kp.name}</h5>
        <p>${kp.description || 'Nema opisa'} • 📍 ${kp.latitude.toFixed(5)}, ${kp.longitude.toFixed(5)}</p>
      </div>
      ${!isPublished ? `
        <div class="key-point-actions">
          <button class="btn btn-secondary btn-sm" onclick="editKeyPoint('${kp._id}')" title="Izmeni">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteKeyPoint('${kp._id}')" title="Obriši">🗑️</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Draw key points on map
function drawKeyPointsOnMap() {
  // Clear existing markers and polyline
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  if (polyline) {
    map.removeLayer(polyline);
    polyline = null;
  }

  if (keyPoints.length === 0) {
    return;
  }

  // Add markers for each key point
  keyPoints.forEach((kp, index) => {
    const marker = L.marker([kp.latitude, kp.longitude], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #667eea; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${kp.order || index + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).addTo(map);

    marker.bindPopup(`
      <div style="min-width: 180px;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${kp.name}</h4>
        <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.85rem;">${kp.description || 'Nema opisa'}</p>
        ${kp.imageUrl ? `<img src="${kp.imageUrl}" style="width: 100%; border-radius: 4px; margin-top: 0.5rem;" onerror="this.style.display='none'">` : ''}
      </div>
    `);

    markers.push(marker);
  });

  // Draw polyline connecting key points
  if (keyPoints.length > 1) {
    const latLngs = keyPoints.map(kp => [kp.latitude, kp.longitude]);
    polyline = L.polyline(latLngs, {
      color: '#667eea',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(map);
  }

  // Fit map to show all markers
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.15));
  }
}

// Modal functions
function openModalForNewKeyPoint(lat, lng) {
  const modal = document.getElementById('keyPointModal');
  const form = document.getElementById('keyPointForm');
  
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

// Key point form submit
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
    order: keyPointId ? undefined : keyPoints.length + 1
  };

  try {
    let res;
    
    if (keyPointId) {
      res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/keypoints/${keyPointId}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } else {
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

    showMessage(keyPointId ? 'Kontrolna tačka izmenjena' : 'Kontrolna tačka dodata', 'success');
    closeModal();
    await loadKeyPoints();
    
  } catch (err) {
    console.error('Error saving key point:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
});

// Tour form submit
editTourForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(editTourForm);
  const tags = formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : [];
  
  const body = {
    name: formData.get('name'),
    description: formData.get('description'),
    difficulty: formData.get('difficulty'),
    tags: tags
  };
  
  // Add optional fields if provided
  const durationValue = formData.get('duration');
  if (durationValue && parseFloat(durationValue) > 0) {
    body.duration = parseFloat(durationValue);
  }
  
  const priceValue = formData.get('price');
  if (priceValue && parseFloat(priceValue) >= 0) {
    body.price = parseFloat(priceValue);
  }

  // Add transport durations
  const walkingDuration = formData.get('walkingDuration');
  const bicycleDuration = formData.get('bicycleDuration');
  const carDuration = formData.get('carDuration');
  
  const transportDurations = {};
  if (walkingDuration && parseInt(walkingDuration) > 0) {
    transportDurations.walking = parseInt(walkingDuration);
  }
  if (bicycleDuration && parseInt(bicycleDuration) > 0) {
    transportDurations.bicycle = parseInt(bicycleDuration);
  }
  if (carDuration && parseInt(carDuration) > 0) {
    transportDurations.car = parseInt(carDuration);
  }
  
  // Only add if at least one is defined
  if (Object.keys(transportDurations).length > 0) {
    body.transportDurations = transportDurations;
  }

  try {
    showMessage('Čuvanje izmena...', 'info');
    
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      return;
    }

    showMessage('Izmene uspešno sačuvane! ✓', 'success');
    
    // Reload tour data
    setTimeout(() => {
      loadTourDetails();
    }, 1000);

  } catch (err) {
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
