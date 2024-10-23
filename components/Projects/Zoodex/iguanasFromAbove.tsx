"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { StructureInfo } from "@/components/Structures/structureInfo";
import ClassificationForm from "@/components/Projects/(classifications)/PostForm";
 
interface ZoodexProps { 
  anomalyId: string;
};

export const IguanasFromAboveTutorial: React.FC<ZoodexProps> = ({ anomalyId }) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-iguanasFromAbove/${anomalyId}.jpeg`;

  const [part, setPart] = useState(1);
  const [line, setLine] = useState(1);

  const nextLine = () => setLine((prevLine) => prevLine + 1);
  const nextPart = () => {
    setPart(2);
    setLine(1);
  };

  const tutorialContent = (
    <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
      {/* <div className="flex items-center">
        <img
          src="/assets/Captn.jpg"
          alt="Captain Cosmos Avatar"
          className="w-12 h-12 rounded-full bg-[#303F51]"
        />
        <h3 className="text-xl font-bold text-[#85DDA2] mt-2 ml-4">Capt'n Cosmos</h3>
      </div> */}
      <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
        <div className="relative">
          <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
          {part === 1 && (
            <>
              {line === 1 && (
                <p className="text-[#EEEAD1]">
                  Hello, and welcome to the Iguana Classification
                </p>
              )}
              {line === 2 && (
                <p className="text-[#EEEAD1]">
                  We need your help to know <strong>how many marine iguanas</strong> are living
                  in the Galápagos. This tutorial will help you identify them in the images.
                  Iguanas can be rare, so please note that when you don't find any.
                </p>
              )}
              {line === 3 && (
                <p className="text-[#EEEAD1]">
                  Search for iguanas following a zigzag pattern,{" "}
                  <strong>look carefully and slowly!</strong> Remember the lizard-shape when
                  looking.
                </p>
              )}
              {line === 4 && (
                <p className="text-[#EEEAD1]">
                  You will find different types of iguanas. <strong>ADULT MALES</strong> are bigger
                  and could be more colourful. If you see an aggregation of grey iguanas around a
                  big coloured male, this is called a <strong>LEK</strong> (reproductive group)!
                </p>
              )}
              {line === 5 && (
                <p className="text-[#EEEAD1]">
                  If your adult male has a lek, select the option{" "}
                  <strong>Adult male with a lek</strong>, if is alone select the option{" "}
                  <strong>Adult male not in a lek.</strong>
                </p>
              )}
              {line === 6 && (
                <p className="text-[#EEEAD1]">
                  If you find an iguana cut by any side of the image, please mark it with the option{" "}
                  <strong>partial iguana</strong>
                </p>
              )}
              {line === 7 && <p className="text-[#EEEAD1]">Let's get started!</p>}

              {line < 7 && (
                <div className="flex justify-center mt-4 w-full h-64">
                  {line === 2 && (
                    <img
                      src="/assets/Docs/Zoodex/zoodex-IguanasFromAbove/Step1.jpeg"
                      alt="Step 2"
                      className="max-w-full max-h-full object-contain bg-white"
                    />
                  )}
                  {line === 3 && (
                    <img
                      src="/assets/Docs/Zoodex/zoodex-IguanasFromAbove/Step2.jpg"
                      alt="Step 3"
                      className="max-w-full max-h-full object-contain bg-white"
                    />
                  )}
                  {line === 4 && (
                    <img
                      src="/assets/Docs/Zoodex/zoodex-IguanasFromAbove/Step3.jpg"
                      alt="Step 4"
                      className="max-w-full max-h-full object-contain bg-white"
                    />
                  )}
                  {line === 5 && (
                    <img
                      src="/assets/Docs/Zoodex/zoodex-IguanasFromAbove/Step4.jpg"
                      alt="Step 5"
                      className="max-w-full max-h-full object-contain bg-white"
                    />
                  )}
                  {line === 6 && (
                    <img
                      src="/assets/Docs/Zoodex/zoodex-IguanasFromAbove/Step5.jpg"
                      alt="Step 6"
                      className="max-w-full max-h-full object-contain bg-white"
                    />
                  )}
                </div>
              )}

              {line < 6 && (
                <button onClick={nextLine} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">
                  Next
                </button>
              )}
              {line === 6 && (
                <button onClick={nextPart} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">
                  Continue
                </button>
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
          <div className="mb-2">
            {tutorialContent}
          </div>
        )}
        {part === 2 && (
          <>
            {/* <div className="mb-2">
              <StructureInfo structureName="Zoodex" />
              <img
                src="https://github.com/Signal-K/client/blob/SGV2-154/public/assets/Archive/Inventory/Structures/TelescopeReceiver.png?raw=true"
                alt="Zoodex"
                className="w-24 h-24 mb-2"
              />
            </div> */}
            <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
              <div className="relative">
                <div className="absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                <div className="bg-white bg-opacity-90">
                  <img
                    src={imageUrl}
                    alt="Sunspot"
                    className="relative z-10 w-64 h-64 object-contain"
                  />
                </div>
              </div>
              <ClassificationForm
                anomalyId={anomalyId}
                anomalyType="zoodex-iguanasFromAbove"
                missionNumber={3000004}
                assetMentioned={imageUrl}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

import { Anomaly } from "../Telescopes/Transiting";

export function ZoodexIguanas() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAnomaly() {
      if (!session) {
        setLoading(false);
        return;
      }

      try {
        const { data: anomalyData, error: anomalyError } = await supabase
          .from("anomalies")
          .select("*")
          .eq("anomalySet", "zoodex-iguanasFromAbove");

        if (anomalyError) {
          throw anomalyError;
        }

        if (!anomalyData || anomalyData.length === 0) {
          setAnomaly(null);
          setLoading(false);
          return;
        }

        const randomAnomaly = anomalyData[Math.floor(Math.random() * anomalyData.length)] as Anomaly;
        setAnomaly(randomAnomaly);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        setImageUrl(`${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-iguanasFromAbove/${randomAnomaly.id}.jpeg`);
      } catch (error: any) {
        console.error('Error fetching iguana: ', error.message);
        setAnomaly(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAnomaly();
  }, [session, supabase, activePlanet]);

  const [hasMission3000004, setHasMission3000004] = useState<boolean>(false);
  useEffect(() => {
    const checkTutorialMission = async () => {
      if (!session) {
        return;
      }

      try {
        const { data: missionData, error: missionError } = await supabase
          .from('missions')
          .select('id')
          .eq('user', session.user.id)
          .eq('mission', 3000004);

        if (missionError) {
          throw missionError;
        }

        setHasMission3000004(missionData.length > 0);
      } catch (error: any) {
        console.error('Error checking iguana mission: ', error.message);
        setHasMission3000004(false);
      }
    };

    checkTutorialMission();
  }, [session, supabase]);

  if (!hasMission3000004) {
    return (
      <IguanasFromAboveTutorial anomalyId={anomaly?.id?.toString() || '5757557437553254'} />
    );
  }

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!anomaly) {
    return (
      <div>
        <p>Looks like we've run out of Iguanas at the moment, maybe come back later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-lg">
      <div className="p-4 rounded-md relative w-full">
        {imageUrl && (
          <img src={imageUrl} alt={anomaly.content} className="w-full h-64 object-cover" />
        )}
        <ClassificationForm
          anomalyId={anomaly.id.toString()}
          anomalyType="zoodex-iguanasFromAbove"
          missionNumber={100000036}
          assetMentioned={imageUrl || ''}
          originatingStructure={3104}
        />
      </div>
    </div>
  );
};