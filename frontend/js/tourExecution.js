const API_BASE = window.API_BASE || 'http://localhost:4000';
const TOURS_BASE = window.TOURS_BASE;

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

// Map variables
let map;
var marker = null;
let polyline = null;
let tempMarker = null;

var userId = null;
var checkpoints = [];
var completedCheckpoints = []
var executionId = null;

const markerGroup = new L.LayerGroup();

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


window.onload = async function() {
    const res1 = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data1 = await res1.json();
    userId = data1.id
    const res3 = await fetch(`${TOURS_BASE}/api/tours/`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data2 = await res3.json();
    const res = await fetch(`${TOURS_BASE}/api/tours/execution/list`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    //zameni kada se uradi cart
    for(var i in data){
        if(data[i].userId == userId && data[i].tourId == data2[0].id){
            executionId = data[i]._id
            
            for(var j in data[i].completedCheckpoints){
                completedCheckpoints.push(data[i].completedCheckpoints[j])
            }
        }
    }

    //var userId = data[0].userId
    if(data.length == 0){
        const res4 = await fetch(`${TOURS_BASE}/api/tours/execution/`, {
      method: 'POST',
      headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
      body: JSON.stringify({tourId: data2[0].id})
    });
    const data4 = await res4.json();
    }
    completedCheckpoints = data[0].completedCheckpoints
    initMap();

    for(var i in data2[0].keyPoints){
        checkpoints.push(data2[0].keyPoints[i])
    }

    for(var i in data2[0].keyPoints){
        if(completedCheckpoints.some(e => e._id === data2[0].keyPoints[i]._id)){
            continue
        }
        marker = L.marker([data2[0].keyPoints[i].latitude, data2[0].keyPoints[i].longitude],{
      icon: L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #FF69B4; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).addTo(markerGroup);
    }
    markerGroup.addTo(map);
    
    //marker = L.marker([data[0].latitude, data[0].longitude]).addTo(map);
// You can use native DOM methods to insert the fragment:
    
};

function initMap() {
  // Center on Novi Sad, Serbia
  map = L.map('map').setView([45.2671, 19.8335], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);


}

window.setInterval(async function(){

     markerGroup.clearLayers();

    const res = await fetch(`${TOURS_BASE}/api/tours/position/users/`+userId, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    marker = L.marker([data[0].latitude, data[0].longitude]).addTo(markerGroup);
    
    for(var i in checkpoints){
        
        if(getDistanceFromLatLonInKm(checkpoints[i].latitude,checkpoints[i].longitude,data[0].latitude, data[0].longitude) < 0.05){
            if(!completedCheckpoints.some(e => e._id === checkpoints[i]._id)){
                completedCheckpoints.push(checkpoints[i])
            const res = await fetch(`${TOURS_BASE}/api/tours/execution/`+executionId, {
            method: 'PUT',
            headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkpoints[i])
            });
            const data = await res.json();
        }
        }
    }
    
    for(var i in checkpoints){
        if(completedCheckpoints.some(e => e._id === checkpoints[i]._id)){
            continue
        }
        marker = L.marker([checkpoints[i].latitude, checkpoints[i].longitude],{
      icon: L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #FF69B4; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })
    }).addTo(markerGroup);
    }
    markerGroup.addTo(map);
    
    if(completedCheckpoints.length == checkpoints.length){
        const res = await fetch(`${TOURS_BASE}/api/tours/execution/complete/`+executionId, {
            method: 'PUT',
            headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
            }
            });
            const data = await res.json();
    }

    //alert(data[0].longitude)
}, 10000);

//thanks stack overflow <3
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

