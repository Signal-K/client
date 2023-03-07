import { MediaRenderer } from '@thirdweb-dev/react';
import Link from 'next/link';
import React from 'react';
import { ExplorePublicationsQuery } from '../../graphql/generated';
import styles from '../../styles/Lens/FeedPost.module.css';
import { useComments } from '@lens-protocol/react'; // Visit https://docs.lens.xyz/docs/use-comments

type Props = {
    publication: ExplorePublicationsQuery["explorePublications"]["items"][0];
}

export default function LensPostFeed ({ publication }: Props) {
    var postId = publication.id;

    return (
        <div className={styles.feedPostContainer}>
            <div className={styles.feedPostHeader}>
                <MediaRenderer 
                    // @ts-ignore
                    src={publication?.profile?.picture?.original?.url || ""}
                    alt={publication.profile.name || publication.profile.handle}
                    className='w-3 h-3 rounded-full'
                />
                <Link href={`/profile/${publication.profile.handle}`} className={styles.feedPostProfileName}>
                    {publication.profile.name || publication.profile.handle}
                </Link>
            </div>
            <div className={styles.feedPostContent}>
                <h3 className={styles.feedPostContentTitle}>{publication.metadata.name}</h3>
                <p className={styles.feedPostContentDescription}>{publication.metadata.content}</p>

                {(publication.metadata.image || publication.metadata.media?.length > 0) && (
                    <MediaRenderer
                        src={publication.metadata.image || publication.metadata.media[0].original.url}
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