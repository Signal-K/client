"use client";

import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => document.getElementById('imageInput')?.click()}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Image
      </Button>
      <input
        id="imageInput"
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
};