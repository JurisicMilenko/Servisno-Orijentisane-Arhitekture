const API_BASE = 'http://localhost:3000';

function jsonResponse(res) {
  return res.text().then(t => {
    try { return JSON.parse(t); } catch(e) { return t; }
  }).then(body => ({ status: res.status, ok: res.ok, body }));
}

// Register
const registerForm = document.getElementById('registerForm');
const registerResult = document.getElementById('registerResult');
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const email = document.getElementById('regEmail').value.trim();
  const role = document.getElementById('regRole').value;
  const first_name = document.getElementById('regFirst').value.trim();
  const last_name = document.getElementById('regLast').value.trim();
  const avatar_url = document.getElementById('regAvatar').value.trim();
  const bio = document.getElementById('regBio').value.trim();
  const motto = document.getElementById('regMotto').value.trim();
  registerResult.textContent = 'Sending...';
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email, role, first_name, last_name, avatar_url, bio, motto })
    });
    const j = await jsonResponse(res);
    registerResult.textContent = JSON.stringify(j, null, 2);
    if (res.ok) {
      // optionally switch to login view
      document.getElementById('register').style.display = 'none';
      document.getElementById('login').style.display = '';
    }
  } catch (err) {
    registerResult.textContent = 'Error: ' + err.message;
  }
});

// Login
const loginForm = document.getElementById('loginForm');
const loginResult = document.getElementById('loginResult');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  loginResult.textContent = 'Sending...';
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const j = await jsonResponse(res);
    loginResult.textContent = JSON.stringify(j, null, 2);
    if (res.ok && j && j.body && j.body.token) {
      // save token and redirect to home with cache busting
      localStorage.setItem('token', j.body.token);
      const ts = Date.now();
      window.location.href = `./home.html?v=${ts}`;
    }
  } catch (err) {
    loginResult.textContent = 'Error: ' + err.message;
  }
});

// UI toggles
document.getElementById('showRegister').addEventListener('click', () => {
  document.getElementById('login').style.display = 'none';
  document.getElementById('register').style.display = '';
});
document.getElementById('hideRegister').addEventListener('click', () => {
  document.getElementById('register').style.display = 'none';
  document.getElementById('login').style.display = '';
});
