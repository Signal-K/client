import React, { Fragment, useState } from "react";
import { Unity, useUnityContext } from 'react-unity-webgl';
import PostCard from "../../../Posts/Postcards/Postcard";
import { useSession } from "@supabase/auth-helpers-react";

export default function UnityBuildLod1 () { /*planet, user*/
    const { unityProvider, takeScreenshot } = useUnityContext({
        // loaderUrl: '/Unity/LOD1/Build/Webgl.loader.js',
        // dataUrl: '/Unity/LOD1/Build/Webgl.data.gz',
        // frameworkUrl: '/Unity/LOD1/Build/Webgl.framework.js.gz',
        // codeUrl: '/Unity/LOD1/Build/Webgl.wasm.gz',
        /*loaderUrl: "/assets/Earth/Rocky_Earth-gen.loader.js",
        dataUrl: "/assets/Earth/Rocky_Earth-gen.data",
        frameworkUrl: "/assets/Earth/Rocky_Earth-gen.framework.js",
        codeUrl: "/assets/Earth/Rocky_Earth-gen.wasm",*/
        loaderUrl: "/Unity/ElementsLOD-gen/Build/ElementsLOD-gen.loader.js",
        dataUrl: "/Unity/ElementsLOD-gen/Build/ElementsLOD-gen.data",
        frameworkUrl: "/Unity/ElementsLOD-gen/Build/ElementsLOD-gen.framework.js",
        codeUrl: "/Unity/ElementsLOD-gen/Build/ElementsLOD-gen.wasm",
        webglContextAttributes: {
            preserveDrawingBuffer: true,
        },
    });

    const session = useSession();

    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

    function handleUnityScreenshot() {
        const dataUrl = takeScreenshot("image/jpg", 10);
        // window.open(dataUrl);
        setScreenshotUrl(dataUrl);
        console.log(dataUrl);
    }

    return (
        <Fragment>
            <Unity unityProvider={unityProvider} style={{ width: "100%", height: "500px" }} /><br />
            <button onClick={handleUnityScreenshot}>Create a postcard</button>
            {screenshotUrl && (
                <PostCard 
                    planetImage={screenshotUrl}
                    time = "Today"
                    user = {session?.user?.id}
                    planet = "your planet"
                    comment = "username"
                />
            )}
         </Fragment>
    );
    // return (
    //     <iframe src='Unity/index.html' height='1000px' width='1000px' />
    // )
}