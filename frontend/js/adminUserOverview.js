const API_BASE = window.API_BASE;
const STAKEHOLDERS_BASE = window.STAKEHOLDERS_BASE;

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[adminUserOverview.js] Token found');

// Navigation
const homeBtn = document.getElementById('homeBtn');
const logoutBtn = document.getElementById('logoutBtn');

homeBtn?.addEventListener('click', () => {
  const ts = Date.now();
  window.location.href = `./home.html?v=${ts}`;
});

logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('token');
  const ts = Date.now();
  window.location.href = `./index.html?v=${ts}`;
});

// UI Elements
const usersTableBody = document.getElementById('usersTableBody');
const errorMessage = document.getElementById('errorMessage');

function showError(msg) {
  if (errorMessage) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
  }
}

function hideError() {
  if (errorMessage) {
    errorMessage.style.display = 'none';
  }
}

async function loadUsers() {
  try {
    hideError();
    usersTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Učitavanje korisnika...</td></tr>';

    const res = await fetch(`${STAKEHOLDERS_BASE}/api/stakeholders/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.status === 403) {
      showError('Nemate administratorske privilegije.');
      usersTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red;">Pristup zabranjen</td></tr>';
      return;
    }

    if (res.status !== 200) {
      const data = await res.json();
      showError('Greška: ' + (data.error || 'Nepoznata greška'));
      usersTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red;">Greška pri učitavanju</td></tr>';
      return;
    }

    const users = await res.json();
    
    if (!users.length) {
      usersTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Nema korisnika</td></tr>';
      return;
    }

    usersTableBody.innerHTML = users.map(user => `
      <tr data-user-id="${user.id}">
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email || '-'}</td>
        <td><span class="role-badge role-${user.role}">${user.role}</span></td>
        <td><span class="status-badge status-${user.status}">${user.status}</span></td>
        <td>${user.first_name || '-'}</td>
        <td>${user.last_name || '-'}</td>
        <td>
          ${user.role !== 'admin' ? `
            <button class="btn ${user.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'} btn-toggle-status" 
                    data-id="${user.id}" 
                    data-current-status="${user.status}">
              ${user.status === 'ACTIVE' ? 'Ban' : 'Unban'}
            </button>
          ` : '<span style="color:#999;">-</span>'}
        </td>
      </tr>
    `).join('');

    // Attach event listeners to toggle buttons
    document.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.dataset.id;
        const currentStatus = e.target.dataset.currentStatus;
        const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
        await toggleUserStatus(userId, newStatus);
      });
    });

  } catch (err) {
    console.error('Error loading users:', err);
    showError('Greška: ' + err.message);
    usersTableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:red;">Greška pri učitavanju</td></tr>';
  }
}

async function toggleUserStatus(userId, newStatus) {
  try {
    hideError();
    const res = await fetch(`${STAKEHOLDERS_BASE}/api/stakeholders/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.status !== 200) {
      const data = await res.json();
      showError('Greška: ' + (data.error || 'Nepoznata greška'));
      return;
    }

    // Reload users to reflect changes
    await loadUsers();
  } catch (err) {
    console.error('Error toggling user status:', err);
    showError('Greška: ' + err.message);
  }
}

// Initial load
loadUsers();
