import Link from "next/link";

export default function PlanetsEditIndexPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-3">Planet Editing</h1>
      <p className="text-sm text-gray-600 mb-4">
        Select a planet to open the editor.
      </p>
      <Link className="text-blue-600 underline" href="/planets/1">
        Open Planet 1
      </Link>
    </main>
  );
}
