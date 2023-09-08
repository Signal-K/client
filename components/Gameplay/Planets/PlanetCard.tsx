import React, { useEffect, useState } from "react";
import Card from "../../Card";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
// import PlanetEditor, { PlanetEditorFromData } from "../../../pages/generator/planet-editor";
import { planetsImagesCdnAddress } from "../../../constants/cdn";
import { v4 as uuidv4 } from 'uuid';
import { Col, Container, Row } from "react-bootstrap";

interface Planet {
    id: string;
    ownerId: string;
    temperature: number;
    created_at: string;
    contract: string;
    tokenId: string;
    chainId: string;
    owner: string;
    ticId: string | null;
}

export function PlanetCard({ activeTab, planetId }: { activeTab: string; planetId: string }) {
    const supabase = useSupabaseClient();
    const [planet, setPlanet] = useState<Planet | null>(null);
    const session = useSession();
    const [planetUri, setPlanetUri] = useState<string | undefined>();
    const [planetOwner, setPlanetOwner] = useState<string | null>(null);
    const [username, setUsername] = useState<string>('');
    const [images, setImages] = useState<any[]>([]);
    const [playerReputation, setPlayerReputation] = useState<number | undefined>(0);

    useEffect(() => {
        async function fetchPlanet() {
            try {
                const { data, error } = await supabase
                    .from('planetsss')
                    .select("*")
                    .eq('id', planetId);

                if (error) {
                    throw error;
                }

                if (data) {
                    setPlanet(data[0]);
                    setPlanetOwner(data[0]?.ownerId);
                }
            } catch (error) {
                console.error('Error fetching planet:', error);
            }
        }

        fetchPlanet();
    }, [planetId, supabase]);

    async function updatePlayerReputation() {
        try {
            const newReputation = (playerReputation || 0) + 1;
            setPlayerReputation(newReputation);

            const { error } = await supabase
                .from('profiles')
                .update([{ reputation: newReputation }])
                .eq('id', session?.user?.id);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error updating player reputation:', error);
        }
    }

    async function claimPlanet() {
        try {
            const { error } = await supabase
                .from('planetsss')
                .update([{ owner: session?.user?.id }])
                .eq('id', planetId);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error('Error claiming planet:', error);
        }
    }

    async function getPlanetImages() {
        try {
            const { data, error } = await supabase
                .storage
                .from('planets')
                .list(planet?.id + '/', {
                    limit: 100,
                    offset: 0,
                    sortBy: {
                        column: 'name',
                        order: 'asc',
                    }
                });

            if (data !== null) {
                setImages(data);
            } else {
                alert('Error loading images');
                console.error(error);
            }
        } catch (error) {
            console.error('Error getting planet images:', error);
        }
    }

    async function uploadImageForPlanet(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            const file = e.target.files?.[0];
            if (file) {
                const { data, error } = await supabase
                    .storage
                    .from('planets')
                    .upload(session?.user?.id + '/' + uuidv4(), file);

                if (data) {
                    getPlanetImages();
                } else {
                    console.error(error);
                }
            }
        } catch (error) {
            console.error('Error uploading image for planet:', error);
        }
    }

    useEffect(() => {
        if (planet) {
            // fetchPlanet();
            getPlanetImages();
        }
    }, [planet?.id, supabase]);

    return (
        <div>
            {activeTab === 'planet' && (
                <div>{/*<Card noPadding={false}>
                    <iframe src="https://deepnote.com/@star-sailors/Star-Sailors-Light-Curve-Plot-b4c251b4-c11a-481e-8206-c29934eb75da" />
                    {/*<Link legacyBehavior href ='https://deepnote.com/workspace/star-sailors-49d2efda-376f-4329-9618-7f871ba16007/project/Star-Sailors-Light-Curve-Plot-b4c251b4-c11a-481e-8206-c29934eb75da/notebook/notebook-377269a4c09f46908203c402cb8545b0'><div><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/377269a4c09f46908203c402cb8545b0/2b82b4f1d68a4ca282977277e09df860?height=43" height="650" width="100%"/></div></Link> {/* https://codesandbox.io/s/nextjs-example-react-jupyter-notebook-viewer-lzjcb5?file=/pages/index.js:21-33 <br />
                    <br />
                    <img src={planetsImagesCdnAddress + planet?.id + '/' + 'download.png'} />
                    {/*<Row className="g-4">
                        {images.map((image) => {
                            return (
                                <Col key={planetsImagesCdnAddress + planet?.id + '/' + image.name}>
                                    <img src={planetsImagesCdnAddress + planet?.id + '/' + image.name} />
                                    <img src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/24/download.png" />
                                </Col>
                            );
                        })}
                    </Row>
                    </Card>*/}</div>
            )}
            {activeTab === 'data' && (
                <div><Card noPadding={false}>
                    <Link legacyBehavior href ='https://deepnote.com/workspace/star-sailors-49d2efda-376f-4329-9618-7f871ba16007/project/Star-Sailors-Light-Curve-Plot-b4c251b4-c11a-481e-8206-c29934eb75da/notebook/notebook-377269a4c09f46908203c402cb8545b0'><div><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/b56a0704304940e49c38823795edaa20/b1b6860bdf364fcea023992c1ae527d6?height=294.6875" height="294.6875" width="500"/><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/377269a4c09f46908203c402cb8545b0/2b82b4f1d68a4ca282977277e09df860?height=43" height="650" width="100%"/></div></Link> {/* https://codesandbox.io/s/nextjs-example-react-jupyter-notebook-viewer-lzjcb5?file=/pages/index.js:21-33 */}
                    <p>{planet?.owner} Owner</p>
                                {planet?.owner == session?.user?.id /*&& planet?.userId == username*/ && (
                            <>
                                {/* <button onClick={() => lazyMint({ metadatas: [{ name: planet?.content, media: planet?.cover, description: planet?.ticId, properties: { trait_type1: 'value' }}]})}>Mint NFT of planet</button> */}
                                <Link legacyBehavior href ='https://deepnote.com/workspace/star-sailors-49d2efda-376f-4329-9618-7f871ba16007/project/Star-Sailors-Light-Curve-Plot-b4c251b4-c11a-481e-8206-c29934eb75da/notebook/notebook-377269a4c09f46908203c402cb8545b0'><div><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/b56a0704304940e49c38823795edaa20/b1b6860bdf364fcea023992c1ae527d6?height=294.6875" height="294.6875" width="500"/><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/377269a4c09f46908203c402cb8545b0/2b82b4f1d68a4ca282977277e09df860?height=43" height="650" width="100%"/></div></Link> {/* https://codesandbox.io/s/nextjs-example-react-jupyter-notebook-viewer-lzjcb5?file=/pages/index.js:21-33 */} {/* Set this to pull in different blocks, with different inputs (from Deepnote/flask API) depending on `{planet?.ticId}`  */}
                            </>
                        )}
                    {planet?.owner == session?.user?.id /*&& planet?.userId == username*/ && (
                            <>
                            Move this underneath Datasets tab in PlanetCard.tsx
                                {/* <button onClick={() => lazyMint({ metadatas: [{ name: planet?.content, media: planet?.cover, description: planet?.ticId, properties: { trait_type1: 'value' }}]})}>Mint NFT of planet</button> */}
                                {!planet?.ticId && (
                                    <p>This planet doesn't have a TIC ID</p>
                                    // Update planet tic textarea & button
                                )}
                            </>
                        )}<p>Planet ID: {planet?.id}</p>
                        <p>Temperatue: {planet?.temperature} Kelvin</p>
                        <p>Created at: {planet?.created_at}</p>
                        <p>Contract: {planet?.contract}</p>
                        <br /><br /><br />
                        <button onClick={claimPlanet}>Claim Planet</button>
                        <br /><br />
                        <p>Contract info: {planet?.contract} ↝ {planet?.tokenId} on {planet?.chainId} </p>
                        <br /><br />
                        {/* <p>Owner of this anomaly: {planet?.owner?.username}</p> */}
                        <br /><br /><br />
                </Card></div>
            )}
            {activeTab === 'refs' && (
                <div><Card noPadding={false}>
                    <div className="mockup-code">
  <pre data-prefix="$"><code>npm i daisyui</code></pre>
</div>
                </Card>{/*<Card noPadding={false}><UtterancesComments /></Card>*/}</div>
            )}
            {activeTab === 'sandbox' && (
                <div><Card noPadding={false}>
                    {/* <PlanetEditor />
                    <PlanetEditorFromData
                        // temperature = planet?.temperature
                    /> */}
                    {/*<StakePlay />*/}
                </Card></div>
            )}
        </div>
    );
};