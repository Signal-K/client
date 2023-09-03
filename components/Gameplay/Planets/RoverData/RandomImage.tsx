// http://mars.jpl.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG"

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoverImage = ({ date, rover }) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Construct the API URL
    const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${date}&api_key=DEMO_KEY`;

    // Make a GET request to the API
    axios.get(apiUrl)
      .then((response) => {
        // Check if there are photos in the response
        if (response.data.photos && response.data.photos.length > 0) {
          // Get the first image URL
          const firstImage = response.data.photos[0].img_src;
          setImageUrl(firstImage);
        } else {
          // Handle the case where no photos are found
          setImageUrl('No images found for the given date and rover.');
        }
      })
      .catch((error) => {
        // Handle any errors here
        setImageUrl('An error occurred while fetching the image.');
        console.error(error);
      });
  }, [date, rover]);

  return (
    <div>
      <h2>Mars Rover Photo</h2>
      <p>Date: {date}</p>
      <p>Rover: {rover}</p>
      <img src={imageUrl} alt="Mars Rover" />
    </div>
  );
};

const RoverImagePage = () => {
    const randomDate = Math.floor(Math.random() * 1000) + 1; // Random date between 1 and 1000
    const selectedRover = 'perseverance'; // You can change this to 'curiosity' or 'opportunity' as needed

    return (
        <div>
        <h1>Mars Rover Image</h1>
        <RoverImage date={randomDate} rover={selectedRover} />
        </div>
    );
}

export default RoverImagePage;