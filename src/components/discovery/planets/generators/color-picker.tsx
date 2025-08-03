"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorPicker({
  color,
  onChange,
  label,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [localColor, setLocalColor] = useState<string>(color);

  useEffect(() => {
    // Sync local color state with external changes
    setLocalColor(color);
  }, [color]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalColor(value);

    // Update parent only if valid hex code
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onChange(value);
    }
  };

  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="flex flex-col space-y-1.5">
      {label && <Label className="text-xs text-gray-900">{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="flex h-8 cursor-pointer">
            <div
              className="w-8 h-8 rounded-l border border-r-0 border-gray-600"
              style={{ backgroundColor: localColor }}
            />
            <Input
              type="text"
              value={localColor}
              onChange={handleInputChange}
              className="rounded-l-none w-24 h-8 font-mono text-xs text-gray-900"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 text-gray-900" side="right">
          <HexColorPicker color={localColor} onChange={handleColorChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
};