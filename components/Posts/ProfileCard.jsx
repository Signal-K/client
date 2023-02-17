import React, { useEffect, useState } from "react"
import UtterancesComments from "../Lens/Utterances"
import Card from "../Card"
import FriendInfo from "../FriendInfo"
import PostCard from "../PostCard"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"

export function ProfileContent ({ activeTab, userId }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        if (!userId) { return; };
        userPosts();
    }, [userId]);

    async function userPosts(userId) {
        const { data } = await supabase.from('posts')
            .select('id, content, created_at, media, author') // profiles(id, avatar_url, username)')
            .eq('author', userId) // session?.user?.id)
            .then(result => { console.log(result); } );
        return data;
    };

    async function userProfile(userId) {
        const { data } = await supabase.from('profiles')
            .select()
            .eq('id', userId);
        return data[0];
    };

    return (
        <div>
            {activeTab === 'posts' && (
                <div>
                <PostCard />
                {/*<PostCard key = { postMessage.id } { ..post } />*/}
                </div>
            )}
            {activeTab === 'about' && (
                <div>
                    <Card noPadding={false}>
                    <h2 className="text-3xl mb-2">About me</h2>
                    <p className="mb-2 text-sm">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut doloremque harum maxime mollitia perferendis praesentium quaerat. Adipisci, delectus eum fugiat incidunt iusto molestiae nesciunt odio porro quae quaerat, reprehenderit, sed.</p>
                    <p className="mb-2 text-sm">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet assumenda error necessitatibus nesciunt quas quidem quisquam reiciendis, similique. Amet consequuntur facilis iste iure minima nisi non praesentium ratione voluptas voluptatem?</p>
                    </Card>
                    <UtterancesComments />
                </div>
            )}
            {activeTab === 'friends' && (
            <div>
                <Card noPadding={false}>
                <h2 className="text-3xl mb-2">Friends</h2>
                <div className="">
                    <div className="border-b border-b-gray-100 p-4 -mx-4">
                    <FriendInfo />
                    </div>
                    <div className="border-b border-b-gray-100 p-4 -mx-4">
                    <FriendInfo />
                    </div>
                    <div className="border-b border-b-gray-100 p-4 -mx-4">
                    <FriendInfo />
                    </div>
                    <div className="border-b border-b-gray-100 p-4 -mx-4">
                    <FriendInfo />
                    </div>
                    <div className="border-b border-b-gray-100 p-4 -mx-4">
                    <FriendInfo />
                    </div>
                    <div className="border-b border-b-gray-100 p-4 -mx-4">
                    <FriendInfo />
                    </div>
                    <div className="border-b border-b-gray-100 p-4 -mx-4">
                    <FriendInfo />
                    </div>
                </div>
                </Card>
            </div>
            )}
            {activeTab === 'photos' && (
            <div>
                <Card noPadding={false}>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-md overflow-hidden h-48 flex items-center shadow-md">
                    <img src="https://images.unsplash.com/photo-1601581875039-e899893d520c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" alt=""/>
                    </div>
                    <div className="rounded-md overflow-hidden h-48 flex items-center shadow-md">
                    <img src="https://images.unsplash.com/photo-1563789031959-4c02bcb41319?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" alt=""/>
                    </div>
                    <div className="rounded-md overflow-hidden h-48 flex items-center shadow-md">
                    <img src="https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt=""/>
                    </div>
                    <div className="rounded-md overflow-hidden h-48 flex items-center shadow-md">
                    <img src="https://images.unsplash.com/photo-1601581874834-3b6065645e07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" alt=""/>
                    </div>
                </div>
                </Card>
            </div>
            )}
        </div>
    );
};