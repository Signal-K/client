import Card from "../Posts/Card";
import styles from '../../styles/social-graph/Profile.module.css';

export default function ProfileMedia () {
    return (
        <Card>
            <div className={styles.mediaImageOuterWrapper}>
                <div className={styles.mediaImageWrapper}><img src='https://images.unsplash.com/photo-1547234935-80c7145ec969?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80' /></div>
                <div className={styles.mediaImageWrapper}><img src='https://images.unsplash.com/photo-1522760122564-d567dac67f45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1083&q=80' /></div>
                <div className={styles.mediaImageWrapper}><img src='https://images.unsplash.com/photo-1574786527860-f2e274867c91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1164&q=80' /></div>
                <div className={styles.mediaImageWrapper}><img src='https://images.unsplash.com/photo-1638975913901-a6ba8c99c300?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80' /></div>
            </div>
        </Card>
    );
};