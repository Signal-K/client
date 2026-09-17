'use client';

import { ReactNode, CSSProperties } from "react";

export const EarthScene: React.FC<{
    toolbar?: ReactNode;
    topSection?: ReactNode;
    middleSection?: ReactNode;
    bottomSection?: ReactNode;
    middleSectionTwo?: ReactNode;
}> = ({ toolbar, topSection, middleSection, bottomSection, middleSectionTwo }) => {
    // Collect all sections to determine height distribution
    const sections = [topSection, middleSection, middleSectionTwo, bottomSection].filter(Boolean);
    const totalSections = sections.length;

    // Define the flex properties for each section
    const sectionStyles: CSSProperties[] = sections.map((_, index) => {
        // Distribute height for each section
        let flexValue = 0;

        if (index === 0) {
            flexValue = 22.5; // Top section
        } else if (index === 1 || index === 2) {
            flexValue = 15; // Middle sections, reduced height
        } else if (index === 3) {
            flexValue = 22.5; // Bottom section
        }

        return {
            flex: flexValue,
        };
    });

    return (
        <div className="relative min-h-screen w-full flex flex-col">
            <img
                className="absolute inset-0 w-full h-full object-cover"
                src="/assets/Backdrops/Earth.png"
                alt="Earth Background"
            />

            <div className="relative flex flex-col h-full z-10">
                {topSection && (
                    <div className="relative flex" style={sectionStyles[0]}>
                        {topSection}
                    </div>
                )}

                {middleSection && (
                    <div className="mt-4 relative flex" style={sectionStyles[1]}>
                        <div className="w-2/3 h-full mx-auto p-4 overflow-hidden">
                            {middleSection}
                        </div>

                        {toolbar && (
                            <div className="absolute top-0 right-0 h-full flex flex-col justify-center p-7">
                                {toolbar}
                            </div>
                        )}
                    </div>
                )}

                {middleSectionTwo && (
                    <div className="mt-4 relative flex" style={sectionStyles[2]}>
                        <div className="w-2/3 h-full mx-auto p-4 overflow-hidden">
                            {middleSectionTwo}
                        </div>
                    </div>
                )}

                {bottomSection && (
                    <div className="relative flex" style={sectionStyles[3]}>
                        <div className="w-2/3 h-full mx-auto p-4 overflow-hidden">
                            {bottomSection}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};