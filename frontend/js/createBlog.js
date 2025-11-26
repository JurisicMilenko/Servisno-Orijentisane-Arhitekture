const API_BASE = window.API_BASE || 'http://localhost:4000';
const BLOG_BASE = window.BLOG_BASE || 'http://localhost:5065';

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = './index.html';
}

console.log('[createBlog.js] Token found');

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


// Form elements
const createBlogForm = document.getElementById('createBlogForm');

let createdBlogId = null;


// Form submit
createBlogForm.addEventListener('submit', async (ev) => {
    ev.preventDefault()
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const data1 = await res.json();
  const formData = new FormData(createBlogForm);
  var images = [{data: formData.get('image'), Id: 0, blogId: 0}]
  
  const now = new Date();
  const body = {
    id: 0,
    title: formData.get('title'),
    description: formData.get('description'),
    pictures: images,
    username: data1.username,
    status: "Active",
    createdAt: now,
    userId: data1.id,
    ratings: [],
    comments: [],
    tags: [],
  };
  // Only add duration if provided
  const image = formData.get('image');
  if (image) {
    body.image = image;
  }
  try {
    alert('Kreiranje bloga...', 'info');
    
    const res = await fetch(`${BLOG_BASE}/api/touristOrAuthor/blog`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (res.status !== 201) {
      alert(res.status);
      alert('Greška: ' + (data.error || 'Nepoznata greška'), 'error');
      return;
    }

    createdBlogId = data._id || data.id;
    
    alert('Blog uspješno kreiran! ✓', 'success');

  } catch (err) {
    alert('Greška: ' + err.message, 'error');
  }
});

