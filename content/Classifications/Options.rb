export const cloudClassificationOptions: ClassificationOption[] = [
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

export const lidarEarthCloudsUploadClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Nimbostratus",
    },
    {
        id: 2,
        text: 'Cumulonimbus',
    },
    {
        id: 3,
        text: 'Stratocumulus',
    },
    {
        id: 4,
        text: 'Stratus'
    },
    {
        id: 5,
        text: "Cumulus",
    },
    {
        id: 6,
        text: "Altostratus",
    },
    {
        id: 7,
        text: "Altocumulus",
    },
    {
        id: 8,
        text: "Cirrostratus",
    },
    {
        id: 9,
        text: "Cirrocumulus",
    },
    {
        id: 10,
        text: "Cirrus",
    },
    {
        id: 11,
        text: "No clouds",
    },
];