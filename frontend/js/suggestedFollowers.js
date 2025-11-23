const token = localStorage.getItem('token');
if (!token) {
  window.location.href = './index.html';
}

// Navigation buttons
document.getElementById('homeBtn')?.addEventListener('click', () => {
  window.location.href = './home.html?v=' + Date.now();
});

document.getElementById('profileBtn')?.addEventListener('click', () => {
  window.location.href = './userDetails.html?v=' + Date.now();
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = './index.html?v=' + Date.now();
});

// Container for suggested users
const suggestedContainer = document.getElementById('suggestedContainer');

// Fetch and display suggested users
async function loadSuggested() {
  suggestedContainer.innerHTML = '<p style="text-align:center; color:#999;">Učitavanje...</p>';
  
  try {
    // 1. Get suggested IDs from the followers microservice via gateway
    const res = await fetch(`${API_BASE}/api/followers/suggested`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!res.ok) throw new Error('Greška prilikom učitavanja preporuka');

    const suggestedIds = await res.json();
    if (suggestedIds.length === 0) {
      suggestedContainer.innerHTML = '<p style="text-align:center; color:#999;">Nema preporuka</p>';
      return;
    }

    // 2. Fetch full user data for each suggested ID
    const users = await Promise.all(
      suggestedIds.map(async id => {
        const userRes = await fetch(`${API_BASE}/api/users/${id}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        return userRes.json();
      })
    );

    // 3. Render the list
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
        await followUser(u.id);
        btn.disabled = true;
        btn.textContent = 'Prati se';
      });
      suggestedContainer.appendChild(div);
    });

  } catch (err) {
    suggestedContainer.innerHTML = `<p style="text-align:center; color:red;">${err.message}</p>`;
  }
}

// Follow a user
async function followUser(targetId) {
  try {
    const res = await fetch(`${API_BASE}/api/followers/${targetId}`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Greška prilikom praćenja korisnika');
  } catch (err) {
    alert(err.message);
  }
}

// Load suggested users on page load
loadSuggested();