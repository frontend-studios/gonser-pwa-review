export interface GonserBoxCartOrderParam {
  propertyId?: string | number;
  value?: string | number;
}

export interface GonserBoxVariationPropertyValue {
  value?: string | number;
}

export interface GonserBoxVariationProperty {
  id?: string | number;
  values?: GonserBoxVariationPropertyValue | GonserBoxVariationPropertyValue[];
}

export interface GonserBoxVariationPropertyGroup {
  id?: string | number;
  properties?: GonserBoxVariationProperty[];
}

export interface GonserBoxVariation {
  variationPropertyGroups?: GonserBoxVariationPropertyGroup[];
  variationProperties?: GonserBoxVariationProperty[];
}

export interface GonserBoxCartItem {
  price?: number;
  quantity?: number;
  basketItemOrderParams?: GonserBoxCartOrderParam[];
  variation?: GonserBoxVariation;
}