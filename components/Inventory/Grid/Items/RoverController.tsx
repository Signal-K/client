export function RoverController({ level }: { level: number }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="30" y="30" width="40" height="40" stroke="#FF8000" strokeWidth="2" />
        <circle cx="50" cy="50" r="15" stroke="#FF8000" strokeWidth="2" />
        <line x1="50" y1="20" x2="50" y2="30" stroke="#FF8000" strokeWidth="2" />
        <line x1="50" y1="70" x2="50" y2="80" stroke="#FF8000" strokeWidth="2" />
        <line x1="20" y1="50" x2="30" y2="50" stroke="#FF8000" strokeWidth="2" />
        <line x1="70" y1="50" x2="80" y2="50" stroke="#FF8000" strokeWidth="2" />
      </svg>
      <p className="text-white mt-2">Rover Controller</p>
    </div>
  )
}

