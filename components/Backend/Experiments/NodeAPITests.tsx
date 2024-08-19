import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CoreLayout from "../../Core/Layout";

const DSLNodeApiTest: React.FC = () => {
    return (
        <CoreLayout>
            <iframe src='https://fjall-nodes.vercel.app' width='100%' height='100%' />
        </CoreLayout>
    )
}

export default DSLNodeApiTest;