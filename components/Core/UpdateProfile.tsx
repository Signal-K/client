import React, { useState, useEffect, createRef } from "react";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import Link from "next/link";

import { useUser, useSupabaseClient, Session } from "@supabase/auth-helpers-react";
import { Database } from "../../utils/database.types";

import { AccountAvatarV1 } from "../../components/AccountAvatar";
import { imagesCdnAddress } from "../../constants/cdn";
import { v4 as uuidv4 } from 'uuid';

type Profiles = Database['public']['Tables']['profiles']['Row'];
type Planets = Database['public']['Tables']['planets']['Row']; 

export default function AccountEditor({ session }: { session: Session }) {
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
        username: Profiles['username']
        website: Profiles['website']
        avatar_url: Profiles['avatar_url']
        address: Profiles['address']
    }) {
        try {
            setLoading(true);
            if (!user) throw new Error('No user authenticated!');
            const updates = {
                id: user.id,
                username,
                website,
                avatar_url,
                address,
                address2,
                updated_at: new Date().toISOString(),
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
                // id: user.id, // Generate a random id later
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
        </div>
    )
}