import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';
import { useProfileContext } from '@/context/UserProfile';
import ReactHtmlParser from 'react-html-parser';

// Simple serialization function for demonstration purposes
function serializeRichText(richText: string): string {
  // Implement serialization logic based on your rich text structure
  // For simplicity, this example just wraps the entire content in paragraph tags
  return `<p>${richText}</p>`;
}

interface CreateBaseClassificationProps {
  assetMentioned: any;
}

export const CreateBaseClassification: React.FC<CreateBaseClassificationProps> = ({ assetMentioned }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [content, setContent] = useState("");
  const [uploads, setUploads] = useState<string[]>([]);
  const { activePlanet } = useActivePlanet();
  const { userProfile } = useProfileContext();

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    console.log("User profile:", userProfile);
  }, [session]);

  async function createPost() {
    const serializedContent = serializeRichText(content); // Serialize the content

    supabase
     .from("classifications")
     .insert([
        {
          author: session?.user?.id,
          content: serializedContent,
          media: uploads,
          anomaly: activePlanet?.id,
        },
      ])
     .then(response => {
        if (!response.error) {
          alert(`Post ${serializedContent} created`);
          setContent('');
        }
      });
  }

  async function addMedia(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files?.length > 0 && session) {
      setIsUploading(true);
      for (const file of files) {
        const fileName = `${Date.now()}${session.user.id}${file.name}`;
        const { data, error } = await supabase.storage.from('media').upload(fileName, file);

        if (data) {
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${data.path}`;
          setUploads(prevUploads => [...prevUploads, url]);
        } else {
          console.error(error);
        }
      }
      setIsUploading(false);
    }
  }

  return (
    <div style={{ width: '83%', margin: 'auto' }}>
      {/* Your existing JSX */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`Your placeholder text`}
      />
      {/* Render uploaded images */}
      {isUploading && (
        <div>
          {uploads.map(upload => (
            <img src={upload} alt="" />
          ))}
        </div>
      )}
      <button onClick={createPost}>Share</button>
    </div>
  );
};

export default CreateBaseClassification;
