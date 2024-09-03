import { ReactNode } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { backgroundImages, bgImage } from "@/constants/backgrounds";

interface LayoutProps {
    children: ReactNode;
    bg: any;
}

export default function Layout({ children }: LayoutProps) {
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    // Asserting that planetId is a number here
    const planetId = Number(activePlanet?.id?? 1); 

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: `url(${(backgroundImages as any)[planetId]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}            
        >
                {children}
        </div>
    );
};

export function OnboardingLayout({ children }: LayoutProps) {
    const session = useSession();

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: `url(${(blur)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}            
        >
                {children}
        </div>
    );
};