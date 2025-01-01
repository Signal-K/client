export interface Point {
  x: number;
  y: number;
};

export type DrawingMode = 'freehand' | 'rectangle' | 'circle';

export interface Shape {
  type: DrawingMode;
  startPoint: Point;
  endPoint: Point;
  color: string;
  width: number;
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