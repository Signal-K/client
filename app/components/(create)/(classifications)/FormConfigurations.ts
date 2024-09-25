import { FormConfig, ClassificationOption } from "./MegaClassificationForm";

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