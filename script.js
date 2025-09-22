// GitHub Repository Configuration
const GITHUB_CONFIG = {
    owner: 'plankl', // Your GitHub username
    repo: 'ff_hamberg_ehrenamtskarte', // Your repository name
    branch: 'data', // Branch where data will be stored
    token: '', // Will be set via environment or prompt
};

// DOM Elements
const form = document.getElementById('memberForm');
const statusDiv = document.getElementById('status');

// Initialize form event listeners
document.addEventListener('DOMContentLoaded', function() {
    form.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearErrors);
    });
});

// Form submission handler
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showStatus('Bitte überprüfen Sie Ihre Eingaben.', 'error');
        return;
    }
    
    const formData = collectFormData();
    
    try {
        showStatus('Daten werden übertragen...', 'loading');
        await saveDataToGitHub(formData);
        showStatus('✓ Daten erfolgreich übertragen!', 'success');
        form.reset();
    } catch (error) {
        console.error('Error saving data:', error);
        showStatus('❌ Fehler beim Übertragen der Daten. Bitte versuchen Sie es erneut.', 'error');
    }
}

// Collect form data
function collectFormData() {
    const formData = new FormData(form);
    const data = {
        timestamp: new Date().toISOString(),
        nachname: formData.get('nachname').trim(),
        vorname: formData.get('vorname').trim(),
        geburtsdatum: formData.get('geburtsdatum'),
        email: formData.get('email').trim().toLowerCase(),
        adresse: {
            strasse: formData.get('strasse').trim(),
            hausnummer: formData.get('hausnummer').trim(),
            plz: formData.get('plz').trim(),
            ort: formData.get('ort').trim()
        },
        telefon: formData.get('telefon').trim(),
        datenschutz_zugestimmt: true
    };
    
    return data;
}

// Save data to GitHub repository
async function saveDataToGitHub(data) {
    // Get token from GitHub Secrets via GitHub Actions or prompt user
    const token = await getGitHubToken();
    
    if (!token) {
        throw new Error('GitHub Token ist erforderlich');
    }
    
    // Create unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `member-data-${timestamp}.json`;
    const path = `data/${filename}`;
    
    // Prepare file content
    const content = btoa(JSON.stringify(data, null, 2)); // Base64 encode
    
    // GitHub API request
    const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
            message: `Add member data: ${data.vorname} ${data.nachname}`,
            content: content,
            branch: GITHUB_CONFIG.branch
        })
    });
    
    if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
}

// Get GitHub token (this will be replaced with GitHub Actions workflow)
async function getGitHubToken() {
    // In production, this will be handled by GitHub Actions
    // For now, we'll use a placeholder that prompts for manual input
    
    // Check if running on GitHub Pages with Actions
    if (window.location.hostname.includes('github.io')) {
        // Token should be injected by GitHub Actions workflow
        return window.FF_DATA_TOKEN || null;
    }
    
    // For local testing, prompt for token
    const token = prompt('Bitte geben Sie Ihr GitHub Personal Access Token ein (nur für Tests):');
    return token?.trim() || null;
}

// Form validation
function validateForm() {
    let isValid = true;
    const requiredFields = form.querySelectorAll('input[required]');
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Individual field validation
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remove previous error styling
    field.classList.remove('error');
    
    // Check if required field is empty
    if (field.required && !value) {
        field.classList.add('error');
        return false;
    }
    
    // Specific validation rules
    switch (field.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                field.classList.add('error');
                return false;
            }
            break;
            
        case 'text':
            if (field.id === 'plz') {
                const plzRegex = /^\d{5}$/;
                if (value && !plzRegex.test(value)) {
                    field.classList.add('error');
                    return false;
                }
            }
            break;
            
        case 'date':
            if (value) {
                const date = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - date.getFullYear();
                
                if (age < 16 || age > 100) {
                    field.classList.add('error');
                    return false;
                }
            }
            break;
    }
    
    return true;
}

// Clear error styling on input
function clearErrors(event) {
    event.target.classList.remove('error');
}

// Show status message
function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// Add some additional security measures
document.addEventListener('DOMContentLoaded', function() {
    // Prevent form resubmission on page refresh
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
    
    // Add basic client-side rate limiting
    let lastSubmission = 0;
    const originalSubmit = handleFormSubmit;
    
    window.handleFormSubmit = function(event) {
        const now = Date.now();
        if (now - lastSubmission < 10000) { // 10 second cooldown
            event.preventDefault();
            showStatus('Bitte warten Sie 10 Sekunden zwischen den Übertragungen.', 'error');
            return;
        }
        lastSubmission = now;
        return originalSubmit(event);
    };
});