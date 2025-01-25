export interface Point {
  x: number;
  y: number;
};

export interface CategoryConfig {
  name: string;
  color: string;
  description: string;
};

export type CoMCategory = 'Peak' | 'Custom';
export const CoMCATEGORIES: Record<CoMCategory, CategoryConfig> = {
  Peak: {
    name: 'Peak',
    color: '#ACAF50',
    description: "Search for arches in each of the frames. Arches will have two sides, a gap in between the sides, and a peak at the top"
  },
  Custom: {
    name: 'Custom',
    color: '#FF0000',
    description: 'Freeform drawing'
  },
};

export type P4Category = 'fan' | 'blotch' | 'Custom';
export const P4CATEGORIES: Record<P4Category, CategoryConfig> = {
  fan: {
    name: 'Fan',
    color: '#00BCD4',
    description: 'Fan-shaped feature'
  },
  blotch: {
    name: 'Blotch',
    color: '#4CAF50',
    description: 'Blotch-shaped feature'
  },
  Custom: {
    name: 'Custom',
    color: '#FF0000',
    description: 'Freeform drawing'
  },
};

export type PHCategory = 'Noise' | 'Clear dip' | 'Missing' | 'Custom';
export const PHCATEGORIES: Record<PHCategory, CategoryConfig> = {
  Noise: {
    name: 'Noise',
    color: '#00BCD4',
    description: 'Noise (random or irrelevant data)'
  },
  'Clear dip': {
    name: 'Clear dip',
    color: '#4CAF50',
    description: 'Clear dip (a clear dip in the light)'
  },
  Missing: {
    name: 'Missing',
    color: '#FFC107',
    description: 'Missing (missing data/empty spot)'
  },
  'Custom': {
    name: 'Custom',
    color: '#FF0000',
    description: 'Custom or other annotation'
  },
};

export type AI4MCategory = 'sand' | 'consolidated-soil' | 'bedrock' | 'big-rocks' | 'Custom';
export const AI4MCATEGORIES: Record<AI4MCategory, CategoryConfig> = {
  sand: {
    name: 'Sand',
    color: '#00BCD4',
    description: 'Sand (like sand on the beach)'
  },
  'consolidated-soil': {
    name: 'Consolidated Soil',
    color: '#4CAF50',
    description: 'Consolidated soil (such that wheels won\'t slip)'
  },
  bedrock: {
    name: 'Bedrock',
    color: '#FFC107',
    description: 'Bedrock (relatively flat rock with less than 30 cm/1 ft in height)'
  },
  'big-rocks': {
    name: 'Big Rocks',
    color: '#E91E63',
    description: 'Big rocks (extremely rare, stands more than 30 cm/1 ft high)'
  },
  Custom: {
    name: 'Custom',
    color: '#FF0000',
    description: 'Custom annotation'
  }
};

export type DrawingMode = 'freehand' | 'rectangle' | 'circle';

export interface Shape {
  type: DrawingMode;
  startPoint: Point;
  endPoint: Point;
  color: string;
  width: number;
};

export type Tool = 'pen' | 'circle' | 'square';

export type DrawingObject = {
  type: Tool;
  color: string;
  width: number;
  points: { x: number; y: number }[];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  category: AI4MCategory | P4Category;
};

export interface Line {
  points: Point[];
  color: string;
  width: number;
};

export interface DrawingState {
  isDrawing: boolean;
  currentLine: Line;
  currentShape: Shape | null;
  lines: Line[];
  shapes: Shape[];
};

export interface DrawingControls {
  strokeColor: string;
  strokeWidth: number;
  drawingMode: DrawingMode;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onModeChange: (mode: DrawingMode) => void;
};