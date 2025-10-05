'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/src/components/ui/dialog';
import Image from 'next/image';
import GameNavbar from '@/src/components/layout/Tes';
import { Progress } from '@/src/components/ui/progress';

type Props = {
  id: string;
};

const telescopeTypes = [
  'planet',
  'active-asteroid',
  'diskDetective',
  'telescope-minorPlanet',
];

const balloonTypes = [
  'cloud',
  'lidar-jovianVortexHunter',
  'balloon-marsCloudShapes',
  'satellite-planetFour',
];

const rooverTypes = [
  'automaton-aiForMars'
]

const projectMap: Record<string, string> = {
  planet: 'planethunters',
  'active-asteroid': 'asteroids',
  DiskDetective: 'diskdetective',
  'telescope-minorPlanet': 'dailyminorplanet',
  sunspot: 'sunspot',
  cloud: 'cloudspotting',
  'lidar-jovianVortexHunter': 'jvh',
  'balloon-marsCloudShapes': 'cloudspotting-shapes',
  'automaton-aiForMars': 'ai-for-mars',
  'satellite-planetFour': 'planet-four',
};

function getWeekDateRange(startDateStr: string): { start: string; end: string } {
  const start = new Date(startDateStr);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

const badgeColors = [
  'bg-red-100 text-red-800',
  'bg-green-100 text-green-800',
  'bg-blue-100 text-blue-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
];

export default function ClientClassificationPage({ id }: Props) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [classification, setClassification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<any[] | null>(null);
  const [diskDetectiveImages, setDiskDetectiveImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);

  // Function to detect how many images are available for disk detective anomaly
  const detectDiskDetectiveImages = async (anomalyId: number) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return [];
    
    const urls: string[] = [];
    let imageIndex = 1;
    let maxAttempts = 20; // Safety limit
    
    while (imageIndex <= maxAttempts) {
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-diskDetective/${anomalyId}/${imageIndex}.png`;
      
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (response.ok) {
          urls.push(imageUrl);
          imageIndex++;
        } else {
          break; // Stop when we hit a 404 or other error
        }
      } catch (error) {
        break; // Stop on network errors
      }
    }
    
    return urls;
  };

  // Navigation functions for slideshow
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % diskDetectiveImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? diskDetectiveImages.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const fetchClassification = async () => {
      const { data, error } = await supabase
        .from("classifications")
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching classification:', error);
        return;
      }

      console.log('classificationConfiguration:', data.classificationConfiguration);
      console.log(
        'annotationOptions:',
        data.classificationConfiguration?.annotationOptions ?? []
      );

      setClassification(data);
      setLoading(false);

      // Load disk detective images if this is a disk detective classification
      if (data?.classificationtype === 'diskDetective' && data?.anomaly) {
        setLoadingImages(true);
        const images = await detectDiskDetectiveImages(data.anomaly);
        setDiskDetectiveImages(images);
        setLoadingImages(false);
      }

      if (session && data?.classificationtype) {
        checkMilestones(data.classificationtype, data.created_at);
      }
    };

    fetchClassification();
  }, [id, supabase, session]);

  const checkMilestones = async (classificationType: string, createdAt: string) => {
    try {
      const res = await fetch('/api/gameplay/milestones');
      const allMilestones = await res.json();

      const matchingWeek = allMilestones.playerMilestones.find((week: any) => {
        const { start, end } = getWeekDateRange(week.weekStart);
        return new Date(createdAt) >= new Date(start) && new Date(createdAt) < new Date(end);
      });

      if (!matchingWeek) {
        setMilestones([]);
        return;
      }

      const relevantMilestones = matchingWeek.data?.filter(
        (m: any) =>
          m.table === "classifications" &&
          m.field === 'classificationtype' &&
          m.value === classificationType
      ) || [];

      if (!relevantMilestones.length) {
        setMilestones([]);
        return;
      }

      const { start, end } = getWeekDateRange(matchingWeek.weekStart);

      const milestoneStatuses = await Promise.all(
        relevantMilestones.map(async (m: any) => {
          const { count, error } = await supabase
            .from("classifications")
            .select('', { count: 'exact', head: true })
            .eq('author', session?.user?.id)
            .eq('classificationtype', classificationType)
            .gte('created_at', start)
            .lt('created_at', end);

          if (error) {
            console.error('Milestone count error:', error);
          }

          return {
            name: m.name,
            requiredCount: m.requiredCount ?? 5,
            currentCount: count ?? 0,
            achieved: (count ?? 0) >= (m.requiredCount ?? 5),
          };
        })
      );

      setMilestones(milestoneStatuses);
    } catch (err) {
      console.error('Error checking milestones:', err);
      setMilestones([]);
    }
  };

  if (loading) return <div className="text-center mt-10 text-[#2E3440]">Loading...</div>;
  if (!classification) return null;

  const mediaUrl = Array.isArray(classification.media)
    ? classification.media.find((item: any) => Array.isArray(item) && typeof item[0] === 'string' && item[0].startsWith('http'))?.[0]
    : undefined;
  const type = classification.classificationtype;

  let structure = 'greenhouse';
  let viewportUrl = '/';
  
  if (telescopeTypes.includes(type)) {
    structure = 'telescope';
    viewportUrl = '/structures/telescope';
  } else if (balloonTypes.includes(type)) {
    structure = 'balloon';
    viewportUrl = '/viewports/satellite';
  } else if (rooverTypes.includes(type)) {
    structure = 'rover';
    viewportUrl = '/viewports/roover';
  }

  const project = projectMap[type];
  const studyUrl = project
    ? `/${structure}/${project}/2/${classification.id}`
    : `/greenhouse/two/${classification.id}`;

  const annotationOptions: string[] =
    classification?.classificationConfiguration?.annotationOptions ?? [];

  // Reduce to count occurrences
  const annotationCounts = annotationOptions.reduce((acc: Record<string, number>, label: string) => {
    const key = label.trim();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const annotationBadges = Object.entries(annotationCounts).map(([label, count], idx) => {
    const color = badgeColors[idx % badgeColors.length];
    return (
      <span
        key={label}
        className={`inline-block px-3 py-1 rounded-full text-xs font-medium mr-2 mb-2 ${color}`}
      >
        {count > 1 ? `${label} (${count})` : label}
      </span>
    );
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="/assets/Backdrops/Earth.png"
          alt="Earth Background"
          className="w-full h-full object-cover blur-md brightness-90 opacity-80"
        />
      </div>

      <div className="w-full z-10">
        <GameNavbar />
      </div>

      <div className="flex items-center justify-center min-h-screen px-2 py-4 sm:px-4 sm:py-8">
        <div className="bg-[#F8FAFC] rounded-2xl shadow-xl p-3 sm:p-6 max-w-4xl w-full border border-[#88C0D0] space-y-4 sm:space-y-6 max-h-[95vh] overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-[#2E3440]">Discovery Summary</h1>
            <p className="text-md text-[#4C566A]">{classification.content}</p>
          </div>

          {mediaUrl && (
            <div className="relative group rounded-md overflow-hidden border border-[#D8DEE9]">
              <Dialog>
                <DialogTrigger asChild>
                  <Image
                    src={mediaUrl}
                    alt="Annotated Media"
                    width={600}
                    height={300}
                    className="w-full h-[300px] object-contain cursor-zoom-in transition-transform duration-200 group-hover:scale-105"
                  />
                </DialogTrigger>
              </Dialog>
            </div>
          )}

          {/* Disk Detective Classification Results */}
          {classification?.classificationtype === 'diskDetective' && classification?.classificationConfiguration && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-[#2E3440]">🔍 Discovery Analysis</h3>
              
              {/* Main discovery result */}
              {classification.classificationConfiguration.interpretation && (
                <div className={`p-3 sm:p-4 rounded-lg border ${
                  classification.classificationConfiguration.interpretation.category.includes('Disk Candidate') || 
                  classification.classificationConfiguration.interpretation.category.includes('Planetary System')
                    ? 'bg-green-50 border-green-200'
                    : classification.classificationConfiguration.interpretation.category === 'Unclassified Object'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="space-y-2 sm:space-y-3">
                    {/* Object type header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        classification.classificationConfiguration.interpretation.category.includes('Disk Candidate') || 
                        classification.classificationConfiguration.interpretation.category.includes('Planetary System')
                          ? 'bg-green-100 text-green-800'
                          : classification.classificationConfiguration.interpretation.category === 'Unclassified Object'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {classification.classificationConfiguration.interpretation.objectType}
                      </span>
                      <span className="text-xs text-gray-600">
                        Confidence: {classification.classificationConfiguration.interpretation.confidence}
                      </span>
                    </div>
                    
                    {/* What you discovered */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">What You Discovered:</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {classification.classificationConfiguration.interpretation.discovery}
                      </p>
                    </div>
                    
                    {/* Scientific description */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Scientific Details:</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {classification.classificationConfiguration.interpretation.description}
                      </p>
                    </div>
                    
                    {/* Scientific value */}
                    <div className="bg-white bg-opacity-50 rounded p-2 sm:p-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Why This Matters:</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        {classification.classificationConfiguration.interpretation.scientificValue}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed characteristics (collapsible on mobile) */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-900 list-none">
                  <div className="flex items-center gap-2">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    <span>View Technical Details</span>
                  </div>
                </summary>
                <div className="mt-2 space-y-2 sm:space-y-3">
                  {/* Selected characteristics */}
                  {classification.classificationConfiguration.selectedOptions && 
                   classification.classificationConfiguration.selectedOptions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Observed Characteristics:</h4>
                      <ul className="space-y-1">
                        {classification.classificationConfiguration.selectedOptions.map((option: any, index: number) => (
                          <li key={index} className="text-xs text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                            <span className="leading-tight">{option.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* User comments */}
                  {classification.classificationConfiguration.comments && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Your Notes:</h4>
                      <p className="text-sm text-gray-700 italic leading-relaxed">
                        "{classification.classificationConfiguration.comments}"
                      </p>
                    </div>
                  )}

                  {/* Survey information */}
                  {classification.classificationConfiguration.imageCount && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600">📊</span>
                        <span className="text-sm text-purple-800">
                          Analyzed {classification.classificationConfiguration.imageCount} survey images
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </div>
          )}

          {/* Disk Detective Image Slideshow */}
          {classification?.classificationtype === 'diskDetective' && (
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-[#2E3440]">📡 Survey Images</h3>
              
              {loadingImages ? (
                <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Loading images...</span>
                </div>
              ) : diskDetectiveImages.length > 0 ? (
                <div className="bg-gray-900 rounded-lg p-2 sm:p-4">
                  <div className="relative">
                    <img
                      src={diskDetectiveImages[currentImageIndex]}
                      alt={`Survey image ${currentImageIndex + 1}`}
                      className="w-full h-48 sm:h-64 object-contain bg-black rounded"
                    />
                    
                    {/* Image navigation thumbnails */}
                    {diskDetectiveImages.length > 1 && (
                      <div className="flex justify-center mt-2 sm:mt-3 gap-1 sm:gap-2 overflow-x-auto pb-2">
                        {diskDetectiveImages.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-6 h-6 sm:w-10 sm:h-10 rounded border-2 overflow-hidden ${
                              currentImageIndex === index 
                                ? 'border-blue-400' 
                                : 'border-gray-600'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-contain bg-black"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Navigation buttons */}
                    {diskDetectiveImages.length > 1 && (
                      <div className="flex justify-between items-center mt-2 sm:mt-3">
                        <button
                          onClick={prevImage}
                          className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-colors text-xs sm:text-sm"
                        >
                          ← Prev
                        </button>
                        <span className="flex items-center text-xs sm:text-sm text-gray-300 mx-2 sm:mx-4">
                          {currentImageIndex + 1} / {diskDetectiveImages.length}
                        </span>
                        <button
                          onClick={nextImage}
                          className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-colors text-xs sm:text-sm"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No survey images available</span>
                </div>
              )}
            </div>
          )}

          {annotationBadges.length > 0 && classification?.classificationtype !== 'diskDetective' && (
            <div className="flex flex-wrap pt-2">{annotationBadges}</div>
          )}

          <div className="bg-[#D8F3DC] text-[#2E7D32] text-sm font-medium p-2 rounded-lg border border-[#A5D6A7]">
            +2 Stardust earned for this classification
          </div>

          <div className="space-y-3 pt-2">
            <h2 className="text-md font-semibold text-[#2E3440]">🎯 Milestones</h2>

            {milestones === null ? (
              <div className="text-sm text-[#4C566A]">Checking milestones...</div>
            ) : milestones.length === 0 ? (
              <div className="text-sm text-[#4C566A] italic">
                No related milestones for this classification type.
              </div>
            ) : (
              milestones.map((m) => (
                <div
                  key={m.name}
                  className={`rounded-lg p-3 border min-h-[96px] flex flex-col justify-between ${
                    m.achieved
                      ? 'bg-[#FFF3CD] text-[#856404] border-[#FFECB5]'
                      : 'bg-[#E3F2FD] text-[#1565C0] border-[#90CAF9]'
                  }`}
                >
                  <div className="font-medium">{m.name}</div>
                  <div className="pt-1">
                    {m.achieved ? (
                      <div>🎉 Milestone Achieved!</div>
                    ) : (
                      <>
                        <div className="text-xs mb-1">
                          {m.currentCount} / {m.requiredCount}
                        </div>
                        <Progress value={(m.currentCount / m.requiredCount) * 100} />
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#D8DEE9]">
            <Button variant="outline" onClick={() => router.push(viewportUrl)} className="text-xs sm:text-sm">
              🧬 Back to Structure
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')} className="text-xs sm:text-sm">
              🏠 Home
            </Button>
            {type === 'planet' && (
              <Button variant="default" onClick={() => router.push(`/planets/paint/${classification.id}`)} className="text-xs sm:text-sm">
                🪐 Customise planet
              </Button>
            )}
            {type != 'planet' && (
              <Button variant='default' onClick={() => router.push(viewportUrl)} className="text-xs sm:text-sm">
                ⚙️ Step 2
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};