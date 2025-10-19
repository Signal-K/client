import type React from "react";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

interface ToolCardProps {
    icon: React.ReactNode;
    name: string;
    count: number;
    status: "active" | "idle" | "upgrading"
    description: string;
};

export default function ToolCard({
    icon,
    name,
    count,
    status,
    description
}: ToolCardProps) {
    const getStatusColor = ( status: string ) => {
        const colors: Record<string, string> = {
            active: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
            idle: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300",
            upgrading: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        };

        return colors[status] || 'bg-gray-100';
    };

    return (
        <Card className="p-4 hover:shadow-lg transition-all bg-card/50 backdrop-blur-sm">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-base text-foreground">{name}</h3>
                        <Badge className={getStatusColor(status)}>{status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{description}</p>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">Count: {count}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};