# 🚒 Feuerwehr Hamberg - Mitgliederdaten Erfassung

Eine sichere Website zur Erfassung von Mitgliederdaten der Feuerwehr Hamberg, die über GitHub Pages gehostet wird und Daten sicher auf GitHub speichert.

## 🎯 Funktionen

- **Benutzerfreundliches Formular** mit allen erforderlichen Feldern
- **Responsive Design** für Desktop und Mobile
- **Sichere Datenübertragung** über GitHub API
- **Automatische Validierung** der Eingaben
- **GitHub Pages Hosting** für einfachen Zugriff
- **Sichere Datenspeicherung** in separatem Branch

## 📋 Erfasste Daten

- Name und Vorname
- Geburtsdatum
- E-Mail Adresse
- Vollständige Adresse (Straße, Hausnummer, PLZ, Ort)
- Telefonnummer
- Datenschutz-Einverständnis

## 🔧 Einrichtung

### 1. Repository Setup

1. **Repository klonen oder forken**
2. **GitHub Pages aktivieren:**
   - Gehen Sie zu `Settings` → `Pages`
   - Wählen Sie `GitHub Actions` als Source
   - Die Website wird automatisch unter `https://[username].github.io/[repository-name]` verfügbar sein

### 2. GitHub Personal Access Token erstellen

1. Gehen Sie zu GitHub → `Settings` → `Developer settings` → `Personal access tokens` → `Tokens (classic)`
2. Klicken Sie auf `Generate new token (classic)`
3. Setzen Sie folgende Berechtigung:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
4. **Token sicher kopieren und aufbewahren!**

### 3. Repository Secrets konfigurieren

1. Gehen Sie zu Ihrem Repository → `Settings` → `Secrets and variables` → `Actions`
2. Klicken Sie auf `New repository secret`
3. Fügen Sie folgendes Secret hinzu:
   - **Name:** `FF_DATA_TOKEN`
   - **Value:** Ihr Personal Access Token aus Schritt 2

### 4. Automatisches Deployment

Nach einem Push auf den `main` Branch:

- GitHub Actions erstellt automatisch einen `data` Branch für die Datenspeicherung
- Die Website wird automatisch auf GitHub Pages deployed
- Der GitHub Token wird sicher in das JavaScript eingebettet

## 🏗️ Projektstruktur

```
ff_hamberg_ehrenamtskarte/
├── index.html              # Hauptformular
├── styles.css              # Styling (Feuerwehr-Design)
├── script.js               # JavaScript-Funktionalität
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions Workflow
├── .gitignore              # Git-Ignore-Datei
└── README.md               # Diese Dokumentation
```

## 📊 Datenspeicherung

- **Branch:** `data` (automatisch erstellt)
- **Format:** JSON-Dateien mit Timestamp
- **Dateiname:** `member-data-YYYY-MM-DDTHH-mm-ss.json`
- **Zugriff:** Nur Repository-Owner können die Daten einsehen

### Beispiel einer gespeicherten JSON-Datei:

```json
{
  "timestamp": "2024-01-15T14:30:25.123Z",
  "nachname": "Müller",
  "vorname": "Hans",
  "geburtsdatum": "1985-03-12",
  "email": "hans.mueller@example.com",
  "adresse": {
    "strasse": "Hauptstraße",
    "hausnummer": "15",
    "plz": "12345",
    "ort": "Hamberg"
  },
  "telefon": "0123 456789",
  "datenschutz_zugestimmt": true
}
```

## 🔒 Sicherheitsfeatures

- **GitHub Token Schutz:** Token wird über GitHub Secrets verwaltet
- **Rate Limiting:** 10 Sekunden Cooldown zwischen Übertragungen
- **Input Validation:** Client- und Server-seitige Validierung
- **HTTPS:** Sichere Datenübertragung
- **Separate Data Branch:** Daten sind vom öffentlichen Code getrennt

## 💾 Daten herunterladen

### Über GitHub Web Interface:

1. Wechseln Sie zum `data` Branch
2. Navigieren Sie zum `data/` Ordner
3. Laden Sie die gewünschten JSON-Dateien herunter

### Über Git Kommandozeile:

```bash
# Data Branch auschecken
git checkout data

# Alle Daten-Dateien auflisten
ls data/member-data-*.json

# Einzelne Datei anzeigen
cat data/member-data-2024-01-15T14-30-25-123Z.json

# Alle Daten in eine Datei kombinieren
jq -s '.' data/member-data-*.json > combined_data.json
```

## 🛠️ Wartung und Updates

### Code Updates:

- Änderungen am Code im `main` Branch committen
- GitHub Actions deployed automatisch die neueste Version

### Daten-Backup:

```bash
# Komplettes Backup des data Branch
git clone -b data https://github.com/plankl/ff_hamberg_ehrenamtskarte.git data-backup
```

### Daten löschen (falls erforderlich):

```bash
# Einzelne Datei löschen
git checkout data
git rm data/member-data-TIMESTAMP.json
git commit -m "Remove member data file"
git push origin data
```

## 🚨 Wichtige Hinweise

⚠️ **Datenschutz:**

- Stellen Sie sicher, dass alle Mitglieder der Datenverarbeitung zugestimmt haben
- Beachten Sie die DSGVO-Bestimmungen
- Löschen Sie Daten nach Ablauf der Aufbewahrungsfristen

⚠️ **Sicherheit:**

- Personal Access Token niemals im Code committen
- Token regelmäßig erneuern
- Repository-Zugriff auf autorisierte Personen beschränken

## 🔐 Zusätzlicher Datenschutz

Für maximalen Schutz der Mitgliederdaten siehe: [DATENSCHUTZ_OPTIONEN.md](DATENSCHUTZ_OPTIONEN.md)

**Empfohlene Schutzmaßnahmen:**

1. **Separates privates Repository** für Daten erstellen
2. **Repository auf "Private"** setzen
3. **Branch Protection Rules** aktivieren
4. **Nur autorisierte Personen** Zugriff gewähren

⚠️ **Backup:**

- Regelmäßige Backups der Daten erstellen
- Testen Sie die Wiederherstellung von Backups

## 📞 Support

Bei Fragen oder Problemen:

1. Überprüfen Sie die GitHub Actions Logs
2. Stellen Sie sicher, dass der FF_DATA_TOKEN korrekt konfiguriert ist
3. Kontaktieren Sie den Repository-Administrator

---

**Version:** 1.0  
**Erstellt für:** Feuerwehr Hamberg  
**Letztes Update:** September 2025
