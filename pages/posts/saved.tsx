import PostCard from "../../components/Posts/PostCard";
import NavigationCard from "../../components/Sidebar";
import styles from '../../styles/social-graph/SavedPosts.module.css';

export default function SavedPostsPage () {
    return (
        <div className={styles.background}>
                <div className={styles.header}>
                    <div className={styles.thing1}> {/* Sidebar */}
                        <NavigationCard />
                    </div>
                    <div className={styles.thing2}>
                        <h1 className={styles.savedPostsHeader}>SAVED POSTS</h1>
                        <PostCard />
                        <PostCard />
                    </div>
                </div>
        </div>
    )
}