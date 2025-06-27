'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import GameNavbar from '@/components/Layout/Tes';
import { Progress } from '@/components/ui/progress';

type Props = {
  id: string;
};

const telescopeTypes = [
  'planet',
  'active-asteroid',
  'DiskDetective',
  'telescope-minorPlanet',
];

const balloonTypes = [
  'cloud',
  'lidar-jovianVortexHunter',
  'balloon-marsCloudShapes',
  'automaton-aiForMars',
  'satellite-planetFour',
];

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

  useEffect(() => {
    const fetchClassification = async () => {
      const { data, error } = await supabase
        .from('classifications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching classification:', error);
        return;
      }

      setClassification(data);
      setLoading(false);

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
          m.table === 'classifications' &&
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
            .from('classifications')
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
  if (telescopeTypes.includes(type)) structure = 'telescope';
  else if (balloonTypes.includes(type)) structure = 'balloon';

  const project = projectMap[type];
  const studyUrl = project
    ? `/${structure}/${project}/2/${classification.id}`
    : `/greenhouse/two/${classification.id}`;

  const annotationOptions: string[] =
    classification?.configuration?.annotationOptions ?? [];

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

      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="bg-[#F8FAFC] rounded-2xl shadow-xl p-6 max-w-xl w-full border border-[#88C0D0] space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-[#2E3440]">Discovery Summary</h1>
            <p className="text-md text-[#4C566A]">{classification.content}</p>
          </div>

          {annotationOptions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {annotationOptions.map((option, idx) => (
                <span
                  key={option}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border border-gray-300 ${
                    badgeColors[idx % badgeColors.length]
                  }`}
                >
                  {option}
                </span>
              ))}
            </div>
          )}

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

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#D8DEE9]">
            <Button variant="outline" onClick={() => router.push(`/structures/${structure}`)}>
              🧬 Back to Structure
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')}>
              🏠 Home
            </Button>
            {type === 'planet' && (
              <Button variant="default" onClick={() => router.push(`/planets/paint/${classification.id}`)}>
                🪐 Customise planet
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};