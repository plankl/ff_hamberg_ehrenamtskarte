// GitHub Repository Configuration
const GITHUB_CONFIG = {
    owner: 'plankl', // Your GitHub username
    repo: 'ff_hamberg_ehrenamtskarte', // Your repository name
    branch: 'data', // Branch where data will be stored
    token: '', // Will be set via environment or prompt
};

// Access Control Configuration
const ACCESS_CONFIG = {
    // Das richtige Passwort - ändern Sie dies zu Ihrem gewünschten Passwort
    correctPassword: 'FFHamberg2025!', // TODO: Ändern Sie dieses Passwort!
    maxAttempts: 3,
    lockoutTime: 300000 // 5 Minuten in Millisekunden
};

// Password attempt tracking
let passwordAttempts = {
    count: 0,
    lastAttempt: 0
};

// DOM Elements
const form = document.getElementById('memberForm');
const statusDiv = document.getElementById('status');
const previewModal = document.getElementById('previewModal');
const previewBtn = document.querySelector('.preview-btn');
const submitBtn = document.querySelector('.submit-btn');

// Initialize form event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeForm();
    initializeModal();
});

// Initialize tab functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Initialize form functionality
function initializeForm() {
    form.addEventListener('submit', handleFormSubmit);
    previewBtn.addEventListener('click', showPreview);
    
    // Add real-time validation
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearErrors);
    });
}

// Initialize modal functionality
function initializeModal() {
    const closeBtn = document.querySelector('.close');
    const editBtn = document.getElementById('editData');
    const confirmBtn = document.getElementById('confirmSubmit');
    
    closeBtn.addEventListener('click', closeModal);
    editBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', confirmAndSubmit);
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === previewModal) {
            closeModal();
        }
    });
}

// Validate access password
function validatePassword() {
    const passwordField = document.getElementById('access_password');
    const enteredPassword = passwordField.value.trim();
    
    // Check if user is locked out
    const now = Date.now();
    if (passwordAttempts.count >= ACCESS_CONFIG.maxAttempts && 
        (now - passwordAttempts.lastAttempt) < ACCESS_CONFIG.lockoutTime) {
        const remainingTime = Math.ceil((ACCESS_CONFIG.lockoutTime - (now - passwordAttempts.lastAttempt)) / 1000 / 60);
        showStatus(`❌ Zu viele Fehlversuche. Bitte warten Sie ${remainingTime} Minuten.`, 'error');
        return false;
    }
    
    // Reset attempts if lockout time has passed
    if ((now - passwordAttempts.lastAttempt) >= ACCESS_CONFIG.lockoutTime) {
        passwordAttempts.count = 0;
    }
    
    // Check password
    if (enteredPassword !== ACCESS_CONFIG.correctPassword) {
        passwordAttempts.count++;
        passwordAttempts.lastAttempt = now;
        
        const remainingAttempts = ACCESS_CONFIG.maxAttempts - passwordAttempts.count;
        
        if (remainingAttempts > 0) {
            showStatus(`❌ Falsches Passwort. Noch ${remainingAttempts} Versuche übrig.`, 'error');
        } else {
            showStatus(`❌ Zu viele Fehlversuche. Account für 5 Minuten gesperrt.`, 'error');
        }
        
        passwordField.classList.add('error');
        passwordField.focus();
        return false;
    }
    
    // Password correct - reset attempts
    passwordAttempts.count = 0;
    passwordField.classList.remove('error');
    return true;
}

// Show data preview
function showPreview() {
    if (!validateForm()) {
        showStatus('Bitte überprüfen Sie Ihre Eingaben.', 'error');
        return;
    }
    
    // Validate password before showing preview
    if (!validatePassword()) {
        return;
    }
    
    const formData = collectFormData();
    displayPreview(formData);
    previewModal.style.display = 'block';
    
    // Show submit button after preview is shown
    showSubmitButton();
}

// Display preview data in modal
function displayPreview(data) {
    const previewDiv = document.getElementById('previewData');
    
    const qualifikationen = [];
    if (data.mta_absolviert) qualifikationen.push('MTA absolviert');
    if (data.dienstjahre_25) qualifikationen.push('25 Jahre Dienst');
    if (data.dienstjahre_40) qualifikationen.push('40 Jahre Dienst');
    
    previewDiv.innerHTML = `
        <table class="preview-data-table">
            <tr><th>Name:</th><td>${data.vorname} ${data.nachname}</td></tr>
            <tr><th>Geburtsdatum:</th><td>${data.geburtsdatum}</td></tr>
            <tr><th>E-Mail:</th><td>${data.email}</td></tr>
            <tr><th>Adresse:</th><td>${data.adresse.strasse} ${data.adresse.hausnummer}<br>${data.adresse.plz} ${data.adresse.ort}</td></tr>
            <tr><th>Telefon:</th><td>${data.telefon}</td></tr>
            <tr><th>Qualifikationen:</th><td>${qualifikationen.length > 0 ? qualifikationen.join('<br>') : 'Keine angegeben'}</td></tr>
            <tr><th>Erfasst am:</th><td>${new Date(data.timestamp).toLocaleString('de-DE')}</td></tr>
        </table>
    `;
}

// Close modal
function closeModal() {
    previewModal.style.display = 'none';
}

// Confirm and submit data
async function confirmAndSubmit() {
    // First validate password
    if (!validatePassword()) {
        return; // Password validation failed, stop submission
    }
    
    closeModal();
    
    const formData = collectFormData();
    
    try {
        showStatus('Daten werden übertragen...', 'loading');
        await saveDataToGitHub(formData);
        showStatus('✓ Daten erfolgreich übertragen!', 'success');
        form.reset();
        
        // Clear password field after successful submission
        document.getElementById('access_password').value = '';
        
        submitBtn.style.display = 'none';
        previewBtn.style.display = 'block';
    } catch (error) {
        console.error('Error saving data:', error);
        showStatus('❌ Fehler beim Übertragen der Daten. Bitte versuchen Sie es erneut.', 'error');
    }
}

// Form submission handler (now only handles preview)
async function handleFormSubmit(event) {
    event.preventDefault();
    showPreview();
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
        qualifikationen: {
            mta_absolviert: document.getElementById('mta_absolviert').checked,
            dienstjahre_25: document.getElementById('dienstjahre_25').checked,
            dienstjahre_40: document.getElementById('dienstjahre_40').checked
        },
        // Legacy support for preview function
        mta_absolviert: document.getElementById('mta_absolviert').checked,
        dienstjahre_25: document.getElementById('dienstjahre_25').checked,
        dienstjahre_40: document.getElementById('dienstjahre_40').checked,
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

// Show submit button after preview
function showSubmitButton() {
    previewBtn.style.display = 'none';
    submitBtn.style.display = 'block';
    submitBtn.onclick = confirmAndSubmit;
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