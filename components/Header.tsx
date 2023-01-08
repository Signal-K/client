import Link from "next/link";
import React from "react";
import styles from '../styles/Header.module.css';
import SignInButton from "./SignInButton";

export default function Header () {
    return (
        <>
            <div className={styles.headerContainer}>
                <div>
                    <Link href={'/'}>
                        <img src="/logo.png" alt='logo' className={styles.logo}/>
                    </Link>
                </div>
                <div className={styles.right}>
                    <SignInButton />
                </div>
            </div>
            <div style={{ height: 64 }} />
        </>
    )
}