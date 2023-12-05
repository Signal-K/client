import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Card from "../../../Card";

export default function BasePlanetSectors({ planetId }: { planetId: string }) {
    const router = useRouter();
    const { id: planetid } = router?.query;

    const supabase = useSupabaseClient();
    const session = useSession();

    const [sectorsData, setSectorsData] = useState(null);

    const getPlanetSectors = async () => {
        if (!planetId) {
            return null;
        }

        if (!session) {
            return null;
        }

        if (!supabase) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('basePlanetSectors')
                .select('*')
                .eq('anomaly', planetId);

            if (data) {
                setSectorsData(data);
            }

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (planetId) {
                await getPlanetSectors();
            }
        };

        fetchData();
    }, [planetId]);

    if (!planetId || sectorsData === null) {
        return <div>Loading...</div>;
    }

    if (!session) {
    return (
        <>
            <Card noPadding={false}>
            <div
          className="flex-col justify-center mt-[-80px] bg-cover bg-center rounded-15"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1578309756042-b445687e326c?q=80&w=2980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          }}
        ></div>
            </Card>
            <div className="">
                    {Object.keys(sectorsData).map((key) => (
                        <div key={key}>
                            <strong>{key}:</strong> {JSON.stringify(sectorsData[key])}
                        </div>
                    ))}
                </div>
        </>
    );
                    }

                    return (
                        <>
                          <Card noPadding={false}>
                            <div
                              className="flex-col justify-center mt-[-80px] bg-cover bg-center rounded-15"
                              style={{
                                backgroundImage:
                                'url("https://images.unsplash.com/photo-1578309756042-b445687e326c?q=80&w=2980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                              }}
                            >
                              <div className="h-[80vh] flex flex-col items-center justify-center relative">
                                <h1 className="text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-[-50px] mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">
                                  Test
                                </h1>
                                <div className="w-full flex items-center justify-center">
                                </div>
                                <div className="flex items-start gap-8 mt-20">
                                  <div className="flex flex-col items-center justify-start gap-4">
                                    <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] tracking-[3.48px]">
                                      Planet {planetId} sector list
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* {deposit && typeof deposit === "string" ? (
                                    <div>{deposit}</div>
                                ) : (
                                    <div>{JSON.stringify(deposit)}</div>
                                )} */}
                            </div>
                          </Card>
                          <div>
                            <Card noPadding={false}>
                            {Object.keys(sectorsData).map((key) => (
                        <div key={key}>
                            <strong>{key}:</strong> {JSON.stringify(sectorsData[key])}
                        </div>
                    ))}
                            </Card>
                          </div>
                        </>
                      );
};