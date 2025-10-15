import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { getMineralDisplayName, getMineralDescription, type MineralConfiguration } from "@/src/utils/mineralAnalysis";

interface MineralCardProps {
    mineral: MineralConfiguration;
    location: string;
    quantity?: number;
};

export function MineralCard({
    mineral,
    location,
    quantity
}: MineralCardProps) {
    const getMineralColor = (type: string) => {
        const colors: Record<string, string> = {
            "iron-ore": "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
            "cultivable-soil": "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700",
            gold: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
            aluminum: "bg-slate-100 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700",
            "water-ice": "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700",
            silicate: "bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700",
            copper: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700",
        };

        return colors[type] || "bg-gray-100 dark:bg-gray-900/30"
    };

    const getDifficultyColor = (difficulty: string) => {
        const colors: Record<string, string> = {
            easy: "bg-green-500",
            moderate: "bg-yellow-500",
            difficult: "bg-orange-500",
            extreme: "bg-red-500",
        };

        return colors[difficulty] || 'bg-gray-500'
    };

    return (
        <Card className={`p-4 ${getMineralColor(mineral.mineralType)} transition-all hover:shadow-md`}>
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h3 className="font-semibold text-lg text-foreground">{getMineralDisplayName(mineral.mineralType)}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">📍 {location}</p>
                </div>
                <Badge variant="outline" className="text-xs">{mineral.estimatedQuantity}</Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{getMineralDescription(mineral.mineralType)}</p>

            <div className="flex flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Purity:</span>
                    <span className="font-medium">{mineral.purity}%</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getDifficultyColor(mineral.extractionDifficulty)}`} />
                        <span className="font-medium capitalize">{mineral.extractionDifficulty}</span>
                    </div>
                    </div>
                    {quantity && (
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Qty:</span>
                        <span className="font-medium">{quantity} units</span>
                    </div>
                )}
            </div>
        </Card>
    )
};