import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient, SupabaseClient } from "@supabase/auth-helpers-react";
import CardForum, { CommentItem, RoverContentCard } from "./DiscussCard";

export default function ClassificationFeed({ custommaxWidth = '85%' }) {
    const supabase: SupabaseClient = useSupabaseClient();
    const session = useSession();

    const [posts, setPosts] = useState([]);
    // const [profile, setProfile] = useState(null);
    const [planetPosts, setPlanetPosts] = useState([]);
 
    useEffect(() => {
        fetchPosts();
      }, []);  
    
    useEffect(() => {
        if (planetPosts.length > 0) {
          console.log("Comments: ", planetPosts.flatMap((post) => post.comments));
        }
    }, []);

    async function fetchPosts() {
        const postsResponse = await supabase
        .from("posts_duplicates")
        .select(
          "id, content, created_at, planets2, planetsss(id, temperature), profiles(id, avatar_url, full_name, username)"
        )
        .order('created_at', { ascending: false });
    
      const postIds = postsResponse.data.map((post) => post.id);
      const commentsResponse = await supabase
        .from("comments")
        .select("id, content, created_at, profiles(id, avatar_url, username), post_id") // Add the closing parenthesis for profiles select
        .in("post_id", postIds)
        .order("created_at", { ascending: true });

      const commentsByPostId: { [postId: number]: Comment[] } = commentsResponse.data.reduce((acc, comment) => {
        const postId = comment.post_id;
        if (!acc[postId]) {
          acc[postId] = [];
        }
        acc[postId].push(comment);
        return acc;
      }, {});
  
      // const postsWithComments: Post[] = postsResponse.data.map((post) => ({
      const postsWithComments = postsResponse.data.map((post) => ({
        ...post,
        comments: commentsByPostId[post.id] || [],
      }));
  
      setPosts(postsWithComments);
    }

    return (
      <ul
        aria-label="Nested user feed"
        role="feed"
        className="relative flex flex-col gap-12 py-12 pl-8 before:absolute before:top-0 before:left-8 before:h-full before:-translate-x-1/2 after:absolute after:top-6 after:left-8 after:bottom-6 after:-translate-x-1/2"
        style={{ maxWidth: custommaxWidth, margin: 'auto' }}
      >
        {posts.map((post) => (
          <li key={post.id} role="article" className="relative pl-8">
            <CardForum {...post} />
          </li>
        ))}
      </ul>
    );
};

export function FactionFeed({ custommaxWidth = '85%', factionId }) {
  const supabase: SupabaseClient = useSupabaseClient();
  const session = useSession();

  const [posts, setPosts] = useState([]);
  // const [profile, setProfile] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);

  useEffect(() => {
      fetchPosts();
    }, []);  
  
  useEffect(() => {
      if (planetPosts.length > 0) {
        console.log("Comments: ", planetPosts.flatMap((post) => post.comments));
      }
  }, []);

  async function fetchPosts() {
      const postsResponse = await supabase
      .from("posts_duplicates")
      .select(
        "id, content, created_at, planets2, faction, planetsss(id, temperature), profiles(id, avatar_url, full_name, username)"
      )
      .eq('faction', factionId)
      .order('created_at', { ascending: false });
  
    const postIds = postsResponse.data.map((post) => post.id);
    const commentsResponse = await supabase
      .from("comments")
      .select("id, content, created_at, profiles(id, avatar_url, username), post_id") // Add the closing parenthesis for profiles select
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    const commentsByPostId: { [postId: number]: Comment[] } = commentsResponse.data.reduce((acc, comment) => {
      const postId = comment.post_id;
      if (!acc[postId]) {
        acc[postId] = [];
      }
      acc[postId].push(comment);
      return acc;
    }, {});

    // const postsWithComments: Post[] = postsResponse.data.map((post) => ({
    const postsWithComments = postsResponse.data.map((post) => ({
      ...post,
      comments: commentsByPostId[post.id] || [],
    }));

    setPosts(postsWithComments);
  }

  return (
    <ul
      aria-label="Nested user feed"
      role="feed"
      className="relative flex flex-col gap-12 py-12 pl-8 before:absolute before:top-0 before:left-8 before:h-full before:-translate-x-1/2 after:absolute after:top-6 after:left-8 after:bottom-6 after:-translate-x-1/2"
      style={{ maxWidth: custommaxWidth, margin: 'auto' }}
    >
      {posts.map((post) => (
        <li key={post.id} role="article" className="relative pl-8">
          <RoverContentCard {...post} />
        </li>
      ))}
    </ul>
  );
};

export function MultiClassificationFeed({ custommaxWidth = '85%' }) {
  const supabase: SupabaseClient = useSupabaseClient();
  const session = useSession();

  const [posts, setPosts] = useState([]);
  const [planetPosts, setPlanetPosts] = useState([]);

  useEffect(() => {
      fetchPosts();
  }, []);

  useEffect(() => {
      if (planetPosts.length > 0) {
          console.log("Comments: ", planetPosts.flatMap((post) => post.comments));
      }
  }, []);

  async function fetchPosts() {
      const postsResponse = await supabase
          .from("posts_duplicates")
          .select(
              "id, content, created_at, planets2, planetsss(id, temperature), profiles(id, avatar_url, full_name, username)"
          )
          .order('created_at', { ascending: false });

      const roverImagePostsResponse = await supabase
          .from("contentROVERIMAGES")
          .select("id, content, created_at")
          .order('created_at', { ascending: false });

      const combinedPosts = [...postsResponse.data, ...roverImagePostsResponse.data];

      const sortedPosts = combinedPosts.sort((a: { created_at: string }, b: { created_at: string }) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPosts(sortedPosts);
  }

  return (
      <ul
          aria-label="Nested user feed"
          role="feed"
          className="relative flex flex-col gap-12 py-12 pl-8 before:absolute before:top-0 before:left-8 before:h-full before:-translate-x-1/2 after:absolute after:top-6 after:left-8 after:bottom-6 after:-translate-x-1/2"
          style={{ maxWidth: custommaxWidth, margin: 'auto' }}
      >
          {posts.map((post) => (
              <li key={post.id} role="article" className="relative pl-8">
                  <CardForum {...post} />
              </li>
          ))}
      </ul>
  );
}

export function ClassificationFeedDemo() {
  return (
    <div className="w-[1359px] h-[1161px] flex-col justify-start items-center gap-[23px] inline-flex">
    <div className="self-stretch justify-center items-center gap-[60px] inline-flex">
        <div className="justify-center items-center gap-[69px] flex">
            <div className="w-[946px] h-[67.03px] flex-col justify-center items-center inline-flex">
                <div className="text-center text-black text-[66.67px] font-normal font-['Anonymous Pro'] tracking-[21.33px]">FEED</div>
                <div className="w-[946px] h-[0px] border-4 border-black"></div>
            </div>
        </div>
    </div>
    <div className="grow shrink basis-0 pl-10 py-5 bg-neutral-50 rounded-[15px] justify-center items-end inline-flex">
        <div className="w-[1312px] self-stretch px-2.5 py-5 rounded-[15px] justify-center items-start flex">
            <div className="self-stretch py-[26px] flex-col justify-start items-start gap-[220px] inline-flex">
                <div className="w-[50px] h-[50px] relative rounded-full">
                    <div className="w-[50px] h-[50px] left-0 top-0 absolute bg-zinc-300 rounded-full" />
                    <img className="w-[50px] h-[50px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/50x50" />
                </div>
                <div className="w-[50px] h-[50px] relative rounded-full">
                    <div className="w-[50px] h-[50px] left-0 top-0 absolute bg-zinc-300 rounded-full" />
                    <img className="w-[50px] h-[50px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/50x50" />
                </div>
            </div>
            <div className="grow shrink basis-0 self-stretch flex-col justify-start items-end gap-2.5 inline-flex">
                <div className="self-stretch h-[261px] p-4 flex-col justify-start items-center flex">
                    <div className="w-[1180px] h-[70px] px-5 justify-center items-center gap-5 inline-flex">
                        <div className="w-[170px] self-stretch text-zinc-950 text-[32px] font-medium font-['Inter'] leading-tight">Steve Jobs</div>
                        <div className="grow shrink basis-0 self-stretch justify-start items-center gap-[47px] flex">
                            <div className="w-[237px] h-[25px] text-right text-zinc-500 text-2xl font-normal font-['Inter'] leading-tight">Created New Thread</div>
                        </div>
                        <div className="px-5 justify-center items-center gap-3.5 flex">
                            <div className="justify-start items-start flex">
                                <div className="justify-start items-start gap-2.5 flex">
                                    <div className="p-2 border border-neutral-300 justify-center items-start flex">
                                        <div className="w-[30px] h-[30px] relative" />
                                    </div>
                                </div>
                            </div>
                            <div className="justify-start items-center gap-2.5 flex">
                                <div className="justify-start items-start gap-2.5 flex">
                                    <div className="p-2 border border-neutral-300 justify-center items-start flex">
                                        <div className="w-[30px] h-[30px] relative" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="self-stretch p-2 border border-neutral-300 justify-center items-start gap-2 flex">
                            <div className="w-[30px] h-[30px] relative" />
                        </div>
                        <div className="w-[147px] self-stretch px-1.5 justify-center items-center gap-[47px] flex">
                            <div className="w-[135px] h-[25px] text-right text-zinc-500 text-2xl font-normal font-['Inter'] leading-tight">2 hours ago</div>
                        </div>
                    </div>
                    <div className="self-stretch h-[159px] pl-[35px] pr-[26px] pt-3.5 pb-[25px] flex-col justify-start items-start gap-2.5 flex">
                        <div className="self-stretch text-black text-2xl font-normal font-['Inter'] leading-[30px]">As seen in the jupyter snippet where the period is set (which can be observed in the binned data, allowing us to phase fold the dips to showcase a potential/likely transit event), we have a consistent dipping occur over a period of ~30 days, with a similar amount of light being blocked out each time. This body is likely to be extremely close to its parent star and as such will likely be tidally locked.</div>
                    </div>
                </div>
                <div className="self-stretch h-[171px] p-4 flex-col justify-start items-center flex">
                    <div className="w-[1180px] h-[70px] px-5 justify-center items-center gap-5 inline-flex">
                        <div className="text-zinc-950 text-[32px] font-medium font-['Inter'] leading-tight">Ben Fraklin</div>
                        <div className="grow shrink basis-0 self-stretch justify-start items-center gap-[47px] flex">
                            <div className="w-[237px] h-[25px] text-zinc-500 text-2xl font-normal font-['Inter'] leading-tight">Replied </div>
                        </div>
                        <div className="w-[147px] self-stretch px-1.5 justify-center items-center gap-[47px] flex">
                            <div className="w-[135px] h-[25px] text-right text-zinc-500 text-2xl font-normal font-['Inter'] leading-tight">2 hours ago</div>
                        </div>
                    </div>
                    <div className="self-stretch h-[69px] pl-[35px] pr-[26px] pt-3.5 pb-[25px] flex-col justify-start items-start gap-2.5 flex">
                        <div className="self-stretch text-black text-2xl font-normal font-['Inter'] leading-[30px]">That is quite the discovery you have made there sir!</div>
                    </div>
                </div>
                <div className="pr-4 justify-end items-start gap-2.5 inline-flex">
                    <div className="w-[70px] self-stretch px-2.5 py-[22px] justify-center items-start gap-2.5 flex">
                        <div className="w-[50px] h-[50px] relative rounded-full">
                            <div className="w-[50px] h-[50px] left-0 top-0 absolute bg-zinc-300 rounded-full" />
                            <img className="w-[50px] h-[50px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/50x50" />
                        </div>
                    </div>
                    <div className="pr-4 py-4 flex-col justify-start items-end inline-flex">
                        <div className="w-[1069px] h-[70px] px-5 justify-center items-center gap-5 inline-flex">
                            <div className="w-[170px] self-stretch text-zinc-950 text-[32px] font-medium font-['Inter'] leading-tight">Steve Jobs</div>
                            <div className="grow shrink basis-0 self-stretch justify-start items-center gap-[47px] flex">
                                <div className="w-[237px] h-[25px] text-zinc-500 text-2xl font-normal font-['Inter'] leading-tight">Replied</div>
                            </div>
                            <div className="w-[152px] self-stretch px-1.5 justify-center items-center gap-[47px] flex">
                                <div className="w-[140px] h-[25px] text-right text-zinc-500 text-2xl font-normal font-['Inter'] leading-tight">1 hour ago</div>
                            </div>
                        </div>
                        <div className="self-stretch h-[69px] pl-5 pr-[26px] pt-3.5 pb-[25px] flex-col justify-start items-start gap-2.5 flex">
                            <div className="self-stretch text-black text-2xl font-normal font-['Inter'] leading-[30px]">Thankyou, i cannot believe i am speaking with the real Benjamin Franklin!</div>
                        </div>
                    </div>
                </div>
                <div className="pr-4 justify-end items-start gap-2.5 inline-flex">
                    <div className="w-[70px] self-stretch px-2.5 py-[22px] justify-center items-start gap-2.5 flex">
                        <div className="w-[50px] h-[50px] relative rounded-full">
                            <div className="w-[50px] h-[50px] left-0 top-0 absolute bg-zinc-300 rounded-full" />
                            <img className="w-[50px] h-[50px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/50x50" />
                        </div>
                    </div>
                    <div className="pr-4 py-4 flex-col justify-start items-end inline-flex">
                        <div className="w-[1069px] h-[70px] px-5 justify-center items-center gap-5 inline-flex">
                            <div className="text-zinc-950 text-[32px] font-medium font-['Inter'] leading-tight">Ben Franklin</div>
                            <div className="grow shrink basis-0 self-stretch justify-start items-center gap-[47px] flex">
                                <div className="w-[237px] h-[25px] text-zinc-500 text-2xl font-normal font-['Inter'] leading-tight">Replied</div>
                            </div>
                            <div className="w-[152px] self-stretch px-1.5 justify-center items-center gap-[47px] flex">
                                <div className="w-[140px] h-[25px] text-right text-zinc-500 text-2xl font-normal font-['Inter'] leading-tight">1 hour ago</div>
                            </div>
                        </div>
                        <div className="self-stretch h-[69px] pl-5 pr-[26px] pt-3.5 pb-[25px] flex-col justify-start items-start gap-2.5 flex">
                            <div className="self-stretch text-black text-2xl font-normal font-['Inter'] leading-[30px]">Lol</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div className="h-[102px] p-4 bg-neutral-50 rounded-[15px] flex-col justify-start items-center gap-2.5 flex">
        <div className="self-stretch h-[70px] justify-between items-center inline-flex">
            <div className="grow shrink basis-0 self-stretch px-5 justify-between items-center flex">
                <div className="w-[50px] h-[50px] relative rounded-full">
                    <div className="w-[50px] h-[50px] left-0 top-0 absolute bg-zinc-300 rounded-full" />
                    <img className="w-[50px] h-[50px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/50x50" />
                </div>
                <div className="w-[1084px] h-[46px] px-4 py-2 bg-white border border-zinc-200 justify-start items-center flex">
                    <div className="w-[293px] text-zinc-500 text-2xl font-normal font-['Inter'] leading-tight">Add a comment..</div>
                </div>
                <div className="h-[46px] bg-white justify-center items-center gap-2.5 flex">
                    <div className="justify-start items-start gap-2.5 flex">
                        <div className="p-2 border border-neutral-300 justify-center items-start flex">
                            <div className="w-[30px] h-[30px] relative" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
  )
}

export function ClassificationFeedForIndividualPlanet(planetId, backgroundColorSet) {
  const supabase: SupabaseClient = useSupabaseClient();
  const session = useSession();

  const [posts, setPosts] = useState([]);
  // const [profile, setProfile] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);

  useEffect(() => {
      fetchPosts();
    }, []);  
  
  useEffect(() => {
      if (planetPosts.length > 0) {
        console.log("Comments: ", planetPosts.flatMap((post) => post.comments));
      }
  }, []);

  async function fetchPosts() {
    try {
      const postsResponse = await supabase
        .from("classifications")
        // .select("id, content, created_at, author, anomaly, basePlanets, profiles(id, avatar_url, full_name, username)")
        .select("id, created_at, content, anomaly, media, profiles(id, avatar_url, full_name, username)")
        .eq('anomaly', planetId.planetId.id)
        .order('created_at', { ascending: false });
  
      if (postsResponse.error || !postsResponse.data) {
        console.error("Error fetching posts:", postsResponse.error);
        return;
      }
  
      const postIds = postsResponse.data.map((post) => post.id);
  
      const commentsResponse = await supabase
        .from("comments")
        .select("id, content, created_at, profiles(id, avatar_url, username), post_id")
        .in("post_id", postIds)
        .order("created_at", { ascending: true });
  
      const commentsByPostId = commentsResponse.data.reduce((acc, comment) => {
        const postId = comment.post_id;
        if (!acc[postId]) {
          acc[postId] = [];
        }
        acc[postId].push(comment);
        return acc;
      }, {});
  
      const postsWithComments = postsResponse.data.map((post) => ({
        ...post,
        comments: commentsByPostId[post.id] || [],
      }));
  
      setPosts(postsWithComments);
      // console.log(posts);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
    }
  }  

  return (
      <div className="flex flex-col items-center gap-4 py-5" style={{ maxWidth: '100%', margin: 'auto' }}>
          {posts.map((post) => (
              <>
                <CardForum key={post.id} {...post} backgroundColor={backgroundColorSet} />
                <p>{post.planetId}</p>
              </>
          ))}
      </div>
  );
};

export function ClassificationFeedForIndividualPlanetDuplicates(planetId) {
  const supabase: SupabaseClient = useSupabaseClient();
  const session = useSession();

  const [posts, setPosts] = useState([]);
  // const [profile, setProfile] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);

  useEffect(() => {
      fetchPosts();
    }, []);  
  
  useEffect(() => {
      if (planetPosts.length > 0) {
        console.log("Comments: ", planetPosts.flatMap((post) => post.comments));
      }
  }, []);

  async function fetchPosts() {
    try {
      const postsResponse = await supabase
        .from("posts_duplicates")
        .select(
          "id, anomaly, content, created_at, planets2, planetsss(id, temperature), profiles(id, avatar_url, full_name, username)"
        )
        // .eq('anomaly', planetId) // 'planets2', planetId
        .order('created_at', { ascending: false });
  
      if (postsResponse.error || !postsResponse.data) {
        console.error("Error fetching posts:", postsResponse.error);
        return;
      }
  
      const postIds = postsResponse.data.map((post) => post.id);
  
      const commentsResponse = await supabase
        .from("comments")
        .select("id, content, created_at, profiles(id, avatar_url, username), post_id")
        .in("post_id", postIds)
        .order("created_at", { ascending: true });
  
      const commentsByPostId = commentsResponse.data.reduce((acc, comment) => {
        const postId = comment.post_id;
        if (!acc[postId]) {
          acc[postId] = [];
        }
        acc[postId].push(comment);
        return acc;
      }, {});
  
      const postsWithComments = postsResponse.data.map((post) => ({
        ...post,
        comments: commentsByPostId[post.id] || [],
      }));
  
      setPosts(postsWithComments);
      console.log(posts);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
    }
  }  

  return (
      <div className="flex flex-col items-center gap-4 py-2" style={{ maxWidth: '100%', margin: 'auto' }}>
          {posts.map((post) => (
              <>
                <CardForum key={post.id} {...post} />
                <p>{post.planetId}</p>
              </>
          ))}
      </div>
  );
};