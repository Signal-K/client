/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from 'react';
import CoreLayout from '../../../components/Core/Layout';

export interface Location {
  place_id: number;
  licence: string;
  powered_by: PoweredBy;
  osm_type: OsmType;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

export enum OsmType {
  Node = "node",
  Relation = "relation",
  Way = "way",
}

export enum PoweredBy {
  MapMakerHTTPSMapsCo = "Map Maker: https://maps.co",
}

async function getData(location: string): Promise<Location | null> {
  try {
    const res = await fetch(`https://geocode.maps.co/search?q=${location}`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await res.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

const AppearsData: React.FC = () => {
  const [formData, setFormData] = useState({
    location: '',
  });

  const [locationData, setLocationData] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      const result = await getData(formData.location);
      console.log(result);
      setLocationData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }

    // Reset the form data after submission
    setFormData({
      location: '',
    });
  };

  return (
    <CoreLayout>
        <main>
            <form className='mt-5 ml-5' onSubmit={handleSubmit}>
            <label htmlFor="location">Location:</label>
            <input
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="location"
                name="location"
                placeholder="Enter location"
                value={formData.location}
                onChange={handleChange}
            />
            <input
                type="submit"
                value="Get lat/long"
                className="mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={isLoading} // Disable button during loading
            />
            </form>
            
            {isLoading ? (
            <p>Loading...</p>
            ) : locationData ? ( // Changed the condition here
            <div>
                <p>Latitude: {parseFloat(locationData.lat)}</p>
                <p>Longitude: {parseFloat(locationData.lon)}</p>
                <p>Place ID: {locationData.place_id}</p>
            </div>
            ) : null}
        </main>
    </CoreLayout>
  );
};

export default AppearsData;