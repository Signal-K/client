'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Image from 'next/image';
import GameNavbar from '@/components/Layout/Tes';

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
    };

    fetchClassification();
  }, [id, supabase]);

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

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#D8DEE9]">
            <Button variant="secondary" onClick={() => router.push(studyUrl)}>
              🔍 Continue Studying
            </Button>
            <Button variant="outline" onClick={() => router.push(`/structures/${structure}`)}>
              🧬 Back to Structure
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')}>
              🏠 Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};