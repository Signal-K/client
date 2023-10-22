import React, { useState, useEffect } from "react";

interface Props {
    roverImage: {
        id: string;
        content: string;
        image: string;
        planets2: string;
    };
};

export default function RoverImageCard({ roverImage }: Props) {
    const { id, content, image, planets2 } = roverImage;
    return (
        <div className="col-md-4 mb-4">
            <div style={{ width: '100%', height: "200px", overflow: "hidden" }}>
                <img
                    src={image}
                    alt="Rover Image"
                    className="w-100 h-auto"
                />                    
            </div>
        </div>
    )
}