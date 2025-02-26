import { Rocket } from "lucide-react";

export type RoadmapPoint = {
  quarter: string
  title: string
  description: string
};

interface RoadmapSectionProps {
  title?: string
  subtitle?: string
  points: RoadmapPoint[]
};

export function RoadmapSection({
  title = "Roadmap",
  subtitle = "Our vision for the future of Star Sailors",
  points,
}: RoadmapSectionProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">{title}</h2>
        <p className="text-xl text-gray-600 text-center mb-12">{subtitle}</p>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {points.map((point, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] hover:translate-x-[4px] hover:shadow-none transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-400 p-2 rounded-full border-2 border-black">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-blue-500">{point.quarter}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{point.title}</h3>
              <p className="text-gray-600">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};