import type { NextPage } from "next";
import { useCallback, useState } from "react";
import Link from "next/link";
import CoreLayout from "../../components/Core/Layout";
import { useDropzone } from "react-dropzone";

import { MediaRenderer, useStorageUpload } from "@thirdweb-dev/react";

const IpfsPinning: NextPage = () => {
    const { mutateAsync: upload } = useStorageUpload();
    const [uris, setUris] = useState<string[]>([]);
    const onDrop = useCallback(
        async ( acceptedFiles: File[] ) => {
            const _uris = await upload ({ data: acceptedFiles });
            setUris(_uris);
        },
        [upload],
    );
    
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <CoreLayout>
            <center>
                <div {...getRootProps()}>
                    <input {...getInputProps()} /> {/* If {profiles.address} is confirmed to be the one in Gnosis safe, allow for lazy minting setup/IPFS upload */}
                    <button>Drop files/articles here to upload them to Nodes</button> {/* Like the gallery -> bring that page in */} {/* Copying/migrating data from tables */}
                </div> {/* IPFS collections, Lens posts */}
                {uris.map((uri) => {
                    return (
                        <MediaRenderer
                            key={uri}
                            src={uri}
                            alt='IPFS URI'
                        />
                    )
                })}
                <p>{uris}</p> {/* Save this to a post, Lens */}
                <Link href='/journal/gallery'>Gallery</Link> {/* Match up the planetId with its tokenId to show its metadata */}
            </center>
        </CoreLayout>
    );
};

export default IpfsPinning;