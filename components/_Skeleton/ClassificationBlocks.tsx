import PostFormCardAnomalyTag from "../Content/Classify/AnomalyPostFormCard";

export const ClassificationForPlanetFormBlock = () => {
    const planetId = "1";

    return (
        <><PostFormCardAnomalyTag planetId={planetId} onPost={null} />You can create posts from here. Go to planets/id for an example in action</>
    );
};