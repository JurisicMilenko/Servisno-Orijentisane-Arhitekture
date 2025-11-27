const API_BASE_URL = window.API_BASE;
const token = localStorage.getItem('token');

const userDetailsBtn = document.getElementById('userDetailsBtn');
const myToursBtn = document.getElementById('myToursBtn');
const createTourBtn = document.getElementById('createTourBtn');
const createBlogBtn = document.getElementById('createBlogBtn');
const viewBlogBtn = document.getElementById('viewBlogBtn');
const posSimBtn = document.getElementById('posSimBtn');
const adminBtn = document.getElementById('adminBtn');
const suggestedFollowersBtn = document.getElementById('suggestedFollowersBtn');
const logoutBtn = document.getElementById('logoutBtn');

if (!token) {
  window.location.href = './index.html';
}

let currentUser = null;

// Fetch current user info
async function loadCurrentUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (!res.ok) throw new Error('Failed to fetch user info');

    currentUser = await res.json();
    console.log('[createTourRating.js] Current user:', currentUser);

    const usernameSpan = document.getElementById('username');
    if (usernameSpan) {
      usernameSpan.textContent = currentUser.username || 'Nepoznat korisnik';
    }

  } catch (err) {
    console.error('Error loading current user:', err);
    const usernameSpan = document.getElementById('username');
    if (usernameSpan) usernameSpan.textContent = 'Nepoznat korisnik';
  }
}

loadCurrentUser();

// Handle form submission
document.getElementById('ratingForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert('Nije moguće poslati ocenu jer korisnik nije učitan.');
    return;
  }

  const tourId = document.getElementById('tourId').value;
  const rating = document.getElementById('rating').value;
  const comment = document.getElementById('comment').value;
  const dateOfAttendance = document.getElementById('dateOfAttendance').value;

  if (!rating || !dateOfAttendance) {
    alert('Molimo popunite ocenu i datum prisustva.');
    return;
  }

  const payload = {
      tourId,
      userId: currentUser.id,
      username: currentUser.username,
      rating: parseInt(rating),
      comment,
      dateOfAttendance: new Date(dateOfAttendance).toISOString(),
      dateOfRating: new Date().toISOString()
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/tours/${tourId}/ratings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Failed to submit rating");
    }

    alert("Ocena uspešno poslata!");
    location.href = `tourDetails.html?id=${tourId}`;

  } catch (error) {
    console.error("Submission error:", error);
    alert("Došlo je do greške pri slanju ocene");
  }
});

userDetailsBtn?.addEventListener('click', () => window.location.href = `./userDetails.html?v=${Date.now()}`);
myToursBtn?.addEventListener('click', () => window.location.href = `./myTours.html?v=${Date.now()}`);
createTourBtn?.addEventListener('click', () => window.location.href = `./createTour.html?v=${Date.now()}`);
createBlogBtn?.addEventListener('click', () => window.location.href = `./createBlog.html?v=${Date.now()}`);
viewBlogBtn?.addEventListener('click', () => window.location.href = `./blogView.html?v=${Date.now()}`);
posSimBtn?.addEventListener('click', () => window.location.href = `./positionSimulator.html?v=${Date.now()}`);
adminBtn?.addEventListener('click', () => window.location.href = `./adminUserOverview.html?v=${Date.now()}`);
suggestedFollowersBtn?.addEventListener('click', () => window.location.href = `./suggestedFollowers.html?v=${Date.now()}`);
logoutBtn?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = `./index.html?v=${Date.now()}`;
});
