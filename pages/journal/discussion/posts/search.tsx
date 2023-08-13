import PostList from '../../../../components/Journal/Discussion/PostList';
import getPosts from '../../../../utils/discussion/getPosts';

export default function Search({ posts, count }) {
    return (
        <PostList posts={posts} totalPosts={count}></PostList>
    )
}

export async function getServerSideProps(context) {
    const { posts, count } = await getPosts(context)

    return {
        props: {
            posts, count
        },
    };
}