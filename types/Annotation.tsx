export interface Point {
  x: number;
  y: number;
};

export interface Line {
  points: Point[];
  color: string;
  width: number;
};

export interface DrawingState {
  isDrawing: boolean;
  currentLine: Line;
  lines: Line[];
};

export interface DrawingControls {
  strokeColor: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
};