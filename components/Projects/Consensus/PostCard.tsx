'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ThumbsUp, MessageSquare, Eye, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MinimalMap } from '@/components/Data/Generator/WeatherPlusMap';
import { GenerativeEarthIcon } from '@/components/Data/Generator/EarthIcon';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';

interface DiscoveryCardProps {
  discovery: {
    id: string;
    project: string;
    classification: string;
    classificationConfiguration: any;
    content: string;
    author: {
      name: string;
      avatar: string;
    };
    media: string[];
    votes: number;
    comments: number;
  };
};

interface Comment {
    id: string;
    content: string;
    author: string;
};  

export function DiscoveryCard({ discovery }: DiscoveryCardProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [isVoted, setIsVoted] = useState(false);
  const [votes, setVotes] = useState(discovery.votes);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [activeView, setActiveView] = useState<'media' | 'map' | 'config'>('media');
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("classification_id", discovery.id);

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      setComments(data || []);
    };

    fetchComments();
  }, [discovery.id]);

  const handleVote = async () => {
    if (!session?.user) {
      console.log('User not logged in.');
      return;
    }

    try {
      if (isVoted) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', session.user.id)
          .eq('classification_id', discovery.id);

        if (error) {
          console.error('Error removing vote:', error.message);
          return;
        }

        setVotes(votes - 1);
        setIsVoted(false);
      } else {
        const { error } = await supabase.from('votes').insert({
          user_id: session.user.id,
          classification_id: discovery.id,
          anomaly_id: null,
        });

        if (error) {
          if (error.code === '23505') {
            console.log('Duplicate vote detected.');
          } else {
            console.error('Error adding vote:', error.message);
          }
          return;
        }

        setVotes(votes + 1);
        setIsVoted(true);
      }
    } catch (error) {
      console.error('Unexpected error during voting:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!session?.user) {
      console.log("User not logged in.");
      return;
    }

    try {
      const { data, error } = await supabase.from("comments").insert({
        content: comment, 
        author: session.user.id, 
        classification_id: discovery.id, 
        configuration: null, 
        uploads: uploadId || null, 
      });
  
      if (error) {
        console.error("Error adding comment:", error.message);
        return;
      }
  
      console.log("Comment added:", data);
      setComment("");
      setShowCommentBox(false); 
    } catch (error) {
      console.error("Unexpected error while submitting comment:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      console.log("No file selected.");
      return;
    }
  
    try {
      const filePath = `uploads/${session?.user?.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
  
      if (error) {
        console.error("Error uploading file:", error.message);
        return;
      }
  
      const uploadUrl = `${supabaseUrl}/storage/v1/object/public/media/${data?.path}`;
      setFileUrl(uploadUrl);
  
      const configuration = {
        media: { uploadUrl },
        comment: "Virgin Australia VA 471 (I think)",
        location: "between Per & Bri",
        cloudName: "I'm on a plane",
        structure: "Crater",
        anomalyType: "Telescope",
      };
  
      const { data: uploadData, error: uploadError } = await supabase
        .from("uploads")
        .insert({
          author: session?.user?.id,
          location: activePlanet.id,
          source: file.name,
          file_url: uploadUrl,
          content: file.name,
          configuration,
        })
        .select();
  
      if (uploadError) {
        console.error("Error inserting upload record:", uploadError.message);
        return;
      }
  
      console.log(uploadData);
      setUploadId(uploadData?.[0]?.id || null);
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
    }
  };
  

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={discovery.author.avatar} />
            <AvatarFallback>{discovery.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{discovery.author.name}</p>
            <p className="text-xs text-muted-foreground">{discovery.project}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-[#2C4F64] bg-[#85DDA2]/20 hover:bg-[#85DDA2]/30"
          onClick={() => setActiveView(activeView === 'map' ? 'media' : 'map')}
        >
          <div className="w-5 h-5 mr-2">
            <GenerativeEarthIcon size={20} seed={discovery.id.charCodeAt(0)} />
          </div>
          <span className="text-xs">Discovered on Earth</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeView === 'media' && (
          <div className="relative aspect-video rounded-md overflow-hidden">
            <Image
              src={discovery.media[0]} 
              alt="Discovery media"
              fill
              className="object-cover"
            />
          </div>
        )}
        {activeView === 'map' && (
          <div className="relative aspect-video rounded-md overflow-hidden">
            <MinimalMap width={400} height={225} />
          </div>
        )}
        {activeView === 'config' && (
          <pre className="p-4 bg-muted rounded-md overflow-auto text-xs">
            {JSON.stringify(discovery.classificationConfiguration, null, 2)}
          </pre>
        )}
        <p className="text-sm">{discovery.content}</p>
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">Classification: {discovery.classification}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView(activeView === 'config' ? 'media' : 'config')}
          >
            <Eye className="w-4 h-4 mr-2" />
            {activeView === 'config' ? 'Hide' : 'View'} Config
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVote}
            className={isVoted ? 'bg-[#85DDA2] text-white' : ''}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            {votes} Votes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCommentBox(!showCommentBox)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {comments.length} Comments
          </Button>
        </div>
        {showCommentBox && (
          <form onSubmit={handleCommentSubmit} className="w-full space-y-2">
            <Textarea
              placeholder="Add a comment or stat..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-between">
              <Button type="submit" size="sm">
                Submit
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" size="sm" onClick={handleFileUpload}>
                  <Upload className="w-4 h-4" />
                  Upload
                </Button>
                <input type="file" onChange={handleFileChange} />
              </div>
            </div>
          </form>
        )}
        {comments.length > 0 && (
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-2">
                <Avatar>
                  <AvatarImage src={discovery.author.avatar} />
                  <AvatarFallback>{discovery.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};