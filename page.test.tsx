import { useEffect, useState } from 'react'
import { StructureInfo } from './components/structure-info'
import { PlanetInfo } from './components/planet-info'
import { PlantGrid } from './components/plant-grid'
import { PlantDetails } from './components/plant-details'
import { PlantMapView } from './components/plant-map-view'
import { AnimalFollowUp } from './components/animal-follow-up'
import { Plant, Structure, PlantMapData, Animal, Comment } from './types/greenhouse'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

const mockStructure: Structure = {
  id: '1',
  type: 'biolab',
  level: 2,
  substructures: [
    { id: '1a', type: 'greenhouse', level: 1 },
    { id: '1b', type: 'greenhouse', level: 2 },
  ],
}

const mockPlanet = {
  id: '1',
  name: 'Kepler-186f',
  starName: 'Kepler-186',
  temperature: 20,
  humidity: 32,
  atmosphere: 72,
}

const mockPlants: PlantMapData[] = [
  {
    id: '1',
    name: 'Space Fern',
    species: 'Nephrolepis exaltata',
    image: '/placeholder.svg?height=200&width=200',
    location: 'Greenhouse A',
    status: 'healthy',
    oxygenProduction: 5,
    lastWatered: '2 days ago',
    nextWateringDue: 'Tomorrow',
    waterLevel: 60,
    position: { x: 20, y: 30, z: 0.5 },
  },
  {
    id: '2',
    name: 'Cosmic Aloe',
    species: 'Aloe vera',
    image: '/placeholder.svg?height=200&width=200',
    location: 'Biolab',
    status: 'warning',
    oxygenProduction: 3,
    lastWatered: '5 days ago',
    nextWateringDue: 'Today',
    waterLevel: 20,
    position: { x: 50, y: 60, z: 0.7 },
  },
  {
    id: '3',
    name: 'Star Monstera',
    species: 'Monstera deliciosa',
    image: '/placeholder.svg?height=200&width=200',
    location: 'Greenhouse B',
    status: 'healthy',
    oxygenProduction: 7,
    lastWatered: '1 day ago',
    nextWateringDue: 'In 3 days',
    waterLevel: 80,
    position: { x: 80, y: 40, z: 0.6 },
  },
]

const mockComments: Record<string, Comment[]> = {
  'A001': [
    { id: 'C001', text: 'Observed increased hopping height', user: 'Researcher1', timestamp: '1 day ago' },
    { id: 'C002', text: 'Fur appears fluffier in low gravity', user: 'Researcher2', timestamp: '12 hours ago' },
  ],
  'A002': [
    { id: 'C003', text: 'Showing signs of stress, monitoring closely', user: 'Researcher3', timestamp: '2 days ago' },
  ],
  'A003': [
    { id: 'C004', text: 'Bioluminescence intensity has increased', user: 'Researcher4', timestamp: '3 days ago' },
    { id: 'C005', text: 'Wing patterns evolving, documenting changes', user: 'Researcher5', timestamp: '1 day ago' },
  ],
}

export default function Greenhouse() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/automaton-aiForMars/${anomalyid}.jpeg`;
  
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [error, setError] = useState<string | null>(null);

  const [selectedPlant, setSelectedPlant] = useState<PlantMapData | null>(null);
  const [isMapView, setIsMapView] = useState(false);
  const [plants, setPlants] = useState(mockPlants);

  useEffect(() => {
    const fetchAnimals = async () => {
      if (!session) {
        return;
      };

      try {
        const { data: classifications, error: classificationError } = await supabase
          .from('classifications')
          .select('anomaly')
          .eq('author', session.user.id);

        if (classificationError) throw classificationError;

        const classifiedAnomalies = classifications?.map((item) => item.anomaly);

        const { data, error } = await supabase
          .from('anomalies')
          .select(`
            id,
            content,
            anomalytype,
            avatar_url,
            anomalySet
          `)
          .in('id', classifiedAnomalies)
          .eq('anomalytype', 'zoodexOthers');
  
        if (error) throw error;
  
        const formattedAnimals: Animal[] = data?.map((item) => ({
          id: item.id.toString(),
          name: item.content || 'Unknown Animal',
          species: 'Unknown Species',
          image: item.avatar_url || '/placeholder.svg?height=200&width=200',
          projectName: 'Zoodex Project',
          classification: 'Unknown',
          lastObserved: 'Not Available',
          status: 'Unknown', // Default value for missing 'status'
        })) || [];        
  
        setAnimals(formattedAnimals);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch animal data.');
      }
    };
  
    if (session) {
      fetchAnimals();
    }
  }, [session, supabase]);  

  const handleWaterPlant = (plantId: string) => {
    setPlants(prevPlants =>
      prevPlants.map(plant =>
        plant.id === plantId
          ? { ...plant, waterLevel: Math.min(plant.waterLevel + 20, 100) }
          : plant
      ),
    );
  };

  const handleAddStat = (plantId: string, statName: string, statValue: number) => {
    setPlants(prevPlants =>
      prevPlants.map(plant =>
        plant.id === plantId
          ? { ...plant, [statName]: statValue }
          : plant
      )
    )
  }

  const handleAddComment = (animalId: string, comment: string) => {
    const newComment: Comment = {
      id: `C${Date.now()}`,
      text: comment,
      user: 'Current User',
      timestamp: 'Just now',
    }
    setComments(prevComments => ({
      ...prevComments,
      [animalId]: [...(prevComments[animalId] || []), newComment],
    }))
  }

  const handleUpdateClassification = (animalId: string, classification: string) => {
    setAnimals(prevAnimals =>
      prevAnimals.map(animal =>
        animal.id === animalId
          ? { ...animal, classification }
          : animal
      )
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <StructureInfo structure={mockStructure} />
        <PlanetInfo planet={mockPlanet} />
        
        <Tabs defaultValue="animals" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="plants" className="flex-1">Plants</TabsTrigger>
            <TabsTrigger value="animals" className="flex-1">Animals</TabsTrigger>
          </TabsList>
          <TabsContent value="plants">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#2C4F64]">Your Plants</h2>
                <Button
                  variant="outline"
                  onClick={() => setIsMapView(!isMapView)}
                >
                  {isMapView ? 'Grid View' : 'Map View'}
                </Button>
              </div>

              <div className="transition-all duration-300 ease-in-out">
                {selectedPlant ? (
                  <PlantDetails
                    plant={selectedPlant}
                    onBack={() => setSelectedPlant(null)}
                    onWater={handleWaterPlant}
                    onAddStat={handleAddStat}
                  />
                ) : isMapView ? (
                  <PlantMapView
                    plants={plants}
                    onPlantClick={(plant) => setSelectedPlant(plant)}
                  />
                ) : (
                  <PlantGrid 
                    plants={plants} 
                    onPlantClick={(plant) => setSelectedPlant(plant)}
                  />
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="animals">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-[#2C4F64]">Animal Follow-ups</h2>
              {animals.map((animal) => (
                <AnimalFollowUp 
                  key={animal.id}
                  animal={animal}
                  comments={comments[animal.id] || []}
                  onAddComment={handleAddComment}
                  onUpdateClassification={handleUpdateClassification}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};