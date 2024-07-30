"use client";

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useActivePlanet } from '@/context/ActivePlanet';
import { Card } from '@/components/ui/card';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface Profile {
  id: string;
  avatar_url: string;
  username: string;
}

interface Classification {
  classificationConfiguration: any;
  id: number;
  content: string;
  author: string;
  media: string[];
  anomaly: number;
  created_at: string;
  classificationtype: any;
  profiles: Profile;
  anomalies: {
    avatar_url: string;
    anomalytype: string;
  };
  classificationCount: number;
}

interface ClassificationsFeedByTypeProps {
  classificationtype: string;
}

export const ClassificationsFeedByType: React.FC<ClassificationsFeedByTypeProps> = ({ classificationtype }) => {
    const supabase = useSupabaseClient();
    const { activePlanet } = useActivePlanet();
    const session = useSession();
    const [posts, setPosts] = useState<Classification[]>([]);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          if (!session?.user?.id || !activePlanet?.id) {
            return; // Exit if session or activePlanet is not available
          }
  
          const { data, error } = await supabase
            .from('classifications')
            .select(`
              id,
              created_at,
              content,
              author,
              anomaly,
              media,
              classificationtype,
              classificationConfiguration,
              profiles (
                id,
                avatar_url,
                username
              ),
              anomalies (
                avatar_url,
                anomalytype
              )
            `)
            .eq('author', session.user.id)
            .eq('anomaly', activePlanet.id)
            .eq('classificationtype', classificationtype)
            .order('created_at', { ascending: false });
  
          if (error) {
            throw new Error(error.message);
          }
  
          const processedData = await Promise.all(
            (data || []).map(async (classification: any) => {
              const classificationCount = data.filter((c: any) => c.anomaly === classification.anomaly).length;
              return {
                ...classification,
                classificationCount
              };
            })
          );
  
          setPosts(processedData);
  
        } catch (error) {
          console.error('Error loading classifications:', error instanceof Error ? error.message : 'Unknown error');
        }
      };
  
      fetchData();
    }, [supabase, session, activePlanet, classificationtype]);
  
    return (
      <div className="flex flex-col items-center gap-4 py-5 space-y-4 w-full">
        {posts.length > 0 ? (
          <Carousel showThumbs={false} infiniteLoop={true} dynamicHeight={true}>
            {posts.map((post) => (
              <div key={post.id} className="p-4">
                <CardForum {...post} />
              </div>
            ))}
          </Carousel>
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    );
  };

interface ClassificationButtonProps {
  classificationtype: string;
  label: string;
  onClick: () => void;
}

export const ClassificationButton: React.FC<ClassificationButtonProps> = ({ classificationtype, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full object-cover cursor-pointer bg-gray-200 p-2 rounded-md"
    style={{ aspectRatio: '1 / 1' }}
  >
    {label}
  </button>
);

export function PostCard() {
  const { activePlanet } = useActivePlanet();
  const [selectedClassificationType, setSelectedClassificationType] = useState<string | null>(null);

  const handleClassificationClick = (classificationtype: string) => {
    setSelectedClassificationType(classificationtype);
  };

  return (
    <Card className="max-w-md w-full mx-auto rounded-2xl overflow-hidden" style={{ height: '70vh' }}>
      {selectedClassificationType ? (
        <ClassificationsFeedByType classificationtype={selectedClassificationType} />
      ) : (
        <div className="relative">
          {activePlanet && activePlanet.avatar_url ? (
            <img
              src={activePlanet.avatar_url}
              alt="Planet"
              className="w-full object-cover"
              style={{ aspectRatio: '4 / 1' }}
            />
          ) : (
            <img
              src="/placeholder.svg"
              alt="Planet"
              className="w-full object-cover"
              style={{ aspectRatio: '4 / 1' }}
            />
          )}
          {/* <Avatar className="w-24 h-24 absolute top-4 left-4 border-4 border-white">
            <AvatarImage
              src={activePlanet && activePlanet.avatar_url ? activePlanet.avatar_url : "/placeholder.svg"}
              alt="Avatar"
            />
            <AvatarFallback>AV</AvatarFallback>
          </Avatar> */}
          <Button
            variant="secondary"
            className="absolute top-4 right-4 bg-opacity-75 bg-black text-white"
            onClick={() => alert("Not implemented yet.")}
          >
            ✎
          </Button>
        </div>
      )}
      <div className="p-4 flex-1 overflow-y-auto">
        {selectedClassificationType ? (
          <Button variant="secondary" onClick={() => setSelectedClassificationType(null)}>
            Back to Planet Info
          </Button>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">{activePlanet?.name || "Planet Name"}</h2>
            <p className="text-sm text-gray-500 mb-2">{activePlanet?.description || "No description available."}</p>
            <hr className="my-2" />
            <div className="grid grid-cols-2 gap-4">
              <ClassificationButton
                classificationtype="lightcurve"
                label="Atmosphere"
                onClick={() => handleClassificationClick("lightcurve")}
              />
              <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center">
                Geology
              </div>
              <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center">
                Moons
              </div>
              <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center">
                Exploration
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

const CardForum: React.FC<Classification> = ({
  id,
  content,
  created_at,
  profiles,
  media,
  anomaly,
  classificationtype,
  anomalies,
  classificationCount,
  classificationConfiguration,
  author,
}) => {
//   const formattedDate = format(new Date(created_at), "MMM dd, yyyy");
  const userMedia = Array.isArray(media) ? media : [];
  const anomalyImage = Array.isArray(media) && media[1] ? media[1] : '';
  const anomalyAvatarUrl = anomalies?.avatar_url || '/default-anomaly-avatar.png';

  return (
    <div
      id={`card-${id}`} // ID for the card element for saving as an image
      className="bg-white rounded-lg shadow-md p-4 mb-4 w-full max-w-lg"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full overflow-hidden w-16 h-16">
          <img
            src={profiles?.avatar_url || "https://cdn4.iconfinder.com/data/icons/profession-avatar-5/64/13-astronaut-512.png"}
            alt={profiles?.username}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-semibold">{profiles?.username || profiles?.id || "user"}</h2>
          {/* <small className="text-gray-500">{formattedDate}</small> */}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-gray-700">{content}</p>
      </div>

      {(userMedia.length > 0 || anomalyImage) && (
        <div className="mt-4">
          {userMedia.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold">User Media</h4>
              {userMedia.map((url: string, index: number) => (
                <div key={index} className="mb-2">
                  <img src={url} alt="User media" className="rounded-md w-full h-auto object-cover" />
                </div>
              ))}
            </div>
          )}
          {anomalyImage && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold">Anomaly Image</h4>
              <img src={anomalyImage} alt="Anomaly Image" className="rounded-md w-full h-auto object-cover" />
            </div>
          )}
        </div>
      )}

      {classificationtype && (
        <div className="flex flex-wrap gap-2 mt-4 border-t border-gray-200 pt-2">
          {Object.keys(classificationtype).map((type, index) => (
            <span
              key={index}
              className={`bg-${classificationtype[type] ? 'green-200 text-green-800' : 'red-200 text-red-800'} px-2 py-1 rounded-md text-xs`}
            >
              #{type}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
        <img src={anomalyAvatarUrl} alt="Anomaly Avatar" className="w-16 h-16 object-cover rounded-md" />
        <span>Anomaly: {anomaly}</span>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        Classifications for this anomaly: {classificationCount}
      </div>
    </div>
  );
};