import React from "react";
import { ColorInput, Stack } from "@mantine/core";
import {
  SwatchesColors,
  useCharacterCustomization,
} from "../../../../context/models/CharacterCustomisationContext";

export const BottomConfigurator: React.FC = () => {
  const {
    pantsColor,
    setPantsColor,
    shoesColor,
    setShoesColor,
    soleColor,
    setSoleColor,
    lacesColor,
    setLacesColor,
  } = useCharacterCustomization();

  return (
    <Stack spacing="sm" py="sm">
      <ColorInput
        label="Pants"
        format="hex"
        swatches={SwatchesColors}
        value={pantsColor || ""}
        onChange={(value) => setPantsColor(value)}
      />
      <ColorInput
        label="Shoes"
        format="hex"
        swatches={SwatchesColors}
        value={shoesColor || ""}
        onChange={(value) => setShoesColor(value)}
      />
      <ColorInput
        label="Laces"
        format="hex"
        swatches={SwatchesColors}
        value={lacesColor || ""}
        onChange={(value) => setLacesColor(value)}
      />
      <ColorInput
        label="Sole"
        format="hex"
        swatches={SwatchesColors}
        value={soleColor || ""}
        onChange={(value) => setSoleColor(value)}
      />
    </Stack>
  );
};