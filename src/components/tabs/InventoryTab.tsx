import InventoryViewport from "@/src/components/classification/tools/inventory-viewport";
import { usePageData } from "@/hooks/usePageData";

export default function InventoryTab() {
  const { hasRoverMineralDeposits } = usePageData();

  if (!hasRoverMineralDeposits) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No mineral deposits found yet.</p>
        <p className="text-sm mt-2">Deploy your rover to discover minerals!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InventoryViewport />
    </div>
  );
}
