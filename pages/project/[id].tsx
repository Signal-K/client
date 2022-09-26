import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Layout from "../../components/Section/Layout";
import UploadFileToRepo from "../../components/Content/UploadToProject";

interface Post {
  id: number;
  content: string;
  author: string;  
  created_at: string;
  media: any[]; 
  planets: string;
}

const ProjectDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const supabase = useSupabaseClient();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!id || Array.isArray(id)) return;

        const postId = parseInt(id as string);   

        const { data, error } = await supabase
          .from("posts_old")
          .select("*")
          .eq("id", postId)
          .single();   

        if (error) {
          console.error("Error fetching post:", error.message);
          return;
        }

        if (data) {
          setPost(data);
        }
      } catch (error) {
        console.error("Error fetching post:", error.message);
      }
    };

    fetchPost();
  }, [id, supabase]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
        <div>
        <h1>Project Detail</h1>
        <p>ID: {post.id}</p>
        <p>Content: {post.content}</p>
        <p>Author: {post.author}</p>
        <p>Created At: {post.created_at}</p>
        <UploadFileToRepo projectId={post.id} />
        </div>
    </Layout>
  );
};

export default ProjectDetailPage;