import NavigationCard from "../Sidebar"
import Card from "./Card"
import styles from '../../styles/social-graph/PostForm.module.css';
import { HiUserGroup, HiOutlineMap, HiOutlinePuzzle, HiOutlineTag, HiOutlineTerminal } from 'react-icons/hi';
import Avatar from "./Avatar";

export default function PostFormCard () {
    return (
        <Card>
            <div className={styles.postFormWrapper}>
                <Avatar />
                <textarea className={styles.textAreaWrapper} placeholder={"What's on your mind? "} />
            </div>
            <div className={styles.postAdditions}>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiUserGroup className={styles.postAdditionButtonIcons}/>
                        People</button>
                </div>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiOutlineMap className={styles.postAdditionButtonIcons}/>
                        Checkin</button>
                </div>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiOutlinePuzzle className={styles.postAdditionButtonIcons}/>
                        Emotion</button>
                </div>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiOutlineTag className={styles.postAdditionButtonIcons}/>
                        Tag NFT</button>
                </div>
                <div>
                    <button className={styles.postAdditionButton}>
                        <HiOutlineTerminal className={styles.postAdditionButtonIcons}/>
                        Upload metadata</button>
                </div>
                <div className={styles.submitButtonWrapper}>
                    <button className={styles.submitButton}>Publish</button>
                </div>
            </div>
        </Card>
    )
}