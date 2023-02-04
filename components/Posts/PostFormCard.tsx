import NavigationCard from "../Sidebar"
import Card from "./Card"
import styles from '../../styles/social-graph/PostForm.module.css';
import { HiUserGroup, HiOutlineMap, HiOutlinePuzzle, HiOutlineTag, HiOutlineTerminal } from 'react-icons/hi';
import Avatar, { AvatarFromTable } from "./Avatar";
import { useEffect, useState } from "react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import { useSession, useSupabaseClient, useUser, Session } from "@supabase/auth-helpers-react";
import { Database } from "../../utils/database.types";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function PostFormCard () {
    const supabase = useSupabaseClient();
    const user = useUser();
    const [profile, setProfile] = useState(null);

    return (
        <Card>
            <div className={styles.postFormWrapper}>
                <Avatar />
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
    return (
        <div className='container' style={{ padding: '50px 0 100px 0' }}>
            <Card>
                <div className={styles.postFormWrapper}>
                    <div><Avatar 
                        /*uid={user!.id}
                        url={avatar_url}
                        size={1}*/
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
        </div>
    )
}