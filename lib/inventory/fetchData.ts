export async function fetchInventoryData(anomalyId: number, ownerId: string) {
    const response = await fetch(`/api/gameplay/inventory`);
    const data = await response.json();
  
    const filteredItems = data.filter((item: InventoryItem) => 
      item.ItemCategory === 'Minerals' && item.anomaly === anomalyId && item.owner === ownerId
    );
  
    return filteredItems;
}  