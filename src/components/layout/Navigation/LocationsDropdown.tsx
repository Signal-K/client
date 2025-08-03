import { Button } from "@/src/components/ui/button";
import { Popover, PopoverContent } from "@/src/components/ui/popover";
import { PopoverTrigger } from "@/src/components/ui/popover";
import MySettlementsLocations from "@/src/components/classification/UserLocations";
import { Sparkle } from "lucide-react";

export function LocationsDropdown() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant='ghost' className="relative group">
                    <Sparkle className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                    <span className="text-yellow-100 font-medium">My planets</span>
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