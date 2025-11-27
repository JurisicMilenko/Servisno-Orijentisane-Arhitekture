const TOURS_BASE = window.TOURS_BASE;

const token = localStorage.getItem('token');
const messageArea = document.getElementById('messageArea');
const tourContent = document.getElementById('tourContent');

// Get tour ID from URL
const urlParams = new URLSearchParams(window.location.search);
const tourId = urlParams.get('id');

// Map variables
let map = null;
let markers = [];
let polyline = null;
let mapInitialized = false;

if (!tourId) {
  showMessage('Greška: ID ture nije pronađen', 'error');
  setTimeout(() => {
    window.location.href = './home.html';
  }, 2000);
}

// Navigation
document.getElementById('backBtn')?.addEventListener('click', () => {
  window.history.back();
});

document.getElementById('homeBtn')?.addEventListener('click', () => {
  window.location.href = './home.html';
});

// Map toggle
let mapVisible = false;

document.getElementById('showMapBtn')?.addEventListener('click', async () => {
  const container = document.getElementById('mapContainer');
  const toggleText = document.getElementById('mapToggle');
  
  if (!mapVisible) {
    // Show map
    if (!mapInitialized) {
      await initializeMap();
    }
    container.style.display = 'block';
    toggleText.textContent = 'Sakrij';
    mapVisible = true;
    
    // Refresh map size and fit bounds to markers
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        // Fit map to show all markers
        if (markers.length > 0) {
          const group = L.featureGroup(markers);
          map.fitBounds(group.getBounds().pad(0.15));
        }
      }
    }, 100);
  } else {
    // Hide map
    container.style.display = 'none';
    toggleText.textContent = 'Prikaži';
    mapVisible = false;
  }
});

// Key points toggle
let keyPointsLoaded = false;
let keyPointsVisible = false;

document.getElementById('showKeyPointsBtn')?.addEventListener('click', async () => {
  const container = document.getElementById('keyPointsContainer');
  const toggleText = document.getElementById('keyPointsToggle');
  
  if (!keyPointsVisible) {
    // Show key points
    if (!keyPointsLoaded) {
      await loadKeyPoints();
      keyPointsLoaded = true;
    }
    container.style.display = 'block';
    toggleText.textContent = 'Sakrij';
    keyPointsVisible = true;
  } else {
    // Hide key points
    container.style.display = 'none';
    toggleText.textContent = 'Prikaži';
    keyPointsVisible = false;
  }
});

function showMessage(msg, type = 'info') {
  messageArea.textContent = msg;
  messageArea.className = `message ${type}`;
  messageArea.style.display = 'block';
}

function hideMessage() {
  messageArea.style.display = 'none';
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

function getStatusText(status) {
  const statusMap = {
    'draft': 'Nacrt',
    'published': 'Objavljena',
    'archived': 'Arhivirana'
  };
  return statusMap[status] || status;
}

function getDifficultyText(difficulty) {
  const difficultyMap = {
    'easy': 'Lako',
    'moderate': 'Umereno',
    'hard': 'Teško',
    'expert': 'Ekspertski'
  };
  return difficultyMap[difficulty] || difficulty;
}

async function loadCurrentUser() {
  if (!token) return null;
  
  try {
    const res = await fetch(`${TOURS_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) return null;
    const data = await res.json();
    
    currentUser = data;
    userId = data.id;
    return data;
  } catch (err) {
    console.error('Error loading current user:', err);
    return null;
  }
}

async function loadTourDetails() {
  try {
    showMessage('Učitavanje detalja ture...', 'info');
    
    const headers = {};
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}`, { headers });
    
    if (!res.ok) {
      if (res.status === 404) {
        showMessage('Tura nije pronađena', 'error');
      } else {
        showMessage(`Greška pri učitavanju ture: ${res.status}`, 'error');
      }
      return;
    }
    
    const tour = await res.json();
    displayTourDetails(tour);
    hideMessage();
    tourContent.style.display = 'block';
    await loadCurrentUser();
    setupRateButton();
    loadReviews();
    
  } catch (err) {
    console.error('Error loading tour details:', err);
    showMessage('Greška pri učitavanju: ' + err.message, 'error');
  }
}

function displayTourDetails(tour) {
  // Header
  document.getElementById('tourName').textContent = tour.name;
  
  const statusBadge = document.getElementById('tourStatus');
  statusBadge.textContent = getStatusText(tour.status);
  statusBadge.className = `status-badge status-${tour.status}`;
  
  const priceElement = document.getElementById('tourPrice');
  if (tour.price && tour.price > 0) {
    priceElement.textContent = `${tour.price} RSD`;
  } else {
    priceElement.textContent = 'Besplatno';
  }
  
  // Info cards
  document.getElementById('tourDifficulty').textContent = getDifficultyText(tour.difficulty);
  
  if (tour.duration !== null && tour.duration !== undefined && tour.duration > 0) {
    document.getElementById('tourDuration').textContent = tour.duration + ' h';
  } else {
    document.getElementById('tourDuration').textContent = 'Nije navedeno';
  }
  
  if (tour.distance !== null && tour.distance !== undefined && tour.distance > 0) {
    document.getElementById('tourDistance').textContent = tour.distance + ' km';
  } else {
    document.getElementById('tourDistance').textContent = 'Nije navedeno';
  }
  
  const keyPointsCount = tour.keyPoints ? tour.keyPoints.length : 0;
  document.getElementById('keyPointsCount').textContent = keyPointsCount;
  
  // Description
  document.getElementById('tourDescription').textContent = tour.description || 'Nema opisa';
  
  // Tags
  if (tour.tags && tour.tags.length > 0) {
    document.getElementById('tagsSection').style.display = 'block';
    document.getElementById('tourTags').innerHTML = tour.tags
      .map(tag => `<span class="tag">${tag}</span>`)
      .join('');
  }
  
  // Metadata
  document.getElementById('authorId').textContent = tour.authorId;
  document.getElementById('createdAt').textContent = formatDate(tour.createdAt);
  document.getElementById('updatedAt').textContent = formatDate(tour.updatedAt);
  
  // Hide key points button if no key points
  if (keyPointsCount === 0) {
    document.getElementById('showKeyPointsBtn').style.display = 'none';
  }
}

async function loadKeyPoints() {
  const keyPointsList = document.getElementById('keyPointsList');
  
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/keypoints`, { headers });
    
    if (!res.ok) {
      keyPointsList.innerHTML = '<p class="error-text">Greška pri učitavanju kontrolnih tačaka</p>';
      return;
    }
    
    const keyPoints = await res.json();
    
    if (!keyPoints || keyPoints.length === 0) {
      keyPointsList.innerHTML = '<p class="info-text">Nema kontrolnih tačaka za ovu turu</p>';
      return;
    }
    
    // Sort by order
    keyPoints.sort((a, b) => a.order - b.order);
    
    keyPointsList.innerHTML = keyPoints.map((kp, index) => `
      <div class="key-point-item">
        <div class="key-point-number">${kp.order || index + 1}</div>
        <div class="key-point-content">
          <h5>${kp.name}</h5>
          <p>${kp.description || 'Nema opisa'}</p>
          <p style="font-size: 0.8rem; color: #999; margin-top: 0.25rem;">📍 ${kp.latitude.toFixed(6)}, ${kp.longitude.toFixed(6)}</p>
        </div>
      </div>
    `).join('');
    
  } catch (err) {
    console.error('Error loading key points:', err);
    keyPointsList.innerHTML = '<p class="error-text">Greška: ' + err.message + '</p>';
  }
}

async function userAlreadyRated() {
  if (!token || !userId) return false;
  try {
    const headers = { 'Authorization': 'Bearer ' + token };
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/ratings`, { headers });

    if (!res.ok) return false;
    const reviews = await res.json();
    
    const userReview = reviews.find(r => r.userId === userId);

    return !!userReview;
  } catch (e) {
    console.error("Rating check error:", e);
    return false;
  }
}


function setupRateButton() {
  const btn = document.getElementById('rateTourBtn');
  const msg = document.getElementById('alreadyRatedMsg');

  btn.addEventListener('click', () => {
    window.location.href = `createTourRating.html?id=${tourId}`;
  });

  userAlreadyRated().then(alreadyRated => {
    if (alreadyRated) {
      btn.disabled = true;
      btn.style.opacity = "0.6";
      msg.style.display = "block";
    }
  });
}

async function loadReviews() {
  const reviewsList = document.getElementById('reviewsList');

  try {
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/ratings`, { headers });

    if (!res.ok) {
      reviewsList.innerHTML = '<p class="error-text">Greška pri učitavanju komentara</p>';
      return;
    }

    const reviews = await res.json();

    if (!reviews || reviews.length === 0) {
      reviewsList.innerHTML = '<p class="info-text">Još uvek nema komentara</p>';
      return;
    }

    reviewsList.innerHTML = reviews.map(r => `
    <div class="review-item">
      <div class="review-header">
        <span class="review-username">${r.username || 'Nepoznat korisnik'}</span>
        <span class="review-rating">⭐ ${r.rating}/5</span>
      </div>
      <div class="review-comment">
        ${r.comment || ''}
      </div>
    </div>
    `).join('');

  } catch (err) {
    console.error('Error loading reviews:', err);
    reviewsList.innerHTML = '<p class="error-text">Greška pri učitavanju komentara</p>';
  }
}


// Initialize map and draw tour route
async function initializeMap() {
  try {
    // Create map centered on Novi Sad (will be adjusted to fit markers)
    map = L.map('tourMap').setView([45.2671, 19.8335], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Load key points
    const headers = {};
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    
    const res = await fetch(`${TOURS_BASE}/api/tours/${tourId}/keypoints`, { headers });
    
    if (!res.ok) {
      console.error('Error loading key points for map');
      mapInitialized = true;
      // Force map to refresh after initialization
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 100);
      return;
    }
    
    const keyPoints = await res.json();
    
    if (!keyPoints || keyPoints.length === 0) {
      mapInitialized = true;
      // Force map to refresh after initialization
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 100);
      return;
    }
    
    // Sort by order
    keyPoints.sort((a, b) => a.order - b.order);
    
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
        <div style="min-width: 200px;">
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

    mapInitialized = true;
    
  } catch (err) {
    console.error('Error initializing map:', err);
    mapInitialized = true;
  }
}

// Load tour details on page load
loadTourDetails();
