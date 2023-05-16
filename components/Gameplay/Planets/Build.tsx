import React from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityBuild () {
    const { unityProvider } = useUnityContext({
        loaderUrl: 'Unity/Build/Webgl.loader.js',
        dataUrl: 'Unity/Build/Webgl.data.gz',
        frameworkUrl: 'Unity/Build/Webgl.framework.js.gz',
        codeUrl: 'Unity/Build/Webgl.wasm.gz',
    });

    return <Unity unityProvider={unityProvider} />
    // return (
    //     <iframe src='Unity/index.html' height='1000px' width='1000px' />
    // )
}