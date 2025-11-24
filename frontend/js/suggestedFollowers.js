const API_BASE = window.API_BASE || 'http://localhost:4000';

// Container for suggested users
const suggestedContainer = document.getElementById('suggestedContainer');

// Fetch current user ID first
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = './index.html';
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) throw new Error('Greška prilikom dohvaćanja korisnika');

    const data = await res.json();
    return data.id; // the userId
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Load and display suggested users
async function loadSuggested() {
  suggestedContainer.innerHTML = '<p style="text-align:center; color:#999;">Učitavanje...</p>';

  const userId = await getCurrentUser();
  if (!userId) return;

  try {
    // 1. Get suggested IDs
    let res = await fetch(`${API_BASE}/api/followers/suggested?userId=${userId}`);
    if (!res.ok) throw new Error('Greška prilikom učitavanja preporuka');

    let suggestedIds = await res.json();

    // 2. Fallback: if no suggested, fetch all users
    if (suggestedIds.length === 0) {
      const allRes = await fetch(`${API_BASE}/api/users`);
      if (!allRes.ok) throw new Error('Greška prilikom učitavanja korisnika');
      const allUsers = await allRes.json();

      // Exclude the current user
      const filteredUsers = allUsers.filter(u => u.id !== userId);

      renderUsers(filteredUsers, userId);
      return;
    }

    // 3. Fetch full user data for suggested IDs
    const users = await Promise.all(
      suggestedIds.map(async id => {
        const userRes = await fetch(`${API_BASE}/api/users/${id}`);
        return userRes.json();
      })
    );

    renderUsers(users, userId);

  } catch (err) {
    suggestedContainer.innerHTML = `<p style="text-align:center; color:red;">${err.message}</p>`;
  }
}

// Render user cards
function renderUsers(users, userId) {
  suggestedContainer.innerHTML = ''; // clear placeholder
  users.forEach(u => {
    const div = document.createElement('div');
    div.className = 'user-card';
    div.style.display = 'flex';
    div.style.justifyContent = 'space-between';
    div.style.alignItems = 'center';
    div.style.marginBottom = '8px';
    div.innerHTML = `
      <span>${u.username} (${u.role})</span>
      <button class="follow-btn">Prati</button>
    `;

    const btn = div.querySelector('button');
    btn.addEventListener('click', async () => {
      await followUser(u.id, userId);
      btn.disabled = true;
      btn.textContent = 'Prati se';
    });

    suggestedContainer.appendChild(div);
  });
}

// Follow a user
async function followUser(targetId, userId) {
  try {
    const res = await fetch(`${API_BASE}/api/followers/${targetId}?userId=${userId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Greška prilikom praćenja korisnika');
  } catch (err) {
    alert(err.message);
  }
}

// Load suggested users on page load
loadSuggested();
