export type RoadmapPoint = {
  quarter: string;
  title: string;
  description: string;
};

interface RoadmapSectionProps {
  title?: string;
  subtitle?: string;
  points: RoadmapPoint[];
}

export function RoadmapSection({
  title = "Roadmap",
  subtitle = "Our vision for the future of Star Sailors",
  points,
}: RoadmapSectionProps) {
  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-4xl font-bold text-center mb-4">{title}</h2>
        <p className="text-xl text-gray-400 text-center mb-12">{subtitle}</p>

        <div className="relative border-l-4 border-gray-600 ml-4">
          {points.map((point, index) => (
            <div key={index} className="mb-10 ml-6 relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[22px] top-1 bg-blue-500 w-4 h-4 rounded-full border-2 border-white"></div>
              
              {/* Roadmap Card */}
              <div className="bg-gray-900 p-6 rounded-lg border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{point.title}</h3>
                  <span className="text-sm font-semibold text-blue-400">{point.quarter}</span>
                </div>
                <p className="text-gray-400">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};