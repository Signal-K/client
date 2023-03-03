import type { NextPage } from "next";
import { useCallback } from "react";
import CoreLayout from "../../components/Core/Layout";

import { ConnectWallet, useStorageUpload } from "@thirdweb-dev/react";

const IpfsPinning: NextPage = () => {
    const { mutateAsync: upload } = useStorageUpload();
    const onDrop = useCallback(
        async ( acceptedFiles: File[] ) => {
            const uris = await upload ({ data: acceptedFiles });
            console.log(uris);
        },
        [upload],
    );
    
    //const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <CoreLayout>
            <div>
            </div>
        </CoreLayout>
    );
};

export default IpfsPinning;