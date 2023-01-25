import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";
import { imagesCdnAddress } from "../../constants/cdn";

function GalleryIndex () {
    const user = useUser();
    const supabase = useSupabaseClient();
    const [images, setImages] = useState([]);

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

    async function signOut() {
        const { error } = await supabase.auth.signOut();
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

    return (
        <Container className="container-sm mt-4">
            { user === null ?
                <>
                    <Link href='/auth/offchain'><h1>Please login</h1></Link>
                </>
                :
                <>
                    <h1>Your photos</h1>
                    <p>Current user: {user.email} </p>
                    <p>Upload image of your model for analysis</p>
                    <Form.Group className="mb-3" style={{maxWidth: '500px'}}>
                        <Form.Control type='file' accept='image/png, image/jpeg' onChange={(e) => uploadImage(e)} />
                    </Form.Group>
                    <br />
                    <hr />
                    <br />
                    <h3>Your images</h3>
                    <Row xs={1} md={3} className='g-4'>
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
                    <Button onClick={() => signOut()}>Sign out</Button>
                </>
            }
        </Container>
    )
}

export default GalleryIndex;