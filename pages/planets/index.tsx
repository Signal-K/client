import React, { useEffect, useState } from "react";

import { GameplayLayout } from "../../components/Core/Layout";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
// import { UserContext } from "../../context/UserContext";
import { Database } from "../../utils/database.types";

import Login from "../login";
import PlanetGalleryCard from "../../components/Planets/PlanetGalleryCard";
import Link from "next/link";
import PlanetFormCard from "./createPlanet";

type Planets = Database['public']['Tables']['planets']['Row'];

import axios from "axios";

export default function PlanetGalleryIndex () {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [planets, setPlanets] = useState([]);
    const [planetTitle, setPlanetTitle] = useState('');
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        fetchPlanets();
    }, []);

    const fetchPlanets = async() => {
        try {
          const response = await axios("http://127.0.0.1:5000/planets");
          console.log(response.data.planets[0].title);
        } catch (error) {
          console.log(error)
        }
      };

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    
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
            if (data != null) { setPlanets(data); };
            if (error) throw error;
        } catch (error: any) { alert(error.message); };
    };

    if (!session) { return <Login />; };

    return (
        <GameplayLayout>
            <div className="flex px-10">
                <p> {!loading ? message : "Loading.."}</p>
                <div className="w-1/2">{planets.map(planet => (
                    <PlanetGalleryCard key = { planet.id } {...planet}></PlanetGalleryCard>
                    ))}
                </div>
                <div className="mx-10 w-1/2">
                    <br /><div className="mx-10"><p>Create a planet</p></div><br />
                    <PlanetFormCard onCreate={getPlanets} />
                </div> {/* Maybe show user's planets or metadata here... */}
            </div>
        </GameplayLayout>
    )
}