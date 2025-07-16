"use client";

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet'; 
import ClassificationForm from '@/components/Projects/(classifications)/PostForm';
import { planetClassificationConfig } from '@/components/Projects/(classifications)/FormConfigurations';
// import PreferredTerrestrialClassifications from '@/components/Structures/Missions/PickPlanet';
import ImageAnnotator from '../(classifications)/Annotating/Annotator';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

type Anomaly = {
  id: number;
  anomalySet: string;
  avatar_url?: string;
  content?: any;
};

export function StarterTelescopeTess() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const router = useRouter()

  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

  useEffect(() => {
    const fetchRandomLinkedAnomaly = async () => {
      if (!session) {
        setLoading(false)
        return
      }

      try {
        const { data: linkedAnomalies, error: linkedError } = await supabase
          .from("linked_anomalies")
          .select(`
            id,
            anomaly_id,
            anomalies!inner (
              id,
              anomalySet,
              avatar_url,
              content
            )
          `)
          .eq("author", session.user.id)
          .eq("anomalies.anomalySet", "telescope-tess")

        if (linkedError) throw linkedError

        if (!linkedAnomalies || linkedAnomalies.length === 0) {
          router.push("/deploy")
          return
        }

        // Pick a random anomaly from the list
        const randomIndex = Math.floor(Math.random() * linkedAnomalies.length)
        const anomaly = linkedAnomalies[randomIndex]?.anomalies as unknown as Anomaly

        setSelectedAnomaly(anomaly)

        const urls: string[] = []
        if (anomaly.avatar_url) urls.push(anomaly.avatar_url)
        urls.push(`${supabaseUrl}/storage/v1/object/public/anomalies/${anomaly.id}/Sector1.png`)

        setImageUrls(urls)
      } catch (err: any) {
        console.error("Error fetching linked anomaly:", err.message || err)
        setError("Unable to load anomaly.")
      } finally {
        setLoading(false)
      }
    }

    fetchRandomLinkedAnomaly()
  }, [session])

  if (error) return <div className="text-red-500 p-4">{error}</div>
  if (loading) return <div className="text-white p-4">Loading...</div>
  if (!selectedAnomaly || imageUrls.length === 0)
    return <div className="text-white p-4">No anomaly found.</div>

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col gap-2 px-4 py-6">
      {/* Button Bar */}
      <div className="w-full rounded-xl backdrop-blur-md bg-white/10 shadow-md p-2 flex justify-end">
        <Button variant="outline" onClick={() => setShowTutorial(true)}>
          Want a walkthrough? Start the tutorial
        </Button>
      </div>

      {/* Tutorial OR Annotator */}
      <div className="flex-1 w-full rounded-xl bg-white/10 backdrop-blur-md shadow-md p-2 overflow-hidden">
        {showTutorial ? (
          <div className="w-full h-full overflow-auto">
            <FirstTelescopeClassification anomalyid="6" />
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr] sm:grid-rows-none sm:grid-cols-1">
            <ImageAnnotator
              anomalyType="planet"
              missionNumber={1372001}
              structureItemId={3103}
              assetMentioned={selectedAnomaly.id.toString()}
              annotationType="PH"
              initialImageUrl={imageUrls[1]}
              anomalyId={selectedAnomaly.id.toString()}
              className="h-full max-h-[calc(100vh-10rem)] sm:max-h-full"
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 640px) {
          html, body {
            overflow: hidden;
            height: 100vh;
          }
        }
      `}</style>
    </div>
  )
}

interface TelescopeProps {
    anomalyid: string;
};

export const FirstTelescopeClassification: React.FC<TelescopeProps> = ({ anomalyid }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${anomalyid || activePlanet?.id}/Binned.png`;

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);

    const nextLine = () => setLine(prevLine => prevLine + 1);
    const nextPart = () => {
        setPart(2);
        setLine(1); 
    };

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && <p className="text-[#EEEAD1]">Hello there! To start your journey, you'll need to discover your first planet.</p>}
                            {line === 2 && <p className="text-[#EEEAD1]">To determine if a planet is real, you'll need to examine a lightcurve and identify patterns in dips and variations.</p>}
                            {line === 3 && <p className="text-[#EEEAD1]">Look for regular dips—these often signal a planet passing in front of its star and can confirm its orbit.</p>}
                            {line === 4 && <p className="text-[#EEEAD1]">Pay attention to the shape of these dips: a sharp, symmetrical dip usually indicates a genuine planet transit...</p>}
                            {line === 5 && <p className="text-[#EEEAD1]">...While asymmetrical or irregular shapes might suggest something else.</p>}
                            {line === 6 && <p className="text-[#EEEAD1]">Let's give it a try! Identify the dips in this lightcurve:</p>}
                            {line < 6 && <button onClick={nextLine} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">Next</button>}
                            {line === 6 && <button onClick={nextPart} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">Continue</button>}
                            {line < 6 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 1 && <img src="/assets/Template.png" alt="Step 1" className="max-w-full max-h-full object-contain" />}
                                    {line === 2 && <img src="/assets/Docs/Curves/Step2.png" alt="Step 2" className="max-w-full max-h-full object-contain bg-white" />}
                                    {line === 3 && <img src="/assets/Docs/Curves/Step1.png" alt="Step 3" className="max-w-full max-h-full object-contain bg-white" />}
                                    {line === 4 && <img src="/assets/Docs/Curves/Step3.png" alt="Step 4" className="max-w-full max-h-full object-contain bg-white" />}
                                    {line === 5 && <img src="/assets/Docs/Curves/Step4.png" alt="Step 5" className="max-w-full max-h-full object-contain bg-white" />}
                                </div>
                            )}
                        </>
                    )}
                    {part === 2 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">Great job! Once you've identified your planet, you can share your findings with the rest of the space sailors community.</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="rounded-lg">
            <div className="flex flex-col items-center">
                {part === 1 && (
                    <div className="mb-2">{tutorialContent}</div>
                )}
                {part === 2 && (
                    <>
                        <div className="mb-2">
                            <img
                                src='https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/TelescopeReceiver.png?raw=true'
                                alt='telescope'
                                className="w-24 h-24 mb-2"
                            />
                        </div>
                        <div className="max-w-4xl mx-auto rounded-lg text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                            <div className='relative'>
                                <div className='absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0'></div>
                                <div className='bg-white bg-opacity-90'>
                                    <img
                                        src={imageUrl}
                                        alt={`Active Planet ${activePlanet?.id}`}
                                        className="relative z-10 w-128 h-128 object-contain"
                                    />
                                </div>
                            </div>
                            <ClassificationForm anomalyId={anomalyid} anomalyType='planet' missionNumber={3000001} assetMentioned={imageUrl} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};