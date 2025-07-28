// Backend configuration
const config = {
    // If you know the exact port, set it here
    // Otherwise, it will try to detect from the current URL
    API_BASE_URL: 'http://localhost:3001/api',
    
    // Function to get the current host from the browser
    getApiUrl: function() {
        // If running from a web server, use relative URL
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return this.API_BASE_URL;
        }
        // For production, use relative URL
        return '/api';
    }
};

// Make it globally available
window.AppConfig = config;
