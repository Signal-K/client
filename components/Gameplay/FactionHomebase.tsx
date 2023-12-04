import React, { useEffect, useState } from "react";
import Card from "../Card";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function HomebaseSelector({ factionId }) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [planetData, setPlanetData] = useState(null);

    // Function to pull in planet data. Match the planet to the factionId
    const getPlanetData = async () => {
        if (!session) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from("basePlanets")
                .select("*")
                .eq('Faction', factionId)
                .single();

            if (data) {
                setPlanetData(data);
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
            if (session && factionId) {
                await getPlanetData();
            }
        };

        fetchData();
    }, [session, factionId]);

    const { content, coverUrl } = planetData || {};

    return (
        <>
            <Card noPadding={false}>
                <div
                    className="flex-col justify-center mt-[-80px] bg-cover bg-center rounded-15"
                    style={{
                        // backgroundImage: `url(${coverUrl})`,
                        backgroundImage: `url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2372&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`
                    }}
                >
                    <div className="h-[80vh] flex flex-col items-center justify-center relative">
                        <h1 className="text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-[-50px] mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">
                            {content}
                        </h1>
                    </div>
                </div>
            </Card>
            <div className="h-grow px-10">
                
            </div>
        </>
    );
};