import React from "react";
import UserBalanceTable from "../components/Gameplay/Silfur/GlobalBalances";
import CoreLayout from "../components/Core/Layout";

export default function Balance () {
    return (
        <CoreLayout>
            <div className="max-w-3xl mx-auto py-8 font-sans">
                <div className="mb-8">
                    <center><h2 className="text-3xl font-bold mb-4">Player balances</h2></center>
                </div>
            </div>
            <UserBalanceTable />
        </CoreLayout>
    )
}