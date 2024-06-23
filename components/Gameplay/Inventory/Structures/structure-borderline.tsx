import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; 

const StructureCard = ({ structure }: { structure: any }) => {
  return (
    <Card className="bg-[#f0f8ff] border border-gray-200 border-[#add8e6] dark:border-gray-800">
      <CardHeader className="flex items-center gap-4">
        <div className="bg-[#e6e6fa] rounded-full p-2 flex items-center justify-center">
          <img src={structure.icon} alt={structure.name} className="w-6 h-6 text-[#708090]" />
        </div>
        <div>
          <CardTitle>{structure.name}</CardTitle>
          <CardDescription>{structure.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {/* Example content specific to each structure */}
        {/* You can map through structure.data to display specific details */}
        {structure.data.map((item: any) => (
          <div key={item.id}>
            <h4 className="text-sm font-medium">{item.label}</h4>
            <p className="text-[#778899]">{item.value}</p>
          </div>
        ))}
        {/* Include dials, graphs, meteorological data, etc., as per structure requirements */}
        {/* For example: */}
        <div>
          <h4 className="text-sm font-medium">Temperature</h4>
          <p className="text-[#778899]">18°C</p>
          <div className="flex items-center mt-2">
            <div className="w-full h-2 bg-[#e6e6fa] rounded-full">
              <div className="w-3/4 h-full bg-[#87ceeb] rounded-full" />
            </div>
            <span className="ml-2 text-[#778899] text-sm">18°C</span>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium">Pressure</h4>
          <p className="text-[#778899]">1.2 atm</p>
          <div className="flex items-center mt-2">
            <div className="w-full h-2 bg-[#e6e6fa] rounded-full">
              <div className="w-4/5 h-full bg-[#87ceeb] rounded-full" />
            </div>
            <span className="ml-2 text-[#778899] text-sm">1.2 atm</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {/* Example action buttons */}
        <Button
          variant="outline"
          size="sm"
          className="border-[#87ceeb] text-[#87ceeb] hover:bg-[#87ceeb] hover:text-white"
        >
          Action 1
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-[#87ceeb] text-[#87ceeb] hover:bg-[#87ceeb] hover:text-white"
        >
          Action 2
        </Button>
      </CardFooter>
    </Card>
  );
};

const ExampleComponent = () => {
  // Example data for a specific structure (replace with your actual data structure)
  const structureData = {
    name: 'Habitat Module',
    description: 'Living quarters for the crew',
    icon: '/path/to/icon.png', // Replace with actual path
    data: [
      { id: 1, label: 'Planet', value: 'Kepler-16b' },
      { id: 2, label: 'Atmosphere', value: 'Nitrogen, Oxygen, Argon' },
      // Add more data fields as needed
    ],
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <StructureCard structure={structureData} />
    </div>
  );
};

export default ExampleComponent;
