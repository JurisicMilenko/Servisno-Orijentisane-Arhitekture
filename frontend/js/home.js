const API_BASE = 'http://localhost:3000';

const profileContent = document.getElementById('profileContent');
const token = localStorage.getItem('token');

if (!token) {
  // not logged in
  window.location.href = './index.html';
} else {
  fetch(`${API_BASE}/api/auth/me`, { headers: { 'Authorization': 'Bearer ' + token } })
    .then(res => res.json().then(b => ({ status: res.status, body: b })))
    .then(r => {
      if (r.status !== 200) {
        profileContent.textContent = 'Error: ' + JSON.stringify(r.body);
        return;
      }
      const p = r.body;
      profileContent.innerHTML = `
        <p><strong>Username:</strong> ${p.username}</p>
        <p><strong>Email:</strong> ${p.email || ''}</p>
        <p><strong>Role:</strong> ${p.role || ''}</p>
        <p><strong>Name:</strong> ${p.first_name || ''} ${p.last_name || ''}</p>
        <p><strong>Motto:</strong> ${p.motto || ''}</p>
        <p><strong>Bio:</strong> ${p.bio || ''}</p>
        ${p.avatar_url ? `<p><img src="${p.avatar_url}" alt="avatar" style="max-width:150px;border-radius:8px"/></p>` : ''}
      `;
    }).catch(err => {
      profileContent.textContent = 'Error: ' + err.message;
    });
}

document.getElementById('logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = './index.html';
});
