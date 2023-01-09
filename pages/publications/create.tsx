import { Web3Button } from '@thirdweb-dev/react';
import React, { useState } from 'react';
import styles from '../../styles/Create.module.css';
import { useCreatePost } from '../../lib/useCreatePost';
import { LENS_CONTRACT_ABI, LENS_CONTRACT_ADDRESS } from '../../constants/contracts';

export default function Create() {
    const [image, setImage] = useState<File | null>(null);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [classificationMetadata, setClassificationMetadata] = useState<string>(""); // Token id (rendering template will add the contract address)
    const [content, setContent] = useState('');
    const { mutateAsync: createPost } = useCreatePost();

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.inputContainer}>
                    <input type='file' onChange={(e) => {
                        if (e.target.files) {
                            setImage(e.target.files[0]);
                        }
                    }} />
                </div>
                <div className={styles.inputContainer}>
                    <input
                        type='text'
                        placeholder='Title'
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className={styles.inputContainer}>
                    <textarea 
                        placeholder='Description'
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className={styles.inputContainer}>
                    <textarea 
                        placeholder='Content'
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
                <div className={styles.inputContainer}>
                    <input
                        type='text'
                        placeholder='NFT id'
                        onChange={(e) => setClassificationMetadata(e.target.value)}
                    />
                </div>
                <Web3Button
                    contractAddress={LENS_CONTRACT_ADDRESS}
                    contractAbi={LENS_CONTRACT_ABI}
                    action={ async () => {
                        if (!image) return;
                        return await createPost({
                            image,
                            title,
                            description,
                            content,
                        })}
                    } 
                >Create Post</Web3Button>
            </div>
        </div>
    )
};