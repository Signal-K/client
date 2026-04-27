import { useState, useCallback } from "react";

export function useImageCarousel(images: string[]) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return { currentIndex, next, prev, goTo };
}
