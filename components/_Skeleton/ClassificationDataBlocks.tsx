import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

const LightcurveMaker = () => {
    const supabase = useSupabaseClient();

    const planetId = "2";
    const [ticId, setTicId] = useState('');
    const [imageUrl, setImageUrl] = useState('');   

    useEffect(() => {
        // Fetch the planet data from the basePlanets table
        const fetchPlanetData = async () => {
          try {
            const { data, error } = await supabase
              .from('basePlanets')
              .select('ticId')
              .eq('id', parseInt(planetId))
              .single();
    
            if (error) {
              throw error;
            }
    
            if (data) {
              // Set the fetched ticId as the default value in the form
              setTicId(data.ticId);
            }
          } catch (error) {
            console.error('Error fetching planet data:', error.message);
          }
        };
    
        fetchPlanetData();
    }, [planetId, supabase]);
};