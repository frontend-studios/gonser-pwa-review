export type InfoBarVariant = 'home' | 'product' | 'category' | 'checkout' | 'global';

export interface InfoBarProps {
  /**
   * Die Variante der InfoBar.
   * 'global' überschreibt alle anderen Varianten.
   * Wenn nicht angegeben, wird automatisch basierend auf der Route erkannt.
   */
  variant?: InfoBarVariant;
}
