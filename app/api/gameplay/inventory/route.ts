import { NextRequest, NextResponse } from 'next/server';

interface Recipe {
  [key: string]: number;
}

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  cost: number;
  icon_url: string;
  ItemCategory: string;
  parentItem: number | null;
  itemLevel: number;
  recipe?: Recipe; 
}

// Mock inventory items data
const inventoryItems: InventoryItem[] = [
  { id: 11, name: 'Coal', description: 'You can burn this to create power', cost: 1, icon_url: 'https://raw.githubusercontent.com/Signal-K/client/initialClassification/public/assets/Inventory/Items/Coal.png', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1 },
  { id: 12, name: 'Telescope Signal Receiver', description: 'This tool is used to receive transmissions from your transiting telescope and decode them into readable data. It is also the first component of your main telescope array', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/Telescope2.png?raw=true', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '13': 3, '15': 2 } }, // Originally pointed towards 2 alloy
  { id: 13, name: 'Silicon', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 14, name: 'Transiting Telescope', description: '', cost: 1, icon_url: 'https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true', ItemCategory: 'Structure', parentItem: 12, itemLevel: 1, recipe: { '13': 2, '15': 1 } },
  { id: 15, name: 'Iron', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 16, name: 'Nickel', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 17, name: 'Alloy', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 18, name: 'Fuel', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 19, name: 'Copper', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 20, name: 'Chromium', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 21, name: 'Water', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 22, name: 'Vehicle Structure', description: '', cost: 1, icon_url: 'https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/r2d2.png', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '17': 4, '18': 2 } },
  { id: 23, name: 'Rover 1', description: '', cost: 1, icon_url: 'https://cdn.cloud.scenario.com/assets-transform/asset_W72syfLV9NsePvDbLFVZqFmB?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfVzcyc3lmTFY5TnNlUHZEYkxGVlpxRm1CPyoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3MjAzOTY3OTl9fX1dfQ__&Key-Pair-Id=K36FIAB9LE2OLR&Signature=sJ2~g6W7RbC~kJIIYYgsNvzDAN9cbpNXmgw2GVvnssd0IOHFomHN9wD-1Bq44D~R2gF0XNDTxxpAm4A5ihJO4JP8wyATDhbPTw1Z5YnPpJi6pbShtDKvTziVkDIxgecfMCRCy-5ew83fHUITLT~cWerjT6dayUoEHMwXYh0OWJUOCzRXk6sEBe0pbsS89y78s8HURYmE4ZjXFAlFj-ZfpT3Cmq3CyhsElgirrt3CiK3K5LnuW55EKdlnjf7~vsqDKX4WTVgmtVo-so7ByJjP3MHX3WVzTOQmm~UjGRALkfDSOjiyvtZatpjzx20TXFUStn87xe1NZdbRti5ZWlwhwQ__&quality=80&width=1024', ItemCategory: 'Automaton', parentItem: 22, itemLevel: 1 }, 
  { id: 24, name: 'Surveyor', description: 'This tool clips onto your telescope receiver and allows you to unlock complex stats about your anomaly.', cost: 1, icon_url: 'https://cdn.cloud.scenario.com/assets/asset_eTRkeYatYQRQRwrjjAgYA2Pq?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9lVFJrZVlhdFlRUlFSd3JqakFnWUEyUHE~KiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=G5z~cUSlmAT2IT-qEQuZVOxQsRe-Q1le4erU8YfKnKe0hfsIq4fjmWArcgikYZLDKY8N0~kgPjf0hPQuHyxpYcDWlhmh1u7esBHffDf~5bR0tqjFcChfY6d1q-OCVvwkPxU9CMOOlxmwDYK3U6049ROnSXXZvmWDM7igl~CPaqILXt0bsNEtL4KWTDAfuBkfq7vDt1Jvy0h0k3z8dQ3XKdsFenqeQozdTp6B-y-7vxEbKcUMOqhEnOW0IXg1Z6egwHBD2dUD2fQhk-jAlQ7CbWeFQ~~h~emfyuFRYT7VMkiv2GICV12SENk2KkBnsB1t3kBONrJiUKlr~ekpsilerw__', ItemCategory: 'Structure', parentItem: 12, itemLevel: 1, recipe: { '13': 1, } },
  { id: 25, name: 'Empty', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 29, name: "Starter Spaceship", description: 'You bravely piloted this spaceship down to your new home', cost: 0, icon_url: '', ItemCategory: 'Vehicles', parentItem: null, itemLevel: 1},
  { id: 30, name: 'Mining station', description: 'Used for mass-mining of resources; requires finding a mineral deposit', cost: 1, icon_url: 'https://cdn.cloud.scenario.com/assets/asset_RVonKpKooEnFZ1eE2BWUXZ6V?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9SVm9uS3BLb29FbkZaMWVFMkJXVVhaNlY~KiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=wHfoexwYJf86AIQvJa1LBbRghiH5cSlUE8l69OD2qdSZqod2NS67mL87WnLuRDcyL7UkkjWLmknAc7pIs0MbjriqIYbnX9wAiH6HviQAY8qBjbdymiXqTUHYc7cDenlY4VQUXge-Q-WrL3OC8AiuMcQMxnRt2utcEIompZpbm0HIhrJUMbwm82Z2GqbrVTcVGDC4wgneRgkeHQ0PaLLLZ2eF~1kVgRmeqzgeLuPmSb5sS53h8zPJUvJgdzqwnk7J5qFVWRPYEwwd8w~Im5DIOWwCp4n6NfLiDvhhnHQO91iKzwp2rBlFVJI9uplKgsJzeuxiy-Nqt~955c8O~U~OUQ__', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1 } },
  { id: 31, name: 'Automaton Upgrade Station', description: 'Add modules to your automatons!', cost: 1, icon_url: 'https://cdn.cloud.scenario.com/assets/asset_2aJ4YgN1jVdVYNGBbXk2mf4G?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF8yYUo0WWdOMWpWZFZZTkdCYlhrMm1mNEc~KiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=a3f3nRz~sa5VInQctqN-FSabHw4cUc~6xzVVD96M-x-rEy2FCKPBoyIqc6KX0Hrk7~hxrJ7OWGcUIzUkSbQi-8952ZM1BOTdMh5GE~ufBshDiHlZF7dt01EtGdVBvEsPRo0iY1iWOdcuWN9PiugQgQ9drSvxaBMCQAbgM0kQdbRYvvpgqJJkfqzvBsHOD6Ps0QgjMGAL8tuaIej1nQqFXnYSc8DuH4zWIIZgXomkyzMmmCHFMCk73Ub1WN-1ZxImCB7Hq-TcA9tOWuJBtESZtvKVVBMB6Y1z5HrSmAZXHpWWgDfX8ytWHnGNC-cUfUY51QdE-K6QQ73xBAL~Cm3eCw__', ItemCategory: 'Structure', parentItem: 22, itemLevel: 1, recipe: { '11': 1 } },
  { id: 28, name: 'Camera Module', description: 'Your automatons can now take photos!', cost: 1, icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIO24cgji4a0syb8AtE9A7cSEWBqCfVU89F5OJ9kcB4-WWVs68-sw-uyJg4vmNuzKTHE8&usqp=CAU', ItemCategory: 'AutomatonModule', parentItem: 23, itemLevel: 1, recipe: { '11': 1} },
  { id: 26, name: 'Meteorology Tool', description: 'Collect cloud info', cost: 1, icon_url: 'https://cdn.cloud.scenario.com/assets/asset_GDyX4B8LzvwoZ14h6qJEtiYV?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9HRHlYNEI4THp2d29aMTRoNnFKRXRpWVY~KiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=Rbq7ljfTG540rYTLHfXKQSds-dG6BKhgcFUILaOXPTsQv1KCt5lXrvzuoTLLC96qQi~ONCYpyeBLeupCwZcWsHycT277SHBOCViwyAzr-HDSY76CGNjDnLqlV0loQF-wCgpBDKmWyPB9jRReJhrPeBDVy2FhT4BZ2Sgt3agPZo~TfRwIWw8JY9jjJ2fR1QcBorWYzMz6A528~ISxYoCUS9~Dc0riAk9EmmaF2lemOgouAHIFQjZFP01YZtDHS0Rc4dN0iigVrmWMcA5HIzvklw6TBb0GVC52xvLwld4RXJVwRjR539kl-2409MfdJ9MM7wXAniMCSnFBK9H4xElIng__', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1} }, // Could be updated to be linked to 12?
  { id: 32, name: 'Camera Receiver', description: 'Keep track of all the photos your anomalies have taken', cost: 1, icon_url: 'https://cdn.cloud.scenario.com/assets/asset_FW7mkjNoXMthXGKKCaxZEEyZ?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9GVzdta2pOb1hNdGhYR0tLQ2F4WkVFeVo~KiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=GqUyLAq6H-lo-8KD384E403iPRD9-0AASotaVykHbvqjO15Hq9FIG7M1stWhozd92lMmuzREN8B43zNfbu8sJj4Ho62cCJIuQkJefPAMLgEdV1zyDmcFA4NCSG5dIed01DuBlieUIPX8rMHo5GnEz1RUQ7QaYY7l~FMFcBIoGm-LWHfT0lgktxbzj7WDQIioZMsJb5eYQjPVAz-hpAUoJNL45OnRj6CYKzshNzP~m6Vi68Osln6q7oz8Xt0KAWUgHuEbxD8ePuLB7E2XcTpLP1Qor0D9XjxSHCESNXGZ7abHSkdlCAH7E8owp90iJPJdCwWxzoQHcvXLZUgcvV4MAQ__', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1 } },
  { id: 33, name: 'Launchpad', description: 'You can now refuel and launch spacecraft from here!', cost: 1, icon_url: '', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '15': 1 } }, // Update to be called "VehicleStructure"
];

export async function GET(req: NextRequest) {
  return NextResponse.json(inventoryItems);
};