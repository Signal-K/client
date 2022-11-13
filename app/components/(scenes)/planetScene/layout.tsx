"use client";

import React, { useState, CSSProperties } from "react";
import { Header } from "@/app/components/sections/header";
import { Essendonitis, background2, background3, callme, mining } from "@/constants/backgrounds";

interface PlanetViewLayoutProps {
    children: React.ReactNode[];
};

const PlanetViewLayout: React.FC<PlanetViewLayoutProps> = ({ children }) => {
    const [expandedSection, setExpandedSection] = useState<number | null>(null);

    const handleExpand = (index: number) => {
        setExpandedSection(index);
    };

    const handleClose = () => {
        setExpandedSection(null);
    };

    const sectionStyles: CSSProperties[] = [
        {
            backgroundImage: `url(${Essendonitis})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            flex: 8,
        },
        {
            backgroundImage: `url(${background2})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            flex: 6,
        },
        {
            backgroundImage: `url(${background3})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column" as const,
            flex: 20, 
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-col flex-1">
                {children.slice(0, 2).map((child, index) => (
                    <div
                        key={index}
                        className={`flex-1 border-b border-dotted border-gray-300 cursor-pointer ${expandedSection !== null && expandedSection !== index ? "hidden" : "flex"}`}
                        style={expandedSection === null ? sectionStyles[index] : expandedSection === index ? { ...sectionStyles[index], flex: 1 } : {}}
                        onClick={() => expandedSection === null && handleExpand(index)}
                    >
                        {expandedSection === null || expandedSection === index ? (
                            <>
                                {child}
                                {expandedSection === index && (
                                    <button
                                        className="absolute top-4 right-4 text-white bg-red-600 p-4 rounded-full shadow-lg text-lg font-bold z-50"
                                        onClick={handleClose}
                                        style={{
                                            border: "3px solid white",
                                            boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)",
                                        }}
                                    >
                                        Close
                                    </button>
                                )}
                            </>
                        ) : null}
                    </div>
                ))}
                <div
                    className={`flex flex-1 border-b border-dotted border-gray-300 cursor-pointer ${expandedSection !== null && expandedSection !== 2 ? "hidden" : "flex"}`}
                    style={expandedSection === null ? sectionStyles[2] : expandedSection === 2 ? { ...sectionStyles[2], flex: 1 } : {}}
                    onClick={() => expandedSection === null && handleExpand(2)}
                >
                    {expandedSection === null || expandedSection === 2 ? (
                        <div className="flex flex-1 flex-col">
                            <div className="flex-1">{children[2]}</div>
                            <div className="flex-1 border-t border-dotted border-gray-300" style={{ flex: 1 }}>{children[3]}</div>
                            {expandedSection === 2 && (
                                <button
                                    className="absolute top-4 right-4 text-white bg-red-600 p-4 rounded-full shadow-lg text-lg font-bold z-50"
                                    onClick={handleClose}
                                    style={{
                                        border: "3px solid white",
                                        boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)",
                                    }}
                                >
                                        Close
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PlanetViewLayout;

export const TestLayout: React.FC<PlanetViewLayoutProps> = ({ children }) => {
    const [expandedSection, setExpandedSection] = useState<number | null>(null);

    const handleExpand = (index: number) => {
        setExpandedSection(index);
    };

    const handleClose = () => {
        setExpandedSection(null);
    };

    const containerStyle: CSSProperties = {
        backgroundImage: `url(${callme})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        flex: 1,
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex flex-col flex-1" style={containerStyle}>
                {children.slice(0, 2).map((child, index) => (
                    <div
                        key={index}
                        className={`flex-1 border-b border-dotted border-gray-300 cursor-pointer ${expandedSection !== null && expandedSection !== index ? "hidden" : "flex"}`}
                        style={expandedSection === null ? {} : expandedSection === index ? { flex: 1 } : {}}
                        onClick={() => expandedSection === null && handleExpand(index)}
                    >
                        {expandedSection === null || expandedSection === index ? (
                            <>
                                {child}
                                {expandedSection === index && (
                                    <button
                                        className="absolute top-4 right-4 text-white bg-red-600 p-4 rounded-full shadow-lg text-lg font-bold z-50"
                                        onClick={handleClose}
                                        style={{
                                            border: "3px solid white",
                                            boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)",
                                        }}
                                    >
                                        Close
                                    </button>
                                )}
                            </>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SceneLayout: React.FC<PlanetViewLayoutProps> = ({ children }) => { // For sample/test scenes, e.g. mining where we need a header but not the additional sections
    return (
        <div
            className="min-h-screen flex flex-col"
            style={{
                backgroundImage: `url(${(mining)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}            
        >
            <Header />
            {children}
        </div>
    );
};