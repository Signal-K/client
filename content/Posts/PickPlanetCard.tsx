import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

import SimplePlanetGenerator from "@/components/Data/Generator/Astronomers/PlanetHunters/SimplePlanetGenerator";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";

interface PickPlanetCardProps {
  title: string;
  id: string;
  author: string;
  content: string;
  anomalyTitle: string;
  images: string[];
  anomaly: string;
  classificationConfiguration?: any;
}

export default function PickPlanetCard({
  id,
  title,
  author,
  content,
  anomalyTitle,
  images = [],
  classificationConfiguration,
  anomaly,
}: PickPlanetCardProps) {
  const supabase = useSupabaseClient();

  const [fullName, setFullName] = useState<string | null>("");
  const [username, setUsername] = useState<string | null>("");
  const [loading, setLoading] = useState(false);

  const [planetName, setPlanetName] = useState<string | null>('');

  useEffect(() => {
    async function fetchAnomalyInfo() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("anomalies")
                .select("content")
                .eq("id", anomaly)
                .single();

            if (data) {
                setPlanetName(data.content);
            };

            if (error) {
                console.warn(error);
            };
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        };
    };

    fetchAnomalyInfo();
  }, [supabase])

  useEffect(() => {
    async function fetchAvatar() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", author)
          .single();

        if (data) {
          setUsername(data.username);
          setFullName(data.full_name);
        };

        if (error) {
          console.error("Error fetching profile:", error);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      };
    };

    if (supabase && author) { 
      fetchAvatar();
    };
  }, [supabase, author]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNextImage = () => {
    if (images.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  };

  const goToPreviousImage = () => {
    if (images.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="mt-2 text-center text-gray-500">
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start space-y-4 p-4 bg-white/10 rounded-lg shadow-md">
        <Link href={`/posts/${id}`} passHref>
            <Button variant="link" className="text-blue-500 flex items-center space-x-2">
                <Share2 size={16} />
                <span>Share</span>
            </Button>
            <p>Star: {planetName}</p>
        </Link>

        <SimplePlanetGenerator
            classificationId={id}
            classificationConfig={classificationConfiguration}
            author={author}
            type="Terrestrial"
        />
    </div>
  );
};

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { PostAvatar } from "@/components/Account/Avatar";

            {/* <div className="h-16">
                <PostAvatar author={author} />
                <p className="text-sm text-muted-foreground">discovered by {author}</p>
            </div> */}

                  {/* <div className="flex items-center space-x-4">
        <PostAvatar author={author} />
        <div>
          <CardTitle>{content}</CardTitle>
          <p className="text-sm text-gray-500">
            Discovered by {username || author}
          </p>
        </div>
      </div> */}