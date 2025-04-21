'use client';

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

// Sample data - replace with actual data in your implementation
const techTree = [
    { id: 1, name: "Cameras", level: 1, maxLevel: 5, progress: 10 },
    { id: 2, name: "Navigation", level: 1, maxLevel: 3, progress: 10 },
    { id: 3, name: "Probe distance", level: 0, maxLevel: 4, progress: 10 },
    { id: 4, name: "Weather identification", level: 0, maxLevel: 4, progress: 10 },
];

export default function TechTreeDropdown() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='ghost' className="relative group">
                    <Zap className="h-5 w-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    <span className="ml-2 text-white">Tech Tree</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-black/80 backdrop-blur-md border border-purple-500/20">
                <div className="p-4 space-y-4">
                    <h3 className="text-lg font-bold text-purple-400">Technology</h3>
                    <div className="grid gap-3">
                        {techTree.map((tech) => (
                            <div key={tech.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium text-white">{tech.name}</h4>
                                    <div className="text-purple-400 text-sm font-bold">
                                        Lvl {tech.level}/{tech.maxLevel}
                                    </div>
                                </div>
                                <Progress value={tech.progress} className="h-1.5 mt-2 bg-white/10" />
                            </div>
                        ))}
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white">Full Tech Tree (Soon)</Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};