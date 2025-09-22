# 🔐 GitHub Actions Secrets Setup

Diese Anleitung zeigt Ihnen, wie Sie Ihre GitHub-Credentials sicher in GitHub Actions hinterlegen.

## 📋 Benötigte Secrets

Sie müssen folgende 4 Secrets in Ihrem Repository einrichten:

### 1. Personal Access Token erstellen

1. **Gehen Sie zu:** GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Klicken Sie auf:** "Generate new token (classic)"
3. **Token-Name:** `FF Hamberg Data Access`
4. **Berechtigung auswählen:**
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
5. **Token kopieren** (wird nur einmal angezeigt!)

### 2. Repository Secrets hinzufügen

**Ort:** Repository → Settings → Secrets and variables → Actions → "New repository secret"

Erstellen Sie diese 4 Secrets:

#### Secret 1: `GH_USERNAME`
- **Name:** `GH_USERNAME`
- **Value:** `plankl` (Ihr GitHub Username)

#### Secret 2: `GH_EMAIL`
- **Name:** `GH_EMAIL` 
- **Value:** Ihre GitHub E-Mail Adresse (z.B. `ihre.email@example.com`)

#### Secret 3: `GH_PAT`
- **Name:** `GH_PAT`
- **Value:** Das Personal Access Token aus Schritt 1

#### Secret 4: `FF_DATA_TOKEN`
- **Name:** `FF_DATA_TOKEN`
- **Value:** Das gleiche Personal Access Token (für Website-Funktionalität)

## ✅ Überprüfung

Nach dem Einrichten sollten Sie 4 Secrets haben:
- `GH_USERNAME` ✅
- `GH_EMAIL` ✅  
- `GH_PAT` ✅
- `FF_DATA_TOKEN` ✅

## 🚀 Was passiert dann?

**Mit Ihren Credentials:**
- ✅ Data Branch wird mit Ihrem Namen erstellt
- ✅ Commits werden unter Ihrem Namen gemacht
- ✅ Vollständiger Zugriff auf private Branches
- ✅ Datenübertragung funktioniert komplett

**Ohne Credentials (Fallback):**
- ⚠️ Verwendet GitHub Actions Standard-User
- ⚠️ Eingeschränkte Funktionalität
- ⚠️ Daten-Upload eventuell nicht möglich

## 🔒 Sicherheit

- **Personal Access Token niemals öffentlich teilen!**
- **Regelmäßig Token erneuern** (z.B. alle 6 Monate)
- **Bei Problemen Token sofort widerrufen**

## 🆘 Troubleshooting

**Problem:** "Authentication failed"
**Lösung:** Token überprüfen und neu erstellen

**Problem:** "Permission denied"  
**Lösung:** Token-Berechtigung auf `repo` prüfen

**Problem:** E-Mail-Benachrichtigungen
**Lösung:** GitHub → Settings → Notifications → Actions deaktivieren