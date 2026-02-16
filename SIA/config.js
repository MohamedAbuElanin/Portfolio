// Backend URL - Update this with your actual Railway/Render backend URL
// Set this via window.BACKEND_URL before config.js loads, or update the default below
const BACKEND_URL = window.BACKEND_URL || 'https://your-backend-url.railway.app'; // UPDATE THIS

const CONFIG = {
    // Backend URL
    BACKEND_URL: BACKEND_URL,
    
    // Check if we are running locally (localhost or 127.0.0.1)
    // If local, assume backend is on port 5000.
    // If production, use BACKEND_URL
    API_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : `${BACKEND_URL}/api`,
    
    // Standalone Express server endpoint (for /submit-test)
    SERVER_BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : BACKEND_URL
};

// Make CONFIG available globally
window.CONFIG = CONFIG;