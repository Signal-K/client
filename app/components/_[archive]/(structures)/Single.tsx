"use client"

// A component to show the structures on the user's active planet
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { OwnedItem, UserStructure } from "./StructureModal";
import { TelescopeReceiverStructureModal, TransitingTelescopeStructureModal } from "@/app/components/_[archive]/Gameplay/Inventory/Structures/Telescopes/Telescopes";
import MiningStationPlaceable from "@/app/components/_[archive]/Gameplay/Inventory/Structures/Mining";
import { AnomalyStructureModal } from "@/app/components/_[archive]/Gameplay/Inventory/Automatons/Automaton";
import { MeteorologyToolModal } from "@/app/components/_[archive]/Gameplay/Inventory/Structures/Telescopes/Terrestrial";
import { AutomatonUpgradeStructureModal } from "@/app/components/_[archive]/Gameplay/Inventory/Structures/Automatons/Automatons";
import { CameraAutomatonModule } from "@/app/components/_[archive]/Gameplay/Inventory/Structures/Automatons/Modules";
import { CameraReceiverStation } from "@/app/components/_[archive]/Gameplay/Inventory/Structures/Automatons/Modules";
import { SurveyorStructureModal } from "@/app/components/_[archive]/Gameplay/Inventory/Structures/Telescopes/Telescopes";
import LaunchpadButton from "@/app/components/_[archive]/Gameplay/Inventory/Structures/Vehicles/Launchpad";

export const PlacedStructureSingle: React.FC<{ ownedItem: OwnedItem; structure: UserStructure; style: any; }> = ({ ownedItem, structure, style }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
<div className={`flex flex-col items-center justify-center p-4 ${style}`}>
<div className="bg-white bg-opacity-20 backdrop-blur-md p-4 rounded-lg shadow-lg text-gray-900">
            <img
                src={structure.icon_url}
                alt={structure.name}
                className="w-16 h-16 mb-2 cursor-pointer"
                onClick={openModal}
            />
            <p className="text-center text-white text-sm font-medium">{structure.name}</p>

            {structure.id === 12 && (
                <TelescopeReceiverStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 14 && (
                <TransitingTelescopeStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 22 && (
                <AnomalyStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 30 && (
                <MiningStationPlaceable
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                    missionId={15}
                />
            )}
            {structure.id === 26 && (
                <MeteorologyToolModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 31 && (
                <AutomatonUpgradeStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 28 && (
                <CameraAutomatonModule
                    // If this component does not handle modal states directly, ensure it's implemented elsewhere
                    // If needed, you can pass other necessary props here
                />
            )}
            {structure.id === 32 && (
                <CameraReceiverStation
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 24 && (
                <SurveyorStructureModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    ownedItem={ownedItem}
                    structure={structure}
                />
            )}
            {structure.id === 33 && (
                <LaunchpadButton />
            )}
        </div>
        </div>
    );
};