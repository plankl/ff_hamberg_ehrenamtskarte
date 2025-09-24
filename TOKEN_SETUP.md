# 🔑 GitHub Token Setup - Feuerwehr Hamberg Ehrenamtskarte

## Problem

Die Website zeigt den Fehler: "Token-Konfiguration fehlt! Administrator muss DATA_TRANSFER_TOKEN Secret hinzufügen."

## Lösung: GitHub Secret konfigurieren

### Schritt 1: Personal Access Token erstellen

1. Gehen Sie zu: https://github.com/settings/tokens
2. Klicken Sie auf **"Generate new token"** → **"Generate new token (classic)"**
3. Geben Sie einen Namen ein: `FF Hamberg Ehrenamtskarte Data Access`
4. Wählen Sie Expiration: **No expiration** (oder ein späteres Datum)
5. Wählen Sie folgende Scopes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **Contents** (Read and write repository contents)
6. Klicken Sie **"Generate token"**
7. **Kopieren Sie das Token sofort** (es wird nur einmal angezeigt!)

### Schritt 2: Secret im Repository hinzufügen

1. Gehen Sie zu: https://github.com/plankl/ff_hamberg_ehrenamtskarte/settings/secrets/actions
2. Klicken Sie **"New repository secret"**
3. Name: `DATA_TRANSFER_TOKEN`
4. Value: Ihr kopiertes Token (beginnt mit `ghp_`)
5. Klicken Sie **"Add secret"**

### Schritt 3: Website neu deployen

1. Gehen Sie zu: https://github.com/plankl/ff_hamberg_ehrenamtskarte/actions
2. Klicken Sie auf den neuesten Workflow-Run
3. Klicken Sie **"Re-run all jobs"**

oder machen Sie einen neuen Commit:

```bash
git commit --allow-empty -m "Trigger redeploy with token"
git push
```

## Verifikation

Nach dem Deployment sollte die Website:

- ✅ Keine Token-Fehler mehr zeigen
- ✅ Daten erfolgreich übertragen können
- ✅ Automatisch CSV, JSON und HTML-Exporte generieren

## Troubleshooting

### Token funktioniert nicht

- Prüfen Sie, dass der Token mit `ghp_` beginnt
- Stellen Sie sicher, dass **repo** und **contents** Berechtigung ausgewählt sind
- Token darf nicht abgelaufen sein

### Secret nicht verfügbar

- Nur Repository-Owner können Secrets hinzufügen
- Secret-Name muss exakt `DATA_TRANSFER_TOKEN` sein (case-sensitive)

### Immer noch Fehler

- Workflow-Logs prüfen: https://github.com/plankl/ff_hamberg_ehrenamtskarte/actions
- Browser-Cache leeren
- Private/Inkognito-Modus testen

## Sicherheit

- ❌ Token niemals öffentlich teilen
- ❌ Token nicht in Code oder Dateien speichern
- ✅ Nur notwendige Berechtigungen vergeben
- ✅ Token regelmäßig erneuern (empfohlen: jährlich)
