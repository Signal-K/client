import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

// LightcurveGenerator component
const LightcurveGenerator = ({ planetId }: { planetId: string }) => {
    const supabase = useSupabaseClient();

    const [ticId, setTicId] = useState('');
    const [imageURL, setImageUrl] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('https://papyrus-production.up.railway.app/generate_lightcurve_image', {
                tic_id: ticId,
            }, { responseType: 'arraybuffer' });
            const blob = new Blob([response.data], { type: 'image/png' });
            const url = URL.createObjectURL(blob);
    
            // Convert planetId to string before constructing the file name
            const fileName = `_${Date.now()}`;
    
            // Upload the image to Supabase storage
            const result = await supabase.storage
                .from('planetsss')
                .upload(fileName, blob);
    
            if (result.data) {
                // If upload successful, get the URL of the uploaded image
                const imageURL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/planetsss/' + result.data.path;
    
                // Update the 'lightkurve' column in the 'basePlanets' table with the image URL
                console.log("planetId:", planetId); // Check the value  of planetId
                await supabase
                    .from('basePlanets')
                    .update({ lightkurve: imageURL })
                    .eq('id', parseInt(planetId)); // Ensure planetId is parsed as integer
    
                // Set the image URL to display the generated image
                setImageUrl(url);
            } else {
                console.log("Error uploading image to Supabase.");
            }
        } catch (error) {
            console.error(error.message);
        };
    };
    
    return (
        <div>
          <form onSubmit={handleSubmit}>
            <label>
              Enter TIC ID:
              <input type="text" value={ticId} onChange={(e) => setTicId(e.target.value)} readOnly/>
            </label>
            <button type="submit">Generate Lightcurve Image</button>
          </form>
          {imageURL && (
            <div>
              <h2>Generated Lightcurve Image:</h2>
              <img src={imageURL} alt="Lightcurve" />
            </div>
          )}
        </div>
    );
};

export default LightcurveGenerator;