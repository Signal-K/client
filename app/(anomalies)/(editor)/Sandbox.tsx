"use client"

import { Sandpack, SandpackCodeEditor, SandpackFileExplorer, SandpackLayout, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";
import ecoLight from "@codesandbox/sandpack-react/";
import SandpackComponent from "./Pyodide";

export default function SandpackBox() {
    const files = {};

    return (
        <div>
            <SandpackProvider
            files={files} 
            template="nextjs"
            >
                <SandpackLayout>
                    <SandpackFileExplorer />
                    <SandpackCodeEditor closableTabs showTabs />
                    <SandpackPreview />
                </SandpackLayout>
            </SandpackProvider>
            {/* <SandpackComponent /> */}
        </div>
    );
};
