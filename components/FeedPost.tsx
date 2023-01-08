import { MediaRenderer } from '@thirdweb-dev/react';
import Link from 'next/link';
import React from 'react';
import { ExplorePublicationsQuery } from '../graphql/generated';
import styles from '../styles/FeedPost.module.css';
import { useComments } from '@lens-protocol/react';

type Props = {
    publication: ExplorePublicationsQuery["explorePublications"]["items"][0];
}

export default function FeedPost ({publication}: Props) {
    var postId = publication.id;

    return (
        <div className={styles.feedPostContainer}>
            <div className={styles.feedPostHeader}>
                <MediaRenderer
                    // @ts-ignore
                    src={publication?.profile?.picture?.original?.url || ""}
                    alt={publication.profile.name || publication.profile.handle}
                    className={styles.feedPostProfilePicture}
                />
                <Link href={`/profile/${publication.profile.handle}`} className={styles.feedPostProfileName}>
                    {publication.profile.name || publication.profile.handle}
                </Link>
            </div>
            <div className={styles.feedPostContent}>
                <h3 className={styles.feedPostContentTitle}>{publication.metadata.name}</h3>
                <p className={styles.feedPostContentDescription}>{publication.metadata.content}</p>

                { publication.metadata.media?.length > 0 && (
                    <MediaRenderer
                        src={publication.metadata.media[0].original.url}
                        alt={publication.metadata.name || ""}
                        className={styles.feedPostContentImage}
                    />
                )}
            </div>
            <div className={styles.feedPostFooter}>
                <p>{publication.stats.totalAmountOfCollects} Collects</p>
                <p>{publication.stats.totalAmountOfComments} Comments</p>
                <p>{publication.stats.totalAmountOfMirrors} Mirrors</p>
            </div>
        </div>
    );
};
