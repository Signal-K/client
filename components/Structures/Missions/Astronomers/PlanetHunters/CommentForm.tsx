import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

interface Classification {
  author: string | undefined;
  id: number;
  content: string;
  media: any;
  classificationConfiguration: {
    votes: number;
    classificationOptions: { [key: string]: any };
  };
  image_url?: string;
};

const PHCommentForm = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [loading, setLoading] = useState(true);
    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [comments, setComments] = useState<any[]>([]);
  
    useEffect(() => {
      const fetchData = async () => {
        if (!session?.user?.id) return;
  
        try {
          const { data: classificationData, error: classificationError } = await supabase
            .from("classifications")
            .select("*")
            .eq("classificationtype", "planet");
  
          if (classificationError) {
            console.error("Error fetching classifications:", classificationError);
            return;
          }
  
          const { data: commentsData, error: commentsError } = await supabase
            .from("comments")
            .select(`
              id,
              content,
              configuration,
              classification_id,
              author (
                id,
                full_name,
                avatar_url
              )
            `)
            .eq("author", session.user.id)
            .not("configuration", "is", null);
  
          if (commentsError) {
            console.error("Error fetching comments:", commentsError);
            return;
          }
  
          setClassifications(classificationData || []);
          setComments(commentsData || []);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };
  
      fetchData();
    }, [supabase, session?.user]);
  
    if (loading) {
      return <p>Loading your comments...</p>;
    }
  
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-black">Planet Comment Form</h2>
        <div>
          {comments.length === 0 ? (
            <p>No comments found for planet classifications</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border p-4 rounded-md bg-gray-100 mb-4">
                <p className="text-sm">{comment.content}</p>
                <p className="text-xs text-gray-500">{comment.configuration.planetType}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
};  

export default PHCommentForm;