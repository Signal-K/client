'use client';

import React, { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, Globe, ThumbsUp, ThumbsDown } from 'lucide-react';
import { zoodexSouthCoastFaunaRecoveryClassificationConfig, cloudClassificationConfig, planetClassificationConfig } from '../FormConfigurations';
import { zoodexSouthCoastFaunaRecovery, initialCloudClassificationOptions, roverImgClassificationOptions, lidarEarthCloudsReadClassificationOptions, planetClassificationOptions, planktonPortalClassificationOptions, penguinWatchClassificationOptions, diskDetectorClassificationOptions, zoodexIguanasFromAboveClassificationOptions, zoodexBurrowingOwlClassificationOptions } from '@/content/Classifications/Options';
import { Button } from '@/components/ui/button';

interface KeyStat {
  label: string;
  value: string;
};

interface DiscoveryCardSingleProps {
  classificationId: number;
};

const generateImagePlaceholder = (name: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = `hsl(${Math.random() * 360}, 70%, 80%)`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'bold 80px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText((name && name.length > 0) ? name.charAt(0).toUpperCase() : '?', canvas.width / 2, canvas.height / 2);
  }
  return canvas.toDataURL();
};

const extractImageUrls = (media: any): string[] => {
  let imageUrls: string[] = [];

  if (typeof media === 'string') {
    try {
      const mediaObj = JSON.parse(media);
      if (mediaObj.uploadUrl) {
        imageUrls.push(mediaObj.uploadUrl);
      }
    } catch {
      // If it's not a valid JSON, do nothing
    }
  } else if (Array.isArray(media)) {
    media.flat().forEach((item) => {
      if (typeof item === 'string' && item.startsWith('http')) {
        imageUrls.push(item);
      }
    });
  }

  return imageUrls;
};

export function DiscoveryCardSingle({ classificationId }: DiscoveryCardSingleProps) {
  const supabase = useSupabaseClient();
  const user = useUser();  // To get the current user's session data
  const [classification, setClassification] = useState<any>(null);
  const [anomaly, setAnomaly] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState<number>(0);
  const [userVote, setUserVote] = useState<number | null>(null); // Track user's vote: 1 for upvote, -1 for downvote

  useEffect(() => {
    const fetchClassification = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('classifications')
          .select('id, content, classificationtype, created_at, media, anomaly, classificationConfiguration, anomalies(avatar_url)')
          .eq('id', classificationId)
          .single();
  
        if (error) throw error;
  
        setClassification(data);
  
        // Get total votes from classificationConfiguration
        const totalVotes = data?.classificationConfiguration?.votes || 0;
        setVoteCount(totalVotes);  // Use the total votes from classifications
  
        if (data.anomaly) {
          const { data: anomalyData } = await supabase
            .from('anomalies')
            .select('avatar_url')
            .eq('id', data.anomaly)
            .single();
          setAnomaly(anomalyData);
        }
  
        // Fetch user's individual vote from the votes table
        const { data: voteData } = await supabase
          .from('votes')
          .select('vote')
          .eq('classification_id', classificationId)
          .eq('user_id', user?.id);
  
        if (voteData && voteData.length > 0) {
          setUserVote(voteData[0].vote);
        }
      } catch (error) {
        console.error('Error fetching classification:', error);
      } finally {
        setLoading(false);
      }
    };
  
    if (user) {
      fetchClassification();
    }
  }, [classificationId, supabase, user]);
  

  const handleVote = async () => {
    if (!user) return alert('Please log in to vote');
  
    try {
      // Step 1: Insert a new row into the 'votes' table
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .insert({
          user_id: user.id,
          classification_id: classification.id,
          anomaly_id: classification.anomaly,  // Assuming 'classification.anomaly' holds the anomaly_id
        });
  
      if (voteError) throw voteError;
  
      // Step 2: Increment the vote count in classificationConfiguration.votes
      const updatedVotes = (classification.classificationConfiguration?.votes || 0) + 1;
  
      const updatedConfiguration = {
        ...classification.classificationConfiguration,
        votes: updatedVotes, // Update the vote count
      };
  
      const { data: updateData, error: updateError } = await supabase
        .from('classifications')
        .update({
          classificationConfiguration: updatedConfiguration,
        })
        .eq('id', classification.id);
  
      if (updateError) throw updateError;
  
      // Step 3: Update the UI
      setVoteCount(updatedVotes);
      setClassification({ ...classification, classificationConfiguration: updatedConfiguration });
  
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };  

  if (loading) return <p>Loading...</p>;
  if (!classification) return <p>No classification found.</p>;

  const { content, classificationtype, created_at, media, classificationConfiguration } = classification;
  const discoveredOn = new Date(created_at).toLocaleDateString();
  const parentAnomaly = classification.anomaly ? `Anomaly ID: ${classification.anomaly}` : 'Earth';
  const imageUrls = extractImageUrls(media);

  return (
    <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 overflow-hidden relative border-2 border-slate-300 rounded-xl shadow-lg">
      <CardContent className="p-6 flex">
        <div className="w-1/3 pr-4 border-r border-slate-300">
          <div className="aspect-square rounded-lg overflow-hidden mb-4 shadow-md">
            {imageUrls.length > 0 ? (
              <img src={imageUrls[0]} alt="Classification Media" className="w-full h-full object-cover" />
            ) : (
              <img src={generateImagePlaceholder(content)} alt={content} className="w-full h-full object-cover" />
            )}
          </div>
          <h2 className="text-2xl font-bold mb-2">{content}</h2>
          <Badge variant="outline" className="bg-slate-800 text-white">
            {classificationtype}
          </Badge>
        </div>
        <div className="w-2/3 pl-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-slate-600" />
              <span className="text-sm">Discovered on: {discoveredOn}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-slate-600" />
              <span className="text-sm">Parent Anomaly: {parentAnomaly}</span>
            </div>
            
            {anomaly?.avatar_url && (
              <div className="mt-4">
                <h3 className="font-semibold">Anomaly Avatar:</h3>
                <img 
                  src={anomaly.avatar_url} 
                  alt="Anomaly Avatar" 
                  className="w-16 h-16 rounded-full object-cover shadow-md" 
                />
              </div>
            )}

            <div className="mt-4">
              <h3 className="font-semibold">Classification Configuration:</h3>
              <pre>{JSON.stringify(classificationConfiguration, null, 2)}</pre>
            </div>

            {imageUrls.length > 1 && (
              <div className="mt-4">
                <h3 className="font-semibold">Additional Media:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {imageUrls.slice(1).map((url, index) => (
                    <img key={index} src={url} alt={`Media ${index + 1}`} className="w-full h-auto object-cover rounded-lg shadow-md" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Voting Section */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-4">
            <Button onClick={handleVote}>
  <ThumbsUp />
</Button>

            </div>
            <Users className="w-5 h-5 text-slate-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};