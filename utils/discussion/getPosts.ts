import { useSupabaseClient } from "@supabase/auth-helpers-react";

const supabase = useSupabaseClient();

interface Post {
  id: number;
  title: string;
  // Define other properties as needed
}

interface User {
  id: number;
  username: string;
  avatar_url: string;
}

interface Reply {
  id: number;
  // Define other properties as needed
}

interface PostWithOwner {
  owner: User;
  replies: Reply[];
}

export interface PostData {
  posts: PostWithOwner[];
  count: number;
  tag: string;
}

export default async function getPosts(context: {
  query: {
    page?: string;
    query?: string;
    tag?: string;
  };
}): Promise<PostData> {
  let tag = '*';
  let searchQ = '';
  let _currentPage = 1;

  if (context.query.page) {
    _currentPage = parseInt(context.query.page, 10);
  }

  if (context.query.query) {
    searchQ = context.query.query;
  }

  if (context.query.tag) {
    tag = context.query.tag;
  }

  let perPage = 14;
  let range_start = 0;
  let range_end = _currentPage * perPage;

  if (_currentPage !== 1) {
    range_start = (_currentPage * perPage) - (perPage - 1);
  }

  const { data: posts, error, count } = await supabase
    .from('forumPosts')
    .select(`
      *, 
      owner:user_id(
        id, username, avatar_url
      ),
      replies(id)
    `, { count: 'exact' })
    .ilike('title', `%${searchQ}%`)
    .ilike('tag', `${tag}`)
    .range(range_start, range_end)
    .order('updated_at', { ascending: false });

  return { posts, count, tag };
}