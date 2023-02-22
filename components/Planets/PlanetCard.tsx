import React, { useEffect, useState } from "react";
import Card from "../Card";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import PlanetEditor, { PlanetEditorFromData } from "../../pages/generator/planet-editor";
import StakePlay from "../../pages/stake/play";

export function PlanetCard ({ activeTab, planetId }) {
    const supabase = useSupabaseClient();

    return (
        <div>
            {activeTab === 'planet' && (
                <div><Card noPadding={false}>
                    Planet Name
                </Card></div>
            )};
            {activeTab === 'data' && (
                <div><Card noPadding={false}>
                    {/*<PlanetEditor />*/}
                    <PlanetEditorFromData
                        // temperature = planet?.temperature
                    /> {/* Put inside pages/planets/planet.tsx underneath the tabs to see in action temporarily */}
                </Card></div>
            )}
            {activeTab === 'refs' && (
                <div><Card noPadding={false}>
                    Planet Name
                </Card></div>
            )};
            {activeTab === 'sandbox' && (
                <div><Card noPadding={false}>
                    Planet
                    {/*<StakePlay />*/}
                </Card></div>
            )}
        </div>
    );
};