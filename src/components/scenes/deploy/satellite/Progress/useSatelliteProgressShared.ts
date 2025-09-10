import { useEffect, useState } from "react";
import { SharedSatelliteProps } from "./types";

export default function useSatelliteProgressShared(props: SharedSatelliteProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isRoot, setIsRoot] = useState(false);
  const [hideCards, setHideCards] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const check = () => setIsMobile(window.innerWidth < 700);
      check();
      setIsRoot(window.location.pathname === "/");
      setHideCards(window.location.pathname === "/");

      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }
  }, []);

  const {
    height: rawHeight,
    width: rawWidth,
    deployTime,
    now,
    parentWidth,
    style,
  } = props;

  const height = rawHeight ?? 16;
  const width = rawWidth ?? 180;

  const pxHeight = typeof height === "number" ? height : 16;
  const pxWidth = typeof width === "number" ? width : 180;

  const satSize = pxHeight * 1.2;
  const isVertical = isMobile;
  const barStart = satSize / 2;
  const barEnd = isVertical
    ? pxHeight - satSize / 2 + 4 * 120
    : pxWidth - satSize / 2;

  const segmentLength = (barEnd - barStart) / (4); // default 5-step layout

  return {
    isMobile,
    isRoot,
    hideCards,
    style,
    parentWidth,
    deployTime,
    now,
    width,
    height,
    pxHeight,
    pxWidth,
    satSize,
    barStart,
    barEnd,
    segmentLength,
    isVertical,
  };
};