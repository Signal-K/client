import { ReactNode } from "react";
import { PlanetLayout } from "@/ui/Sections/PlanetLayout";
import { useMediaQuery } from "react-responsive";

interface LayoutProps {
    children: ReactNode;
    bg: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, bg }) => {
    const isDesktop = useMediaQuery({ query: "(min-width: 1224px)" });
    const isMobile = useMediaQuery({ query: "(max-width: 1224px)" });

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
                        // backgroundImage: `url("https://cdn.cloud.scenario.com/assets-transform/asset_RDKUVrGJwfXeptXvexzT8yLt?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfUkRLVVZyR0p3ZlhlcHRYdmV4elQ4eUx0P3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxNjMzNTk5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=fm371udZ5VT9zI4NbuPSxagoSrh5RlxWtuDIvcpPsTpkmdnSUz36sBBOicpNzMZB9PzNwGwGLd2~3D93gZDjSOW9mI9ysOS48LmYEzvO6pd2uixSXJJAGfmOqQvrTtjYxsHyAXfgiaLD12WZJVsmjjTt3KNOpABZmDo~42rXQ0fwJF80ghYQAldGwEUc4bQnxVL9UAQ0q4FkJY5Hvx8GM8Pk6879-zKKXw26L6gwKJZ-IhPISHBF1lB0dvztkogYbJQbjVl303IOIEsbnPNO~4lkVB79w8Mm40TEg3Mca7gXXUq3LsuYhx3VnjW01Xpu9sDuhauNa3noT4wlUtocCw__")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}>
                <main className="h-max pb-10 grow overflow-y-auto">
                    <PlanetLayout>{children}</PlanetLayout>
                </main>
            </div>
        </div>
    );
};

export default Layout;