import React from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildLod11 () {
    const { unityProvider } = useUnityContext({
        loaderUrl: "/assets/Water/Rocky_Water-base.loader.js",
        dataUrl: "/assets/Water/Rocky_Water-base.data",
        frameworkUrl: "/assets/Water/Rocky_Water-base.framework.js",
        codeUrl: "/assets/Water/Rocky_Water-base.wasm",
    });

    return (
        <Unity unityProvider={unityProvider} style={{ width: "100%", height: "500px" }}/>
    );

    return (
        <>Unity dev param</>
    )
}