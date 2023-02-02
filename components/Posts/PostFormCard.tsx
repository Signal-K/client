import NavigationCard from "../Sidebar"
import Card from "./Card"
import styles from '../../styles/social-graph/PostForm.module.css';
import { HiUserGroup, HiOutlineMap, HiOutlinePuzzle, HiOutlineTag, HiOutlineTerminal } from 'react-icons/hi';
import Avatar, { AvatarFromTable } from "./Avatar";
import { useEffect, useState } from "react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient, useUser, Session } from "@supabase/auth-helpers-react";
import AccountAvatar from "../Data/AccountAvatar";
import { Database } from "../../utils/database.types";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function PostFormCard () {
    const supabase = useSupabaseClient();
    const user = useUser();
    const [profile, setProfile] = useState(null);

    return (
        <Card>
            <div className={styles.postFormWrapper}>
                <Avatar 
                    /*uid={user!.id}
                    url={avatar_url}
                    size={1}*/
                />
                <textarea className={styles.textAreaWrapper} placeholder={"What's on your mind? "} />
            </div>
            <div className={styles.postAdditions}>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiUserGroup className={styles.postAdditionButtonIcons}/>
                        People</button>
                </div>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiOutlineMap className={styles.postAdditionButtonIcons}/>
                        Checkin</button>
                </div>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiOutlinePuzzle className={styles.postAdditionButtonIcons}/>
                        Emotion</button>
                </div>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiOutlineTag className={styles.postAdditionButtonIcons}/>
                        Tag NFT</button>
                </div>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiOutlineTerminal className={styles.postAdditionButtonIcons}/>
                        Upload metadata</button>
                </div>
                <div className={styles.submitButtonWrapper}>
                    <button className={styles.submitButton}>Publish</button>
                </div>
            </div>
        </Card>
    )
}

export function PostFormCarduseUser () {
    const supabase = useSupabaseClient();
    const user = useUser();
    const [username, setUsername] = useState('');
    const [website, setWebsite] = useState('');
    const [avatar_url, setAvatarUrl] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProfile(); // Get user id of authenticated user
        console.log(username);
    }, []);

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

            if (data) {
                setUsername(data.username);
                setWebsite(data.website);
                setAvatarUrl(data.avatar_url);
                setAddress(data.address);
            }
        } catch (error) {
            alert('Error loading your user data');
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='container' style={{ padding: '50px 0 100px 0' }}>
            {!user ? (
                <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme='dark' />
            ) : (
                <Card>
                    <div className={styles.postFormWrapper}>
                        <div><Avatar 
                            /*uid={user!.id}
                            url={avatar_url}
                            size={1}*/
                        /><AccountAvatar // Match this with Lens avatar later
                        uid={user!.id}
                        url={avatar_url}
                        size={7}
                        onUpload={(url) => {
                            setAvatarUrl(url)                        
                        }}
                        /></div>
                        <textarea className={styles.textAreaWrapper} placeholder={"What's on your mind? "} />
                    </div>
                    <div className={styles.postAdditions}>
                        <div><button className={styles.postAdditionButton}><HiUserGroup className={styles.postAdditionButtonIcons}/>People</button> </div>
                        <div><button className={styles.postAdditionButton}><HiOutlineMap className={styles.postAdditionButtonIcons}/>Checkin</button></div>
                        <div><button className={styles.postAdditionButton}><HiOutlinePuzzle className={styles.postAdditionButtonIcons}/>Emotion</button></div>
                        <div><button className={styles.postAdditionButton}><HiOutlineTag className={styles.postAdditionButtonIcons}/>Tag NFT</button></div>
                        <div><button className={styles.postAdditionButton}><HiOutlineTerminal className={styles.postAdditionButtonIcons}/>Upload metadata</button></div>
                        <div className={styles.submitButtonWrapper}><button className={styles.submitButton}>Publish</button></div>
                    </div>
                </Card>
            )}
        </div>
    )
}