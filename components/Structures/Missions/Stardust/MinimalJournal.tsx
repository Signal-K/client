import { useState } from 'react';
import { ChevronDown, Award } from 'lucide-react';
import { Category, Project } from '@/types/journal';

export default function MinimalJournal() {
  const [openCategories, setOpenCategories] = useState<number[]>([]);

  const toggleCategory = (categoryId: number) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-[#581c87]">
      <h1 className="text-3xl font-bold mb-6 text-[#5FCBC3]">Your Progress</h1>

      {categories.map((category) => (
        <div key={category.id} className="mb-4">
          <button
            className="flex items-center justify-between w-full p-3 bg-[#2C4F64]/5 rounded-lg shadow-sm border border-[#2C4F64]/20 hover:bg-[#2C4F64]/20 transition-colors"
            onClick={() => toggleCategory(Number(category.id))}
          >
            <span className="font-semibold text-[#2C4F64]">{category.name}</span>
            <ChevronDown
              className={`transition-transform ${
                openCategories.includes(Number(category.id)) ? 'rotate-180' : ''
              }`}
            />
          </button>

          <div
            className={`mt-2 space-y-3 transition-all duration-300 ease-in-out ${
              openCategories.includes(Number(category.id)) ? 'max-h-screen' : 'max-h-0'
            } overflow-hidden`}
          >
            {category.projects.map((project) => (
              <div
                key={project.id}
                className="w-full p-3 bg-[#2C4F64]/10 rounded-lg shadow-sm border border-[#2C4F64]/20"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#5FCBC3]">{project.name}</span>
                  <span className="text-sm text-[#FFD700]">Points: {project.totalProgress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Astronomers',
    totalTally: 40,
    projects: [
      { id: '1', name: 'Planet Hunters', totalProgress: 15 },
      { id: '2', name: 'Sunspots', totalProgress: 8 },
      { id: '3', name: 'Daily Minor Planet', totalProgress: 12 },
      { id: '4', name: 'Disk Detective', totalProgress: 5 },
    ],
  },
  {
    id: '2',
    name: 'Meteorologists',
    totalTally: 67,
    projects: [
      { id: '5', name: 'Planet Four', totalProgress: 20 },
      { id: '6', name: 'Cloudspotting', totalProgress: 30 },
      { id: '7', name: 'AI4M', totalProgress: 7 },
      { id: '8', name: 'Jovian Vortex Hunter', totalProgress: 10 },
    ],
  },
  {
    id: '3',
    name: 'Biologists',
    totalTally: 50,
    projects: [{ id: '9', name: 'Animal & Plant observations', totalProgress: 50 }],
  },
];