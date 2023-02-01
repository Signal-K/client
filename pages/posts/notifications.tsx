import Link from 'next/link';
import Avatar from '../../components/Posts/Avatar';
import Card from '../../components/Posts/Card';
import NavigationCard from '../../components/Sidebar';
import styles from '../../styles/social-graph/SavedPosts.module.css';

export default function UserNotificationsPage () {
    return (
        <div className={styles.background}>
            <div className={styles.header}>
                <div className={styles.thing1}> {/* Sidebar */}
                    <NavigationCard />
                </div>
                <div className={styles.thing2}>
                    <h1 className={styles.savedPostsHeader}>Notifications</h1>
                    <Card>
                        <div className={styles.notificationOuterWrapper}>
                            <div className={styles.notificationWrapper}>
                                <Avatar />
                                <div><Link href='/' className={styles.notificationUser}>David Wilson</Link> liked <Link href='/' className={styles.notificationItemLink}>your photo</Link></div>
                            </div>
                            <div className={styles.notificationWrapper}>
                                <Avatar />
                                <div><Link href='/' className={styles.notificationUser}>David Wilson</Link> disliked <Link href='/' className={styles.notificationItemLink}>your photo</Link></div>
                            </div>
                            <div className={styles.notificationWrapper}>
                                <Avatar />
                                <div><Link href='/' className={styles.notificationUser}>David Wilson</Link> dunked on <Link href='/' className={styles.notificationItemLink}>your photo</Link></div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div> 
    )
}