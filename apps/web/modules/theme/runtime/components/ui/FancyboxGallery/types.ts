import type { ImagesData, Product } from '@plentymarkets/shop-api';

export type FancyboxDisplayImageVariant = 'secondPreview' | 'preview' | 'middle' | 'full';

export type FancyboxVideoProvider = 'youtube' | 'vimeo';

export interface FancyboxImageItem {
  type: 'image';
  src: string;
  displaySrc: string;
  thumbSrc: string;
  alt?: string;
  title?: string | null;
  caption?: string;
  width?: number | null;
  height?: number | null;
}

export interface FancyboxVideoItem {
  type: FancyboxVideoProvider;
  src: string;
  displaySrc: string;
  thumbSrc: string;
  alt?: string;
  title?: string | null;
  caption?: string;
  width?: number | null;
  height?: number | null;
}

export type FancyboxGalleryItem = FancyboxImageItem | FancyboxVideoItem;

export interface FancyboxGalleryProps {
  images: ImagesData[];
  product?: Product | null;
  fancyboxOptions?: Record<string, unknown>;
  group?: string;
  showThumbnails?: boolean;
  displayImageVariant?: FancyboxDisplayImageVariant;
  itemId?: number | string | null;
}