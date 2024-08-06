import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from "@/components/ui/button";
import { Carousel } from 'react-responsive-carousel';
import Modal from '../(classifications)/DataModal';
import { useActivePlanet } from '@/context/ActivePlanet';

export function PostCard() {
  const { activePlanet, classifications } = useActivePlanet();
  const [selectedClassification, setSelectedClassification] = useState<any | null>(null);

  const lightcurveClassifications = classifications.filter(
    c => c.classificationtype === 'lightcurve'
  );

  const openModal = (classification: any) => {
    console.log("Opening modal with classification:", classification);
    setSelectedClassification(classification);
  };
  const closeModal = () => setSelectedClassification(null);

  console.log("Lightcurve Classifications:", lightcurveClassifications);

  return (
    <Card className="max-w-md w-full mx-auto rounded-2xl overflow-hidden" style={{ height: '70vh' }}>
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
      </div>
      <div className="grid grid-cols-2 gap-4 p-4 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 25%)' }}>
        {/* Atmosphere Panel */}
        <div className="relative">
          {lightcurveClassifications.length > 0 ? (
            <img
              src={lightcurveClassifications[0].media[1]} // Display the first image
              alt="Lightcurve"
              className="w-full object-cover cursor-pointer"
              style={{ aspectRatio: '1 / 1' }}
              onClick={() => openModal(lightcurveClassifications[0])}
            />
          ) : (
            <img
              src="/placeholder.svg"
              alt="Atmosphere"
              className="w-full object-cover"
              style={{ aspectRatio: '1 / 1' }}
            />
          )}
          <div className="p-2 text-sm font-medium text-muted-foreground">Atmosphere</div>
        </div>
        {/* Placeholder for Geology */}
        <div className="relative">
          <img
            src="/placeholder.svg"
            alt="Geology"
            className="w-full object-cover"
            style={{ aspectRatio: '1 / 1' }}
          />
          <div className="p-2 text-sm font-medium text-muted-foreground">Geology</div>
        </div>
        {/* Placeholder for Moons */}
        <div className="relative">
          <img
            src="/placeholder.svg"
            alt="Moons"
            className="w-full object-cover"
            style={{ aspectRatio: '1 / 1' }}
          />
          <div className="p-2 text-sm font-medium text-muted-foreground">Moons</div>
        </div>
        {/* Placeholder for Exploration */}
        <div className="relative">
          <img
            src="/placeholder.svg"
            alt="Exploration"
            className="w-full object-cover"
            style={{ aspectRatio: '1 / 1' }}
          />
          <div className="p-2 text-sm font-medium text-muted-foreground">Exploration</div>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 border-t">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">Shadcn</div>
            <div className="text-xs text-muted-foreground">Planet Explorer</div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <ShareIcon className="w-5 h-5" />
          <span className="sr-only">Share</span>
        </Button>
      </div>
      {selectedClassification && (
        <Modal isOpen={true} onRequestClose={closeModal}>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Classification Details</h2>
            <Carousel showThumbs={false} infiniteLoop={true} dynamicHeight={true}>
              {selectedClassification.media.map((url: string, index: number) => (
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
            <Button onClick={closeModal} className="mt-4">Close</Button>
          </div>
        </Modal>
      )}
    </Card>
  );
}

function ShareIcon(props: any) {
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
};