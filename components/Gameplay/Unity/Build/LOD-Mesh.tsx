import { useSession } from "@supabase/auth-helpers-react";
import React, { Fragment, useState, useEffect } from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildSupabaseMesh ({ planetName }) {
    const { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "/assets/Mars/Mesh/Rocky_Earth-base.Mesh.loader.js",
        dataUrl: "/assets/Mars/Mesh/Rocky_Earth-base.Mesh.data",
        frameworkUrl: "/assets/Mars/Mesh/Rocky_Earth-base.Mesh.framework.js",
        codeUrl: "/assets/Mars/Mesh/Rocky_Earth-base.Mesh.wasm",
    });

    // const [planetName, setPlanetName] = useState("");
    
    const session = useSession();
 
    // const handlePlanetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setPlanetName(event.target.value);
    // };

    const handleSendPlanetName = () => {
        sendMessage("5", "UpdatePlanetName", planetName);//session?.user?.id);
    };

    const handleUpdatePlanetSpeed = () => {
        sendMessage("Planet", "UpdatePlanetTurnSpeed", 75);
    };

    const handleGeneratePlanet = () => {
        sendMessage("Planet", "GeneratePlanet");
    };

    // State to read data FROM unity scene
    const [receivedPlanetName, setReceivedPlanetName] = useState("");
    // useEffect(() => {
    //     // Add an event listener to listen for messages from Unity
    //     const handleUnityMessage = (message) => {
    //         if (message.name === "UnityToReactMessage" && message.data === "PlanetNameUpdated") {
    //             // Received planet name from Unity, update the state
    //             setReceivedPlanetName(message.value);
    //         }
    //     };

    //     // Register the event listener
    //     addEventListener("message", handleUnityMessage);

    //     // Cleanup by removing the event listener when the component unmounts
    //     return () => {
    //         removeEventListener("message", handleUnityMessage);
    //     };
    // }, []);

    return (
        <Fragment>
            <Unity unityProvider={unityProvider} style={{ width: "100%", height: "500px" }}/>
            <input
                type="text"
                placeholder="Enter planet name"
                value={planetName}
                // onChange={handlePlanetNameChange}
            />
            <button onClick={handleSendPlanetName}>Send Planet Name</button>
            <button onClick={handleUpdatePlanetSpeed}>Increase rotation</button>
            <button onClick={handleGeneratePlanet}>Generate planet</button>
        </Fragment>
    );
}