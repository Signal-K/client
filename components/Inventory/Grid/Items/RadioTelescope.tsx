export function RadioTelescope({ level }: { level: number }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="70" r="25" stroke="#00FFFF" strokeWidth="2" />
        <line x1="50" y1="70" x2="50" y2="10" stroke="#00FFFF" strokeWidth="2" />
        <line x1="35" y1="25" x2="65" y2="25" stroke="#00FFFF" strokeWidth="2" />
      </svg>
      <p className="text-white mt-2">Radio Telescope</p>
    </div>
  )
}

