import Head from "next/head";
import Image from "next/image";
import Card from "../../components/Posts/Card";
import PostCard from "../../components/Posts/PostCard";
import PostFormCard from "../../components/Posts/PostFormCard";
import NavigationCard from "../../components/Sidebar";
import styles from '../../styles/social-graph/Home.module.css';
import { Session } from "@supabase/supabase-js";
import { useSession } from "@supabase/auth-helpers-react";

export default function SocialIndex () {
    const session = useSession();

    if (!session) {
        return ("Hello World");
    };

    return (
        <div className={styles.background}>
                <div className={styles.header}>
                    <div className={styles.thing1}> {/* Sidebar */}
                        <NavigationCard />
                    </div>
                    <div className={styles.thing2}>
                        <PostFormCard/>
                        <PostCard />
                    </div>
                </div>
        </div>
    )
}