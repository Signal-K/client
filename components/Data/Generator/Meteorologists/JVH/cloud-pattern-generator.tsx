import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CloudPattern, AtmosphericLayer } from '../../../../../types/Generators/JVH/atmosphere';
import { atmosphericLayers } from '../../../../../data/atmospheric-layers';
import { Cloud, Wind, TornadoIcon as Hurricane, Waves } from 'lucide-react';

export default function CloudPatternGenerator() {
  const [selectedPattern, setSelectedPattern] = useState<CloudPattern>('featureless');
  const [altitude, setAltitude] = useState(500);

  const getCurrentLayer = (alt: number): AtmosphericLayer => {
    return (
      atmosphericLayers.find(
        (layer) => alt >= layer.minAltitude && alt <= layer.maxAltitude
      ) || atmosphericLayers[0]
    );
  };

  const currentLayer = getCurrentLayer(altitude);

  const patterns: { type: CloudPattern; icon: React.ReactNode; label: string }[] = [
    { type: 'featureless', icon: <Cloud className="w-6 h-6" />, label: 'Featureless' },
    { type: 'turbulent', icon: <Wind className="w-6 h-6" />, label: 'Turbulent' },
    { type: 'vortex', icon: <Hurricane className="w-6 h-6" />, label: 'Vortex' },
    { type: 'bands', icon: <Waves className="w-6 h-6" />, label: 'Bands' },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Cloud Pattern Classifier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pattern Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {patterns.map(({ type, icon, label }) => (
            <Button
              key={type}
              variant={selectedPattern === type ? 'default' : 'outline'}
              className="flex flex-col gap-2 h-auto py-4"
              onClick={() => setSelectedPattern(type)}
            >
              {icon}
              <span className="text-sm">{label}</span>
            </Button>
          ))}
        </div>

        {/* Cloud Visualization */}
        <div className="relative h-48 rounded-lg overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b ${currentLayer.color}`}>
            <div className="absolute inset-0 mix-blend-overlay">
              {selectedPattern === 'featureless' && (
                <div className="w-full h-full bg-white/10" />
              )}
              {selectedPattern === 'turbulent' && (
                <div className="w-full h-full animate-pulse bg-[url('data:image/svg+xml;base64,...')]" />
              )}
              {selectedPattern === 'vortex' && (
                <div className="w-full h-full animate-spin-slow bg-[url('data:image/svg+xml;base64,...')]" />
              )}
              {selectedPattern === 'bands' && (
                <div className="w-full h-full bg-gradient-to-b from-transparent via-white/20 to-transparent bg-[size:100%_20px]" />
              )}
            </div>
          </div>
        </div>

        {/* Altitude Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Altitude: {altitude} km</span>
            <span>Layer: {currentLayer.name}</span>
          </div>
          <Slider
            value={[altitude]}
            min={0}
            max={10000}
            step={10}
            onValueChange={(value) => setAltitude(value[0])}
          />
        </div>

        {/* Atmospheric Information */}
        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold">Atmospheric Composition</h3>
          <div className="flex flex-wrap gap-2">
            {currentLayer.primaryComposition.map((component) => (
              <Badge key={component.name} variant="secondary">
                {component.name}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Temperature:</span>
              <p className="text-muted-foreground">{currentLayer.temperature}</p>
            </div>
            <div>
              <span className="font-medium">Pressure:</span>
              <p className="text-muted-foreground">{currentLayer.pressure}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};