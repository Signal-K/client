import React, { useEffect, useState } from "react";
import Card from "../../Card";
import Link from "next/link";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import PlanetEditor, { PlanetEditorFromData } from "../../../pages/generator/planet-editor";
import StakePlay from "../../../pages/stake/play";
import UtterancesComments from "../../Lens/Utterances";
import { useContract, useContractRead, useContractWrite, useLazyMint } from "@thirdweb-dev/react";

export function PlanetCard ({ activeTab, planetId }) {
    const supabase = useSupabaseClient();
    const [planet, setPlanet] = useState(null);
    const session = useSession();
    const [planetUri, setPlanetUri] = useState();
    const [planetOwner, setPlanetOwner] = useState(null);
    function fetchPlanet () {
        supabase.from('planetsss')
            .select("*")
            .eq('id', planetId) // How should the ID be generated -> similar to how `userId` is generated? Combination of user + org + article + dataset number??
            .then(result => {
                if (result.error) { throw result.error; };
                if (result.data) { setPlanet(result.data[0]); /*console.log(planet);*/ setPlanetOwner(planet?.ownerId); };
            }
        );
    }
    const { contract } = useContract(planet?.contract);
    /*const { mutateAsync: lazyMint, isLoading } = useContractWrite(contract, "lazymint");
    const lazyMintAnomaly = async () => {
        try {
            const data = await lazyMint([ _amount, _baseURIForTokens, _data ]);
            console.info('contract call success: ', data);
        } catch (err) {
            console.error('contract call failure: ', err);
        }
    }*/

    const {
        mutate: lazyMint,
        isLoading,
        error,
    } = useLazyMint(contract);

    function showNftMetadataUri (planet) {
        const { contract } = useContract(`{planet?.contract}`);
        const { data, isLoading } = useContractRead( contract, "uri", `{planet?.tokenId}`)
        if ( data ) {
            setPlanetUri( data );
        }
    }

    return (
        <div>
            {activeTab === 'planet' && (
                <div><Card noPadding={false}>
                    Planet Name
                </Card></div>
            )}
            {activeTab === 'data' && (
                <div><Card noPadding={false}>
                    <Link href='https://deepnote.com/workspace/star-sailors-49d2efda-376f-4329-9618-7f871ba16007/project/Star-Sailors-Light-Curve-Plot-b4c251b4-c11a-481e-8206-c29934eb75da/notebook/notebook-377269a4c09f46908203c402cb8545b0'><div><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/b56a0704304940e49c38823795edaa20/b1b6860bdf364fcea023992c1ae527d6?height=294.6875" height="294.6875" width="500"/><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/377269a4c09f46908203c402cb8545b0/2b82b4f1d68a4ca282977277e09df860?height=43" height="650" width="100%"/></div></Link> {/* https://codesandbox.io/s/nextjs-example-react-jupyter-notebook-viewer-lzjcb5?file=/pages/index.js:21-33 */}
                    <p>{planet?.owner} Owner</p>
                                {planet?.owner == session?.user?.id /*&& planet?.userId == username*/ && (
                            <>
                                <button onClick={() => lazyMint({ metadatas: [{ name: planet?.content, media: planet?.cover, description: planet?.ticId, properties: { trait_type1: 'value' }}]})}>Mint NFT of planet</button>
                                <Link href='https://deepnote.com/workspace/star-sailors-49d2efda-376f-4329-9618-7f871ba16007/project/Star-Sailors-Light-Curve-Plot-b4c251b4-c11a-481e-8206-c29934eb75da/notebook/notebook-377269a4c09f46908203c402cb8545b0'><div><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/b56a0704304940e49c38823795edaa20/b1b6860bdf364fcea023992c1ae527d6?height=294.6875" height="294.6875" width="500"/><iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/377269a4c09f46908203c402cb8545b0/2b82b4f1d68a4ca282977277e09df860?height=43" height="650" width="100%"/></div></Link> {/* https://codesandbox.io/s/nextjs-example-react-jupyter-notebook-viewer-lzjcb5?file=/pages/index.js:21-33 */}
                            </>
                        )}
                </Card></div>
            )}
            {activeTab === 'refs' && (
                <div><Card noPadding={false}>
                    <div className="mockup-code">
  <pre data-prefix="$"><code>npm i daisyui</code></pre>
</div>
                </Card><Card noPadding={false}><UtterancesComments /></Card></div>
            )}
            {activeTab === 'sandbox' && (
                <div><Card noPadding={false}>
                    <PlanetEditor />
                    <PlanetEditorFromData
                        // temperature = planet?.temperature
                    />
                    {/*<StakePlay />*/}
                </Card></div>
            )}
        </div>
    );
};