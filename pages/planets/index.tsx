import React, { useEffect, useState } from "react";

import { GameplayLayout } from "../../components/Core/Layout";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Col, Container, Row, Form } from "react-bootstrap";
// import { UserContext } from "../../context/UserContext";
// import { Database } from "../../utils/database.types";

import Login from "../login";
import PlanetGalleryCard from "../../components/Gameplay/Planets/PlanetGalleryCard";
import Link from "next/link";
import PlanetFormCard from "./createPlanet";
import { UserContext } from "../../context/UserContext";

import * as path from 'path';
import * as fs from 'fs';

// type Planets = Database['public']['Tables']['planets']['Row'];

export default function PlanetGalleryIndex () {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [planets, setPlanets] = useState([]);
    
    useEffect(() => {
        getPlanets();
    }, [session]);

    const deployImages = () => {
        const outputDirectory = path.join(__dirname, 'output');
        const imageFiles = fs.readdirSync(outputDirectory).filter((file) => {
            const extension = path.extname(file);
            return extension === '.jpg' || extension === '.jpeg' || extension === '.png';
        });

        // Upload each image file to the "planets" bucket
        imageFiles.forEach(async (file) => {
            const filePath = path.join(outputDirectory, file);
            const fileBuffer = fs.readFileSync(filePath);
            const { data, error } = await supabase.storage.from('planets').upload(file, fileBuffer);
            
            if (error) {
                console.error(error);
            } else {
                console.log(`File ${file} uploaded successfully!`);
            }
        });
    }

    const getPlanets = async () => {
        try {
            const { data, error } = await supabase
                .from('planetsss')
                .select("*")
                .order('created_at', { ascending: false })
                .limit(20)
            if (data != null) { setPlanets(data); };
            if (error) throw error;
        } catch (error: any) { alert(error.message); };
    };

    if (!session) { return <Login />; };

    return (
        <GameplayLayout><center>
            <div className="px-10 col-span-2">
                <div className="w-1/3">{planets.map(planet => ( // TODO: Update to be carousel of cards
                    <Col><PlanetGalleryCard key = { planet.id } {...planet}></PlanetGalleryCard></Col>
                ))}</div>
                <div className="mx-10">
                    <button onClick={deployImages}><h1>Deploy images</h1></button>
                    {/*<img src="http://127.0.0.1:5000/get_image" />*/}
                    {/*<PlanetFormCard onCreate={getPlanets} />*/}
                </div> {/* Maybe show user's planets or metadata here... */}
            </div></center>
        </GameplayLayout>
    )
}