import React from "react";
import axios from "axios";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Login from "../../../../pages/login";
import UnityBuildSupabaseMesh from "../../Unity/Build/LOD-Mesh";

export default function SendPlanetsssDataToFlask () {
    const supabase = useSupabaseClient(); // Draw planet data (tests/planet.tsx) via Supabase, pass in as props/arguments
    const session = useSession();

    const dataToSend = { // Define the data to send
        planetName: "Earth",
        userName: "John Doe",
        planetData: "Some data about Earth"
    };

    const ticId = {
        ticId: "KIC 10593626", // Update this to draw from Supabase like in the LodRocky component/mesh
    }
  
    // Send a POST request to the Flask app
    fetch('http://localhost:5000/flux_variability', { // fetch('/receive_data', { // http://localhost:5000
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Should print "Data received successfully"
    })
    .catch(error => {
        console.error(error);
    });
  
    if (!session) {
        return (
            <Login />
        );
    };
};