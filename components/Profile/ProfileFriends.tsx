import Card from "../Posts/Card";
import styles from '../../styles/social-graph/Profile.module.css';
import Avatar from "../Posts/Avatar";

export default function ProfileFriends () {
    return (
        <Card>
            <h2 className={styles.aboutMe}>Friends</h2>
            <div className={styles.friendsWrapper}>
                <div className={styles.friendWrapperInner}>
                    <Avatar />
                    <div>
                        <h3 className={styles.friendName}>David Wilson</h3>
                        <div className={styles.mutualFriendsText}>1 mutual friend</div>
                    </div>
                </div>
                {/* Duplicating this for frontend demo purposes to pretend I have multiple friends - will draw from database table later */}
                <br /><div className={styles.friendWrapperInner}>
                    <Avatar />
                    <div>
                        <h3 className={styles.friendName}>David Wilson</h3>
                        <div className={styles.mutualFriendsText}>1 mutual friend</div>
                    </div>
                </div>
                <br /><div className={styles.friendWrapperInner}>
                    <Avatar />
                    <div>
                        <h3 className={styles.friendName}>David Wilson</h3>
                        <div className={styles.mutualFriendsText}>1 mutual friend</div>
                    </div>
                </div>
                <br /><div className={styles.friendWrapperInner}>
                    <Avatar />
                    <div>
                        <h3 className={styles.friendName}>David Wilson</h3>
                        <div className={styles.mutualFriendsText}>1 mutual friend</div>
                    </div>
                </div>
            </div>
        </Card>
    )
}