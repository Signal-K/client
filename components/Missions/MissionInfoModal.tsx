import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";

const MissionInfoModal = ({
    show,
    onClose,
    content,
}: {
    show: boolean;
    onClose: () => void;
    content: React.ReactNode;
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
            <div className="w-full h-full flex flex-col p-6 overflow-auto">
                {/* Close button */}
                <Button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-red-600 text-white text-lg font-bold hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
                >
                    Close ✖
                </Button>
                {/* Content */}
                <div className="flex-grow flex items-center justify-center text-gray-200">
                    {content}
                </div>
            </div>
        </div>
    );
};

export default MissionInfoModal;