// GitHub Repository Configuration
const GITHUB_CONFIG = {
    owner: 'plankl', // Your GitHub username
    repo: 'ff_hamberg_ehrenamtskarte', // Your repository name
    branch: 'data', // Branch where data will be stored
    token: '', // Will be set via environment or prompt
};

// Token configuration - will be replaced by GitHub Actions
const GITHUB_TOKEN = 'GITHUB_TOKEN_PLACEHOLDER';

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
        // Find first invalid field and scroll to it
        const firstInvalidField = form.querySelector('.error, :invalid');
        if (firstInvalidField) {
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidField.focus();
            
            // Show specific error message
            let fieldName = firstInvalidField.getAttribute('name') || firstInvalidField.id;
            let errorMsg = `❌ Bitte ${getFieldDisplayName(fieldName)} korrekt ausfüllen.`;
            showStatus(errorMsg, 'error');
        } else {
            showStatus('❌ Bitte überprüfen Sie Ihre Eingaben.', 'error');
        }
        
        // Scroll to status message after a brief delay
        setTimeout(() => {
            document.getElementById('status').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
        
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
        // Check for duplicates first
        showStatus('Prüfe auf doppelte Einträge...', 'loading');
        const duplicateCheck = await checkForDuplicates(formData);
        
        if (duplicateCheck.isDuplicate) {
            const proceed = confirm(
                `⚠️ Möglicher doppelter Eintrag gefunden!\n\n` +
                `${duplicateCheck.message}\n\n` +
                `Möchten Sie trotzdem fortfahren?`
            );
            
            if (!proceed) {
                showStatus('Übertragung abgebrochen - doppelter Eintrag vermieden', 'warning');
                return;
            }
        }
        
        showStatus('Daten werden übertragen...', 'loading');
        await saveDataToGitHub(formData);
        showStatus('✓ Daten erfolgreich übertragen!', 'success');
        form.reset();
        
        // Clear password field after successful submission
        document.getElementById('access_password').value = '';
        
        // Reset button states for next entry
        resetButtonStates();
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error saving data:', error);
        let errorMessage = '❌ Fehler beim Übertragen der Daten.';
        
        if (error.message.includes('token')) {
            errorMessage += ' Token-Problem: Bitte GitHub Token erneut eingeben.';
        } else if (error.message.includes('network')) {
            errorMessage += ' Netzwerk-Problem: Prüfen Sie Ihre Internetverbindung.';
        } else {
            errorMessage += ' Bitte versuchen Sie es erneut oder kontaktieren Sie den Administrator.';
        }
        
        showStatus(errorMessage, 'error');
        
        // Reset button states so user can try again
        resetButtonStates();
        
        // Scroll to status message
        document.getElementById('status').scrollIntoView({ behavior: 'smooth', block: 'center' });
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

// Check for duplicate entries
async function checkForDuplicates(newData) {
    try {
        const token = await getGitHubToken();
        
        // Try to load existing members summary
        const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/data/all_members.json?ref=${GITHUB_CONFIG.branch}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const fileData = await response.json();
            const existingData = JSON.parse(atob(fileData.content));
            
            // Check for duplicates based on email or name+birthdate
            for (const existing of existingData.members || []) {
                // Email duplicate check
                if (existing.email.toLowerCase() === newData.email.toLowerCase()) {
                    return {
                        isDuplicate: true,
                        field: 'email',
                        existing: existing,
                        message: `E-Mail Adresse bereits vorhanden: ${existing.vorname} ${existing.nachname} (${existing.email})`
                    };
                }
                
                // Name + birthdate duplicate check
                if (existing.nachname.toLowerCase() === newData.nachname.toLowerCase() && 
                    existing.vorname.toLowerCase() === newData.vorname.toLowerCase() && 
                    existing.geburtsdatum === newData.geburtsdatum) {
                    return {
                        isDuplicate: true,
                        field: 'name_birthdate',
                        existing: existing,
                        message: `Person bereits vorhanden: ${existing.vorname} ${existing.nachname} (${existing.geburtsdatum})`
                    };
                }
            }
        }
        
        return { isDuplicate: false };
    } catch (error) {
        console.warn('Duplikat-Prüfung fehlgeschlagen:', error);
        return { isDuplicate: false }; // Bei Fehler erlauben wir die Eingabe
    }
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
    // Debug information
    const isPlaceholder = GITHUB_TOKEN === 'GITHUB_TOKEN_PLACEHOLDER';
    const isValidToken = GITHUB_TOKEN && GITHUB_TOKEN.startsWith('ghp_') && GITHUB_TOKEN.length >= 36;
    
    console.log('🔍 Token Debug Info:', {
        'GITHUB_TOKEN': GITHUB_TOKEN ? GITHUB_TOKEN.substring(0, 8) + '...' : 'null',
        'Is Placeholder': isPlaceholder,
        'Is Valid Token': isValidToken,
        'Token Length': GITHUB_TOKEN ? GITHUB_TOKEN.length : 0,
        'Hostname': window.location.hostname
    });
    
    // Check if we have a valid token from GitHub Actions deployment
    if (isValidToken) {
        console.log('✅ Valid GitHub token found!');
        return GITHUB_TOKEN;
    }
    
    // Check if running on GitHub Pages with Actions (fallback)
    if (window.location.hostname.includes('github.io')) {
        console.error('❌ No valid token found. Current token:', GITHUB_TOKEN);
        console.error('🔧 Token injection failed. This indicates FF_DATA_TOKEN secret is not properly configured.');
        
        // Show user-friendly error with instructions first
        showStatus(
            '❌ Token-Konfiguration fehlt! Administrator muss FF_DATA_TOKEN Secret hinzufügen.',
            'error'
        );
        
        // Temporary fallback: Ask user for token
        const userToken = prompt(
            '⚠️ GitHub Token nicht verfügbar!\n\n' +
            'Temporäre Lösung: Geben Sie Ihren Personal Access Token ein:\n' +
            '(Dieser sollte mit "ghp_" beginnen)\n\n' +
            'Dauerhaften Fix: FF_DATA_TOKEN Secret in GitHub konfigurieren\n' +
            'Token erstellen: https://github.com/settings/tokens'
        );
        
        if (userToken && userToken.trim().startsWith('ghp_') && userToken.trim().length >= 36) {
            console.log('✅ Temporärer Token eingegeben');
            return userToken.trim();
        }
        
        throw new Error('Kein gültiger GitHub Token verfügbar - Datenübertragung nicht möglich');
    }
    
    // For local testing, prompt for token  
    const userToken = prompt(
        '🔑 GitHub Personal Access Token eingeben:\n\n' +
        'Berechtigung: Contents (Read & Write)\n' +
        'Format: ghp_...\n\n' +
        'Token erstellen: https://github.com/settings/tokens'
    );
    
    if (userToken && userToken.trim().startsWith('ghp_') && userToken.trim().length >= 36) {
        return userToken.trim();
    }
    
    throw new Error('Ungültiger GitHub Token - muss mit ghp_ beginnen');
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

// Reset button states for new entry
function resetButtonStates() {
    submitBtn.style.display = 'none';
    previewBtn.style.display = 'block';
    submitBtn.onclick = null; // Clear onclick handler
}

// Get user-friendly field names for error messages
function getFieldDisplayName(fieldName) {
    const fieldNames = {
        'nachname': 'Nachname',
        'vorname': 'Vorname', 
        'geburtsdatum': 'Geburtsdatum',
        'email': 'E-Mail Adresse',
        'strasse': 'Straße',
        'hausnummer': 'Hausnummer',
        'plz': 'Postleitzahl',
        'ort': 'Ort',
        'telefon': 'Telefonnummer',
        'access_password': 'Passwort'
    };
    return fieldNames[fieldName] || fieldName;
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