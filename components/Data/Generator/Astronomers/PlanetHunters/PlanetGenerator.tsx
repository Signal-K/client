import { useState, useEffect } from 'react';
import { PlanetScene } from './planet-scene'; 
import { PlanetControls } from './planet-controls';
import { PlanetImportExport } from './planet-import-export';
import { calculatePlanetStats } from '@/utils/planet-physics';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import type { PlanetStats } from '@/utils/planet-physics';

const TERRESTRIAL_THRESHOLD = 7.5; // Earth masses
const GASEOUS_THRESHOLD = 2.0; // Earth radii

export interface PlanetGeneratorProps {
  classificationConfig?: any;
  content?: string;
  classificationId: string;
  author: string;
};

export default function PlanetGenerator({ classificationConfig, author, classificationId }: PlanetGeneratorProps) {
  const supabase = useSupabaseClient();
  const session = useSession(); 

  const initialMass = classificationConfig?.exportedValue?.mass ?? 1;
  const initialRadius = classificationConfig?.exportedValue?.radius ?? 1;

  const [mass, setMass] = useState(initialMass);
  const [radius, setRadius] = useState(initialRadius);
  const [typeOverride, setTypeOverride] = useState<'terrestrial' | 'gaseous' | null>(null);

  const stats = calculatePlanetStats(mass, radius, typeOverride);

  const handleMassChange = (newMass: number) => {
    if (typeOverride === 'terrestrial' && newMass > TERRESTRIAL_THRESHOLD) {
      setMass(TERRESTRIAL_THRESHOLD);
    } else if (typeOverride === 'gaseous' && newMass <= TERRESTRIAL_THRESHOLD) {
      setMass(TERRESTRIAL_THRESHOLD + 0.1);
    } else {
      setMass(newMass);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    if (typeOverride === 'terrestrial' && newRadius > GASEOUS_THRESHOLD) {
      setRadius(GASEOUS_THRESHOLD);
    } else if (typeOverride === 'gaseous' && newRadius <= GASEOUS_THRESHOLD) {
      setRadius(GASEOUS_THRESHOLD + 0.1);
    } else {
      setRadius(newRadius);
    }
  };

  const handleTypeOverride = (type: 'terrestrial' | 'gaseous' | null) => {
    setTypeOverride(type);
    if (type === 'terrestrial') {
      if (mass > TERRESTRIAL_THRESHOLD) setMass(TERRESTRIAL_THRESHOLD);
      if (radius > GASEOUS_THRESHOLD) setRadius(GASEOUS_THRESHOLD);
    } else if (type === 'gaseous') {
      if (mass <= TERRESTRIAL_THRESHOLD) setMass(TERRESTRIAL_THRESHOLD + 0.1);
      if (radius <= GASEOUS_THRESHOLD) setRadius(GASEOUS_THRESHOLD + 0.1);
    };
  };

  const handleImport = (importedStats: Partial<PlanetStats>) => {
    if (importedStats.mass !== undefined) {
      setMass(importedStats.mass);
    };
    if (importedStats.radius !== undefined) {
      setRadius(importedStats.radius);
    };

    setTypeOverride(null);
  };

  const handleSave = async () => {
    if (!classificationId) {
      console.error('Classification ID is missing.');
      return;
    };

    const idToQuery = typeof classificationId === 'string' ? classificationId : String(classificationId);

    try {
      const { data, error } = await supabase
        .from('classifications')
        .select('classificationConfiguration')
        .eq('id', idToQuery)
        .single();

      if (error) throw error;

      const currentConfig = data?.classificationConfiguration || {};
      const newConfig = {
        ...currentConfig,
        exportedValue: { mass, radius },
      };

      const { error: updateError } = await supabase
        .from('classifications')
        .update({ classificationConfiguration: newConfig })
        .eq('id', idToQuery); 

      if (updateError) throw updateError;

      alert('Planet configuration saved successfully!');
    } catch (err) {
      console.error('Error saving planet configuration:', err);
      alert('Failed to save planet configuration.');
    };
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Procedural Planet Generator</h1>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <PlanetScene stats={stats} />
          <div className="space-y-8">
            <PlanetControls
              stats={stats}
              onMassChange={handleMassChange}
              onRadiusChange={handleRadiusChange}
              onTypeOverride={handleTypeOverride}
            />
            <PlanetImportExport stats={stats} onImport={handleImport} onSave={handleSave} />
            {author === session?.user.id && (
                <button
                onClick={handleSave}
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              >
                Save Configuration
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};