/**
 * Button Configuration
 */
export interface GonserButton {
  text: string;
  url: string;
  class?: string;
  style?: 'primary' | 'secondary' | 'green' | 'custom';
  customColor?: string;
  customTextColor?: string;
  borderRadius?: string;
  fontSize?: string;
  fontWeight?: string;
  padding?: string;
}

/**
 * Props für die GonserBox Fortschritts-Komponente
 *
 * Die GonserBox zeigt den Fortschritt bis zum versandkostenfreien Versand für
 * Artikel mit Property ID 4 und value '1'. Sie kann überall im Shop integriert werden.
 *
 * Alle Texte, Buttons und Inhalte werden automatisch aus den i18n-Übersetzungen geladen
 * (theme.GonserBox.*), können aber über Props überschrieben werden.
 */
export interface GonserBoxProps {
  /**
   * Schwellenwert für kostenlosen Versand in CHF
   * @default 35
   */
  threshold?: number;

  /**
   * Erster Info-Text (Regular 400)
   * Falls nicht angegeben, wird t('theme.GonserBox.infoText1') verwendet
   */
  infoText1?: string;

  /**
   * Zweiter Info-Text (SemiBold 600)
   * Falls nicht angegeben, wird t('theme.GonserBox.infoText2') verwendet
   */
  infoText2?: string;

  /**
   * Bild-URL (rechts neben den Info-Texten)
   * Falls nicht angegeben, wird t('theme.GonserBox.imageUrl') verwendet
   */
  imageUrl?: string;

  /**
   * Alternativ-Text für das Bild
   * Falls nicht angegeben, wird t('theme.GonserBox.imageAlt') verwendet
   */
  imageAlt?: string;

  /**
   * HTML-Inhalt für das Modal (wird bei Button 2 geöffnet)
   * Falls nicht angegeben, wird t('theme.GonserBox.modalContent') verwendet
   */
  modalContent?: string;

  /**
   * Button-Konfigurationen
   * Falls nicht angegeben, werden die Default-Buttons aus den Übersetzungen geladen
   */
  buttons?: GonserButton[];

  /**
   * Hintergrundfarbe der Box
   * @default '#F4F3F6'
   */
  backgroundColor?: string;

  /**
   * Border-Radius der Box
   * @default '10px'
   */
  borderRadius?: string;

  /**
   * Custom CSS-Klasse
   */
  customClass?: string;
}
