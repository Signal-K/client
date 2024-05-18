import { ReactNode } from "react";
import { PlanetLayout } from "@/ui/Sections/PlanetLayout";
import { useMediaQuery } from "react-responsive";
import { useSession } from "@supabase/auth-helpers-react";

interface LayoutProps {
    children: ReactNode;
    bg: boolean;
};

const Layout: React.FC<LayoutProps> = ({ children, bg }) => {
    const isDesktop = useMediaQuery({ query: "(min-width: 1224px)" });
    const isMobile = useMediaQuery({ query: "(max-width: 1224px)" });

    const session = useSession();

    if (!session) {
        return (
            <p>Please log in</p>
        );
    };
    
    return (
        <div>
            {/* {bg && ( */}
                {/* <div
                    className="p-5"
                    style={{
                        backgroundImage: `url("https://cdn.cloud.scenario.com/assets-transform/asset_RDKUVrGJwfXeptXvexzT8yLt?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfUkRLVVZyR0p3ZlhlcHRYdmV4elQ4eUx0P3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNjMzNTk5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=fm371udZ5VT9zI4NbuPSxagoSrh5RlxWtuDIvcpPsTpkmdnSUz36sBBOicpNzMZB9PzNwGwGLd2~3D93gZDjSOW9mI9ysOS48LmYEzvO6pd2uixSXJJAGfmOqQvrTtjYxsHyAXfgiaLD12WZJVsmjjTt3KNOpABZmDo~42rXQ0fwJF80ghYQAldGwEUc4bQnxVL9UAQ0q4FkJY5Hvx8GM8Pk6879-zKKXw26L6gwKJZ-IhPISHBF1lB0dvztkogYbJQbjVl303IOIEsbnPNO~4lkVB79w8Mm40TEg3Mca7gXXUq3LsuYhx3VnjW01Xpu9sDuhauNa3noT4wlUtocCw__")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                /> */}
            
            <div className="flex relative items-start h-screen overflow-y-auto" style={{
                        backgroundImage: `url("https://cdn.cloud.scenario.com/assets-transform/asset_sYraHMnuKLMpacKpBsR8TjCj?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfc1lyYUhNbnVLTE1wYWNLcEJzUjhUakNqP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNzE5OTk5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=lYc4k4L9qOm7lURP9EBdjrzLadXIZiNM989Cnxowqq2hRCIbtDcwCtQni3UCJysLDr0oiuviats892BUJOMMJ5VinAUDR5g4ktAsjJF979FT7ddjz6y-PBHE05nbIHLYM6fMllAZ-YFF9NI9WY~~fL69~zyWuvplAjq5-qFit08eaT2kPz8lYeWGUptQQdGril59-rdws7f0YNlPxt33LtgBPTJtlGj7XGbSRv1WEeoO-HxEklDYE-q4Z7QzB1miUw3jS2T-y3YliPrEWA-Tjipx0Z4841-j8piJtZM3SeiFxiIlygIYT~8JPxjwEFG5~Q3NaJvtlBX-GYtQqIxPMQ__&format=jpeg")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}>
                <main className="h-max pb-10 grow overflow-y-auto "> {/* Insert blur discriminator here if required */}
                    <PlanetLayout>{children}</PlanetLayout>
                </main>
            </div>
        </div>
    );
};

export default Layout;