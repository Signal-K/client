import React, { createContext, useContext, useState, ReactNode } from "react";

export enum CameraModes {
  FREE = "FREE",
  HEAD = "HEAD",
  TOP = "TOP",
  BOTTOM = "BOTTOM",
}

export const SwatchesColors: string[] = [
  "#25262b",
  "#868e96",
  "#fa5252",
  "#e64980",
  "#be4bdb",
  "#7950f2",
  "#4c6ef5",
  "#228be6",
  "#15aabf",
  "#12b886",
  "#40c057",
  "#82c91e",
  "#fab005",
  "#fd7e14",
];

interface CharacterCustomizationContextType {
  cameraMode: CameraModes;
  setCameraMode: React.Dispatch<React.SetStateAction<CameraModes>>;
  hairColor: string | undefined; // Replace 'string' with the actual type of color
  setHairColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  mouthColor: string | undefined; // Replace 'string' with the actual type of color
  setMouthColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  eyesColor: string | undefined; // Replace 'string' with the actual type of color
  setEyesColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  glassesColor: string | undefined; // Replace 'string' with the actual type of color
  setGlassesColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  skinColor: string | undefined; // Replace 'string' with the actual type of color
  setSkinColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  shirtColor: string | undefined; // Replace 'string' with the actual type of color
  setShirtColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  pantsColor: string | undefined; // Replace 'string' with the actual type of color
  setPantsColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  shoesColor: string | undefined; // Replace 'string' with the actual type of color
  setShoesColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  lacesColor: string | undefined; // Replace 'string' with the actual type of color
  setLacesColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  soleColor: string | undefined; // Replace 'string' with the actual type of color
  setSoleColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  morphTargetDictionary: any[]; // Replace 'any' with the actual type
  setMorphTargetDictionary: React.Dispatch<React.SetStateAction<any[]>>; // Replace 'any' with the actual type
  morphTargetInfluences: any[]; // Replace 'any' with the actual type
  setMorphTargetInfluences: React.Dispatch<React.SetStateAction<any[]>>; // Replace 'any' with the actual type
  takeScreenshot: boolean;
  setTakeScreenshot: React.Dispatch<React.SetStateAction<boolean>>;
}

const CharacterCustomizationContext = createContext<CharacterCustomizationContextType>(
  {} as CharacterCustomizationContextType
);

interface CharacterCustomizationProviderProps {
  children: ReactNode;
}

export const CharacterCustomizationProvider: React.FC<CharacterCustomizationProviderProps> = (
  props
) => {
  const [takeScreenshot, setTakeScreenshot] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<CameraModes>(CameraModes.FREE);
  const [hairColor, setHairColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [mouthColor, setMouthColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [eyesColor, setEyesColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [glassesColor, setGlassesColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [skinColor, setSkinColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [shirtColor, setShirtColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [pantsColor, setPantsColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [shoesColor, setShoesColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [lacesColor, setLacesColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [soleColor, setSoleColor] = useState<string | undefined>(undefined); // Replace 'string' with the actual type of color
  const [morphTargetDictionary, setMorphTargetDictionary] = useState<any[]>([]); // Replace 'any' with the actual type
  const [morphTargetInfluences, setMorphTargetInfluences] = useState<any[]>([]); // Replace 'any' with the actual type

  return (
    <CharacterCustomizationContext.Provider
      value={{
        cameraMode,
        setCameraMode,
        hairColor,
        setHairColor,
        mouthColor,
        setMouthColor,
        eyesColor,
        setEyesColor,
        glassesColor,
        setGlassesColor,
        skinColor,
        setSkinColor,
        shirtColor,
        setShirtColor,
        pantsColor,
        setPantsColor,
        shoesColor,
        setShoesColor,
        lacesColor,
        setLacesColor,
        soleColor,
        setSoleColor,
        morphTargetDictionary,
        setMorphTargetDictionary,
        morphTargetInfluences,
        setMorphTargetInfluences,
        takeScreenshot,
        setTakeScreenshot,
      }}
    >
      {props.children}
    </CharacterCustomizationContext.Provider>
  );
};

export const useCharacterCustomization = (): CharacterCustomizationContextType => {
  return useContext(CharacterCustomizationContext);
};