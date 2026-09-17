import React from 'react';

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface InventoryListProps {
  items: InventoryItem[];
}

const InventoryList: React.FC<InventoryListProps> = ({ items }) => {
  return (
    <div className="bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold mb-4">Inventory</h2>
      <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map(item => (
          <li key={item.id} className="bg-white shadow-md p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">{item.name}</h3>
            <div className="mb-2">
              <img src={item.image} alt={item.name} className="w-full h-auto" />
            </div>
            <p className="text-gray-600">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;