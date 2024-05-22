import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export function CreateAutomaton() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    // Create a function that will create a new automaton (from the `inventory` api route, create from id "23"). only if they don't currently have a rover/automaton. So search through `inventory` for any rows with `owner` == `session?.user?.id`, and `item` == 23. If there is no record, show a button allowing them to create an automaton. Additionally, we have to search through the inventory to make sure they have a rover construction structure (id 22). So only allow them to create an automaton/rover if they don't have id == 23, and they do have id == 22.
    const handleCreateAutomaton = async () => {
        // Check if the user has an automaton already
        const { data: automatonData, error: automatonError } = await supabase.from('inventory').select('id').eq('owner', session?.user?.id).eq('item', 23);
        if (automatonError) {
            console.error('Error checking for existing automaton', automatonError);
            return;
        }

        if (automatonData && automatonData.length > 0) {
            console.log('User already has an automaton');
            return;
        }

        // Check if the user has a rover construction structure
        const { data: structureData, error: structureError } = await supabase.from('inventory').select('id').eq('owner', session?.user?.id).eq('item', 22);
        if (structureError) {
            console.error('Error checking for existing structure', structureError);
            return;
        }

        if (!structureData || structureData.length === 0) {
            console.log('User does not have a rover construction structure');
            return;
        }

        // Create the automaton
        const { data: createdAutomatonData, error: createdAutomatonError } = await supabase.from('inventory').insert([
            {
                owner: session?.user?.id,
                item: 23,
                quantity: 1,
                anomaly: activePlanet?.id,
                notes: "First Rover Created By User",
            }
        ]);
        if (createdAutomatonError) {
            console.error('Error creating automaton', createdAutomatonError);
            return;
        }

        console.log('Automaton created', createdAutomatonData);
    };
    
    return (
        <>
            Create a new automaton
            <button onClick={handleCreateAutomaton}>Create Automaton</button>
        </>
    );
};