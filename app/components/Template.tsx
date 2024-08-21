import { ReactNode } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { backgroundImages, bgImage } from "@/constants/backgrounds";

interface LayoutProps {
    children: ReactNode;
    bg: any;
};
export function OnboardingLayout({ children }: LayoutProps) {
    const session = useSession();
 
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: `url(${(bgImage)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}            
        >
            {/* <PlanetLayout> */}
                {children}
            {/* </PlanetLayout> */}
        </div>
    );
};