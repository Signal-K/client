"use client";

import React, { useEffect, useState } from "react";
import { Sandpack, SandpackCodeEditor, SandpackFileExplorer, SandpackLayout, SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react";
import ecoLight from "@codesandbox/sandpack-react/";
import { python } from "@codemirror/lang-python";
 
export default function PythonSandpackTest() {
    return (
        <><SandpackProvider>
            <SandpackCodeEditor
                additionalLanguages={[
                    {
                        name: "python",
                        extensions: ["py"],
                        language: python(),
                    },
                ]} />
        </SandpackProvider><Sandpack
                options={{
                    codeEditor: {
                        additionalLanguages: [
                            {
                                name: "python",
                                extensions: ["py"],
                                language: python(),
                            },
                        ]
                    },
                }}
                template="react" /></>
    )
}