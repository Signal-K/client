import React from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';

export default function UnityTest1 () {
    const { unityProvider } = useUnityContext({
        loaderUrl: "Rocky_Water-base.data.loader.js",
        dataUrl: "Rocky_Water-base.data.data",
        frameworkUrl: "Rocky_Water-base.data.framework.js",
        codeUrl: "Rocky_Water-base.data.wasm",
    });

    return (
        <Unity unityProvider={unityProvider} />
    );
}