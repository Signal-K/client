'use client';

import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, Globe } from 'lucide-react';

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
          .select('id, content, classificationtype, created_at, media, anomaly')
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

  const { content, classificationtype, created_at, media, anomaly } = classification;
  const profileImage = media.length > 0 ? media[0] : undefined;
  const discoveredOn = new Date(created_at).toLocaleDateString();
  const parentAnomaly = anomaly ? `Anomaly ID: ${anomaly}` : 'Earth';

  return (
    <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 overflow-hidden relative border-2 border-slate-300 rounded-xl shadow-lg">
      <CardContent className="p-6 flex">
        <div className="w-1/3 pr-4 border-r border-slate-300">
          <div className="aspect-square rounded-lg overflow-hidden mb-4 shadow-md">
            <img src={profileImage || generateImagePlaceholder(content)} alt={content} className="w-full h-full object-cover" />
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};