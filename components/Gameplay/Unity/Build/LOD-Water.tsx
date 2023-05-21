import React from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildLod1 () {
    const { unityProvider } = useUnityContext({
        loaderUrl: "/assets/Water/LOD1.loader.js",
        dataUrl: "/assets/Water/LOD1.data",
        frameworkUrl: "/assets/Water/LOD1.framework.js",
        codeUrl: "/assets/Water/LOD.wasm",
    });

    return (
        <Unity unityProvider={unityProvider} />
    );
}