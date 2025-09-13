"use client";

import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import Section from "../../sections/Section";
import { Button } from "../../ui/button";

type CapacityKey =
  | "probeCount"
  | "probeDistance"
  | "stationCount"
  | "balloonCount"
  | "Seiscam"
  | "Wheels"
  | "cameraCount"
  | "stationSize";

type UserCapacities = Record<CapacityKey, number>;

export default function ResearchSkillViewport() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [userCapacities, setUserCapacities] = useState<UserCapacities | null>(
    null
  );

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchCapacities = async () => {
      const { data, error } = await supabase
        .from("user_capacities")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user capacities:", error);
      } else {
        setUserCapacities(data);
      }
    };

    fetchCapacities();
  }, [session, supabase]);

  return (
    <Section
      sectionId="research-viewport-preview"
      variant="viewport"
      backgroundType="interstellar"
      infoText={""}
      expandLink={"/research"}
    >
      <div className="relative w-full h-full flex items-center justify-center py-8 md:py-12">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>

        {/* Content */}
        <div className="relative z-10 text-center text-white p-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Advance Your Research
          </h2>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
            Unlock new technologies and expand your cosmic reach. Upgrading your
            equipment allows you to explore further, gather more data, and make
            groundbreaking discoveries.
          </p>

          {userCapacities && (
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {userCapacities.probeCount}
                </p>
                <p className="text-sm">Probes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {userCapacities.stationCount}
                </p>
                <p className="text-sm">Stations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {userCapacities.balloonCount}
                </p>
                <p className="text-sm">Balloons</p>
              </div>
            </div>
          )}

          <Link href="/research" passHref>
            <Button size="lg" className="text-lg">
              Go to Research
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
};