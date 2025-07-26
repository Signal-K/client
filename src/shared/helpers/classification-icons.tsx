export function ClassificationIcon({ type }: { type: string | null }) {
  switch (type) {
    case "planet":
      return (
        <svg className="w-12 h-12 animate-pulse" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="20" fill="#3B82F6" />
          <circle cx="32" cy="32" r="24" stroke="#3B82F6" strokeOpacity="0.3" strokeWidth="4" />
          <circle cx="20" cy="24" r="4" fill="white" fillOpacity="0.6" />
        </svg>
      );
    case "cloud":
      return (
        <svg className="w-12 h-12 animate-float" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="38" rx="20" ry="12" fill="#60A5FA" />
          <ellipse cx="24" cy="30" rx="12" ry="10" fill="#93C5FD" />
          <ellipse cx="40" cy="30" rx="12" ry="10" fill="#93C5FD" />
        </svg>
      );
    case "telescope-minorplanet":
      return (
        <svg className="w-12 h-12 animate-spin-slow" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="16" stroke="#FBBF24" strokeWidth="4" />
          <circle cx="32" cy="32" r="8" fill="#F59E0B" />
          <circle cx="44" cy="20" r="4" fill="#FCD34D" />
        </svg>
      );
    case "telescopeminor":
      return (
        <svg className="w-12 h-12 animate-spin-slow" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="16" stroke="#FBBF24" strokeWidth="4" />
          <circle cx="32" cy="32" r="8" fill="#F59E0B" />
          <circle cx="44" cy="20" r="4" fill="#FCD34D" />
        </svg>
      );
    case "sunspot":
      return (
        <svg className="w-12 h-12 animate-pulse" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="20" fill="#F59E0B" />
          <path
            d="M32 12v8M32 44v8M12 32h8M44 32h8M20 20l6 6M38 38l6 6M20 44l6-6M38 26l6-6"
            stroke="#B45309"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
          ?
          {/* <p>{type}</p> */}
        </div>
      );
  };
};

export function getAnomalyColor(type: string | null) {
  if (!type) return "#9CA3AF";
  const t = type.toLowerCase();
  if (t.includes("tess")) return "#8B5CF6";
  if (t.includes("planet")) return "#3B82F6";
  if (t.includes("star")) return "#F59E0B";
  if (t.includes("dust")) return "#F97316";
  return "#6B7280";
}