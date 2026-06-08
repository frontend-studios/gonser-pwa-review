export interface ProductPropertyValue {
  value?: string | number;
}

export interface ProductProperty {
  id: number;
  names?: {
    name?: string;
  };
  cast?: string;
  values?: ProductPropertyValue;
}

export interface ProductPropertyGroup {
  properties?: ProductProperty[];
}

export interface GonserBoxPropertyParam {
  property: {
    id: number;
    names: {
      name: string;
    };
    valueType: string;
    value: string;
  };
}