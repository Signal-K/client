import { ReactNode } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { PlanetLayout } from "@/ui/Sections/PlanetLayout";

interface LayoutProps {
    children: ReactNode;
    bg: any;
}

const backgroundImages = {
    1: "https://cdn.cloud.scenario.com/assets-transform/asset_kndmNKAPEUtbXsQ8vDQzbT9e?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfa25kbU5LQVBFVXRiWHNROHZEUXpiVDllP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=FTz7yIDNNxwS86IhY4imtBY0YJCqLt8PXlmhWFBaL632VuIP13qIzTREaIcxJICHQ7nO2EW-Wi7n97fPlIC580li1uzbeE~ulDXFp2XywZEmwrsybJV82GBTmcUqjAYMcIrZjATFSrIYv9-lA~QH3OtJtyrFAvZrpcLSWlQ4ncxe26-lppuqSrJSlZ4EnuhcCvCqZZYnOQ2de2B0DCi9Qmlqmes4l2AFFXA8oVy9Tsult5x4GxHGvWissoz2PXWHGalLz2b6oIf3kGfcNvj2nWLn1~XlzN1THWkQ4d4uERGsC8x2nn-Wap-~JSmyTvqPmJFFkhIhGFx1roaV1x-6ew__&quality=80&format=jpeg&width=1024",
    2: "https://cdn.cloud.scenario.com/assets-transform/asset_kndmNKAPEUtbXsQ8vDQzbT9e?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfa25kbU5LQVBFVXRiWHNROHZEUXpiVDllP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=FTz7yIDNNxwS86IhY4imtBY0YJCqLt8PXlmhWFBaL632VuIP13qIzTREaIcxJICHQ7nO2EW-Wi7n97fPlIC580li1uzbeE~ulDXFp2XywZEmwrsybJV82GBTmcUqjAYMcIrZjATFSrIYv9-lA~QH3OtJtyrFAvZrpcLSWlQ4ncxe26-lppuqSrJSlZ4EnuhcCvCqZZYnOQ2de2B0DCi9Qmlqmes4l2AFFXA8oVy9Tsult5x4GxHGvWissoz2PXWHGalLz2b6oIf3kGfcNvj2nWLn1~XlzN1THWkQ4d4uERGsC8x2nn-Wap-~JSmyTvqPmJFFkhIhGFx1roaV1x-6ew__&quality=80&format=jpeg&width=1024",
    3: "https://cdn.cloud.scenario.com/assets-transform/asset_kndmNKAPEUtbXsQ8vDQzbT9e?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfa25kbU5LQVBFVXRiWHNROHZEUXpiVDllP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=FTz7yIDNNxwS86IhY4imtBY0YJCqLt8PXlmhWFBaL632VuIP13qIzTREaIcxJICHQ7nO2EW-Wi7n97fPlIC580li1uzbeE~ulDXFp2XywZEmwrsybJV82GBTmcUqjAYMcIrZjATFSrIYv9-lA~QH3OtJtyrFAvZrpcLSWlQ4ncxe26-lppuqSrJSlZ4EnuhcCvCqZZYnOQ2de2B0DCi9Qmlqmes4l2AFFXA8oVy9Tsult5x4GxHGvWissoz2PXWHGalLz2b6oIf3kGfcNvj2nWLn1~XlzN1THWkQ4d4uERGsC8x2nn-Wap-~JSmyTvqPmJFFkhIhGFx1roaV1x-6ew__&quality=80&format=jpeg&width=1024",
    4: "https://cdn.cloud.scenario.com/assets-transform/asset_kndmNKAPEUtbXsQ8vDQzbT9e?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfa25kbU5LQVBFVXRiWHNROHZEUXpiVDllP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=FTz7yIDNNxwS86IhY4imtBY0YJCqLt8PXlmhWFBaL632VuIP13qIzTREaIcxJICHQ7nO2EW-Wi7n97fPlIC580li1uzbeE~ulDXFp2XywZEmwrsybJV82GBTmcUqjAYMcIrZjATFSrIYv9-lA~QH3OtJtyrFAvZrpcLSWlQ4ncxe26-lppuqSrJSlZ4EnuhcCvCqZZYnOQ2de2B0DCi9Qmlqmes4l2AFFXA8oVy9Tsult5x4GxHGvWissoz2PXWHGalLz2b6oIf3kGfcNvj2nWLn1~XlzN1THWkQ4d4uERGsC8x2nn-Wap-~JSmyTvqPmJFFkhIhGFx1roaV1x-6ew__&quality=80&format=jpeg&width=1024",
    5: "https://cdn.cloud.scenario.com/assets-transform/asset_kndmNKAPEUtbXsQ8vDQzbT9e?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfa25kbU5LQVBFVXRiWHNROHZEUXpiVDllP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=FTz7yIDNNxwS86IhY4imtBY0YJCqLt8PXlmhWFBaL632VuIP13qIzTREaIcxJICHQ7nO2EW-Wi7n97fPlIC580li1uzbeE~ulDXFp2XywZEmwrsybJV82GBTmcUqjAYMcIrZjATFSrIYv9-lA~QH3OtJtyrFAvZrpcLSWlQ4ncxe26-lppuqSrJSlZ4EnuhcCvCqZZYnOQ2de2B0DCi9Qmlqmes4l2AFFXA8oVy9Tsult5x4GxHGvWissoz2PXWHGalLz2b6oIf3kGfcNvj2nWLn1~XlzN1THWkQ4d4uERGsC8x2nn-Wap-~JSmyTvqPmJFFkhIhGFx1roaV1x-6ew__&quality=80&format=jpeg&width=1024",
    6: "https://cdn.cloud.scenario.com/assets-transform/asset_kndmNKAPEUtbXsQ8vDQzbT9e?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy10cmFuc2Zvcm0vYXNzZXRfa25kbU5LQVBFVXRiWHNROHZEUXpiVDllP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcyMDM5Njc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=FTz7yIDNNxwS86IhY4imtBY0YJCqLt8PXlmhWFBaL632VuIP13qIzTREaIcxJICHQ7nO2EW-Wi7n97fPlIC580li1uzbeE~ulDXFp2XywZEmwrsybJV82GBTmcUqjAYMcIrZjATFSrIYv9-lA~QH3OtJtyrFAvZrpcLSWlQ4ncxe26-lppuqSrJSlZ4EnuhcCvCqZZYnOQ2de2B0DCi9Qmlqmes4l2AFFXA8oVy9Tsult5x4GxHGvWissoz2PXWHGalLz2b6oIf3kGfcNvj2nWLn1~XlzN1THWkQ4d4uERGsC8x2nn-Wap-~JSmyTvqPmJFFkhIhGFx1roaV1x-6ew__&quality=80&format=jpeg&width=1024"
};

const bgImage = "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2372&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

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
            <PlanetLayout>
                {children}
            </PlanetLayout>
        </div>
    );
};

export function LayoutNoPlanet({ children }: LayoutProps) {
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <PlanetLayout>
                {children}
            </PlanetLayout>
        </div>
    );
};