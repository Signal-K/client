'use client';

import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Avatar } from '@/components/Account/Avatar';

const OceanGallery = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classifications, setClassifications] = useState<any[]>([]);
  const [selectedClassification, setSelectedClassification] = useState<any | null>(null);
  
  useEffect(() => {
    const fetchClassifications = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from("classifications")
          .select('id, content, media, author')
          .eq('author', session.user.id)
          .in('classificationtype', ['zoodex-clickACoral', 'zoodex-planktonPortal']);
          
        if (error) {
          console.error('Error fetching classifications:', error);
        } else {
          setClassifications(data || []);
        };
      };
    };

    fetchClassifications();
  }, [session]);

  const getAvatarUrl = async (authorId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', authorId)
      .single();
      
    if (error) {
      console.error('Error fetching avatar:', error);
      return ''; 
    };

    return data?.avatar_url || ''; 
  };

  const handleCardClick = (classification: any) => {
    setSelectedClassification(classification);
  };

  const closeCard = () => {
    setSelectedClassification(null);
  };

  return (
    <div className="relative flex flex-wrap gap-6 p-6">
      {classifications.map((classification) => {
        const media = Array.isArray(classification.media) ? classification.media[1] : null;
        if (!media) return null;

        const mediaUrl = media; 
        const classificationId = classification.id;
        
        return (
          <div
            key={classificationId}
            className="bg-gray-900 bg-opacity-80 p-4 rounded-lg cursor-pointer"
            onClick={() => handleCardClick(classification)}
          >
            <img src={mediaUrl} alt={`Media for classification ${classificationId}`} className="w-32 h-32 object-cover rounded-lg" />
          </div>
        );
      })}

      {selectedClassification && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6"
          onClick={closeCard}
        >
          <div
            className="bg-gray-900 p-6 rounded-lg max-w-lg w-full cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4">
              <Avatar />
              <div>
                <h3 className="text-2xl font-semibold text-white">Classification Details</h3>
                <p className="text-sm text-gray-400">{selectedClassification.content}</p>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => window.location.href = `/posts/${selectedClassification.id}`}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
              >
                View Full Classification
              </button>
            </div>
            
            <div className="mt-4">
              {selectedClassification.media && Array.isArray(selectedClassification.media) && (
                <img src={selectedClassification.media[1]} alt="Selected classification media" className="w-32 h-32 object-cover rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OceanGallery;