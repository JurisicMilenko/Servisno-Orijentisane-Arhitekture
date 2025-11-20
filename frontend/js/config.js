// API Configuration - Global variables
window.API_CONFIG = {
  GATEWAY: 'http://localhost:4000',
};

window.API_BASE = window.API_CONFIG.GATEWAY;
window.TOURS_BASE = window.API_CONFIG.GATEWAY;
window.BLOG_BASE = window.API_CONFIG.GATEWAY; 
window.FOLLOWERS_BASE = window.API_CONFIG.GATEWAY;
window.STAKEHOLDERS_BASE = window.API_CONFIG.GATEWAY;

console.log('[Config] API_BASE set to:', window.API_BASE);
console.log('[Config] TOURS_BASE set to:', window.TOURS_BASE);
console.log('[Config] BLOG_BASE set to:', window.BLOG_BASE);
console.log('[Config] FOLLOWERS_BASE set to:', window.FOLLOWERS_BASE);
console.log('[Config] STAKEHOLDERS_BASE set to:', window.STAKEHOLDERS_BASE);
