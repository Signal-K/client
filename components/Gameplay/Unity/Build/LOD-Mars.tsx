import React from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildLod1 () {
    const { unityProvider } = useUnityContext({
        loaderUrl: "/assets/Mars/Rocky_Mars-base.loader.js",
        dataUrl: "/assets/Mars/Rocky_Mars-base.data",
        frameworkUrl: "/assets/Mars/Rocky_Mars-base.framework.js",
        codeUrl: "/assets/Mars/Rocky_Mars-base.wasm",
    });

    return (
        <Unity unityProvider={unityProvider} />
    );
}