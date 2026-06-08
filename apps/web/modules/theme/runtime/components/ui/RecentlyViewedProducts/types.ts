export interface RecentlyViewedProductsProps {
  /**
   * Überschrift für die Sektion
   */
  title?: string;

  /**
   * Untertitel für die Sektion
   */
  subtitle?: string;

  /**
   * Maximale Anzahl der anzuzeigenden Produkte
   * @default 10
   */
  maxItems?: number;

  /**
   * Automatisches Laden der Produkte beim Mount
   * @default true
   */
  autoFetch?: boolean;

  /**
   * Zeige Komponente auch wenn keine Produkte vorhanden sind
   * @default false
   */
  showEmpty?: boolean;

  /**
   * Layout der Produktanzeige
   * - 'horizontal': Nebeneinander mit Slider
   * - 'vertical': Untereinander als Grid
   * @default 'horizontal'
   */
  layout?: 'horizontal' | 'vertical';
}
