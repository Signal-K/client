import { useSession } from "@supabase/auth-helpers-react";
import React, { Fragment, useState } from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildLod1Mars () {
    const { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "/assets/Mars/Rocky_Mars-base.loader.js",
        dataUrl: "/assets/Mars/Rocky_Mars-base.data",
        frameworkUrl: "/assets/Mars/Rocky_Mars-base.framework.js",
        codeUrl: "/assets/Mars/Rocky_Mars-base.wasm",
    });

    // const [planetName, setPlanetName] = useState("");
    const planetName = 'Pluto';
    const session = useSession();

    // const handlePlanetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     setPlanetName(event.target.value);
    // };

    const handleSendPlanetName = () => {
        sendMessage("5", "UpdatePlanetName", session?.user?.id);
    };

    const handleSendPlanetRotateSpeed = () => {
        // if (session) {
        //     sendMessage("Text", "UpdatePlanetTurnSpeed", 50);
        // };
        sendMessage("Planet", "UpdatePlanetTurnSpeed", 25);
        console.log('Update');
    };

    return (
        <Fragment>
            <Unity unityProvider={unityProvider} style={{ width: "100%", height: "500px" }}/>
            {/* <input
                type="text"
                placeholder="Enter planet name"
                value='Pluto'
                // onChange={handlePlanetNameChange}
            /> */}
            <button onClick={handleSendPlanetName}>Send Planet Name</button>
            <button onClick={handleSendPlanetRotateSpeed}>Update rotate speed</button>
        </Fragment>
    );
}