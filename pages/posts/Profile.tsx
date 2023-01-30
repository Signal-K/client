import Layout from "../../generator/components/Layout";
import NavigationCard from "../../components/Sidebar";
import styles from '../../styles/social-graph/Home.module.css';
import Card, { ProfileCard } from "../../components/Posts/Card";
import Avatar, { BigAvatar } from "../../components/Posts/Avatar";

export default function ProfilePage() {
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
                                </div>
                            </div>
                        </div>
                    </ProfileCard>
                </div>
            </div>
        </div>
    )
}