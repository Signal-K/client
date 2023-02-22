import type { NextPage } from "next";
import styles from '../../styles/Home.module.css';
import { Text, Spacer } from '@nextui-org/react';

const JournalHome: NextPage = () => {
    return (
        <>
            <Text h2>All extracted articles</Text>
            <Spacer y={1} />
            <Text size="$lg">
                Feel free to add more articles to extract metadata from
            </Text>
        </>
    );
};