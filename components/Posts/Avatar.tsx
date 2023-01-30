import styles from '../../styles/social-graph/PostForm.module.css';

export default function Avatar () {
    return (
        <div>
            <div className={styles.avatarWrapper}><img src="https://media.licdn.com/dms/image/D5603AQGuBaGYxDFueQ/profile-displayphoto-shrink_200_200/0/1674356082766?e=1680134400&v=beta&t=gXTx1iMfVws7De8w7QormN7K3GSmYDsj1fOV1-Jl2Vg" /></div>
        </div>
    )
}

export function BigAvatar () {
    return (
        <div>
            <div className={styles.bigAvatarWrapper}><img src="https://media.licdn.com/dms/image/D5603AQGuBaGYxDFueQ/profile-displayphoto-shrink_200_200/0/1674356082766?e=1680134400&v=beta&t=gXTx1iMfVws7De8w7QormN7K3GSmYDsj1fOV1-Jl2Vg" /></div>
        </div>
    )
}