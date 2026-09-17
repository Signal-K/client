import React from "react";

export default function AlchemyUI() {
    return (
        <div className="container mx-auto flex flex-col items-center">
            <div className="mb-8 mt-4">
                <canvas id="game-canvas" className="border border-gray-400" style={{ width: '80vw', height: '80vh' }}></canvas>
            </div>
            <div className="flex flex-row space-x-4">
                <div className="bg-blue-500 w-12 h-12 rounded-full"></div>
                <div className="bg-green-500 w-12 h-12 rounded-full"></div>
                <div className="bg-red-500 w-12 h-12 rounded-full"></div>
                <div className="bg-yellow-500 w-12 h-12 rounded-full"></div>
            </div>
        </div>
    );
};