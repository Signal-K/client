import Layout from "../../generator/components/Layout";
import NavigationCard from "../../components/Sidebar";
import styles from '../../styles/social-graph/Home.module.css';
import Card, { ProfileCard } from "../../components/Posts/Card";
import Avatar, { BigAvatar } from "../../components/Posts/Avatar";
import { HiPencilAlt, HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineVideoCamera } from 'react-icons/hi';
import Link from "next/link";
import PostCard from "../../components/Posts/PostCard";
import { useRouter } from "next/router";
import { useState } from "react";
import ProfileAbout from "../../components/Profile/ProfileAbout";
import ProfileFriends from "../../components/Profile/ProfileFriends";
import ProfileMedia from "../../components/Profile/ProfileMedia";

export default function ProfilePage() {
    const router = useRouter();
    const { asPath: pathname } = router;
    const isPosts = pathname.includes('posts') || pathname == '/profile';
    const isAbout = pathname.includes('about') || pathname == '/about';
    const isFriends = pathname.includes('friends') || pathname == '/friends';
    const isMedia = pathname.includes('media') || pathname == '/media';
    const [isPostsButton, setIsPostsButton] = useState(true);
    const [isFriendsButton, setIsFriendsButton] = useState(false);
    const [isAboutButton, setIsAboutButton] = useState(false);
    const [isMediaButton, setIsMediaButton] = useState(false);
    const clickPosts = () => {
        console.log(isPostsButton);
        setIsPostsButton(true);
        setIsFriendsButton(false)
        setIsAboutButton(false)
        setIsMediaButton(false)
    }
    const clickFriends = () => {
        console.log(isPostsButton);
        setIsPostsButton(false);
        setIsFriendsButton(true)
        setIsAboutButton(false)
        setIsMediaButton(false)
    }
    const clickAbout = () => {
        console.log(isPostsButton);
        setIsPostsButton(false);
        setIsFriendsButton(false)
        setIsAboutButton(true)
        setIsMediaButton(false)
    }
    const clickMedia = () => {
        console.log(isMediaButton);
        setIsPostsButton(false);
        setIsFriendsButton(false)
        setIsAboutButton(false)
        setIsMediaButton(true)
    }

    return (
        <div className={styles.background}>
            <div className={styles.header}>
                <div className={styles.thing1}> {/* Sidebar */}
                    <NavigationCard />
                </div>
                <div className={styles.thing2}>
                    <ProfileCard>
                        <div className={styles.profileContentsWrapper}>
                            <div className={styles.profileCoverImage}>
                                <img src="https://images.unsplash.com/photo-1454789591675-556c287e39e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80" />
                            </div>
                            <div className={styles.profilePicWrapper}>
                                <BigAvatar />
                            </div>
                            <div className={styles.profileContents}>
                                <div className={styles.profileContentsText}>
                                    <h1 className={styles.profileName}>Liam Arbuckle</h1>
                                    <div className={styles.profileLocation}>Melbourne, Australia</div>
                                    <div className={styles.profileLocation}>0x734gr874h4t4g8g4y384yt4490x</div>
                                </div>
                                <div className={styles.postAdditions}> {/* Add a section to show their planet. Create a publication that references the planet they've generated */}
                                    <a onClick={() => clickPosts()}><div><button className={styles.postAdditionButton}> <HiPencilAlt className={styles.postAdditionButtonIcons}/>
                                        Posts
                                    </button></div></a>
                                    <a onClick={() => clickFriends()}><div><button className={styles.postAdditionButton}> <HiOutlineUserGroup className={styles.postAdditionButtonIcons}/>
                                        Friends
                                    </button></div></a>
                                    <a onClick={() => clickAbout()}><div><button className={styles.postAdditionButton}> <HiOutlineDocumentText className={styles.postAdditionButtonIcons}/>
                                        About
                                    </button></div></a>
                                    <a onClick={() => clickMedia()}><div><button className={styles.postAdditionButton}> <HiOutlineVideoCamera className={styles.postAdditionButtonIcons}/>
                                        Media
                                    </button></div></a>
                                    {/*<div><button className={styles.postAdditionButton}> <HiUserGroup className={styles.postAdditionButtonIcons}/>
                                            Notebooks
                                    </button></div>
                                    <div><button className={styles.postAdditionButton}> <HiUserGroup className={styles.postAdditionButtonIcons}/>
                                            Sandbox
                                    </button></div>
                                    <div><button className={styles.postAdditionButton}> <HiUserGroup className={styles.postAdditionButtonIcons}/>
                                            Proposals
                                    </button></div>
                                    <div><button className={styles.postAdditionButton}> <HiUserGroup className={styles.postAdditionButtonIcons}/>
                                            Publications
                                    </button></div>
                                    <div><button className={styles.postAdditionButton}> <HiUserGroup className={styles.postAdditionButtonIcons}/>
                                            Collections
                                    </button></div>*/}
                                </div>
                            </div>
                        </div>
                    </ProfileCard>
                    {clickPosts && (
                        <div>
                            <PostCard />
                            <ProfileAbout />
                            <ProfileFriends />
                            <ProfileMedia />
                        </div>
                    )}
                    {/* Now, the rest of the page should be laid out like this, however...I'm going to put everything inside {clickPosts... as we appear unable to change state this way */}
                    {isAbout && (
                        <ProfileAbout />
                    )}
                    {isFriends && (
                        <ProfileFriends />
                    )}
                    {isMedia && (
                        <ProfileMedia />
                    )}
                </div>
            </div>
        </div>
    )
}