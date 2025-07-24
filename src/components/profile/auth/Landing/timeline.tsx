import Image from "next/image";
import { Calendar } from 'lucide-react';

export type TimelinePoint = {
  date: string
  title: string
  description: string
  image: string
};

interface TimelineSectionProps {
  title?: string
  points: TimelinePoint[]
};

export function TimelineSection({ 
  title = "Release history", 
  points 
}: TimelineSectionProps) {
  return (
    <section className="py-20 bg-[#FDFBF7]">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-blue-400 text-center mb-12">{title}</h2>
        <div className="relative">
        
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-300 hidden md:block"></div>
          
          {points.map((point, index) => (
            <div key={index} className={`mb-16 md:mb-24 relative ${index % 2 === 0 ? 'md:ml-auto' : ''} md:w-1/2`}>
            
              {/* <div className="hidden md:block absolute top-0 left-0 md:left-auto md:right-auto md:-ml-5 md:-translate-x-1/2 w-10 h-10 rounded-full bg-blue-400 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10">
                <Calendar className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
              </div> */}
              
              <div className={`bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:mx-8 ${index % 2 === 0 ? 'md:mr-0 md:ml-12' : 'md:ml-0 md:mr-12'}`}>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full"> {/* md:w-1/2 */}
                    <div className="bg-yellow-100 text-blue-300 inline-block px-4 py-1 rounded-full text-sm font-bold mb-3 border-2 border-black">
                      {point.date}
                    </div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-2">{point.title}</h3>
                    <p className="text-gray-600">{point.description}</p>
                  </div>
                  {/* <div className="w-full md:w-1/2 rounded-lg overflow-hidden border-2 border-black">
                    <Image
                      src={point.image || "/placeholder.svg"}
                      alt={point.title}
                      width={400}
                      height={300}
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};