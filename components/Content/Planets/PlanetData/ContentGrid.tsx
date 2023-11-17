import React from "react";
import PostFormCardAnomalyTag from "../../Classify/AnomalyPostFormCard";
import { ClassificationFeedForIndividualPlanet } from "../../ClassificationFeed";

export default function IndividualBasePlanetGrid(planetId) {
  return (
        <div className="grid grid-cols-2 gap-4">
            <div><PostFormCardAnomalyTag planetId={planetId} onPost={null} /></div>
            <div><ClassificationFeedForIndividualPlanet planetId={{ id: planetId as string }} /> </div>
        </div>
    );
};