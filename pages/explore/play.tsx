import React from "react";
import AlchemyUI from "../../components/Gameplay/Sandbox/AlchemyUI";
import Navigation from "../../components/_Core/Section/Navbar";

export default function AlchemyPage() {
    return (
        <>
            <style jsx global>
                {`
                    body {
                        background: url('garden.png') center/cover;
                    }
                    
                    @media only screen and (max-width: 767px) {
                        .planet-heading {
                        color: white;
                        font-size: 24px;
                        text-align: center;
                        margin-bottom: 10px;
                        }
                    }
                `}
           </style>
           <Navigation />
            <AlchemyUI />
        </>
    );
};