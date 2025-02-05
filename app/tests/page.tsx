"use client";

import { BasicPopupModal } from "@/components/Layout/Modal";
import { useSession } from "@supabase/auth-helpers-react";

export default function TestPage() {
  const session = useSession();

    return (
        // <StarnetLayout>
          <>
            <BasicPopupModal />
            <p>{session?.user.id}</p>
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