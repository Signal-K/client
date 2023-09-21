// http://mars.jpl.nasa.gov/msl-raw-images/proj/msl/redops/ods/surface/sol/01000/opgs/edr/fcam/FLB_486265257EDR_F0481570FHAZ00323M_.JPG"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row, Spinner, Button, Form } from "react-bootstrap";
import RoverImageCard from './RoverImageCard';

const RoverImage = ({ date, rover }) => {
  const [imageUrl, setImageUrl] = useState('');
  const apiKey = "iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE"

  useEffect(() => {
    // Construct the API URL
    const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${date}&api_key=${apiKey}`;

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

export function RoverGallerySingle() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [roverImage, setRoverImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState('');
  const [imageMetadata, setImageMetadata] = useState('');
  const [content, setContent] = useState('');

  const fetchImage = async () => {
    const randomDate = Math.floor(Math.random() * 1000) + 1;
    const selectedRover = 'perseverance'; // You can change this to 'curiosity' or 'opportunity' as needed
    const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${randomDate}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data.photos && response.data.photos.length > 0) {
        const firstImage = response.data.photos[0].img_src;
        setRoverImage(firstImage);

        // Set metadata from the fetched image
        const metadataText = JSON.stringify(response.data.photos[0], null, 2);
        setImageMetadata(metadataText);
        setMetadata('Metadata for the current image:');
      } else {
        setRoverImage('No images found for the given date and rover.');
        setMetadata('No image available.');
        setImageMetadata('');
      }
    } catch (error) {
      console.error(error);
      setRoverImage('An error occurred while fetching the image.');
      setMetadata('Error fetching the image.');
      setImageMetadata('');
    }

    setLoading(false); // Set loading to false when the image is loaded
  };

  const generateNewImage = () => {
    setLoading(true); 
    fetchImage();
  };

  useEffect(() => {
    fetchImage();
  }, []);

  const handlePostSubmit = async () => {
    if (content) {
      const user = session?.user?.id;
      if (user) {
        const response = await supabase.from('contentROVERIMAGES').upsert([
          {
            author: user,
            metadata: imageMetadata,
            imageLink: roverImage,
            planet: null,
            content,
            media: null,
          },
        ]);

        if (response.error) {
          console.error(response.error);
        } else {
          setContent('');
        }
      }
    }
  };

  return (
    <Container>
      <Row className="mb-20">
        <RoverImageCard roverImage={{ id: '1', content: '', image: roverImage, planets2: '' }} />
      </Row>
      <Form.Group>
        <Form.Label>{metadata}</Form.Label>
        <Form.Control as="textarea" rows={10} value={imageMetadata} readOnly />
      </Form.Group><br />
      <Form.Group>
          <Form.Label>Your Thoughts:</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={content}
            onChange={(e) => setContent((e.target as HTMLTextAreaElement).value)}
          />
        </Form.Group>
      <button onClick={handlePostSubmit}>Submit Post</button>
      <button onClick={generateNewImage}>Generate New Image</button>
      {loading && <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>}
    </Container>
  );
}
