export interface ClassificationOption {
  id: number;
  text?: string;
  subOptions?: ClassificationOption[];
};

export interface FormConfig {
  title?: string; 
  richTextFields: number;
  options?: ClassificationOption[];
  richTextTitles?: (string | undefined)[];
}; 

export interface ClassificationFormProps {
  config?: FormConfig;
  onSubmit?: (data: any) => void;
  anomalyType: string;
  anomalyId: string;
  missionNumber: number;
  assetMentioned: string | string[];
  // structureItemId?: number;
  structureItemId?: number;
};

const defaultConfig: FormConfig = {
  title: "Classification Form",
  richTextFields: 1,
  options: [],
};

const planetClassificationOptions: ClassificationOption[] = [
  { id: 1,
    // text: "Planet candidate",
    subOptions: [
      { id: 1, text: 'No dips at all' },
      { id: 2, text: 'Repeating dips' },
      { id: 3, text: 'Dips with similar size' },
      { id: 4, text: 'Dips aligned to one side' },
    ],
  },
];

const roverImgClassificationOptions: ClassificationOption[] = [
  {
    id: 1,
    text: "Terrain options",
    subOptions: [
      { id: 1, text: 'Dried-up water channels' },
      { id: 2, text: 'Pebbles/medium-sized rocks' },
      { id: 3, text: 'Hills/mountain formations' },
      { id: 4, text: 'Volcano (dormant/extinct)' },
      { id: 5, text: 'Mineral deposits' },
      { id: 6, text: 'Sandy/rocky terrain' },
    ],
  },
];

const zoodexSouthCoastFaunaRecoveryOptions: ClassificationOption[] = [
  {
    id: 1,
    text: "Birds",
    subOptions: [
      { id: 1, text: "Australian raven" },
      { id: 2, text: "Red-winged fairy-wren" },
      { id: 4, text: "Brown falcon" },
      { id: 5, text: "Silvereye" },
      { id: 7, text: "Brown quail" },
      { id: 8, text: "Southern emu-wren" },
      { id: 10, text: "Brush bronzewing" },
      { id: 11, text: "Splendid fairy-wren" },
      { id: 13, text: "Carnaby's black cockatoo" },
      { id: 14, text: "Spotted nightjar" },
    ],
  },
  {
    id: 2,
    text: "Large Mammals",
    subOptions: [
      { id: 6, text: "Echidna" },
      { id: 18, text: "Quokka" },
      { id: 19, text: "Emu" },
      { id: 24, text: "Western brush wallaby" },
      { id: 27, text: "Western grey kangaroo" },
      { id: 30, text: "Western ringtail possum" },
      { id: 61, text: "Brushtail possum" },
    ],
  },
  {
    id: 3,
    text: "Small Mammals",
    subOptions: [
      { id: 3, text: "Cat" },
      { id: 9, text: "Fox" },
      { id: 12, text: "Mouse or smaller?" },
      { id: 15, text: "Quenda" },
      { id: 21, text: "Rabbit" },
      { id: 41, text: "Small mammal" },
      { id: 47, text: "Mammal" },
      { id: 64, text: "Bush rat" },
    ],
  },
  {
    id: 4,
    text: "Reptiles",
    subOptions: [
      { id: 53, text: "Bobtail skink" },
      { id: 56, text: "Heath monitor" },
      { id: 59, text: "King skink" },
      { id: 62, text: "Western blue-tongued skink" },
    ],
  },
  {
    id: 5,
    text: "Other",
    subOptions: [
      { id: 33, text: "Faulty" },
      { id: 35, text: "Human" },
      { id: 38, text: "Nothing" },
      { id: 44, text: "Bird" },
      { id: 50, text: "Reptile" },
    ],
  },
];

const cloudClassificationOptions: ClassificationOption[] = [
  {
    id: 1,
    text: "Colour",
    subOptions: [
      { id: 1, text: "White colour" },
      { id: 2, text: "Blue colour" },
    ],
  },
  {
    id: 2,
    text: "Intensity",
    subOptions: [
      { id: 1, text: "Bright clouds" },
      { id: 2, text: "Faint clouds" },
      { id: 3, text: "Medium clouds" },
    ],
  },
  {
    id: 3,
    text: "Coverage",
    subOptions: [
      { id: 1, text: "Clouds cover most of the height" },
      { id: 2, text: "Clouds are smaller" },
    ],
  },
];

const zoodexBurrowingOwlClassificationOptions: ClassificationOption[] = [
  { id: 1, text: "Adult owl" },
  { id: 2, text: "Baby owl" },
];

const zoodexIguanasFromAboveClassificationOptions: ClassificationOption[] = [
  { id: 1, text: "Adult Male not in a Lek" },
  { id: 2, text: "Adult male with a Lek" },
  { id: 3, text: "Juvenile/Female" },
  { id: 4, text: "Partial iguana" },
];

const diskDetectorOptions: ClassificationOption[] = [
  {
    id: 1,
    text: "Object moves away from crosshairs in...",
    subOptions: [
      {
        id: 1,
        text: "ONLY the 2MASS images"
      },
      {
        id: 2,
        text: "two or more images"
      },
    ],
  },
  {
    id: 2,
    text: "Expansions",
    subOptions: [
      {
        id: 1, 
        text: "The object is extended beyond the outer circle in the unWISE Images",
      },
      {
        id: 2,
        text: "Two or more images show multiple objects inside the inner circle",
      },
      {
        id: 3,
        text: "Two or more images show objects between the inner and outer circles"
      }
    ],
  },
  {
    id: 3,
    text: "The object of interest is not round in the Pan-STARRS, SkyMapper or 2MASS images",
  },
  {
    id: 4,
    text: "None of the above",
  },
];

export const planetClassificationConfig: FormConfig = {
  // title: "Planet Classification",
  richTextFields: 1,
  options: planetClassificationOptions,
};

export const roverImgClassificationConfig: FormConfig = {
  title: "Rover Image Classification",
  richTextFields: 1,
  options: roverImgClassificationOptions,
};

export const zoodexSouthCoastFaunaRecoveryClassificationConfig: FormConfig = {
  title: "South Coast Fauna Recovery",
  richTextFields: 1,
  options: zoodexSouthCoastFaunaRecoveryOptions,
};

export const cloudClassificationConfig: FormConfig = {
  title: "Cloud Classification",
  richTextFields: 1,
  options: cloudClassificationOptions,
};

export const zoodexBurrowingOwlClassificationConfig: FormConfig = {
  title: "Zoodex Burrowing Owl Classification",
  richTextFields: 1,
  options: zoodexBurrowingOwlClassificationOptions,
};

export const zoodexIguanasFromAboveClassificationConfig: FormConfig = {
  title: "Zoodex Iguanas From Above Classification",
  richTextFields: 1,
  options: zoodexIguanasFromAboveClassificationOptions,
};

export const telescopeSunspotDetectorConfig: FormConfig = {
  title: "Sunspot Detector",
  richTextFields: 1,
};

export const telescopeDiskDetectorConfig: FormConfig = {
  title: "Disk Detector",
  richTextFields: 1,
  options: diskDetectorOptions,
};

export const zoodexNestQuestGoConfig: FormConfig = {
  title: "Nested Quest Go",
  richTextFields: 4,
  richTextTitles: ['Month of EACH nest visit (put a slash / between nest visits)', 'Day of EACH nest visit(put a slash / between nest visits)', 'Number of Eggs for EACH nest visit (put a slash / between nest visits)', 'Number of Young for EACH nest visit (put a slash / between nest visits)'],
};