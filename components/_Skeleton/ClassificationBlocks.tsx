import PostFormCardAnomalyTag from "../Content/Classify/AnomalyPostFormCard";
import { ClassificationFeedForIndividualPlanet } from "../Content/Classify/ClassificationFeed";

export const ClassificationForPlanetFormBlock = () => {
    const planetId = "1";

    return (
        <><PostFormCardAnomalyTag planetId={planetId} onPost={null} />You can create posts from here. Go to planets/id for an example in action</>
    );
};

export const ClassificationFeedBlock = () => {
    return (
        <ClassificationFeedForIndividualPlanet planetId="2" backgroundColorSet="bg-blue-200" />
    );
};