import styles from '../../styles/social-graph/Home.module.css';

export default function Card ({ children }) {
    return (
        <div className={styles.card}>{children}</div>
    );
}

export function ProfileCard ({ children }) {
    return (
        <div className={styles.profileCard}>{children}</div>
    );
}