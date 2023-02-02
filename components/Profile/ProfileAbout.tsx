import Card from "../Posts/Card";
import styles from '../../styles/social-graph/Profile.module.css';

export default function ProfileAbout () {
    return (
        <Card>
            <h2 className={styles.aboutMe}>About Me</h2>
            <p className={styles.aboutMeText}>I'm Liam, the guy who built this site and is currently having issues with state management in Next.JS (how ironic)</p>
            <p className={styles.aboutMeText}>I rely on my teammates like Nathan and Perth-based overlord David to fix the issues I cause. Thanks guys</p>
        </Card>
    )
}