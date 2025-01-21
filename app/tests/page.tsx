"use client";

import { BasicPopupModal } from "@/components/Layout/Modal";

export default function TestPage() {
    return (
        // <StarnetLayout>
          <>
            <BasicPopupModal />
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