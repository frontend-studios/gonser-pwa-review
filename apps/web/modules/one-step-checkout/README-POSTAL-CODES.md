# Swiss Postal Code Autocomplete - Anleitung

## Übersicht

Die PLZ-Autovervollständigung ist jetzt in beiden Adressformularen (Shipping & Billing) integriert.

## Features

✅ **Autocomplete ab 2 Zeichen**: Dropdown erscheint bei Eingabe von 2+ Ziffern  
✅ **Keyboard-Navigation**: Arrow Up/Down, Enter, Escape  
✅ **Auto-Fill**: PLZ und Ort werden automatisch ausgefüllt  
✅ **Performance**: Debouncing (150ms), Limit 20 Ergebnisse  
✅ **Mobile-optimiert**: Touch-friendly Dropdown  
✅ **Lazy Loading**: Daten werden erst bei Bedarf geladen

## Daten hinzufügen

### 1. Datenstruktur

Die Datei befindet sich hier:

```
apps/web/public/one-step-checkout/swiss-postal-codes.json
```

Aktuell sind 19 Beispiel-Einträge enthalten. Sie müssen diese mit Ihren 6000+ PLZ ersetzen.

### 2. JSON-Format

Jeder Eintrag muss folgende Struktur haben:

```json
{
  "zip": "9601",
  "zipSuffix": "0",
  "city": "Lütisburg Station",
  "canton": "SG"
}
```

**Felder:**

- `zip`: Postleitzahl (String)
- `zipSuffix`: Zusatzziffern (String, z.B. "0")
- `city`: Ortsname (String, max 27 Zeichen)
- `canton`: Kantonsabkürzung (String, z.B. "SG", "ZH", "BE")

### 3. Daten konvertieren

Wenn Sie Ihre Daten in CSV oder Excel haben:

**CSV-Format (erwartet):**

```csv
PLZ,Zusatzziffern,Bezeichnung,Kanton
9601,0,Lütisburg Station,SG
9602,0,Bazenheid,SG
```

**Konvertierung zu JSON:**

Sie können ein Online-Tool verwenden (z.B. https://www.convertcsv.com/csv-to-json.htm) oder ein einfaches Script:

```javascript
// Node.js Script: convert-postal-codes.js
const fs = require('fs');
const csv = require('csv-parser'); // npm install csv-parser

const results = [];

fs.createReadStream('postal-codes.csv')
  .pipe(csv({ separator: ',' }))
  .on('data', (row) => {
    results.push({
      zip: row['PLZ'],
      zipSuffix: row['Zusatzziffern'],
      city: row['Bezeichnung'],
      canton: row['Kanton'],
    });
  })
  .on('end', () => {
    fs.writeFileSync('swiss-postal-codes.json', JSON.stringify(results, null, 2));
    console.log(`✅ ${results.length} PLZ erfolgreich konvertiert!`);
  });
```

**Ausführen:**

```bash
npm install csv-parser
node convert-postal-codes.js
```

### 4. Datei ersetzen

Kopieren Sie die generierte `swiss-postal-codes.json` nach:

```
apps/web/public/one-step-checkout/swiss-postal-codes.json
```

## Verwendung

### Im Checkout

1. User gibt PLZ ein (z.B. "96")
2. Dropdown erscheint automatisch mit allen PLZ, die mit "96" beginnen
3. User wählt seine PLZ aus dem Dropdown
4. PLZ und Ort werden automatisch ausgefüllt

### Keyboard-Navigation

- **Arrow Down**: Nächster Eintrag
- **Arrow Up**: Vorheriger Eintrag
- **Enter**: Ausgewählten Eintrag übernehmen
- **Escape**: Dropdown schließen

## Technische Details

### Composable

```typescript
// apps/web/modules/one-step-checkout/runtime/composables/useSwissPostalCodes.ts
const { loadPostalCodes, searchPostalCodes } = useSwissPostalCodes();
```

### Performance

- **Lazy Loading**: Daten werden erst beim ersten Focus des PLZ-Feldes geladen
- **Caching**: Daten werden nach dem ersten Laden im Memory gecached
- **Debouncing**: 150ms Verzögerung zwischen Suchen
- **Limit**: Max 20 Ergebnisse im Dropdown

### Dateigröße

- 6000 Einträge ≈ 350 KB uncompressed
- Mit gzip ≈ 80-100 KB
- Load-Zeit: < 200ms (schnelle Verbindung)

## Testing

Nach dem Hinzufügen der Daten:

1. Dev-Server neustarten: `npm run dev`
2. Checkout-Seite öffnen
3. PLZ-Feld fokussieren und "80" eingeben
4. Dropdown sollte erscheinen mit Zürich-PLZ (8001, 8002, etc.)
5. Eintrag auswählen → PLZ und Ort sollten ausgefüllt werden

## Troubleshooting

### Dropdown erscheint nicht

- Prüfen Sie die Browser-Console auf Fehler
- Prüfen Sie, ob die JSON-Datei korrekt geladen wird: `/one-step-checkout/swiss-postal-codes.json`
- JSON-Validierung: https://jsonlint.com/

### Falsche Daten

- Prüfen Sie das JSON-Format (alle Felder müssen Strings sein)
- Prüfen Sie die Feldnamen: `zip`, `zipSuffix`, `city`, `canton`

### Performance-Probleme

- Limit erhöhen in `useSwissPostalCodes.ts`: `searchPostalCodes(query, 50)`
- Debounce-Zeit erhöhen: `debounce(handlePostalCodeInput, 300)`

## Weitere Anpassungen

### Dropdown-Styling anpassen

In beiden Adressformularen (Shipping/Billing):

```vue
<div class="... max-h-[300px] overflow-y-auto">
  <!-- Höhe anpassen: max-h-[200px] oder max-h-[400px] -->
</div>
```

### Mehr Ergebnisse anzeigen

In `useSwissPostalCodes.ts`:

```typescript
postalCodeSuggestions.value = searchPostalCodes(query, 50); // statt 20
```

### Suche anpassen

Aktuell: `item.zip.startsWith(query)`  
Alternativ: `item.zip.includes(query)` oder `item.city.toLowerCase().includes(query.toLowerCase())`
