export function ResearchStation({ level }: { level: number }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="40" width="60" height="40" stroke="#FFFF00" strokeWidth="2" />
        <polygon points="20,40 50,20 80,40" stroke="#FFFF00" strokeWidth="2" fill="none" />
        <rect x="40" y="60" width="20" height="20" stroke="#FFFF00" strokeWidth="2" />
      </svg>
      <p className="text-white mt-2">Research Station</p>
    </div>
  )
}

