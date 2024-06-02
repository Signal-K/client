import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import ReactHtmlParser from 'react-html-parser';

interface Classification {
  id: number;
  content: string;
  author: string;
  media: string[];
  anomaly: number;
}

const ClassificationsFeed: React.FC = () => {
  const supabase = useSupabaseClient();
  const [posts, setPosts] = useState<Classification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
       .from('classifications')
       .select('*');
      
      if (error) {
        console.error('Error loading classifications:', error.message);
      } else {
        setPosts(data || []);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className="card">
          <h3>{post.author}</h3>
          <p>{post.anomaly}</p>
          {post.media.map((url, index) => (
            <img key={index} src={url} alt="" />
          ))}
          {ReactHtmlParser(post.content)} {/* Directly render the parsed HTML */}
        </div>
      ))}
    </div>
  );
};

export default ClassificationsFeed;
