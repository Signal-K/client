import NavigationCard from "./Sidebar";
import styles from '../../styles/social-graph/Home.module.css';

export default function Layout({ children }) {
    <div className={styles.background}>
        <div className={styles.header}>
            <div className={styles.thing1}> {/* Sidebar */}
                <NavigationCard />
            </div>
            <div className={styles.thing2}>
                {children}
            </div>
        </div>
    </div>
}