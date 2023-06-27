import React from 'react';

const Instructions: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-primary">
          The first study we’re taking part in is the Planet Hunters project
        </h2>
        <p className="text-gray-700">
          An investigation into the data collected by space observatories like the Kepler Space Telescope & TESS project. These telescopes observe stars in our local neighbourhood to discover evidence of exoplanets orbiting those stars. There are a number of ways that scientists observe stars to find planets, including radial velocity and microlensing, however these telescopes use the transit method.
        </p>
        <div className="my-8">
        <img src="https://file.notion.so/f/s/2fc56936-935f-4149-89c4-0a77c26bb003/Untitled.png?id=ccb438a2-d95a-40db-b0de-9ff9934c4969&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1687865859601&signature=2qBDmjHYlr5h2SdQlVJJiUY2Pa-UCIaD-AXI2cRJvX0&downloadName=Untitled.png" alt="Transit Method" className="w-full" />
        </div>
        <p className="text-gray-700">
          Using the transit method to find exoplanets reveals a lot of information about the planet itself - the size of the dip in light is related to the fraction of light that is being blocked out by a planet - for a given star, a larger planet means the dip is larger, and a smaller planet results in a smaller dip.
        </p>
        <div className="my-8">
        <img src="https://file.notion.so/f/s/93246fc4-b0db-46a7-b488-37a82c7e53d1/Untitled.png?id=f02de9d7-b9a6-41e9-8adc-54b773d5295b&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1687865836212&signature=k7_jX8tNJGmWsazC1V5NrPYXj2uqwJ3BXAG-NgtnMfI&downloadName=Untitled.png" alt="Size Estimation" className="w-full" />
        </div>
        <p className="text-gray-700">
          Space-based satellites such as <a href="https://solarsystem.nasa.gov/missions/gaia/in-depth/" className="text-accent underline">Gaia</a> can tell us the size of stars that TESS looks at, meaning that when a transit event is found, its depth can be used to estimate the size of the planet.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-primary">Why not use AI?</h2>
        <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
          <p className="text-gray-700">
            You might be wondering why astronomers use visual vetting (looking at data by eye) when there are computers that can do this. Computer algorithms are very good at finding certain types of transit events; however, they also tend to miss other types of transits. More specifically, most transit search algorithms require at least two transit events for the algorithm to identify it. This means that machines are biased toward finding short period planets (planets where the duration of a year is very short) and tend to miss the longer period planets.
          </p>
        </blockquote>
      </div>

      <div>
        <h2 className="text-3xl font-bold mb-4 text-primary">Other projects/classifications</h2>
        <p className="text-gray-700">
          There are several citizen science projects that focus on the discovery, analysis, and follow-up of exoplanets - planets outside our Solar System. The Planet Hunters TESS Coffee Chat team works in collaboration with these projects, in particular, <a href="https://www.zooniverse.org/projects/nora-dot-eisner/planet-hunters-tess" className="text-accent underline">Planet Hunters Transiting Exoplanet Survey Satellite</a> or TESS.
        </p>
      </div>
    </div>
  );
};

export default Instructions;
