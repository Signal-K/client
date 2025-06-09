'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import GameNavbar from '@/components/Layout/Tes';
import { Progress } from '@/components/ui/progress'; // Make sure this component exists

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

export default function ClientClassificationPage({ id }: Props) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  const [classification, setClassification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<any[]>([]);

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
        checkMilestones(data.classificationtype);
      }
    };

    fetchClassification();
  }, [id, supabase, session]);

  const checkMilestones = async (classificationType: string) => {
    try {
      const res = await fetch('/api/gameplay/milestones');
      const allMilestones = await res.json();

      const currentWeek = allMilestones?.[0];
      const relevantMilestones = currentWeek?.data?.filter(
        (m: any) =>
          m.table === 'classifications' &&
          m.field === 'classificationtype' &&
          m.value === classificationType
      );

      if (!relevantMilestones?.length) return;

      const milestoneStatuses = await Promise.all(
        relevantMilestones.map(async (m: any) => {
          const { count } = await supabase
            .from('classifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session?.user?.id)
            .eq('classificationtype', classificationType);

          return {
            name: m.name,
            requiredCount: m.requiredCount ?? 5, // fallback if missing
            currentCount: count ?? 0,
            achieved: count !== null && count >= (m.requiredCount ?? 5),
          };
        })
      );

      // Debug logs (optional)
      // console.log('Relevant Milestones:', relevantMilestones);
      // console.log('Computed Milestone Statuses:', milestoneStatuses);

      setMilestones(milestoneStatuses);
    } catch (err) {
      console.error('Error checking milestones:', err);
    }
  };

  if (loading) return <div className="text-center mt-10 text-[#2E3440]">Loading...</div>;
  if (!classification) return null;

  const mediaUrl = classification.media?.[1]?.[0];
  const type = classification.classificationtype;

  let structure = 'greenhouse';
  if (telescopeTypes.includes(type)) structure = 'telescope';
  else if (balloonTypes.includes(type)) structure = 'balloon';

  const project = projectMap[type];
  const studyUrl = project
    ? `/${structure}/${project}/2/${classification.id}`
    : `/greenhouse/two/${classification.id}`;

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
            <h1 className="text-xl font-semibold text-[#2E3440]">🪐 Classification Summary</h1>
            <p className="text-sm text-[#4C566A]">ID: {classification.id}</p>
            <p className="text-sm text-[#4C566A]">
              Created At: {new Date(classification.created_at).toLocaleString()}
            </p>
            <p className="text-md text-[#4C566A]">{classification.content}</p>
          </div>

          {mediaUrl && (
            <div className="relative group rounded-lg overflow-hidden border border-[#D8DEE9]">
              <Dialog>
                <DialogTrigger asChild>
                  <Image
                    src={mediaUrl}
                    alt="Annotated Media"
                    width={600}
                    height={400}
                    className="w-full h-auto cursor-zoom-in transition-transform duration-200 group-hover:scale-105"
                  />
                </DialogTrigger>
                <DialogContent className="p-0 bg-transparent shadow-none border-none max-w-4xl">
                  <img src={mediaUrl} alt="Full View" className="w-full h-auto rounded-lg" />
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="text-sm text-[#2E3440] space-y-1">
            <p><span className="font-semibold text-[#5E81AC]">Type:</span> {type}</p>
            <p><span className="font-semibold text-[#5E81AC]">Anomaly:</span> {classification.anomaly}</p>
            <p><span className="font-semibold text-[#5E81AC]">Author ID:</span> {classification.author}</p>
          </div>

          {/* Stardust Info */}
          <div className="bg-[#D8F3DC] text-[#2E7D32] text-sm font-medium p-2 rounded-lg border border-[#A5D6A7]">
            +2 Stardust earned for this classification
          </div>

          {/* Milestone Info */}
          {milestones.length > 0 && (
            <div className="space-y-3 pt-2">
              {milestones.map((m) => (
                <div
                  key={m.name}
                  className={`rounded-lg p-3 border ${
                    m.achieved
                      ? 'bg-[#FFF3CD] text-[#856404] border-[#FFECB5]'
                      : 'bg-[#E3F2FD] text-[#1565C0] border-[#90CAF9]'
                  }`}
                >
                  <div className="font-medium">{m.name}</div>
                  {m.achieved ? (
                    <div>🎉 Milestone Achieved!</div>
                  ) : (
                    <div className="pt-2">
                      <div className="text-xs mb-1">
                        {m.currentCount} / {m.requiredCount}
                      </div>
                      <Progress value={(m.currentCount / m.requiredCount) * 100} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#D8DEE9]">
            {/* <Button variant="secondary" onClick={() => router.push(studyUrl)}>
              🔍 Continue Studying
            </Button> */}
            <Button variant="outline" onClick={() => router.push(`/structures/${structure}`)}>
              🧬 Back to Structure
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')}>
              🏠 Home
            </Button>
            <Button variant="default" onClick={() => router.push('/research')}>
              🌟 View Stardust / Research
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};