# 🔐 Passwortschutz für den Data Branch

Es gibt mehrere Möglichkeiten, den `data` Branch zu schützen:

## Option 1: Separates privates Repository (EMPFOHLEN)

### Vorteile:

- ✅ Maximale Sicherheit
- ✅ Separate Zugriffskontrolle
- ✅ Keine Sichtbarkeit für Website-Besucher

### Setup:

1. **Neues privates Repository erstellen:** `ff_hamberg_data`
2. **Personal Access Token anpassen:**
   - Berechtigung für beide Repositories
3. **Script.js anpassen:**

```javascript
const GITHUB_CONFIG = {
  owner: "plankl",
  repo: "ff_hamberg_data", // Separates privates Repository
  branch: "main",
  token: "",
};
```

## Option 2: Repository-Schutz mit Teams

### Vorteile:

- ✅ Granulare Zugriffskontrolle
- ✅ Team-basierte Verwaltung

### Setup:

1. **Repository auf "Private" setzen**
2. **GitHub Team erstellen:** "FF-Hamberg-Data-Access"
3. **Branch Protection Rules:**
   ```
   Settings → Branches → Add rule
   - Branch name pattern: data
   - Restrict access to specific people or teams
   ```

## Option 3: Verschlüsselung der JSON-Daten

### Vorteile:

- ✅ Daten sind auch bei Zugriff unlesbar
- ✅ Repository kann öffentlich bleiben

### Implementation:

- AES-256 Verschlüsselung der JSON-Dateien
- Passwort über separate Secrets
- Entschlüsselung nur mit korrektem Passwort

## Option 4: GitHub Apps mit eingeschränkten Berechtigungen

### Vorteile:

- ✅ Sehr granulare Berechtigung
- ✅ Audit-Log für alle Zugriffe

### Setup:

- GitHub App nur für data Branch
- Separate Authentifizierung
- Token mit minimalen Rechten

---

## Welche Option bevorzugen Sie?

Ich empfehle **Option 1** (separates privates Repository) für maximale Sicherheit und Einfachheit.
