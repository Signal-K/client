"use client";

import { ImageAnnotator } from "@/components/Projects/(classifications)/Annotating/Annotator";
import React, { useState } from "react";

export default function TestPage() {
    return (
        // <StarnetLayout>
          <>
              {/* <Greenhouse /> */}
              {/* <MiningComponent /> */}
              <main className="container mx-auto py-8">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold">Image Annotator</h1>
        <p className="text-muted-foreground text-center max-w-2xl">
          Upload an image and use the pen tool to draw annotations. When you&apos;re done, download the annotated image.
        </p>
        <ImageAnnotator />
      </div>
    </main>
          </>
        // {/* </StarnetLayout> */}
    );
};

/*
<ImageAnnotation src={imageUrls[currentImageIndex]} onUpload={uploadAnnotatedImage} />
  anomalies = {[
    {
      id: "1",
      name: "Hardened owl",
      description:
        "A hardened owl that is ready to be transported to another lush location.",
    },
  ]}  />

*/