import LensPostFeed from "../../../components/Lens/FeedPost";
//import { PublicationMainFocus, PublicationSortCriteria, useExploreProfilesQuery } from "@lens-protocol/api-bindings";
import { PublicationMainFocus, PublicationSortCriteria, useExplorePublicationsQuery } from "../../../graphql/generated";
import styles from '../../../styles/Lens/Home.module.css';
import { useState, useEffect } from "react";
import { Flex, Text, IconButton } from '@chakra-ui/react';

import { useSession } from "@supabase/auth-helpers-react";

export default function Home () {
    const session = useSession();
    const { isLoading, error, data } = useExplorePublicationsQuery ({
        request: {
            sortCriteria: PublicationSortCriteria.Latest,
            metadata: {
                //mainContentFocus: PublicationSortCriteria.Latest,
            },
        },
    }, {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });

    if (isLoading) { return ( <div className={styles.container}>Loading</div> ); };
    if (error) { return ( <div className={styles.container}>Error</div>); };

    return (
        <Flex w='100%'>
          {/* Taken from the old version of `wb3-11` branch on signal-k/client <Sidebar />*/}
            <Flex
                pos="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
            >
            <div className={styles.container}>
              <div className={styles.postsContainer}>
                {data?.explorePublications.items.map((publication) => (
                  <LensPostFeed publication={publication} key={publication.id} />
                ))}
              </div>
            </div>
          </Flex>
        </Flex>
    );
}