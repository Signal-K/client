import React from "react";
import { MultiClassificationFeed } from "../../components/Content/ClassificationFeed";
import PostCard from "../../components/Content/Classify/PostCard";

const samplePosts = [
    {
      _id: 'post1',
      parentId: null,
      text: 'This is the first sample post.',
      author: {
        name: 'Alice',
        image: '/path-to-alice-image.jpg',
        id: 'user1',
      },
      community: {
        id: 'community1',
        name: 'Sample Community',
        image: '/path-to-community-image.jpg',
      },
      createdAt: '2024-01-23T10:00:00.000Z',
      children: [
        {
          author: {
            image: '/path-to-bob-image.jpg',
          },
        },
      ],
    },
    {
      _id: 'post2',
      parentId: 'post1',
      text: 'This is a comment on the first post.',
      author: {
        name: 'Bob',
        image: '/path-to-bob-image.jpg',
        id: 'user2',
      },
      community: {
        id: 'community1',
        name: 'Sample Community',
        image: '/path-to-community-image.jpg',
      },
      createdAt: '2024-01-23T10:30:00.000Z',
      children: [], 
    },
  ];

export default function FullFeedPageTest() {
    return (
        <div>
            <section className='mt-9 flex flex-col gap-10'>
      {samplePosts.length === 0 ? (
        <p className='no-result'>No threads found</p>
      ) : (
        <>
          {samplePosts.map((post) => (
            <PostCard
              key={post._id}
              id={post._id}
              currentUserId="user123" // Replace with the actual current user ID
              parentId={post.parentId}
              content={post.text}
              author={post.author}
              community={post.community}
              createdAt={post.createdAt}
              comments={post.children}
            />
          ))}
        </>
      )}
    </section>
            <MultiClassificationFeed />
        </div>
    );
};