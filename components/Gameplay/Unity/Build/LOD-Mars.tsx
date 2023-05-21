import React from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildLod1 () {
    const { unityProvider } = useUnityContext({
        loaderUrl: "/assets/Mars/LOD1.loader.js",
        dataUrl: "/assets/Mars/LOD1.data",
        frameworkUrl: "/assets/Mars/LOD1.framework.js",
        codeUrl: "/assets/Mars/LOD.wasm",
    });

    return (
        <Unity unityProvider={unityProvider} />
    );
}