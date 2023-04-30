import Layout from "../../components/Layout";
import PostFormCard from "../../components/PostFormCard";
import PostCard from "../../components/PostCard";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../../context/UserContext";
// import { StarSystem } from 'stellardream';
// import LoginPage from "../login/social-login";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Login from "../login";
TimeAgo.addDefaultLocale(en);

export default function SocialGraphHome () {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchPosts();
    // const starSystem = new StarSystem(1549748672440);
    // console.log(JSON.stringify(starSystem, null, 2));
    var myNumber1 = Math.floor(Math.random() * 10);
    var myNumber2 = Math.floor(Math.random() * 10);
    var myNumber3 = Math.floor(Math.random() * 10);
    var myNumber4 = Math.floor(Math.random() * 10);
    var myNumber5 = Math.floor(Math.random() * 10);
    var myNumber6 = Math.floor(Math.random() * 10);
    var myNumber7 = Math.floor(Math.random() * 10);
    var myNumber8 = Math.floor(Math.random() * 10);
    var myNumber9 = Math.floor(Math.random() * 10);
    var myNumber10 = Math.floor(Math.random() * 10);
    var myNumber11 = Math.floor(Math.random() * 10);
    var myNumber12 = Math.floor(Math.random() * 10);
    var myNumber13 = Math.floor(Math.random() * 10);
    var myNumber = myNumber1.toString() + myNumber2.toString() + myNumber3.toString() + myNumber4.toString() + myNumber5.toString() + myNumber6.toString() + myNumber7.toString() + myNumber8.toString() + myNumber9.toString() + myNumber10.toString() + myNumber11.toString() + myNumber12.toString() + myNumber13.toString();
    //const starSystem = new StarSystem(myNumber)
    //console.log(JSON.stringify(starSystem, null, 2));
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase.from('profiles')
      .select()
      .eq('id', session?.user?.id)
      .then(result => {
        if (result.data.length) {
          setProfile(result.data[0]);
        }
      })
  }, [session?.user?.id]); // Run it again if auth/session state changes

  function fetchPosts () {
    supabase.from('posts')
      .select('id, content, created_at, media, profiles(id, avatar_url, username)') // Reset id on testing playground server later
      .order('created_at', { ascending: false })
      .then(result => { setPosts(result.data); })
      console.log(posts);
  }

  function fetchProfile () {
    supabase.from('profiles')
      .select()
      .eq('id', session.user.id)
      .then(result => {
        if (result.data) {
          setProfile(result.data[0]);
        }
    })
  }

  if (!session) { return <Login /> };

  return (
    <Layout hideNavigation={false}>
      <UserContext.Provider value={{profile}}> {/* Move this into `_app.tsx` later */}
        <PostFormCard onPost={fetchPosts} />
        {posts?.length > 0 && posts.map(post => (
          <PostCard key = { post.id } {...post} />
        ))}
      </UserContext.Provider>
    </Layout>
  );
}

export function SocialGraphHomeNoSidebar () {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase.from('profiles')
      .select()
      .eq('id', session?.user?.id)
      .then(result => {
        if (result.data.length) {
          setProfile(result.data[0]);
        }
      })
  }, [session?.user?.id]); // Run it again if auth/session state changes

  function fetchPosts () {
    supabase.from('posts')
      .select('id, content, created_at, media, profiles(id, avatar_url, username)') // Reset id on testing playground server later
      .order('created_at', { ascending: false })
      .then( result => { setPosts(result.data); });

    supabase.from('posts_duplicate')
      .select('id, content, created_at, media, planets2, profiles(id, avatar_url, username)') // Reset id on testing playground server later
      .order('created_at', { ascending: false })
      .then( result => { setPlanetPosts(result.data); });
  }

  function fetchProfile () {
    supabase.from('profiles')
      .select()
      .eq('id', session.user.id)
      .then(result => {
        if (result.data) {
          setProfile(result.data[0]);
        }
    })
  }

  if (!session) { return <Login />; };

  return (
    <Layout hideNavigation={true}>
      <UserContext.Provider value={{profile}}> {/* Move this into `_app.tsx` later */}
        <PostFormCard onPost={fetchPosts} />
        {planetPosts?.length > 0 && planetPosts.map(post => (
          <PostCard key = { post.id } {...post} />
        ))}
        {posts?.length > 0 && posts.map(post => (
          <PostCard key = { post.id } {...post} />
        ))}
      </UserContext.Provider>
    </Layout>
  );
}

export function SocialGraphHomeNoSidebarIndividualPlanet (planetId) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);

  useEffect(() => {
    fetchPostsForPlanet(planetId);
  }, [planetId]);
  

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase.from('profiles')
      .select()
      .eq('id', session?.user?.id)
      .then(result => {
        if (result.data.length) {
          setProfile(result.data[0]);
        }
      })
  }, [session?.user?.id]); // Run it again if auth/session state changes

  async function fetchPostsForPlanet( planetId ) {
    supabase
      .from('posts_duplicate')
      .select('*') //id, content, created_at, media, planets2, profiles(id, avatar_url, username)')
      .eq('planets2', planetId)
      .order('created_at', { ascending: false })
      .then(result => {
        setPlanetPosts(result.data);
      });
  }
  

  function fetchProfile () {
    supabase.from('profiles')
      .select()
      .eq('id', session.user.id)
      .then(result => {
        if (result.data) {
          setProfile(result.data[0]);
        }
    })
  }

  if (!session) { return <Login />; };

  return (
    <Layout hideNavigation={true}>
      <UserContext.Provider value={{profile}}> {/* Move this into `_app.tsx` later */}
        {planetPosts?.length > 0 && planetPosts.map(post => (
          <PostCard key = { post.id } {...post} />
        ))}
      </UserContext.Provider>
    </Layout>
  );
}

export function SocialGraphHomeNoSidebarIndividualPlanetReturn (planetId) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);

  useEffect(() => {
    fetchPostsForPlanet(planetId);
  }, [planetId]);
  

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase.from('profiles')
      .select()
      .eq('id', session?.user?.id)
      .then(result => {
        if (result.data.length) {
          setProfile(result.data[0]);
        }
      })
  }, [session?.user?.id]); // Run it again if auth/session state changes

  async function fetchPostsForPlanet ( planetId ) {
    supabase.from('posts_duplicate')
      .select('*') //id, content, created_at, media, planets2, profiles(id, avatar_url, username)') // Reset id on testing playground server later
      .order('created_at', { ascending: false })
      // .eq('author', planetId)
      //.eq('planets2', planetId)
      .then( result => { setPlanetPosts(result.data); });
      // console.log("horeui", planetPosts[0]?.planets2/*?.planets2)
  }

  function fetchProfile () {
    supabase.from('profiles')
      .select()
      .eq('id', session.user.id)
      .then(result => {
        if (result.data) {
          setProfile(result.data[0]);
        }
    })
  }

  if (!session) { return <Login />; };

  return (
    <Layout hideNavigation={true}>
      <UserContext.Provider value={{profile}}> {/* Move this into `_app.tsx` later */}
        {planetPosts?.length > 0 && planetPosts.map(post => (
          <PostCard key = { post.id } {...post} />
        ))}
      </UserContext.Provider>
    </Layout>
  );
}