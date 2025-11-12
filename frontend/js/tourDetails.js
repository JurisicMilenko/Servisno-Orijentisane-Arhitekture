const TOURS_BASE = 'http://localhost:3002';

const token = localStorage.getItem('token');
const messageArea = document.getElementById('messageArea');
const tourContent = document.getElementById('tourContent');

// Get tour ID from URL
const urlParams = new URLSearchParams(window.location.search);
const tourId = urlParams.get('id');

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
  
  if (tour.duration) {
    document.getElementById('tourDuration').textContent = tour.duration;
  } else {
    document.getElementById('tourDuration').textContent = 'Nije navedeno';
  }
  
  if (tour.distance) {
    document.getElementById('tourDistance').textContent = tour.distance;
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
      <div class="key-point-card">
        <div class="key-point-header">
          <span class="key-point-number">${kp.order || index + 1}</span>
          <h4>${kp.name}</h4>
        </div>
        <p class="key-point-description">${kp.description || 'Nema opisa'}</p>
        <div class="key-point-coordinates">
          <span>📍 Koordinate: ${kp.latitude}, ${kp.longitude}</span>
        </div>
        ${kp.imageUrl ? `
          <div class="key-point-image">
            <img src="${kp.imageUrl}" alt="${kp.name}" onerror="this.style.display='none'">
          </div>
        ` : ''}
      </div>
    `).join('');
    
  } catch (err) {
    console.error('Error loading key points:', err);
    keyPointsList.innerHTML = '<p class="error-text">Greška: ' + err.message + '</p>';
  }
}

// Load tour details on page load
loadTourDetails();
