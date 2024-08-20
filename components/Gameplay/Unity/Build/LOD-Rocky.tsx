import React from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuildLod1 () {
    const { unityProvider } = useUnityContext({
        // loaderUrl: '/Unity/LOD1/Build/Webgl.loader.js',
        // dataUrl: '/Unity/LOD1/Build/Webgl.data.gz',
        // frameworkUrl: '/Unity/LOD1/Build/Webgl.framework.js.gz',
        // codeUrl: '/Unity/LOD1/Build/Webgl.wasm.gz',
        loaderUrl: "/assets/Earth/Rocky_Earth-gen.loader.js",
        dataUrl: "/assets/Earth/Rocky_Earth-gen.data",
        frameworkUrl: "/assets/Earth/Rocky_Earth-gen.framework.js",
        codeUrl: "/assets/Earth/Rocky_Earth-gen.wasm",
    });

    return <Unity unityProvider={unityProvider} style={{ width: "100%", height: "500px" }} />
    // return (
    //     <iframe src='Unity/index.html' height='1000px' width='1000px' />
    // )
}