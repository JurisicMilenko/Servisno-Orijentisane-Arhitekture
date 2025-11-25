const API_BASE = window.API_BASE || 'http://localhost:4000';
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

// --- NAVBAR ---
const homeBtn = document.getElementById('homeBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');

homeBtn?.addEventListener('click', () => {
  window.location.href = `./home.html?v=${Date.now()}`;
});

profileBtn?.addEventListener('click', () => {
  window.location.href = `./userDetails.html?v=${Date.now()}`;
});

logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = `./index.html?v=${Date.now()}`;
});

// --- SUGGESTED FOLLOWERS ---
const suggestedContainer = document.getElementById('suggestedContainer');

async function getCurrentUser() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Niste ulogovani');
    return await res.json();
  } catch (err) {
    alert(err.message);
    window.location.href = './index.html';
    return null;
  }
}

async function loadSuggested() {
  suggestedContainer.innerHTML = `<p style="text-align:center; color:#999;">Učitavanje...</p>`;

  const user = await getCurrentUser();
  if (!user) return;

  try {
    const res = await fetch(`${API_BASE}/api/followers/suggested?userId=${user.id}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Greška prilikom učitavanja preporuka');
    alert(res.status);
    const suggestedUsers = await res.json();
    renderUsers(suggestedUsers, user.id);
  } catch (err) {
    suggestedContainer.innerHTML = `<p style="text-align:center; color:red;">${err.message}</p>`;
  }
}

function renderUsers(users, followerId) {
  suggestedContainer.innerHTML = '';

  users.forEach(u => {
    const div = document.createElement('div');
    div.className = 'user-card';
    div.innerHTML = `
      <span>${u.username} (${u.role})</span>
      <button class="follow-btn">Prati</button>
    `;

    const btn = div.querySelector('button');
    btn.addEventListener('click', async () => {
      const ok = await followUser(followerId, u.id);
      if (ok) {
        btn.disabled = true;
        btn.textContent = 'Prati se';
      }
    });

    suggestedContainer.appendChild(div);
    alert(u.username);
  });
}

async function followUser(userId, targetId) {
  try {
    const res = await fetch(`${API_BASE}/api/followers/${targetId}?userId=${userId}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    return res.ok;
  } catch (err) {
    alert('Neuspešno praćenje korisnika');
    return false;
  }
}

// INIT
loadSuggested();