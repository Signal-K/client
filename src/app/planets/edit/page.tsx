"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PlanetEntry {
  id: number;
  title?: string;
  content?: string;
  classificationtype?: string;
}

export default function PlanetsEditIndexPage() {
  const [planets, setPlanets] = useState<PlanetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlanets() {
      try {
        const res = await fetch("/api/gameplay/classifications?classificationtype=planet&limit=50");
        const data = await res.json();
        setPlanets(data?.classifications ?? []);
      } catch {
        setPlanets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPlanets();
  }, []);

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-3">Planet Editing</h1>
      <p className="text-sm text-gray-600 mb-4">
        Select a planet to open the editor.
      </p>
      {loading ? (
        <p className="text-sm text-gray-400">Loading planets...</p>
      ) : planets.length === 0 ? (
        <Link className="text-blue-600 underline" href="/planets/edit/1">
          Open Planet 1
        </Link>
      ) : (
        <ul className="space-y-2">
          {planets.map((planet) => (
            <li key={planet.id}>
              <Link
                className="text-blue-600 underline"
                href={`/planets/edit/${planet.id}`}
              >
                {planet.title || planet.content || `Planet ${planet.id}`}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
