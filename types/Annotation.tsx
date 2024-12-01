export interface Annotation {
    type: 'rectangle' | 'pen';
    label: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    points?: number[];
  }