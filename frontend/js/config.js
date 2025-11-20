// API Configuration - Global variables
window.API_CONFIG = {
  GATEWAY: 'http://localhost:4000',
  BACKEND: 'http://localhost:3000',
  STAKEHOLDERS: 'http://localhost:3001',
  TOURS: 'http://localhost:3002',
  BLOG: 'http://localhost:5065'
};

// Use Gateway as default for ALL API calls
window.API_BASE = window.API_CONFIG.GATEWAY;
window.TOURS_BASE = window.API_CONFIG.GATEWAY; // Tours now via gateway

console.log('[Config] API_BASE set to:', window.API_BASE);
console.log('[Config] TOURS_BASE set to:', window.TOURS_BASE);
