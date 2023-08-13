import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CoreLayout from "../../../components/Core/Layout";
import MySpaceships from "../../../components/Gameplay/Spaceships/mySpaceships";
import AllSpaceships from "../../../components/Gameplay/Spaceships/allBuySpaceships";
import MoveShipToPlanet from "../../../components/Gameplay/Spaceships/moveSpaceship";

const SpaceshipsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
      <CoreLayout>
        <div className="container mx-auto p-4 mb-30">
            <h1 className="text-2xl font-semibold mb-4">Your Spaceships</h1>
            <MySpaceships /><br /><br />
            <h1 className="text-2xl font-semibold mb-4">Buy Spaceships</h1>
            <AllSpaceships /><br />
            {isModalOpen && (
              <MoveShipToPlanet onClose={closeModal} />
            )}
        </div>
      </CoreLayout>
  );
};

export default SpaceshipsPage;