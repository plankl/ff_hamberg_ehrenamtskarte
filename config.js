// GitHub Configuration - Will be replaced during deployment
window.GITHUB_CONFIG = window.GITHUB_CONFIG || {
    tokenConfigured: false,
    token: null
};

// This file will be automatically generated during GitHub Actions deployment 
// with the actual DATA_TRANSFER_TOKEN if configured
console.log('📁 Local config.js loaded - deployment will override if token is configured');