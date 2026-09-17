import { NextRequest, NextResponse } from "next/server";

export interface PlanetConfig {
  id: number;
  name: string;
  mass: string;
  radius: string;
  temperature: {
    average: string;
    min?: string;
    max?: string;
  };
  equilibriumTemperature: string;
  volume: string;
  density: string;
  distanceFromSunOrPlanet: string;
  orbitalPeriod: string;
  planetType: string;
};

const planetConfigurations: PlanetConfig[] = [
  {
    id: 100001,
    name: "Mercury",
    mass: "3.3011 × 10^23 kg",
    radius: "2,439.7 km",
    temperature: {
      average: "167 °C",
      min: "-173 °C",
      max: "427 °C"
    },
    equilibriumTemperature: "440 K",
    volume: "6.083 × 10^10 km³",
    density: "5.427 g/cm³",
    distanceFromSunOrPlanet: "57.91 million km",
    orbitalPeriod: "88 days",
    planetType: "Arid",
  },
  {
    id: 200001,
    name: "Venus",
    mass: "4.8675 × 10^24 kg",
    radius: "6,051.8 km",
    temperature: {
      average: "464 °C",
      min: "462 °C",
      max: "465 °C"
    },
    equilibriumTemperature: "328 K",
    volume: "9.2843 × 10^11 km³",
    density: "5.243 g/cm³",
    distanceFromSunOrPlanet: "108.2 million km",
    orbitalPeriod: "225 days",
    planetType: "Hellhole",
  },
  {
    id: 300001,
    name: "Earth",
    mass: "5.972 × 10^24 kg",
    radius: "6,371 km",
    temperature: {
      average: "15 °C",
      min: "-88 °C",
      max: "58 °C"
    },
    equilibriumTemperature: "255 K",
    volume: "1.08321 × 10^12 km³",
    density: "5.514 g/cm³",
    distanceFromSunOrPlanet: "149.6 million km",
    orbitalPeriod: "365.25 days",
    planetType: "Lush",
  },
  {
    id: 3000011,
    name: "Moon",
    mass: "7.342 × 10^22 kg",
    radius: "1,737.4 km",
    temperature: {
      average: "-53 °C",
      min: "-173 °C",
      max: "127 °C"
    },
    equilibriumTemperature: "270 K",
    volume: "2.1968 × 10^10 km³",
    density: "3.344 g/cm³",
    distanceFromSunOrPlanet: "384,400 km (from Earth)",
    orbitalPeriod: "27.3 days (around Earth)",
    planetType: "Arid",
  },
  {
    id: 400001,
    name: "Mars",
    mass: "6.4171 × 10^23 kg",
    radius: "3,389.5 km",
    temperature: {
      average: "-63 °C",
      min: "-143 °C",
      max: "35 °C"
    },
    equilibriumTemperature: "210 K",
    volume: "1.6318 × 10^11 km³",
    density: "3.933 g/cm³",
    distanceFromSunOrPlanet: "227.9 million km",
    orbitalPeriod: "687 days",
    planetType: "Frozen",
  },
  {
    id: 500001,
    name: "Jupiter",
    mass: "1.8982 × 10^27 kg",
    radius: "69,911 km",
    temperature: {
      average: "-145 °C"
    },
    equilibriumTemperature: "112 K",
    volume: "1.43128 × 10^15 km³",
    density: "1.326 g/cm³",
    distanceFromSunOrPlanet: "778.5 million km",
    orbitalPeriod: "11.86 years",
    planetType: "GasGiant",
  },
  {
    id: 500011,
    name: "Amalthea",
    mass: "2.08 × 10^18 kg",
    radius: "83.5 km",
    temperature: {
      average: "-153 °C"
    },
    equilibriumTemperature: "98 K",
    volume: "2.43 × 10^5 km³",
    density: "0.857 g/cm³",
    distanceFromSunOrPlanet: "181,000 km (from Jupiter)",
    orbitalPeriod: "0.498 days",
    planetType: "Rocky",
  },
  {
    id: 500021,
    name: "Io",
    mass: "8.9319 × 10^22 kg",
    radius: "1,821.6 km",
    temperature: {
      average: "-143 °C"
    },
    equilibriumTemperature: "110 K",
    volume: "2.53 × 10^10 km³",
    density: "3.528 g/cm³",
    distanceFromSunOrPlanet: "421,700 km (from Jupiter)",
    orbitalPeriod: "1.77 days",
    planetType: "Volcanic",
  },
  {
    id: 500031,
    name: "Callisto",
    mass: "1.0759 × 10^23 kg",
    radius: "2,410.3 km",
    temperature: {
      average: "-139 °C"
    },
    equilibriumTemperature: "99 K",
    volume: "5.9 × 10^10 km³",
    density: "1.834 g/cm³",
    distanceFromSunOrPlanet: "1,882,700 km (from Jupiter)",
    orbitalPeriod: "16.69 days",
    planetType: "Icy",
  },
  {
    id: 500041,
    name: "Ganymede",
    mass: "1.4819 × 10^23 kg",
    radius: "2,634.1 km",
    temperature: {
      average: "-160 °C"
    },
    equilibriumTemperature: "110 K",
    volume: "7.6 × 10^10 km³",
    density: "1.936 g/cm³",
    distanceFromSunOrPlanet: "1,070,400 km (from Jupiter)",
    orbitalPeriod: "7.15 days",
    planetType: "Icy",
  },
  {
    id: 500051,
    name: "Europa",
    mass: "4.7998 × 10^22 kg",
    radius: "1,560.8 km",
    temperature: {
      average: "-160 °C"
    },
    equilibriumTemperature: "102 K",
    volume: "1.593 × 10^10 km³",
    density: "3.013 g/cm³",
    distanceFromSunOrPlanet: "671,100 km (from Jupiter)",
    orbitalPeriod: "3.55 days",
    planetType: "Icy",
  },
  {
    id: 600001,
    name: "Saturn",
    mass: "5.6834 × 10^26 kg",
    radius: "58,232 km",
    temperature: {
      average: "-178 °C"
    },
    equilibriumTemperature: "84 K",
    volume: "8.2713 × 10^14 km³",
    density: "0.687 g/cm³",
    distanceFromSunOrPlanet: "1.434 billion km",
    orbitalPeriod: "29.45 years",
    planetType: "GasGiant",
  },
  {
    id: 700001,
    name: "Uranus",
    mass: "8.6810 × 10^25 kg",
    radius: "25,362 km",
    temperature: {
      average: "-224 °C"
    },
    equilibriumTemperature: "59 K",
    volume: "6.833 × 10^13 km³",
    density: "1.27 g/cm³",
    distanceFromSunOrPlanet: "2.871 billion km",
    orbitalPeriod: "84 years",
    planetType: "IceGiant",
  },
  {
    id: 800001,
    name: "Neptune",
    mass: "1.02413 × 10^26 kg",
    radius: "24,622 km",
    temperature: {
      average: "-214 °C"
    },
    equilibriumTemperature: "48 K",
    volume: "6.254 × 10^13 km³",
    density: "1.638 g/cm³",
    distanceFromSunOrPlanet: "4.495 billion km",
    orbitalPeriod: "164.8 years",
    planetType: "IceGiant",
  },
];

export async function GET(req: NextRequest) {
  return NextResponse.json(planetConfigurations);
};