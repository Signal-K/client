export function WeatherBalloon({ level }: { level: number }) {
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="40" r="30" stroke="#FF00FF" strokeWidth="2" />
        <line x1="50" y1="70" x2="50" y2="100" stroke="#FF00FF" strokeWidth="2" />
        <rect x="45" y="90" width="10" height="10" stroke="#FF00FF" strokeWidth="2" />
      </svg>
      <p className="text-white mt-2">Weather Balloon</p>
    </div>
  );
};