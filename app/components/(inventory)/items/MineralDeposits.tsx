import React from 'react';

export function MineralDeposit() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans">
      <div className="w-full max-w-6xl mx-auto p-8">
        <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] p-6 rounded-lg shadow-md">
          <div className="border-b border-[hsl(var(--border))] pb-4 mb-4">
            <h2 className="text-2xl font-bold">Mars Mineral Deposits</h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              Locations of mineral deposits discovered by the Mars Rover
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MineralLocation
              title="Valles Marineris"
              coordinates="10°S, 70°W"
              mineral="Iron Oxide"
            />
            <MineralLocation
              title="Syrtis Major"
              coordinates="20°N, 290°W"
              mineral="Silica"
            />
            <MineralLocation
              title="Hellas Basin"
              coordinates="40°S, 70°E"
              mineral="Magnesium Sulfate"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function MineralLocation({ title, coordinates, mineral }: { title: string; coordinates: string; mineral: string }) {
  return (
    <div className="flex flex-col items-center">
      <MapPinIcon className="w-8 h-8 text-[hsl(var(--primary))]" />
      <div className="mt-2 text-sm font-medium">{title}</div>
      <div className="text-[hsl(var(--muted-foreground))]">{coordinates}</div>
      <div className="text-[hsl(var(--muted-foreground))]">{mineral}</div>
    </div>
  );
};

export function MapPinIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
};