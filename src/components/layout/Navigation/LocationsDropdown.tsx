import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent } from "@/src/components/ui/popover";
import { PopoverTrigger } from "@/src/components/ui/popover";
import MySettlementsLocations from "@/src/components/classification/UserLocations";
import { Sparkle } from "lucide-react";

export function LocationsDropdown() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='ghost' className="relative group flex items-center h-8">
                    <Sparkle className="h-4 w-4 text-yellow-400 group-hover:text-yellow-300 transition-colors flex-shrink-0" />
                    <span className="ml-1 text-yellow-100 font-medium text-sm whitespace-nowrap">My planets</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-black/80 backdrop-blur-md border border-yellow-500/20">
                <div className="p-4 space-y-4">
                    <MySettlementsLocations />
                </div>
            </PopoverContent>
        </Popover>
    );
};