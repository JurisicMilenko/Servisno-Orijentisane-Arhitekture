const API_BASE = window.API_BASE;
const STAKEHOLDERS_BASE = window.STAKEHOLDERS_BASE;

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[userDetails.js] Token found');

// Navigation
const homeBtn = document.getElementById('homeBtn');
const adminBtn = document.getElementById('adminBtn');
const logoutBtn = document.getElementById('logoutBtn');

console.log('[userDetails.js] homeBtn:', homeBtn);
console.log('[userDetails.js] logoutBtn:', logoutBtn);

if (!homeBtn || !logoutBtn) {
  console.error('[userDetails.js] ERROR: Navigation buttons not found!');
}

homeBtn?.addEventListener('click', () => {
  console.log('[userDetails.js] Home clicked');
  const ts = Date.now();
  window.location.href = `./home.html?v=${ts}`;
});

adminBtn?.addEventListener('click', () => {
  console.log('[userDetails.js] Admin Panel clicked');
  const ts = Date.now();
  window.location.href = `./adminUserOverview.html?v=${ts}`;
});

logoutBtn?.addEventListener('click', () => {
  console.log('[userDetails.js] Logout clicked');
  localStorage.removeItem('token');
  const ts = Date.now();
  window.location.href = `./index.html?v=${ts}`;
});

// Profile Management
const profileDisplay = document.getElementById('profileDisplay');
const profileEditForm = document.getElementById('profileEditForm');
const editProfileBtn = document.getElementById('editProfileBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editMessage = document.getElementById('editMessage');

// Profile Display Elements
const profileImg = document.getElementById('profileImg');
const profileUsername = document.getElementById('profileUsername');
const profileRole = document.getElementById('profileRole');
const profileEmail = document.getElementById('profileEmail');
const profileFirstName = document.getElementById('profileFirstName');
const profileLastName = document.getElementById('profileLastName');
const profileMotto = document.getElementById('profileMotto');
const profileBio = document.getElementById('profileBio');

// Form Elements
const editEmail = document.getElementById('editEmail');
const editFirstName = document.getElementById('editFirstName');
const editLastName = document.getElementById('editLastName');
const editAvatarUrl = document.getElementById('editAvatarUrl');
const editMotto = document.getElementById('editMotto');
const editBio = document.getElementById('editBio');

let currentUser = null;

async function loadUserProfile() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();
    
    if (res.status !== 200) {
      console.error('Failed to load profile:', data);
      profileDisplay.innerHTML = `<p style="color:red;">Greška: ${data.error}</p>`;
      return;
    }

    currentUser = data;

    // Show admin button if user is admin
    if (data.role === 'admin' && adminBtn) {
      adminBtn.style.display = 'inline-block';
    }

    // Update profile display
    profileUsername.textContent = data.username;
    profileRole.textContent = data.role === 'guide' ? 'Vodič' : (data.role === 'admin' ? 'Administrator' : 'Turist');
    profileEmail.textContent = data.email || '-';
    profileFirstName.textContent = data.first_name || '-';
    profileLastName.textContent = data.last_name || '-';
    profileMotto.textContent = data.motto || '-';
    profileBio.textContent = data.bio || '-';
    
    // Update avatar
    if (data.avatar_url) {
      profileImg.src = data.avatar_url;
    }

    // Update form fields
    editEmail.value = data.email || '';
    editFirstName.value = data.first_name || '';
    editLastName.value = data.last_name || '';
    editAvatarUrl.value = data.avatar_url || '';
    editMotto.value = data.motto || '';
    editBio.value = data.bio || '';

  } catch (err) {
    console.error('Error loading profile:', err);
    profileDisplay.innerHTML = `<p style="color:red;">Greška: ${err.message}</p>`;
  }
}

// Edit Profile Button
editProfileBtn.addEventListener('click', () => {
  profileDisplay.style.display = 'none';
  profileEditForm.style.display = 'block';
  editMessage.textContent = '';
});

cancelEditBtn.addEventListener('click', () => {
  profileDisplay.style.display = 'block';
  profileEditForm.style.display = 'none';
  editMessage.textContent = '';
});

// Form Submit
profileEditForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  
  const body = {
    email: editEmail.value,
    first_name: editFirstName.value,
    last_name: editLastName.value,
    avatar_url: editAvatarUrl.value,
    motto: editMotto.value,
    bio: editBio.value
  };

  try {
    editMessage.textContent = 'Čuva se...';
    editMessage.className = '';
    
    // Use stakeholders service for profile update
    const userId = currentUser.id;
    const res = await fetch(`${STAKEHOLDERS_BASE}/api/stakeholders/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.status !== 200) {
      editMessage.textContent = 'Greška: ' + (data.error || 'Nepoznata greška');
      editMessage.className = 'error';
      return;
    }

    editMessage.textContent = 'Profil uspješno sačuvan! ✓';
    editMessage.className = 'success';

    // Close form and refresh display
    setTimeout(() => {
      profileDisplay.style.display = 'block';
      profileEditForm.style.display = 'none';
      editMessage.textContent = '';
      loadUserProfile();
    }, 1500);

  } catch (err) {
    editMessage.textContent = 'Greška: ' + err.message;
    editMessage.className = 'error';
  }
});

// Initial load
loadUserProfile();
