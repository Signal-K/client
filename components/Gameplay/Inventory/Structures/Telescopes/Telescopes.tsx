"use client";

// A component to show the structures on the user's active planet
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

import CreateBaseClassification, { CreateFirstBaseClassification } from "@/Classifications/ClassificationForm";
import { useProfileContext } from "@/context/UserProfile";
import PlanetData from "@/components/Content/Anomalies/PlanetData";

interface OwnedItem { 
    id: string;
    item: string;
    quantity: number;
    sector: string;
    notes?: string;
};

interface UserStructure {
    id: number;
    item: number; 
    name: string;
    description: string;
    cost: number;
    icon_url: string;
    ItemCategory: string;
    parentItem: number | null;
    itemLevel: number;
    // Function (what is executed upon click)
};

interface SurveyorStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedItem: any;
    structure: any;
  }

export const SurveyorStructureModal: React.FC<SurveyorStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
    const [isActionDone, setIsActionDone] = useState(false);
    const [configuration, setConfiguration] = useState<any>(null);
    const [hasRequiredItem, setHasRequiredItem] = useState<boolean>(false);
    const [gravity, setGravity] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
  
    useEffect(() => {
      if (!activePlanet || !session?.user || !isOpen) return;
  
      async function checkUserItemAndFetchConfiguration() {
        try {
          // Check if the user owns the required item
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory')
            .select('*')
            .eq('item', 24)
            .eq('owner', session?.user.id)
            .single();
  
          if (inventoryError) {
            throw inventoryError;
          }
  
          if (inventoryData) {
            setHasRequiredItem(true);
  
            // Fetch configuration data if the user owns the required item
            const { data: configData, error: configError } = await supabase
              .from('anomalies')
              .select('*')
              .eq('id', activePlanet?.id)
              .single();
  
            if (configError) {
              throw configError;
            }
  
            if (configData) {
              setConfiguration(configData.configuration);
            }
          }
        } catch (error: any) {
          console.error('Error:', error.message);
        }
      }
  
      checkUserItemAndFetchConfiguration();
    }, [activePlanet, session, supabase, isOpen]);
  
    const handleGravityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setGravity(e.target.value);
    };
  
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!configuration || !session?.user) return;
  
      const updatedConfiguration = { ...configuration, gravity: parseFloat(gravity) };
      const content = JSON.stringify(updatedConfiguration);
  
      setLoading(true);
  
      try {
        const { error } = await supabase
          .from('classifications')
          .insert([
            {
              content: content,
              author: session.user.id,
              anomaly: activePlanet?.id,
              classificationtype: 'gravity'
            }
          ]);
  
        const missionData = {
          user: session?.user?.id,
          time_of_completion: new Date().toISOString(),
          mission: 21,
        };
  
        const { error: missionError } = await supabase
          .from('missions')
          .insert([missionData]);
  
        if (missionError) {
          throw missionError;
        };
  
        if (error) {
          throw error;
        }
  
        alert('Gravity value saved successfully!');
        setGravity('');
      } catch (error: any) {
        console.error('Error saving gravity value:', error.message);
      } finally {
        setLoading(false);
      }
    };
  
    if (!isOpen) return null;
  
    if (!hasRequiredItem) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto shadow-lg">
            <p>Need to craft this item</p>
          </div>
        </div>
      );
    }
  
    if (!configuration) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto shadow-lg">
            <p>Loading configuration...</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-auto shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{configuration.ticId}</h2>
            <button className="btn btn-square btn-outline" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="flex flex-col items-center mt-4">
            <p>Mass: {configuration.mass}</p>
            <p>Radius: {configuration.radius}</p>
            <p>Semi-Major Axis: {configuration.smaxis}</p>
            <p>Orbital Period: {configuration.orbital_period}</p>
            <p>Equilibrium Temperature: {configuration.temperatureEq}</p>
            {/* Add other fields as needed */}
          </div>
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="tooltip" data-tip="Please enter the gravity value">
              <label htmlFor="gravity" className="block text-sm font-medium text-gray-700">Gravity</label>
              <input
                type="number"
                id="gravity"
                name="gravity"
                value={gravity}
                onChange={handleGravityChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Gravity'}
            </button>
          </form>
        </div>
      </div>
    );
  };

interface TransitingTelescopeStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedItem: OwnedItem;
    structure: UserStructure;
};

export const TransitingTelescopeStructureModal: React.FC<TransitingTelescopeStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
  const [isActionDone, setIsActionDone] = useState(false);
  const { activePlanet } = useActivePlanet();

  const handleActionClick = () => {
      // Implement action logic here
      setIsActionDone(true);
  };

  if (!isOpen) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${activePlanet?.id}/phased.png`;

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-lg mx-auto shadow-lg overflow-hidden">
              <button className="absolute top-2 right-2 btn btn-square btn-outline" onClick={onClose}>
                  ✕
              </button>
              <div className="p-4 max-h-[80vh] overflow-y-auto">
                  <div className="flex flex-col items-center">
                      <img src={structure.icon_url} alt={structure.name} className="w-24 h-24 mb-2" />
                      <div className="mt-4">
                          <img src={imageUrl} alt={`Active Planet ${activePlanet?.id}`} className="w-full h-auto mb-4" />
                          <p>
                              Your mission is to analyze the phase-folded lightcurve of your home planet. Look closely at the pattern of dips and variations in brightness. This information helps determine if the planet is real.

                              Here are some tips for classifying: <br />

                              Look for Regular Dips: These dips often indicate a planet passing in front of its star. The regularity can confirm its orbit. <br />

                              Assess the Shape: A sharp, symmetrical dip is typical of a planet transit. Asymmetrical or irregular shapes might suggest other phenomena. <br />

                              Use these criteria to decide if the lightcurve reveals a legitimate planet. Write a post and click share when you're ready to submit your findings. Happy exploring!
                          </p>
                          <br />
                          <CreateFirstBaseClassification assetMentioned={imageUrl} />
                          {isActionDone && <p className="mt-2 text-green-500">Action Completed</p>}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};


interface TelescopeReceiverStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedItem: OwnedItem;
    structure: UserStructure;
};

export const TelescopeReceiverStructureModal: React.FC<TelescopeReceiverStructureModalProps> = ({ isOpen, onClose, ownedItem, structure }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [activeModules, setActiveModules] = useState<string[]>([]);
    const [inactiveModules, setInactiveModules] = useState<string[]>([]);

    useEffect(() => {
        if (session && activePlanet && isOpen) {
            getActiveModules();
        }
    }, [session, activePlanet, isOpen]);

    const getActiveModules = async () => {
        try {
            const { data, error } = await supabase
                .from('inventory')
                .select('item')
                .eq('owner', session?.user?.id)
                .eq('anomaly', activePlanet?.id)
                .in('item', [14, 29]);

            if (error) {
                throw error;
            }

            const activeModuleIds = data.map((module: any) => String(module.item));
            setActiveModules(activeModuleIds);
            setInactiveModules(["14", "29"].filter(id => !activeModuleIds.includes(id)));
        } catch (error: any) {
            console.error('Error fetching active telescope modules:', error.message);
        }
    };

    const handleModuleClick = async (moduleId: string) => {
        try {
            const { data, error } = await supabase
                .from('inventory')
                .upsert([
                    {
                        item: moduleId,
                        owner: session?.user?.id,
                        quantity: 1,
                        time_of_deploy: new Date().toISOString(),
                        notes: "Structure",
                        anomaly: activePlanet?.id,
                    },
                ]);

            if (error) {
                throw error;
            }

            console.log('Module created successfully:', data);
            // Refresh active modules after creating the new module
            getActiveModules();
        } catch (error: any) {
            console.error('Error creating module:', error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{structure.name}</h2>
                    <button className="btn btn-square btn-outline" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="flex flex-col items-center mt-4">
                    <img src={structure.icon_url} alt={structure.name} className="w-32 h-32 mb-2" />
                    <p>ID: {ownedItem.id}</p>
                    <p>Description: {structure.description}</p>
                    <div>
                        {inactiveModules.map(moduleId => (
                            <div key={moduleId} className="flex items-center justify-between mb-2">
                                <span>Module {moduleId}</span>
                                <button className="btn btn-primary" onClick={() => handleModuleClick(moduleId)}>Create</button>
                            </div>
                        ))}
                        {activeModules.map(moduleId => (
                            <div key={moduleId} className="flex items-center justify-between mb-2">
                                <span>Module {moduleId}</span>
                                <span>Unlocked</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};