import React, { useState, useEffect, createRef } from "react";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import Link from "next/link";

import { useUser, useSupabaseClient, Session } from "@supabase/auth-helpers-react";
import { Database } from "../../utils/database.types";

import { AccountAvatarV1 } from "../../components/AccountAvatar";
import { imagesCdnAddress } from "../../constants/cdn";
import { v4 as uuidv4 } from 'uuid';
import { useScreenshot } from 'use-react-screenshot';

import PlanetEditor from "./planet-editor";

type Profiles = Database['public']['Tables']['profiles']['Row'];
type Planets = Database['public']['Tables']['planets']['Row']; // See `wb3-10` at this point https://github.com/Signal-K/client/blob/wb3-10-implement-off-chain-commenting-post/components/Data/OffchainAccount.tsx / https://github.com/Signal-K/client/commit/17301ae88f3f8d1aa673ac968ceef360192fa3b1 -> Clone that branch and compare the behaviour and UI to what occurs here and in planet-editor

export default function OffchainAccount({ session }: { session: Session}) {
    const supabase = useSupabaseClient<Database>();
    const user = useUser();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<Profiles['username']>(null);
    const [website, setWebsite] = useState<Profiles['website']>(null); // I believe this is the email field
    const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(null);
    const [address2, setAddress2] = useState<Profiles['address2']>(null);
    const [address, setAddress] = useState<Profiles['address']>(null); // This should be set by the handler eventually (connected address).
    const [images, setImages] = useState([]);

    // User planet
    const [userIdForPlanet, setUserIdForPlanet] = useState<Planets['userId']>(null);
    const [planetGeneratorImage, setPlanetGeneratorImage] = useState<Planets['screenshot']>(null);

    const ref = createRef();
    let width = '100%'
    const [image, takeScreenShot] = useScreenshot();

    const getImage = () => takeScreenShot(ref.current);

    useEffect(() => {
        getProfile();
        console.log(session?.user?.id)
    }, [session]);

    async function getProfile () {
        try {
            setLoading(true);
            if (!user) throw new Error('No user authenticated');
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url, address, address2`)
                .eq('id', user.id)
                .single()

            if (error && status !== 406) {
                throw error; 
            }

            if (data) {
                setUsername(data.username);
                setWebsite(data.website);
                setAvatarUrl(data.avatar_url);
                setAddress(data.address);
                setAddress2(data.address2);
            }
        } catch (error) {
            //alert('Error loading your user data');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile({
        username,
        website,
        avatar_url,
        address,
    } : {
        username: string //Profiles['username']
        website: string //Profiles['website']
        avatar_url: string //Profiles['avatar_url']
        address: string //Profiles['address']
    }) {
        try {
            setLoading(true);
            if (!user) throw new Error('No user authenticated!');
            const updates = {
                id: user.id,
                updated_at: new Date().toISOString(),
                username,
                website,
                avatar_url,
                address,
                address2,
            }
            let { error } = await supabase.from('profiles').upsert(updates);
            if (error) throw error;
            alert('Off-chain Profile updated');
        } catch (error) {
            alert('Error updating your profile data:');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    // Gallery components
    // Retrieving gallery data for user
    async function getImages() {
        const { data, error } = await supabase
            .storage
            .from('images')
            .list(user?.id + '/', {
                limit: 100, // Get 100 images from this dir
                offset: 0,
                sortBy: {
                    column: 'name',
                    order: 'asc'
                }
            });

        if ( data !== null ) {
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
            .upload(user.id + '/' + uuidv4(), file);

        if (data) {
            getImages();
        } else {
            console.log(error);
        }
    }

    async function uploadScreenshot(e) {
        let file = image + '.png';
        const { data, error } = await supabase
            .storage
            .from('images')
            .upload(user.id + '/' + uuidv4(), file);

        if (data) {
            getImages();
        } else {
            console.log(error);
        }
    }

    async function deleteImage (imageName) {
        const { error } = await supabase
            .storage
            .from('images')
            .remove([ user.id + '/' + imageName ])

        if (error) {
            alert (error);
        } else {
            getImages();
        }
    }

    useEffect(() => {
        if (user) { // Only get images IF the user exists and is logged in
            getImages(); // Add a getPosts function to get a user's profile posts
        }
    }, [user]);

    function convertURIToImageData(URI) {
        return new Promise(function(resolve, reject) {
          if (URI == null) return reject();
          var canvas = document.createElement('canvas'),
              context = canvas.getContext('2d'),
              image = new Image();
          image.addEventListener('load', function() {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(context.getImageData(0, 0, canvas.width, canvas.height));
          }, false);
          image.src = URI;
        });
    }

    /* PLANET manipulation */
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
                .from('planetsss')
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
    }

    return (
        <div className="form-widget">
            <AccountAvatarV1
                uid={user?.id}
                url={avatar_url}
                size={150}
                onUpload={(url) => {
                    setAvatarUrl(url) 
                    updateProfile({ username, website, avatar_url: url, address})
                }}
            />
            <div>
                <label htmlFor='email'>Email</label>
                <input id='email' type='text' value={session?.user?.email} disabled />
            </div><br />
            <div>
                <label htmlFor='username'>Username</label>
                <input
                    id='username'
                    type='text'
                    value={ username || '' }
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div><br />
            <div>
                <label htmlFor='website'>Website</label>
                <input
                    id='website'
                    type='website'
                    value={ website || '' }
                    onChange={(e) => setWebsite(e.target.value)}
                /><br />
            </div><br />
            <div>
                <label htmlFor='address'>Address</label>
                <input
                    id='address'
                    type='text'
                    value={ address || '' }
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div><br />
            <div>
                <button
                    className="button primary block"
                    onClick={() => updateProfile({ username, website, avatar_url, address })}
                    disabled={loading}
                >
                    {loading ? 'Loading ...' : 'Update'}
                </button>
            </div><br />
            <div>
                <button style={{ marginBottom: "10px" }} onClick={getImage}>
                    Take screenshot
                </button>
            </div>
            <img width={width} src={image} alt={"ScreenShot"} />
            <div
                ref={ref as React.RefObject<HTMLDivElement>}
                style={{
                    border: "1px solid #ccc",
                    padding: "10px",
                    marginTop: "20px"
                }}
            >
                <PlanetEditor />
            </div>
            <br />
            <Container className='container-sm mt-4 mx-auto border-5 border-emerald-500'>
                <>
                    <h1>Your photos</h1><br />
                    <p>Upload image of your model for analysis</p>
                    <Form.Group className="mb-3" style={{maxWidth: '500px'}}>
                        <Form.Control type='file' accept='image/png, image/jpeg' onChange={(e) => uploadImage(e)} />
                    </Form.Group><br />
                    <Button variant='outline-info' onClick={() => uploadScreenshot(image)}>Upload planet metadata</Button>
                    <br /><br /><hr /><br />
                    <h3>Your images</h3>
                    <Row className='g-4'>
                        {images.map((image) => {
                            return (
                                <Col key={imagesCdnAddress + user.id + '/' + image.name}>
                                    <Card>
                                        <Card.Img variant='top' src={imagesCdnAddress + user.id + '/' + image.name} />
                                        <Card.Body>
                                            <Button variant='danger' onClick={() => deleteImage(image.name)}>Delete image</Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )
                        })}
                    </Row>
                </>
            </Container>
            <div>
                <Button variant='outline-info' onClick={() => supabase.auth.signOut()}>
                    Sign Out
                </Button>
            </div>
        </div>
    )
}