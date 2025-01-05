export function Biodome({ level }: { level: number }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 70 Q50 10 90 70" stroke="#00FF00" strokeWidth="2" fill="none" />
        <line x1="10" y1="70" x2="90" y2="70" stroke="#00FF00" strokeWidth="2" />
        <path d="M40 70 Q50 40 60 70" stroke="#00FF00" strokeWidth="2" fill="none" />
      </svg>
      <p className="text-white mt-2">Biodome</p>
    </div>
  )
}

