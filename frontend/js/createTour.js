const API_BASE = window.API_BASE || 'http://localhost:4000';
const TOURS_BASE = window.TOURS_BASE || 'http://localhost:4000';

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[createTour.js] Token found');

// Navigation
const homeBtn = document.getElementById('homeBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const cancelBtn = document.getElementById('cancelBtn');

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

cancelBtn?.addEventListener('click', () => {
  const ts = Date.now();
  window.location.href = `./home.html?v=${ts}`;
});

// Form elements
const createTourForm = document.getElementById('createTourForm');
const message = document.getElementById('message');
const tourCreatedInfo = document.getElementById('tourCreatedInfo');
const addKeyPointsBtn = document.getElementById('addKeyPointsBtn');
const viewMyToursBtn = document.getElementById('viewMyToursBtn');

let createdTourId = null;

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
      return;
    }

    const data = await res.json();
    
    if (data.role !== 'guide') {
      showMessage('Samo vodiči mogu kreirati ture', 'error');
      setTimeout(() => {
        window.location.href = './home.html';
      }, 2000);
    }
  } catch (err) {
    console.error('Error checking role:', err);
    showMessage('Greška: ' + err.message, 'error');
  }
}

function showMessage(msg, type = 'info') {
  message.textContent = msg;
  message.className = `message ${type}`;
  message.style.display = 'block';
}

function hideMessage() {
  message.style.display = 'none';
}

// Form submit
createTourForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  
  hideMessage();
  
  const formData = new FormData(createTourForm);
  const tags = formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(t => t) : [];
  
  const body = {
    name: formData.get('name'),
    description: formData.get('description'),
    difficulty: formData.get('difficulty'),
    tags: tags
  };
  
  // Only add duration if provided
  const durationValue = formData.get('duration');
  if (durationValue && parseFloat(durationValue) > 0) {
    body.duration = parseFloat(durationValue);
  }

  try {
    showMessage('Kreiranje ture...', 'info');
    
    const res = await fetch(`${TOURS_BASE}/api/tours`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.status !== 201) {
      showMessage('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      return;
    }

    createdTourId = data._id || data.id;
    
    showMessage('Tura uspješno kreirana! ✓', 'success');
    
    // Hide form and show success info
    createTourForm.style.display = 'none';
    tourCreatedInfo.style.display = 'block';

  } catch (err) {
    showMessage('Greška: ' + err.message, 'error');
  }
});

// Add key points button
addKeyPointsBtn?.addEventListener('click', () => {
  if (createdTourId) {
    window.location.href = `./manageKeyPoints.html?id=${createdTourId}`;
  }
});

// View my tours button (placeholder - implement later)
viewMyToursBtn?.addEventListener('click', () => {
  // TODO: Navigate to my tours page
  const ts = Date.now();
  window.location.href = `./myTours.html?v=${ts}`;
});


// Initial check
checkGuideRole();
