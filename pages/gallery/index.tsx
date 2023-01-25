import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useUser, useSupabaseClient, Session } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";
import { imagesCdnAddress } from "../../constants/cdn";
import AccountAvatar from "../../components/Data/AccountAvatar";
import { Database } from "../../utils/database.types";

type Profiles = Database['public']['Tables']['profiles']['Row'];

function GalleryIndex ({ session }: { session: Session }) {
    const user = useUser();
    const supabase = useSupabaseClient<Database>();
    const [images, setImages] = useState([]);

    // Main account info
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<Profiles['username']>(null);
    const [website, setWebsite] = useState<Profiles['website']>(null);
    const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(null);
    const [address, setAddress] = useState<Profiles['address']>(null);

    useEffect(() => {
        getProfile();
    }, [session]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!user) throw new Error('No user authenticated');
            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url, address`)
                .eq('id', user.id)
                .single()

            if (error && status !== 406) {
                throw error;
            }

            if ( data ) {
                setUsername(data.username);
                setWebsite(data.website);
                setAvatarUrl(data.avatar_url);
                setAddress(data.address);
            }
        } catch (error) {
            alert('Error loading your profile data');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile ( { username, website, avatar_url, address, } : {
        username: Profiles['username'];
        website: Profiles['website'];
        avatar_url: Profiles['avatar_url'];
        address: Profiles['address'];
    }) {
        try {
            setLoading(true);
            if (!user) throw new Error('No user authenticated');
            const updates = {
                id: user.id,
                username,
                website,
                avatar_url,
                address,
                updated_at: new Date().toISOString(),
            }
            let { error } = await supabase.from('profiles').upsert(updates);
            if ( error ) throw error;
            alert('Offchain profile updated');
        } catch (error) {
            alert('Error updating your profile data');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

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
        <>
            {/*<div className="form-widget">
                {/*<AccountAvatar
                    uid = { user!.id }
                    url = { avatar_url }
                    size = { 150 }
                    onUpload = {( url ) => {
                        setAvatarUrl( url )
                        updateProfile({ username, website, avatar_url: url, address })
                    }}
                />
                <div>
                    <label htmlFor='email'>Email</label>
                    <input id='email' type='text' value={user.email} disabled />
                </div>
                <div>
                    <label htmlFor='username'>Username</label>
                    <input
                        id='username'
                        type='text'
                        value={ username || '' }
                        onChange={( e ) => setUsername(e.target.value) }
                    />
                </div>
                <div>
                    <label htmlFor='address'>Address</label>
                    <input
                        id='address'
                        type='text'
                        value={ address || '' }
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <div>
                    <button
                        className="button primary block"
                        onClick={() => updateProfile({ username, website, avatar_url, address })}
                        disabled={loading}
                    >
                        {loading ? 'Loading ...' : 'Update'}
                    </button>
                </div>

                <br />
                <br />
                <p>Upload image of your model for analysis</p>
                <Form.Group className="mb-3" style={{maxWidth: '500px'}}>
                    <Form.Control type='file' accept='image/png, image/jpeg' onChange={(e) => uploadImage(e)} />
                </Form.Group>
            </div>*/}
            <Container className="container-sm mt-4">
                { user === null ?
                    <>
                        <Link href='/auth/offchain'><h1>Please login</h1></Link>
                    </>
                    :
                    <>
                        <h1>Your photos</h1>
                        <p>Current user: {user.email} </p>
                        <br />
                        <div>
                            <label htmlFor='website'>Website</label>
                            <input
                                id='website'
                                type='website'
                                value={ website || '' }
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>
                        <br />
                        <p>Upload image of your model for analysis</p>
                        <Form.Group className="mb-3" style={{maxWidth: '500px'}}>
                            <Form.Control type='file' accept='image/png, image/jpeg' onChange={(e) => uploadImage(e)} />
                        </Form.Group>
                        <br />
                        <hr />
                        <br />
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
                        <Button onClick={() => signOut()}>Sign out</Button>
                    </>
                }
            </Container>
        </>
    )
}

export default GalleryIndex;