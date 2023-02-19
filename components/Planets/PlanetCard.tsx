import React, { useEffect, useState } from "react";
import Card from "../Card";

import { useSupabaseClient } from "@supabase/auth-helpers-react";

export function PlanetCard ({ activeTab }) {
    const supabase = useSupabaseClient();

    return (
        <div>
            {activeTab === 'planet' && (
                <div><Card noPadding={false}>
                    Planet Name
                </Card></div>
            )};
        </div>
    );
};