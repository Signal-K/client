import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CoreLayout from "../../../components/Core/Layout";
import MySpaceships from "../../../components/Gameplay/Spaceships/mySpaceships";
import AllSpaceships from "../../../components/Gameplay/Spaceships/allBuySpaceships";

const SpaceshipsPage: React.FC = () => {

  return (
      <CoreLayout>
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-semibold mb-4">Your Spaceships</h1>
            <MySpaceships /><br /><br />
            <h1 className="text-2xl font-semibold mb-4">Buy Spaceships</h1>
            <AllSpaceships />
        </div>
      </CoreLayout>
  );
};

export default SpaceshipsPage;