# 🔐 Passwort-Schutz Dokumentation

## Überblick

Die Feuerwehr Hamberg Website verfügt jetzt über einen Passwort-Schutz, der verhindert, dass unbefugte Personen Daten übermitteln können.

## 🔑 Standard-Passwort

**Aktuelles Passwort:** `FFHamberg2025!`

⚠️ **WICHTIG:** Ändern Sie dieses Passwort nach der ersten Einrichtung!

## ✨ Funktionen

### Sicherheitsfeatures:

- **Passwort-Validierung:** Überprüfung bei jeder Datenübermittlung
- **Brute-Force Schutz:** Maximale 3 Versuche pro Session
- **Automatische Sperrung:** 5 Minuten Wartezeit nach 3 Fehlversuchen
- **Sichere Speicherung:** Passwort wird nicht in den übermittelten Daten gespeichert
- **Benutzerfreundlich:** Klare Fehlermeldungen und Verbleibende-Versuche-Anzeige

### Benutzerinterface:

- Passwort-Feld in der "Sicherheit & Datenschutz" Sektion
- Monospace-Schrift für bessere Passwort-Eingabe
- Visuelles Feedback bei falschen Eingaben
- Automatisches Leeren nach erfolgreicher Übermittlung

## 🛠️ Passwort ändern

1. **Datei öffnen:** `script.js`
2. **Zeile finden:** Suchen Sie nach `const ACCESS_CONFIG`
3. **Passwort ändern:**

```javascript
const ACCESS_CONFIG = {
  correctPassword: "IhrNeuesPasswort123!", // Hier Ihr neues Passwort eintragen
  maxAttempts: 3,
  lockoutTime: 300000, // 5 Minuten
};
```

4. **Speichern und committen:**

```bash
git add script.js
git commit -m "Update access password"
git push origin main
```

## 🔧 Konfigurationsoptionen

### Anzahl der Versuche ändern:

```javascript
maxAttempts: 5, // Mehr Versuche erlauben
```

### Sperrzeit ändern:

```javascript
lockoutTime: 600000, // 10 Minuten (in Millisekunden)
```

## 🚫 Troubleshooting

### Problem: "Zu viele Fehlversuche"

- **Lösung:** 5 Minuten warten oder Browser-Cache leeren

### Problem: Korrektes Passwort wird nicht akzeptiert

- **Lösung:** Überprüfen Sie Groß-/Kleinschreibung und Sonderzeichen

### Problem: Passwort vergessen

- **Lösung:** Passwort in `script.js` überprüfen oder neues setzen

## 📞 Support

Bei Problemen wenden Sie sich an den Administrator der Feuerwehr Hamberg Website.

---

**Letzte Aktualisierung:** $(Get-Date -Format "dd.MM.yyyy HH:mm")  
**Version:** 1.0 mit Passwort-Schutz
