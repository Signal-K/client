import React, { Fragment, useState } from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildLod11 () {
    const { unityProvider, sendMessage, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "/assets/Water/Rocky_Water-base.loader.js",
        dataUrl: "/assets/Water/Rocky_Water-base.data",
        frameworkUrl: "/assets/Water/Rocky_Water-base.framework.js",
        codeUrl: "/assets/Water/Rocky_Water-base.wasm",
    });

    const [planetName, setPlanetName] = useState("");

    const handlePlanetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlanetName(event.target.value);
    };

    const handleSendPlanetName = () => {
        sendMessage("PlanetName", "UpdatePlanetName", planetName);
    };
 
    return (
        <Fragment>
            <Unity unityProvider={unityProvider} style={{ width: "100%", height: "500px" }}/>
            <input
                type="text"
                placeholder="Enter planet name"
                value={planetName}
                onChange={handlePlanetNameChange}
            />
            <button onClick={handleSendPlanetName}>Send Planet Name</button>
        </Fragment>
    );
}