import React, { useState } from "react";
import axios from "axios";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const LightcurveGenerator = ({ planetId }: { planetId: string }) => {
    const supabase = useSupabaseClient();

    const [planetData, setPlanetData] = useState(null);
    const [ticId, setTicId] = useState('');
    const [imageURL, setImageUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://127.0.0.1:5000/generate_lightcurve_image', {
                tic_id: ticId,
            }, { responseType: 'arraybuffer' });
            const blob = new Blob([response.data], { type: 'image/png' });
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
        } catch (error) {
            console.error(error.message);
        };
    };
    

    return (
        <div>
          <form onSubmit={handleSubmit}>
            <label>
              Enter TIC ID:
              <input type="text" value={ticId} onChange={(e) => setTicId(e.target.value)} />
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