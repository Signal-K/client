import Card from "./Card";
import Avatar from "./Avatar";
import styles from '../../styles/social-graph/PostCard.module.css';
import { HiOutlineHeart, HiOutlineSpeakerphone, HiOutlineTrash, HiOutlineShare, HiOutlineCamera, HiOutlineDotsHorizontal, HiOutlineSaveAs, HiOutlineBell, HiEyeOff } from 'react-icons/hi'
import ClickOutHandler from 'react-clickout-handler';
import { useState } from "react";
import Link from "next/link";

export default function PostCard () {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    function openDropdown(e) {
        e.stopPropagation();
        setDropdownOpen(true);
    }
    function handleClickOutsideDropdown (e) {
        e.stopPropagation();
        setDropdownOpen(false);
    }

    return (
        <Card>
            <div className={styles.postContentsBoxTop}>
                <div>
                    <Link href={'/profile'}>
                        <span className={styles.avatarPointer}>
                            <Avatar />
                        </span>
                    </Link>
                </div>
                <div className={styles.thing1}>
                    <p><Link href={'/profile'}><span className={styles.postContentsAuthor}>Liam Arbuckle</span></Link> shared a <a className={styles.postContentsPostLink}> post: </a></p>
                    <p className={styles.postContentsTimeAgo}>2 hours ago</p>
                </div>
                <div>
                    {!dropdownOpen && (
                        <button className={styles.postMetaButton} onClick={openDropdown}>
                            <HiOutlineDotsHorizontal />
                        </button>
                    )}
                    {dropdownOpen && (
                        <button className={styles.postMetaButton} onClick={handleClickOutsideDropdown}>
                            <HiOutlineDotsHorizontal />
                        </button>
                    )}
                    <ClickOutHandler onClickOut={handleClickOutsideDropdown}>
                        <div className={styles.dropDownWrapper}>
                            {dropdownOpen && (
                                <div className={styles.dropDownWrapperInner}>
                                    <a className={styles.dropDownIconWrapper} href=''><HiOutlineSaveAs className={styles.dropDownIcon} />Save post</a>
                                    <a className={styles.dropDownIconWrapper} href=''><HiOutlineBell className={styles.dropDownIcon} />Get notified</a> {/* Additional updates/data/citations */}
                                    <a className={styles.dropDownIconWrapper} href=''><HiEyeOff className={styles.dropDownIcon} />Hide post</a>
                                    <a className={styles.dropDownIconWrapper} href=''><HiOutlineTrash className={styles.dropDownIcon} />Delete post</a> {/* Delete from frontend, will still be there privately on your Lens profile */}
                                    {/* 
                                        * Add to dataset/collection
                                        * Inspect dataset
                                        * Clone datapoint
                                        * Remix (in your own playground, either existing or new)
                                        * Reference (in a document/article)
                                        All these action items are stored on-chain!
                                    */}
                                </div>
                            )}
                        </div>
                    </ClickOutHandler>
                </div>
            </div>
            <div>
                <p className={styles.postContentsPostText}>Lorem ipsum doler  sit ameet, consectetur adipisicing dol enur im eit heyt gummi thiguh benn hesuoghbseig esgijkhesuogahbesanag asregu heg gehg egw g ds gds g dsg sd g eskjgbse gse g sed gsed gsed g wers ag re hgaer h dsf ghserdahgsrh dsrhdfashfd h fd hsrfd h r hardf h sfdh df h df h fdh f hadfa jh gcf hj dfh  fdh hfd h fd hdf h fd h fdhdf  hfd h dfr hfd h fd h fdh dra  hgfd fh df h haettd htd </p>
                <div className={styles.postContentsImage}><img src='https://images.unsplash.com/photo-1506261423908-ea2559c1f24c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1484&q=80' /></div>
            </div>
            <div className={styles.postActionsButtonsWrapper}> {/* Post action buttons section */}
                <button className={styles.postActionButtonsIcons}><HiOutlineHeart /> 72 </button>
                <button className={styles.postActionButtonsIcons}><HiOutlineSpeakerphone /> 21 </button>
                <button className={styles.postActionButtonsIcons}><HiOutlineShare /> 2 </button>
            </div>
            <div className={styles.postCommentSectionWrapper}> {/* Commenting section */}
                <div>
                    <Avatar />
                </div>
                <div className={styles.postCommentSectionContentWrapper}>
                    <textarea className={styles.postCommentSectionTextArea} placeholder="Leave a commment"></textarea>
                    <button className={styles.postCommentSectionButton}><HiOutlineCamera /></button>
                </div>
            </div>
        </Card>
    );
}