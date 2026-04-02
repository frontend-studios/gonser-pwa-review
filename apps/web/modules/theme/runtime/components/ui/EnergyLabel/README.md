# EnergyLabel Komponente

## Übersicht

Die `EnergyLabel` Komponente zeigt Energieeffizienzklassen-Labels (A+++ bis G) auf Produkten an, basierend auf Property ID 47.

## Architektur

Die Implementierung folgt dem etablierten Pattern der GonserBox-Komponente:

```
modules/theme/runtime/
├── composables/
│   └── useEnergyLabel/
│       └── useEnergyLabel.ts          # Geschäftslogik
├── components/
│   └── ui/
│       └── EnergyLabel/
│           ├── types.ts               # TypeScript Types
│           └── EnergyLabel.vue        # UI Komponente
└── lang/
    └── de.json                        # Übersetzungen
```

## Verwendung

### In ProductCard (Kategorie-Seiten)

```vue
<EnergyLabel :product="product" position="bottom-right" :size="52" />
```

- Position: `bottom-right` (absolute positioniert)
- Größe: 52px (passt zu anderen Badges)

### In Produktdetailseite ([slug].vue)

```vue
<EnergyLabel :product="product" position="inline" :size="120" class="mb-4" />
```

- Position: `inline` (normaler Fluss)
- Größe: 120px (größer für bessere Sichtbarkeit)

## Props

| Prop          | Typ                          | Default          | Beschreibung                                  |
| ------------- | ---------------------------- | ---------------- | --------------------------------------------- |
| `product`     | `Product`                    | -                | **Erforderlich.** Das Produkt-Objekt          |
| `position`    | `'bottom-right' \| 'inline'` | `'bottom-right'` | Positionierung des Labels                     |
| `size`        | `number`                     | `52`             | Größe des Labels in px                        |
| `customClass` | `string`                     | `''`             | Optionale CSS-Klassen                         |
| `clickable`   | `boolean`                    | `true`           | Ob Label klickbar sein soll (öffnet Lightbox) |

## Composable API

### `useEnergyLabel()`

```typescript
const { hasEnergyLabel, getEnergyLabelValue, getEnergyIconUrl } = useEnergyLabel();

// Prüft ob Produkt ein EEK Label hat (Property ID 47)
const hasLabel = hasEnergyLabel(product);

// Gibt Energieeffizienzklasse zurück (z.B. "A++")
const labelValue = getEnergyLabelValue(product);

// Gibt Icon-URL für Energieeffizienzklasse zurück
const iconUrl = getEnergyIconUrl('A++');
```

## Features

✅ **Auto-Hide**: Zeigt sich nur, wenn Property ID 47 vorhanden ist  
✅ **Klickbare Lightbox**: Öffnet Detailansicht beim Klick  
✅ **Responsive**: Passt sich verschiedenen Größen an  
✅ **i18n**: Vollständig übersetzt  
✅ **Accessibility**: ARIA-Labels und Keyboard-Navigation

## Energieeffizienzklassen

Unterstützte Klassen mit Icon-Mapping:

- A+++ → `https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/eek/A+++.svg`
- A++ → `https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/eek/A++.svg`
- A+ → `https://cdn02.plentymarkets.com/mrt54q44tptl/frontend/eek/A+.svg`
- A bis G → entsprechende URLs

## PlentyONE Integration

### Property-Struktur

Die Komponente sucht nach Property ID 47 in `variationPropertyGroups`:

```typescript
{
  id: 47,
  values: {
    value: "A++"  // oder Array: [{ value: "A++" }]
  }
}
```

### Lightbox-Bild (TODO)

Aktuell verwendet die Lightbox das gleiche Icon wie das Label. Für eine vollständige Implementierung sollte das Lightbox-Bild aus:

- Produkt-Dokumenten
- Einer separaten Property
- Oder einem konfigurierbaren Mapping

extrahiert werden.

## Übersetzungen

Definiert in `lang/de.json`:

```json
{
  "theme": {
    "EnergyLabel": {
      "ariaLabel": "Energieeffizienzklasse",
      "lightboxTitle": "Energieeffizienzklasse",
      "lightboxImageAlt": "Energielabel für Klasse",
      "noLightboxImage": "Kein Energielabel-Bild verfügbar"
    }
  }
}
```

## Vergleich zur Vorgänger-Implementierung (Twig)

| Aspekt               | Twig                          | Vue 3                     |
| -------------------- | ----------------------------- | ------------------------- |
| Property-Detection   | `if property.id == 47`        | `hasEnergyLabel(product)` |
| Icon-Mapping         | `energyIconImages[value]`     | `getEnergyIconUrl(value)` |
| Lightbox             | `window.openEnergyLightbox()` | Vue Modal mit Teleport    |
| Position             | inline CSS                    | Flexible Props            |
| Wiederverwendbarkeit | ❌                            | ✅                        |

## Beispiele

### Nur anzeigen, ohne Lightbox

```vue
<EnergyLabel :product="product" :clickable="false" />
```

### Benutzerdefinierte Größe und Klasse

```vue
<EnergyLabel :product="product" :size="80" custom-class="shadow-lg rounded-lg" />
```

### Programmatischer Zugriff

```vue
<script setup>
import { useEnergyLabel } from '~/composables/useEnergyLabel/useEnergyLabel';

const { hasEnergyLabel, getEnergyLabelValue } = useEnergyLabel();

const product = /* ... */;

if (hasEnergyLabel(product)) {
  const label = getEnergyLabelValue(product);
  console.log(`Dieses Produkt hat Energieeffizienzklasse: ${label}`);
}
</script>
```

## Testing

Die Komponente kann mit verschiedenen Produkt-Property-Strukturen getestet werden:

```typescript
// Mock-Produkt mit EEK Label
const mockProduct = {
  variations: [
    {
      properties: [
        {
          id: 47,
          values: { value: 'A++' },
        },
      ],
    },
  ],
};
```

## Zukünftige Erweiterungen

- [ ] Lightbox-Bild aus Produkt-Dokumenten extrahieren
- [ ] Animation beim Ein-/Ausblenden
- [ ] A11y-Verbesserungen (Screen Reader Announcements)
- [ ] Unit Tests mit Vitest
- [ ] E2E Tests mit Cypress
- [ ] Mehrsprachige Unterstützung erweitern
