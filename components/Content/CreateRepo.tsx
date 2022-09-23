import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function CreateNode() {
    const supabase  = useSupabaseClient();
    const session = useSession();

    const [repoName, setNodeName] = useState('');

    const createNodeDb = async () => {
        try {
            if (repoName == '') {
                return;
            };

            const { error, data } = await supabase
                .from("posts_old")
                .insert({
                    content: repoName,
                    author: session?.user?.id,
                });

            if (error) {
                console.error("Error inserting data into Supabase, ", error.message);
                return;
            };

            console.log("Data inserted successfully: ", data);
            setNodeName('');
        } catch (error) {
            console.error("Error creating node: ", error);
        };
    };

    return (
        <div>
            <input
                type="text"
                className="border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline-none focus:border-blue-500"
                placeholder="Enter repository name"
                value={repoName}
                onChange={(e) => setNodeName(e.target.value)}
            />
            <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={createNodeDb}
            >
                Create Node
            </button>
        </div>
    );
};