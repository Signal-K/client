import React, { useEffect, useState } from "react";

import Layout from "../../components/Layout";
import Card from "../../components/Card";
import PostCard from "../../components/PostCard";

import { v4 as uuidv4 } from 'uuid';

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../../context/UserContext";
import { Col, Container, Row, Form } from "react-bootstrap";
import { imagesCdnAddress } from "../../constants/cdn";

export default function GalleryIndex () {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    async function getImages() {
        const { data, error } = await supabase
            .storage    
            .from('images')
            .list(session?.user?.id + '/', {
                limit: 100,
                offset: 0,
                sortBy: {
                    column: 'name',
                    order: 'asc',
                }
            });
        
        if (data !== null) {
            setImages(data);
        } else {
            alert('Error loading images');
            console.log(error);
        }
    }

    async function uploadImage(e) {
        let file = e.target.files[0];
        const { data, error } = await supabase
            .storage
            .from('images')
            .upload(session?.user?.id + '/' + uuidv4(), file);

        if (data) {
            getImages();
        } else {
            console.log(error);
        }
    }

    async function deleteImage ( imageName ) {
        const { error } = await supabase
            .storage
            .from('images')
            .remove([ session?.user?.id + '/' + imageName ])

        if (error) {
            alert (error);
        } else {
            getImages();
        }
    }

    useEffect(() => {
        if (session?.user) {
            getImages();
        }
    }, [session?.user]);

    /* PLANET manipulation 
    async function createPlanet({ // Maybe we should add a getPlanet (getUserPlanet) helper as well?
        userId, temperature, radius, date, ticId
    } : {
        //id: Planets['id']
        userId: Planets['userId'] // Check to see if this page gets the userId as well, or just the username. Foreign key still works regardless
        temperature: Planets['temperature']
        radius: Planets['radius']
        date: Planets['date']
        ticId: Planets['ticId']
    }) {
        try {
            setLoading(true);
            // Is the planet ID going to be based on the user id (obviously not in production, but in this version?)
            const newPlanetParams = {
                id: user.id, // Generate a random id later
                // .. other params from database types
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    } 
    
    async function getUserPlanet() {
        try {
            setLoading(true);
            if (!user) throw new Error('No user authenticated');
            let { data, error, status } = await supabase
                .from('planets')
                .select(`id, userId, temperature, radius, ticId`)
                .eq('userId', username)
                .single()

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUserIdForPlanet(data.userId);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    } */

    return (
        <Layout hideNavigation={false}>
            <Card noPadding={false}>
                <Container className="container-sm mt-4 mx-auto border-5 border-emerald-500">
                    <>
                        {/* Add screenshot function for <PlanetEditor /> from `pages/planets/planet.tsx` */}
                        <h3>Your images</h3> {/* These images should be stored in an array based on which anomaly they're referring to if they're coming from posts -> e.g. 1 post can have 3 photos about "WASP-12b" */}
                        <Row className="g-4">
                            {images.map((image) => {
                                return (
                                    <Col key={imagesCdnAddress + session?.user?.id + '/' + image.name}>
                                        {/*<Card noPadding={false}>*/}<img src={imagesCdnAddress + session?.user?.id + '/' + image.name} />
                                    </Col>
                                );
                            })}
                        </Row>
                        <br />
                        <p>Upload images of anomalies for analysis</p>
                        <Form.Group className='mb-3' style={{ maxWidth: '500px' }}>
                            <Form.Control type='file' accept='image/png, image/jpeg, image/jpg' onChange={(e) => uploadImage(e)} />
                        </Form.Group>
                    </>
                </Container>
            </Card>
        </Layout>
    );
}

// Original component demo here: https://github.com/Signal-K/client/blob/wb3-10-implement-off-chain-commenting-post/components/Data/OffchainAccount.tsx