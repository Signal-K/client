export interface Point {
  x: number;
  y: number;
};

export interface CategoryConfig {
  name: string;
  color: string;
  description: string;
  iconUrl?: string;
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

export type JVHCategory = 'Vortex' | 'TurbulentRegion' | 'CloudBands' | 'Null';
export const JVHCATEGORIES: Record<JVHCategory, CategoryConfig> = {
  Vortex: {
    name: 'Vortex',
    color: '#00BCD4',
    description: 'Atmospheric feature that is generally round/elliptical in shape',
  },
  TurbulentRegion: {
    name: 'Turbulent region',
    color: '#4CAF50',
    description: "Cloud structures that don't have a definite shape, but form lots of curls and swirls",
  },
  CloudBands: {
    name: 'Cloud bands',
    color: '#FFC107',
    description: "Gradients in color that are mostly horizontal in direction",
  },
  Null: {
    name: 'Null',
    color: '#FF0000',
    description: 'None of the above/content too blurry',
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

export type CoMShapesCategory = 'CloudyRegion' | 'Ozone' | 'CanyonCrater' | 'Twilightzonecloud' | 'Streakcloud' | 'Diskcloud' | 'Vortexcloud' | 'Dottedcloud' | 'Gravitywavecloud' | 'Othercloudtype'
export const CoMSCategories: Record<CoMShapesCategory, CategoryConfig> = {
  "CloudyRegion": {
    name: "Cloudy Region",
    color: '#00BCD4',
    description: "A cloudy area without distinct or multiple cloud types",
    iconUrl: '/assets/Docs/LIDAR/lidar-martianClouds/other-general.png'
  },
  "Ozone": {
    name: "Ozone",
    description: "Pink region on the map",
    color: "#ff3398",
  },
  "CanyonCrater": {
    name: "Canyon / Crater",
    color: "#1a13dc",
    description: "Depressed region on the map with a blue tint",
  },
  "Twilightzonecloud": {
    name: "Twilight zone cloud",
    color: '#f20c26',
    description: 'A cloud near the red terminator line',
  },
  "Streakcloud": {
    name: 'Streak cloud',
    color: '#770cf2',
    description: 'Long, narrow and straight feature',
    iconUrl: '/assets/Docs/LIDAR/lidar-martianClouds/streak.png',
  },
  "Diskcloud": {
    name: 'Disk cloud',
    color: '#44ba25',
    description: "Small round circles that resemble disks or caps",
    iconUrl: '/assets/Docs/LIDAR/lidar-martianClouds/disk.png',
  },
  "Vortexcloud": {
    name: "Vortex Cloud",
    color: '#dcc40e',
    description: 'A cloud that turns in on itself, with a spiral shape',
    iconUrl: '/assets/Docs/LIDAR/lidar-martianClouds/vortex.png',
  },
  "Dottedcloud": {
    name: 'Dotted cloud',
    color: '#7bb9d1',
    description: 'Small patches of clouds without strict direction or structure',
    iconUrl: '/assets/Docs/LIDAR/lidar-martianClouds/dotted.png',
  },
  'Gravitywavecloud': {
    name: 'Gravity wave cloud',
    description: 'A rippled cloud pattern with a preferred direction where the cloud disappears and reappears',
    color: '#0c749d',
    iconUrl: '/assets/Docs/LIDAR/lidar-martianClouds/gravitywave.png',
  },
  "Othercloudtype": {
    name: 'Other cloud type',
    iconUrl: '/assets/Docs/LIDAR/lidar-martianClouds/other-general.png',
    color: '#340a65',
    description: "A cloud that doesn't fit into the other categories",
  },
};

export type CACCategory = 
  | 'Antipathes Atlantica' 
  | 'Antipathes Furcata' 
  | 'Bebryce Sp.' 
  | 'Ellisellidae' 
  | 'Madracis Sp.' 
  | 'Madrepora Sp.' 
  | 'Muricea Pendula' 
  | 'Paramuriciade Sp' 
  | 'Stichopathes' 
  | 'Swiftia exserta' 
  | 'Thesea nivea' 
  | 'Sponge' 
  | 'Fish';

export const CACCategories: Record<CACCategory, CategoryConfig> = {
  'Antipathes Atlantica': {
    name: 'Antipathes Atlantica',
    color: '#1E88E5',
    description: 'Deep-sea black coral species with intricate branching structures.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Antipathes-Atlantica.jpeg',
  },
  'Antipathes Furcata': {
    name: 'Antipathes Furcata',
    color: '#673AB7',
    description: 'A black coral species with a forked branching pattern.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Antipathes-Furcata.jpeg'
  },
  'Bebryce Sp.': {
    name: 'Bebryce Sp.',
    color: '#F57C00',
    description: 'A soft coral genus known for its feathery polyps.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Bebryce-Sp.jpg',
  },
  'Ellisellidae': {
    name: 'Ellisellidae',
    color: '#4DB6AC',
    description: 'Family of deep-sea gorgonian corals with flexible, whip-like structures.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Ellisellidae.jpeg',
  },
  'Madracis Sp.': {
    name: 'Madracis Sp.',
    color: '#FBC02D',
    description: 'Colonial stony coral with small, tightly packed polyps.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Madracis-sp..jpg',
  },
  'Madrepora Sp.': {
    name: 'Madrepora Sp.',
    color: '#E91E63',
    description: 'A cold-water coral species forming complex reef structures.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Madrepora-Sp.jpeg',
  },
  'Muricea Pendula': {
    name: 'Muricea Pendula',
    color: '#8D6E63',
    description: 'A gorgonian coral species with long, pendulous branches.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Muricea-Pendula.jpg',
  },
  'Paramuriciade Sp': {
    name: 'Paramuriciade Sp',
    color: '#9C27B0',
    description: 'Deep-sea coral family with tree-like branching patterns.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Paramuriciade.jpg',
  },
  'Stichopathes': {
    name: 'Stichopathes',
    color: '#388E3C',
    description: 'A black coral genus characterized by spiral growth patterns.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Stichopathes.jpg',
  },
  'Swiftia exserta': {
    name: 'Swiftia exserta',
    color: '#D32F2F',
    description: 'A bright red gorgonian coral with delicate, branching arms.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Swiftia-Exserta.jpeg',
  },
  'Thesea nivea': {
    name: 'Thesea nivea',
    color: '#03A9F4',
    description: 'A white, fan-like gorgonian coral species.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Thesea-Nivea.jpeg',
  },
  'Sponge': {
    name: 'Sponge',
    color: '#795548',
    description: 'Porous marine organisms that filter water and provide habitat.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Spoonge.jpeg',
  },
  'Fish': {
    name: 'Fish',
    color: '#FF9800',
    description: 'Various fish species observed in the coral reef ecosystem.',
    iconUrl: '/assets/Docs/Zoodex/zoodex-clickACoral/Fish.jpeg',
  }
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