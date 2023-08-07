import React, { createContext, useContext, useState, ReactNode } from "react";

interface CharacterAnimationsContextType {
  animationIndex: number;
  setAnimationIndex: React.Dispatch<React.SetStateAction<number>>;
  animations: any[]; // Replace 'any' with the actual type of animations
  setAnimations: React.Dispatch<React.SetStateAction<any[]>>; // Replace 'any' with the actual type of animations
}

const CharacterAnimationsContext = createContext<CharacterAnimationsContextType>(
  {} as CharacterAnimationsContextType
);

interface CharacterAnimationsProviderProps {
  children: ReactNode;
}

export const CharacterAnimationsProvider: React.FC<CharacterAnimationsProviderProps> = (
  props
) => {
  const [animationIndex, setAnimationIndex] = useState<number>(0);
  const [animations, setAnimations] = useState<any[]>([]); // Replace 'any' with the actual type of animations

  return (
    <CharacterAnimationsContext.Provider
      value={{
        animationIndex,
        setAnimationIndex,
        animations,
        setAnimations,
      }}
    >
      {props.children}
    </CharacterAnimationsContext.Provider>
  );
};

export const useCharacterAnimations = (): CharacterAnimationsContextType => {
  return useContext(CharacterAnimationsContext);
};