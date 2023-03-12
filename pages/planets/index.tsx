import React, { useEffect, useState } from "react";

import { GameplayLayout } from "../../components/Core/Layout";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
// import { UserContext } from "../../context/UserContext";
// import { Database } from "../../utils/database.types";

import Login from "../login";
import PlanetGalleryCard from "../../components/Gameplay/Planets/PlanetGalleryCard";
import Link from "next/link";
import PlanetFormCard from "./createPlanet";
import { UserContext } from "../../context/UserContext";

// type Planets = Database['public']['Tables']['planets']['Row'];

export default function PlanetGalleryIndex () {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [planets, setPlanets] = useState([]);
    const [planetTitle, setPlanetTitle] = useState('');
    const [currentTime, setCurrentTime] = useState(0);
    const [profile, setProfile] = useState(null);
    
    /* useEffect(() => {
        getPlanets();
        fetch('/time').then(res => res.json()).then(data => {
            console.log(data.time);
        });
        /*fetch('/', {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => console.log(res.json())).then(data => {
            //setPlanetTitle(data.title);
        });
        fetch('/planets').then(response => response.json().then(data => {console.log(data)}))*/
    //}, [session]);

    /*useEffect(() => {
        fetch("/planets")
        .then(response => response.json()
        .then(data => {
          console.log(response);
          console.log(data[0]);
          setPlanets(data[0].title);
        })
    )}, []);*/

    const getPlanets = async () => {
        try {
            const { data, error } = await supabase
                .from('planetsss')
                .select("*")
                .limit(10)
            if (data != null) { 
                setPlanets(data); 
                /*if (!planets) { // Just testing for now -> pointing out where requests for the new data (new planet data) will go
                    axios.post('http://127.0.0.1:5000/tic_classify/select_planet', {
                        planetId: '{data.ticId}', // See kurve_parse.py blueprint
                    })
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                    }*/
                };
            if (error) throw error;
        } catch (error: any) { alert(error.message); };
    };

    useEffect(() => {
        if (!session?.user?.id) {
            return;
        }
    
        supabase.from('profiles')
            .select()
            .eq('id', session?.user?.id)
            .then(result => {
                if (result.data.length) {
                    setProfile(result.data[0]);
                }
            }
        )
    }, [session?.user?.id]); // Run it again if auth/session state changes

    if (!session) { return <Login />; };

    return (
        <GameplayLayout>
            <UserContext.Provider value={{ profile }}>
                <div className="flex px-10">
                    <div className="w-1/2">{planets.map(planet => (
                        <PlanetGalleryCard key = { planet.id } {...planet}></PlanetGalleryCard>
                        ))}
                    </div>
                    <div className="mx-10 w-1/2">
                        <br /><div className="mx-10"><p>Create a planet</p></div><br />
                        <PlanetFormCard onCreate={getPlanets} />
                    </div> {/* Maybe show user's planets or metadata here... */}
                </div>
            </UserContext.Provider>
        </GameplayLayout>
    )
}