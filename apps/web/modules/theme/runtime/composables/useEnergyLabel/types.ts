export interface EnergyLabelPropertyValue {
  value?: string | number;
}

export interface EnergyLabelProperty {
  id: number;
  values?: EnergyLabelPropertyValue | EnergyLabelPropertyValue[];
}

export interface EnergyLabelPropertyGroup {
  properties?: EnergyLabelProperty[];
}

export interface EnergyLabelGalleryImage {
  position?: number;
  url?: string;
}