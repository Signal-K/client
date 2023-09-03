import { useSession } from "@supabase/auth-helpers-react";
import React, { Fragment, useState } from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildSupabaseMesh () {
    const { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "/assets/Mars/Mesh/Rocky_Earth-base.Mesh.loader.js",
        dataUrl: "/assets/Mars/Mesh/Rocky_Earth-base.Mesh.data",
        frameworkUrl: "/assets/Mars/Mesh/Rocky_Earth-base.Mesh.framework.js",
        codeUrl: "/assets/Mars/Mesh/Rocky_Earth-base.Mesh.wasm",
    });

    // const [planetName, setPlanetName] = useState("");
    const planetName = 'Pluto';
    const session = useSession();
 
    // const handlePlanetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setPlanetName(event.target.value);
    // };

    const handleSendPlanetName = () => {
        sendMessage("Text", "UpdatePlanetName", session?.user?.id);
    };

    return (
        <Fragment>
            <Unity unityProvider={unityProvider} style={{ width: "100%", height: "500px" }}/>
            <input
                type="text"
                placeholder="Enter planet name"
                value='Pluto'
                // onChange={handlePlanetNameChange}
            />
            <button onClick={handleSendPlanetName}>Send Planet Name</button>
        </Fragment>
    );
}