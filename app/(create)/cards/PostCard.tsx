"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';
import { Carousel } from 'react-responsive-carousel';

/*
// Missing datatypes
import { Carousel } from 'react-responsive-carousel';
import Modal from '../(classifications)/DataModal';
import { useActivePlanet } from '@/context/ActivePlanet';
*/

interface Classification {
    anomaly: string;
    classificationtype: string | null;
    author: string;
    media: string[];
};

interface ClassificationData {
  id: string;
  media: string;
  data: Record<string, string>;
};

interface ProfileData {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  username: string;
  level: number;
  classifications: number;
  posts: number;
  planets: number;
};

interface ExplorerPost {
  author: ProfileData;
  content: string;
};

const mockData = {

  planet: {
    name: 'Kepler-16b',
    // avatar_url: {activePlanet.avatar_url},
    missionProgress: 65,
  },
  classifications: [
    { 
      type: 'Atmosphere', 
      classifications: [
        {
          id: '001',
          media: '/placeholder.svg',
          data: {
            composition: '70% Nitrogen, 25% Oxygen, 5% Other gases',
            pressure: '1.2 Earth atmospheres',
            temperatureRange: '-50°C to 30°C'
          },
        },
        {
          id: '002',
          media: '/placeholder.svg',
          data: {
            composition: '80% Carbon dioxide, 15% Nitrogen, 5% Argon',
            pressure: '0.8 Earth atmospheres',
            temperatureRange: '-80°C to 10°C'
          },
        },
      ],
      link: '/atmosphere',
      progress: 75
    },
    { 
      type: 'Geology', 
      classifications: [
        {
          id: '001',
          media: '/placeholder.svg',
          data: {
            surface: 'Rocky with large ocean coverage',
            core: 'Iron-nickel, possibly liquid',
            tectonicActivity: 'Moderate, with occasional seismic events'
          },
        },
      ],
      link: '/geology',
      progress: 60
    },
    { 
      type: 'Moons', 
      classifications: [
        {
          id: '001',
          media: '/placeholder.svg',
          data: {
            name: 'Kepler-16b-I',
            radius: '1,500 km',
            orbitalPeriod: '28 Earth days'
          },
        },
        {
          id: '002',
          media: '/placeholder.svg',
          data: {
            name: 'Kepler-16b-II',
            radius: '500 km',
            orbitalPeriod: '7 Earth days'
          },
        },
        {
          id: '003',
          media: '/placeholder.svg',
          data: {
            name: 'Kepler-16b-III',
            radius: '200 km',
            orbitalPeriod: '3 Earth days'
          },
        },
      ],
      link: '/moons',
      progress: 90
    },
    { 
      type: 'Exploration', 
      classifications: [
        {
          id: '001',
          media: '/placeholder.svg',
          data: {
            missions: '3 orbital, 1 lander',
            nextPlannedMission: 'Kepler-16b Sample Return (2030)',
            keyDiscoveries: 'Possible microbial life in upper atmosphere'
          },
        },
      ],
      link: '/exploration',
      progress: 40
    },
  ],
  profile: {
    name: 'Liam',
    role: 'Planet Explorer',
    avatar: '/favicon.ico',
    bio: 'Passionate about exploring new worlds and documenting celestial phenomena.',
    username: 'Gizzmotron',
    level: 25,
    classifications: 10,
    posts: 9,
    planets: 3,
  },
  post: {
    author: {
      name: 'Liam',
      role: 'Planet Explorer',
      avatar: '/favicon.ico',
      bio: 'Passionate about exploring new worlds and documenting celestial phenomena.',
      username: 'Gizzmotron',
      level: 25,
      classifications: 10,
      posts: 9,
      planets: 3,
    },
    content: "Just completed a fascinating analysis of Kepler-16b's atmosphere! The data suggests a unique composition of gases that could potentially support microbial life. Can't wait to share my full report with the team. #SpaceExploration #Kepler16b",
  }
};

export function PostCard() {
    const session = useSession();
    const { activePlanet, classifications } = useActivePlanet();

    const [selectedClassification, setSelectedClassification] = useState<Classification | null>(null);
    const [completeness, setCompleteness] = useState({
        overallCount: 0,
        userCount: 0,
        classificationTypes: {}
    });

    useEffect(() => {
        const calculateCompleteness = (classifications: Classification[], activePlanetId: string, userId: string) => {
            const requiredTypes = ['lightcurve', 'zoodex', 'roverPhoto', 'marsCloud'];
            let overallCount = 0;
            let userCount = 0;
            let classificationTypes: { [key: string]: { overall: boolean, user: boolean } } = {};
            let otherClassificationsOverall = 0;
            let otherClassificationsUser = 0;
      
            requiredTypes.forEach(type => {
              classificationTypes[type] = {
                overall: classifications.some(c => c.anomaly === activePlanetId && c.classificationtype === type),
                user: classifications.some(c => c.anomaly === activePlanetId && c.classificationtype === type && c.author === userId)
              };
              if (classificationTypes[type].overall) overallCount++;
              if (classificationTypes[type].user) userCount++;
            });
      
            classifications.forEach(c => {
              if (c.anomaly === activePlanetId && !requiredTypes.includes(c.classificationtype || '')) {
                otherClassificationsOverall++;
                if (c.author === userId) otherClassificationsUser++;
              }
            });
      
            overallCount += otherClassificationsOverall > 0 ? 1 : 0;
            userCount += otherClassificationsUser > 0 ? 1 : 0;
      
            classificationTypes['other'] = {
              overall: otherClassificationsOverall > 0,
              user: otherClassificationsUser > 0
            };
      
            return { overallCount, userCount, classificationTypes };
          };
      
          if (activePlanet && classifications.length > 0 && session?.user) {
            const completeness = calculateCompleteness(classifications, activePlanet.id, session.user.id);
            setCompleteness(completeness);
          }
    }, [classifications, activePlanet, session]);

  const [selectedMedia, setSelectedMedia] = useState<{ [key: string]: number }>({
    Atmosphere: 0,
    Geology: 0,
    Moons: 0,
    Exploration: 0,
  });

  const lightcurveClassifications = classifications.filter(
    (c: Classification) => c.classificationtype === 'lightcurve'
  );

  const openModal = (classification: Classification) => {
    console.log("Opening modal with classification:", classification);
    setSelectedClassification(classification);
  };
  const closeModal = () => setSelectedClassification(null);

  const [activeClassification, setActiveClassification] = useState<string | null>(null); 
    // const [selectedClassification, setSelectedClassification] = useState<any | null>(null);

    //   const { activePlanet, classifications } = useActivePlanet();

    //   const lightcurveClassifications = classifications.filter(
    //     c => c.classificationtype === 'lightcurve'
    //   );

    //   const openModal = (classification: any) => {
    //     console.log("Opening modal with classification:", classification);
    //     setSelectedClassification(classification);
    //   };
    //   const closeModal = () => setSelectedClassification(null);

    //   console.log("Lightcurve Classifications:", lightcurveClassifications);

  return (
    <Card className="w-full max-w-md mx-auto rounded-2xl overflow-hidden flex flex-col h-[80vh]">
      <motion.div 
        className="relative h-1/5"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src={activePlanet.avatar_url}
          alt={activePlanet.content}
          layout="fill"
          objectFit="cover"
        />
        <motion.div 
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <Progress value={mockData.planet.missionProgress} className="mt-2" />
          </motion.div>
          <motion.div 
            className="flex justify-between text-sm text-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <span>Mission Progress:</span>
            <motion.span
              className="text-right font-semibold text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              {mockData.planet.missionProgress}%
            </motion.span>  
          </motion.div>
        </motion.div>
        <motion.h2 
          className="absolute top-4 left-4 text-2xl font-bold text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {activePlanet.content}
        </motion.h2>
      </motion.div>
      
      <motion.div 
        className="flex-grow overflow-y-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-2 text-primary">Classifications</h3>
        <motion.div 
          className="grid grid-cols-2 gap-2"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {mockData.classifications.map((classification, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <motion.div 
                  className="relative cursor-pointer"
                  onClick={() => setActiveClassification(classification.type)}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    show: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={lightcurveClassifications[0].media[1]}
                    alt={classification.type}
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-foreground text-sm font-medium">{classification.type}</p>
                  </div>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <motion.div 
                  className="grid gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-lg font-semibold text-foreground">{classification.type} Classification</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                    <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 50px)' }}>
            <h2 className="text-xl font-bold mb-4">Classification Details</h2>
            <Carousel showThumbs={false} infiniteLoop={true} dynamicHeight={true}>
              {selectedClassification?.media.map((url: string, index: number) => (
                <div key={index} className="mb-4">
                  <img
                    src={url}
                    alt={`Lightcurve ${index}`}
                    className="w-full object-cover"
                  />
                </div>
              ))}
            </Carousel>
            <pre>{JSON.stringify(selectedClassification, null, 2)}</pre>
            <div className="p-4">
        <h3 className="text-lg font-bold">Completeness</h3>
        <p>Overall Classification Types: {completeness.overallCount} / 5</p>
        <p>User Classification Types: {completeness.userCount} / 5</p>
      </div></div>
                      {classification.classifications.map((classificationItem, classificationIndex) => (
                        <Image
                          key={classificationIndex}
                          src={lightcurveClassifications[0].media[1]}
                          alt={`${classification.type} ${classificationIndex + 1}`}
                          width={180}
                          height={180}
                          className={`rounded-md object-cover mb-2 ${classification.classifications.length > 1 ? 'cursor-pointer' : ''}`}
                          onClick={() => {
                            if (classification.classifications.length > 1) {
                              setSelectedMedia(prevState => ({
                                ...prevState,
                                [classification.type]: classificationIndex
                              }));
                            }
                          }}
                        />
                      ))}
                    </div>
                    <div>
                      {Object.entries(classification.classifications[selectedMedia[classification.type]].data).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <p className="text-sm font-semibold text-foreground">{key.charAt(0).toUpperCase() + key.slice(1).split(/(?=[A-Z])/).join(" ")}</p>
                          <p className="text-sm text-muted-foreground">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1 text-primary">Progress</p>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1 }}
                    >
                      <Progress value={classification.progress} className="h-2" />
                    </motion.div>
                    <motion.p 
                      className="text-xs text-right mt-1 text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                    >
                      <span className="font-semibold text-muted-foreground">{classification.progress}%</span>
                    </motion.p>
                  </div>
                  <Button asChild>
                    <a href={`${classification.link}/${classification.classifications[selectedMedia[classification.type]].id}`}>
                      View Full Classification
                    </a>
                  </Button>
                </motion.div>
                
              </DialogContent>
            </Dialog>
          ))}
        </motion.div>

        <motion.div 
          className="mt-6 mb-6"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Separator />
        </motion.div>
        
        <h3 className="text-lg font-semibold mb-2 text-primary">Post</h3>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={mockData.profile.avatar} alt={mockData.profile.name} />
                  <AvatarFallback>{mockData.profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-base sm:text-lg text-primary">{mockData.profile.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{mockData.profile.role}</p>
                </div>
              </div>
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium self-start sm:self-auto">
                🏆 Lvl {mockData.profile.level}
              </span>
            </div>
            <Separator className="my-2 sm:my-4" />
            <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <div className="prose prose-sm sm:prose-base max-w-none">
                <p className="text-sm sm:text-base text-muted-foreground">{mockData.post.content}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="border-t p-4 flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div className="relative group">
          <div className="flex items-center cursor-pointer">
            <Avatar>
              <AvatarImage src={mockData.profile.avatar} />
              <AvatarFallback>{mockData.profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <p className="font-medium text-primary">{mockData.profile.name}</p>
              <p className="text-sm text-muted-foreground">{mockData.profile.role}</p>
            </div>
          </div>
          <div className="absolute bottom-full left-0 mb-2 w-64 rounded-md shadow-lg bg-popover ring-1 ring-border ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out z-10">
            <div className="py-3 px-4">
              <p className="text-sm text-foreground mb-2">{mockData.profile.bio}</p>
              <p className="text-sm text-foreground">👤 Username: <span className="text-primary">{mockData.profile.username}</span></p>
              <p className="text-sm text-foreground">🏆 Level: <span className="text-primary">{mockData.profile.level}</span></p>
              <p className="text-sm text-foreground">🔍 Classifications: <span className="text-primary">{mockData.profile.classifications}</span></p>
              <p className="text-sm text-foreground">📝 Posts: <span className="text-primary">{mockData.profile.posts}</span></p>
              <p className="text-sm text-foreground">🪐 Planets: <span className="text-primary">{mockData.profile.planets}</span></p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <ShareIcon className="w-5 h-5" />
          <span className="sr-only">Share</span>
        </Button>
      </motion.div>
    </Card>
  );
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}