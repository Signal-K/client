import Head from "next/head";
import Image from "next/image";
import Card from "../../components/Posts/Card";
import PostCard from "../../components/Posts/PostCard";
import PostFormCard from "../../components/Posts/PostFormCard";
import NavigationCard from "../../components/Sidebar";
import styles from '../../styles/social-graph/Home.module.css';

export default function SocialIndex () {
    return (
        <div className={styles.background}>
                <div className={styles.header}>
                    <div className={styles.thing1}> {/* Sidebar */}
                        <NavigationCard />
                    </div>
                    <div className={styles.thing2}>
                        <PostFormCard />
                        <PostCard />
                    </div>
                </div>
        </div>
    )
}