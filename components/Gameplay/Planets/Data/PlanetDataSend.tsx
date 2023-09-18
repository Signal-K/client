import React, { useState } from "react";
import axios from "axios";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Login from "../../../../pages/login";
import UnityBuildSupabaseMesh from "../../Unity/Build/LOD-Mesh";

export default function SendPlanetsssDataToFlask() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [ticId, setTicId] = useState("KIC 10593626"); // Default TIC ID
    const [response, setResponse] = useState(null); // State to store the response data

    const dataToSend = {
        planetName: "Earth",
        userName: session?.user?.id,
        planetData: "drycugbyuf-5684hb-634htn47uyt-jghuijb",
    };

    const handleSendTicId = () => {
        // Send a POST request to the Flask app with the current TIC ID
        fetch('https://5000-signalk-sytizen-7gvsjazwhrp.ws-us105.gitpod.io/flux_variability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticId }),
        })
            .then(response => response.json())
            .then(data => {
                // Set the response data in the state
                setResponse(data);
            })
            .catch(error => {
                console.error(error);
            });
    };

    if (!session) {
        return <Login />;
    };

    return (
        <div>
            <div>
                <label>TIC ID:</label>
                <input
                    type="text"
                    value={ticId}
                    onChange={(e) => setTicId(e.target.value)}
                />
                <button onClick={handleSendTicId}>Send TIC ID</button>
            </div>

            {response && (
                <div>
                    <h2>Response:</h2>
                    <pre>{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};