import NavigationCard from "../Sidebar"
import Card from "./Card"
import styles from '../../styles/social-graph/PostForm.module.css';
import { HiUserGroup, HiOutlineMap, HiOutlinePuzzle, HiOutlineTag, HiOutlineTerminal } from 'react-icons/hi';

export default function PostFormCard () {
    return (
        <Card>
            <div className={styles.postFormWrapper}>
                <div>
                    <div className={styles.avatarWrapper}><img src="https://media.licdn.com/dms/image/D5603AQGuBaGYxDFueQ/profile-displayphoto-shrink_200_200/0/1674356082766?e=1680134400&v=beta&t=gXTx1iMfVws7De8w7QormN7K3GSmYDsj1fOV1-Jl2Vg" /></div>
                </div>
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