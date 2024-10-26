'use client';

import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, Globe } from 'lucide-react';
import { zoodexSouthCoastFaunaRecoveryClassificationConfig, cloudClassificationConfig, planetClassificationConfig } from '../FormConfigurations';
import { zoodexSouthCoastFaunaRecovery, 
  cloudClassificationOptions, 
  initialCloudClassificationOptions, 
  roverImgClassificationOptions, 
  lidarEarthCloudsReadClassificationOptions, 
  lidarEarthCloudsUploadClassificationOptions, 
  planetClassificationOptions, 
  planktonPortalClassificationOptions, 
  penguinWatchClassificationOptions, 
  diskDetectorClassificationOptions, 
  zoodexIguanasFromAboveClassificationOptions, 
  zoodexBurrowingOwlClassificationOptions, 
} from '@/content/Classifications/Options';

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

interface DiscoveryCardSingleProps {
  classificationId: number;
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
    // Flatten the array and extract URLs
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
  const [classification, setClassification] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClassification = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('classifications')
          .select('id, content, classificationtype, created_at, media, anomaly, classificationConfiguration')
          .eq('id', classificationId)
          .single();

        if (error) throw error;

        setClassification(data);
      } catch (error) {
        console.error('Error fetching classification:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassification();
  }, [classificationId, supabase]);

  if (loading) return <p>Loading...</p>;
  if (!classification) return <p>No classification found.</p>;

  const { content, classificationtype, created_at, media, anomaly, classificationConfiguration } = classification;
  const discoveredOn = new Date(created_at).toLocaleDateString();
  const parentAnomaly = anomaly ? `Anomaly ID: ${anomaly}` : 'Earth';

  // Extract URLs from the media column
  const imageUrls = extractImageUrls(media);

  return (
    <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 overflow-hidden relative border-2 border-slate-300 rounded-xl shadow-lg">
      <CardContent className="p-6 flex">
        <div className="w-1/3 pr-4 border-r border-slate-300">
          <div className="aspect-square rounded-lg overflow-hidden mb-4 shadow-md">
            {/* Display first image or placeholder */}
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
            <div className="mt-4">
              <h3 className="font-semibold">Classification Configuration:</h3>
              <pre>{JSON.stringify(classificationConfiguration, null, 2)}</pre>
            </div>

            {/* Display all images from the media */}
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
        </div>
      </CardContent>
    </Card>
  );
};


interface ClassificationConfiguration {
  [key: string]: string | number | boolean; 
}