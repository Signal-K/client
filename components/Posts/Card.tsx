import styles from '../../styles/social-graph/Home.module.css';

export default function Card ({ children }) {
    return (
        <div className={styles.card}>{children}</div>
    );
}