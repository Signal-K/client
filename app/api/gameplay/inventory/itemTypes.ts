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
  { id: 23, name: 'Rover 1', description: '', cost: 1, icon_url: 'https://cdn.cloud.scenario.com/assets-transform/asset_ZyHyv4e5QSHJqPofzQ6nN4Wp?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfWnlIeXY0ZTVRU0hKcVBvZnpRNm5ONFdwPyoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3MTkwMTQzOTl9fX1dfQ__&Key-Pair-Id=K36FIAB9LE2OLR&Signature=YTmTZD6uCrxQWeQgZ8jZTp32YbL0ZKg44RZ2ITkbqILAZiIhGNRP~bD8qEF848NqsZzGGXSYnRjdQ2L8-Y1oaEFwqVwPNYJExaR7W3obXDA57ae1HUGrUY5rftyhLVICR-1UKu3TBHgY0RZ4t5CpNOKwAToHjPvFiOrACUAaTJkCznaeBYuCe98Mi6GrRKJA~aLNztTnU162cri~9ETFOWtMgeK2VhKroXEE2EQuJzbJ~6cyepjEDZYBL7SCpv~PyR39C-cwv0SGK9xy~9fAGSoRNcII846Ifgz-X3~Ekz2Mz4KDOnXUiV-hPGzJtY1bGWx-cHZhZgj60H1F6~RCKg__', ItemCategory: 'Automaton', parentItem: 22, itemLevel: 1 }, 
  { id: 24, name: 'Surveyor', description: 'This tool clips onto your telescope receiver and allows you to unlock complex stats about your anomaly.', cost: 1, icon_url: 'https://cdn.cloud.scenario.com/assets-transform/asset_y7ruADK425SWAywZPsigLZdL?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfeTdydUFESzQyNVNXQXl3WlBzaWdMWmRMPyoiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3MTc4MDQ3OTl9fX1dfQ__&Key-Pair-Id=K36FIAB9LE2OLR&Signature=wFvo0s~tygISSAqhM~Dd96uoni2J8xkX9mkisNjA-rFltOwTA~pFXT-3NpLxQVlUzKXAMgGdHTFIaws~CFfB79KyPoiSrrL9G0SO8CRIt7f3QLKI~Txsqk6HxJGq8a-x9B3chnbbMAliK5tcWnzfCr1ZT7Biz59XY-Ixs8MQKGleQFiQrlz2hRPKED7pdj4OBZL0juzjPrvYX20jI7BGeNnhAQ4ZBNDIS4f4WABKnkgKrbbtPlPsM-GRlvTIURa9k9YU47qQUlWdSYNfT3A3GqnIHskLAbuIqECQhA0jy2XNyw9KfibRebN5rWS8TOfujCTxbSy0VXcObe4eOmLvcQ__&quality=80&width=128', ItemCategory: 'Structure', parentItem: 12, itemLevel: 1, recipe: { '13': 1, } },
  { id: 25, name: 'Empty', description: '', cost: 1, icon_url: '', ItemCategory: 'Minerals', parentItem: null, itemLevel: 1},
  { id: 29, name: "Starter Spaceship", description: 'You bravely piloted this spaceship down to your new home', cost: 0, icon_url: '', ItemCategory: 'Vehicles', parentItem: null, itemLevel: 1},
  { id: 30, name: 'Mining station', description: 'Collect an omega amount of resources!', cost: 1, icon_url: '', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1 } },
  { id: 31, name: 'Automaton Upgrade Station', description: 'Add modules to your automatons!', cost: 1, icon_url: '', ItemCategory: 'Structure', parentItem: 22, itemLevel: 1, recipe: { '11': 1 } },
  { id: 28, name: 'Camera Module', description: 'Your automatons can now take photos!', cost: 1, icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIO24cgji4a0syb8AtE9A7cSEWBqCfVU89F5OJ9kcB4-WWVs68-sw-uyJg4vmNuzKTHE8&usqp=CAU', ItemCategory: 'AutomatonModule', parentItem: 23, itemLevel: 1, recipe: { '11': 1} },
  { id: 26, name: 'Meteorology Tool', description: 'Collect cloud info', cost: 1, icon_url: '', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1} }, // Could be updated to be linked to 12?
  { id: 32, name: 'Camera Receiver', description: 'Keep track of all the photos your anomalies have taken', cost: 1, icon_url: '', ItemCategory: 'Structure', parentItem: null, itemLevel: 1, recipe: { '11': 1 } },
];

export async function GET(req: NextRequest) {
  return NextResponse.json(inventoryItems);
};