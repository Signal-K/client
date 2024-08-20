import React from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildLod1 () {
    const { unityProvider } = useUnityContext({
        // loaderUrl: '/Unity/LOD1/Build/Webgl.loader.js',
        // dataUrl: '/Unity/LOD1/Build/Webgl.data.gz',
        // frameworkUrl: '/Unity/LOD1/Build/Webgl.framework.js.gz',
        // codeUrl: '/Unity/LOD1/Build/Webgl.wasm.gz',
        loaderUrl: "/assets/LOD2.loader.js",
        dataUrl: "/assets/LOD2.data",
        frameworkUrl: "/assets/LOD2.framework.js",
        codeUrl: "/assets/LOD2.wasm",
    });

    return <Unity unityProvider={unityProvider} />
    // return (
    //     <iframe src='Unity/index.html' height='1000px' width='1000px' />
    // )
}