interface ClassificationOption {
    id: number;
    text: string;
    subOptions?: ClassificationOption[];
};

export const jvhOptions: ClassificationOption[] = [
    {
        id: 1, 
        text: "Vortex",
    },
    {
        id: 2,
        text: "Turbulent region",
    },
    {
        id: 3,
        text: "Cloud bands",
    },
    {
        id: 4,
        text: "None of the above/content too blurry",
    },
];

export const DailyMinorPlanetOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Object cannot be followed",
    },
    {
        id: 2,
        text: 'Object follows green circle consistently',
    },
    {
        id: 3,
        text: "Varied/unknown",
    },
];

export const activeAsteroidsOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Hot – shows a tail or coma",
    },
    {
        id: 2,
        text: "Not – no visible activity",
    },
    {
        id: 3,
        text: "Can't tell / object not visible",
    },
];

export const PlanetFourOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Dust Deposits",
    },
    {
        id: 2,
        text: "Surface Cracks",
    },
    {
        id: 3,
        text: "Spider-like Features",
    },
    {
        id: 4,
        text: "Rocky Outcrops",
    },
    {
        id: 5,
        text: "Smooth Terrain",
    },
];

export const automatonaiForMarsOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Big rocks",
    },
    {
        id: 2,
        text: "Sand"
    },
    {
        id: 3,
        text: 'Soil'
    },
    {
        id: 4,
        text: "Bedrock"
    },
    {
        id: 5,
        text: "Unlabelled"
    },
];

export const cloudClassificationOptionsOne: ClassificationOption[] = [
    {
        id: 1,
        text: "White colour",
    },
    {
        id: 2,
        text: "Blue colour"
    },
];

export const cloudClassificationOptionsTwo: ClassificationOption[] = [
    {
        id: 1,
        text: "Bright clouds",
    },
    {
        id: 2,
        text: "Faint clouds",
    },
    {
        id: 3,
        text: "Medium clouds",
    },
];

export const cloudClassificationOptionsThree: ClassificationOption[] = [
    {
        id: 1,
        text: "Clouds cover most of the height",
    },
    {
        id: 2,
        text: "Clouds are smaller",
    },
];

export const planetClassificationOptions: ClassificationOption[] = [
    { id: 1, text: 'No dips at all' },
    { id: 2, text: 'Repeating dips' },
    { id: 3, text: 'Dips with similar size' },
    { id: 4, text: 'Dips aligned to one side' },
];

export const roverImgClassificationOptions: ClassificationOption[] = [
    { id: 1, text: 'Dried-up water channels' },
    { id: 2, text: 'Pebbles/medium-sized rocks' },
    { id: 3, text: 'Hills/mountain formations' },
    { id: 4, text: 'Volcano (dormant/extinct)' },
    { id: 5, text: 'Mineral deposits' },
    { id: 6, text: 'Sandy/rocky terrain' },
];

export const initialCloudClassificationOptions: ClassificationOption[] = [
    // Cloudspotting on Mars main classifications
    { id: 1, text: "Narrow arch" },
    { id: 2, text: "Wide arch" },
    { id: 3, text: "1 cloud" },
    { id: 4, text: "2 clouds" },
    { id: 5, text: "3 clouds" },
    { id: 6, text: "4+ clouds" },
    { id: 7, text: "Faint cloud" },
    { id: 8, text: "Distinct cloud" },
    { id: 9, text: "Very distinct cloud" },
];
export const cloudSpottingOnMarsShapesOptions: ClassificationOption[] = [
    // Cloudspotting on Mars: Shapes classifications
    // { id: 1, text: "Long and straight" },
    // { id: 2, text: "Curved" },
    // { id: 3, text: "Wavy" },
    // { id: 4, text: "Blob" },
    // { id: 5, text: "Streaky" },
    // { id: 6, text: "Multiple shapes" },
    // {
    //     id: 1,
    //     text: "Cloudy region",
    // },
    // {
    //     id: 2,
    //     text: "Other cloud type",
    // },
    // {
    //     id: 3,
    //     text: "Canyon/Crater",
    // },
    // {
    //     id: 4,
    //     text: ""
    // }
    {
        id: 1,
        text: "Cloudy region",
    },
    {
        id: 2,
        text: "Other clouds",
    },
];


export const ClickACoralClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Coral",
    },
    {
        id: 2,
        text: "Fish/Animals"
    },
];


export const lidarEarthCloudsReadClassificationOptions: ClassificationOption[] = [
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

export const planktonPortalClassificationOptions: ClassificationOption[] = [
    {
        id: 1, 
        text: 'Round plankton, no tentacles',
    },
    {
        id: 2, 
        text: "Head with tail",
    },
    {
        id: 3, 
        text: 'Jellyfish-like',
    },
    {
        id: 4, 
        text: 'Bug-like',
    },
    {
        id: 5,
        text: "Ribbon/elongated",
    },
    {
        id: 6,
        text: "Unidentifiable/None",
    },
];

export const diskDetectorClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Object moves away from crosshairs",
    },
    {
        id: 2,
        text: "Object is extended beyond the outer circle",
    },
    {
        id: 3,
        text: "Multiple objects inside inner circle",
    },
    {
        id: 4,
        text: "Objects between inner and outer circles",
    },
    {
        id: 5,
        text: "Object is not round",
    },
    {
        id: 6,
        text: "None of the above",
    },
];

export const penguinWatchClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Adult penguin",
    },
    {
        id: 2,
        text: "Penguin chicks",
    },
    {
        id: 3,
        text: "Penguin eggs",
    },
    {
        id: 4,
        text: "Nesting pair with eggs",
    },
    {
        id: 5,
        text: "No penguins/too blurry"
    },
];

export const zoodexBurrowingOwlClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Adult owl",
    },
    {
        id: 2,
        text: "Baby owl",
    },
    {
        id: 3,
        text: 'Mortality event',
    },
    {
        id: 4,
        text: "Infanticide",
    },
    {
        id: 5,
        text: "Prey delivery",
    },
    {
        id: 6,
        text: "Mating",
    },
    {
        id: 7,
        text: "Feeding",
    },
    {
        id: 8,
        text: "Owls have bands",
    },// Expand for choosing numbers, pointers, and predators etc.
];

export const zoodexIguanasFromAboveClassificationOptions: ClassificationOption[] = [
    {
        id: 1,
        text: "Adult Male not in a Lek",
    },
    {
        id: 2,
        text: "Adult male with a Lek",
    },
    {
        id: 3,
        text: "Juvenile/Female",
    },
    {
        id: 4,
        text: "Partial iguana",
    },
];

export const zoodexSouthCoastFaunaRecovery: ClassificationOption[] = [
    { id: 1, text: "Australian raven" },
    { id: 2, text: "Red-winged fairy-wren" },
    { id: 3, text: "Cat" },
    { id: 4, text: "Brown falcon" },
    { id: 5, text: "Silvereye" },
    { id: 6, text: "Echidna" },
    { id: 7, text: "Brown quail" },
    { id: 8, text: "Southern emu-wren" },
    { id: 9, text: "Fox" },
    { id: 10, text: "Brush bronzewing" },
    { id: 11, text: "Splendid fairy-wren" },
    { id: 12, text: "Mouse or smaller?" },
    { id: 13, text: "Carnaby's black cockatoo" },
    { id: 14, text: "Spotted nightjar" },
    { id: 15, text: "Quenda" },
    { id: 16, text: "Common bronzewing" },
    { id: 17, text: "Tawny frogmouth" },
    { id: 18, text: "Quokka" },
    { id: 19, text: "Emu" },
    { id: 20, text: "Tawny-crowned honeyeater" },
    { id: 21, text: "Rabbit" },
    { id: 22, text: "Galah" },
    { id: 23, text: "Wedge-tailed eagle" },
    { id: 24, text: "Western brush wallaby" },
    { id: 25, text: "Grey butcherbird" },
    { id: 26, text: "Welcome swallow" },
    { id: 27, text: "Western grey kangaroo" },
    { id: 28, text: "Grey currawong" },
    { id: 29, text: "Western bristlebird" },
    { id: 30, text: "Western ringtail possum" },
    { id: 31, text: "Grey fantail" },
    { id: 32, text: "Western fieldwren" },
    { id: 33, text: "Faulty" },
    { id: 34, text: "Laughing kookaburra" },
    { id: 35, text: "Human" },
    { id: 36, text: "Magpie" },
    { id: 37, text: "Western rosella" },
    { id: 38, text: "Nothing" },
    { id: 39, text: "Malleefowl" },
    { id: 40, text: "Western spinebill" },
    { id: 41, text: "Small mammal" },
    { id: 42, text: "Nankeen kestrel" },
    { id: 43, text: "Western wattlebird" },
    { id: 44, text: "Bird" },
    { id: 45, text: "New holland honeyeater" },
    { id: 46, text: "Western whipbird" },
    { id: 47, text: "Mammal" },
    { id: 48, text: "Noisy scrub-bird" },
    { id: 49, text: "Western whistler" },
    { id: 50, text: "Reptile" },
    { id: 51, text: "Painted button-quail" },
    { id: 52, text: "White-browed scrubwren" },
    { id: 53, text: "Bobtail skink" },
    { id: 54, text: "Purple swamphen" },
    { id: 55, text: "White-cheeked honeyeater" },
    { id: 56, text: "Heath monitor" },
    { id: 57, text: "Red wattlebird" },
    { id: 58, text: "Willie wagtail" },
    { id: 59, text: "King skink" },
    { id: 60, text: "Red-capped parrot" },
    { id: 61, text: "Brushtail possum" },
    { id: 62, text: "Western blue-tongued skink" },
    { id: 63, text: "Red-eared firetail" },
    { id: 64, text: "Bush rat" },
];