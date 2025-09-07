import React from "react";

const colorMap: Record<string, string> = {
  Custom: "bg-purple-200 text-purple-800",
  Fan: "bg-yellow-200 text-yellow-800",
  Blotch: "bg-blue-200 text-blue-800",
  Sandstorm: "bg-yellow-300 text-yellow-900",
  Asteroid: "bg-gray-300 text-gray-800",
  Cloud: "bg-cyan-200 text-cyan-800",
  Rover: "bg-red-200 text-red-800",
};

export function AnnotationOptionLabel({ option }: { option: string }) {
  // Extract base type from option string (e.g. "Fan (x2)" -> "Fan")
  const base = option.split(" ")[0];
  const color = colorMap[base] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-2 py-1 rounded text-xs font-mono mr-1 ${color}`}>{option}</span>
  );
}
