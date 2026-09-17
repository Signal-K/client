import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Container, Row, Spinner } from "react-bootstrap";
import Login from "../../login";
import RoverImageCard from "../../../components/Gameplay/Planets/RoverData/RoverImageCard";
import CoreLayout from "../../../components/Core/Layout";
import axios from 'axios';

export default function PlanetGalleryIndex() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [rovers, setRovers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      const imagePromises = [];
      for (let i = 0; i < 9; i++) {
        const randomDate = Math.floor(Math.random() * 1000) + 1;
        const selectedRover = 'perseverance'; // You can change this to 'curiosity' or 'opportunity' as needed
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${randomDate}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;

        const imagePromise = axios.get(apiUrl)
          .then((response) => {
            if (response.data.photos && response.data.photos.length > 0) {
              return response.data.photos[0].img_src;
            } else {
              return 'No images found for the given date and rover.';
            }
          })
          .catch((error) => {
            console.error(error);
            return 'An error occurred while fetching the image.';
          });

        imagePromises.push(imagePromise);
      }

      const images = await Promise.all(imagePromises);
      setRovers(images);
      setLoading(false); // Set loading to false when all images are loaded
    };

    fetchImages();
  }, []); // Empty dependency array ensures the effect runs only once, after the initial render

  if (!session) {
    return <Login />;
  }

  return (
    <CoreLayout>
      <Container>
        {loading ? (
          // Display a loading spinner while images are being fetched
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        ) : (
          <Row className="mb-20">
            {rovers.map((image, index) => (
              <RoverImageCard key={index} roverImage={{ id: index.toString(), content: '', image: image, planets2: '' }} />
            ))}
          </Row>
        )}
      </Container>
    </CoreLayout>
  );
}