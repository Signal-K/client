import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../../Card";
import FactionSelection from "../blocks/FactionSelection";

const EmergenceComponent: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">
        {" "}
        The emergence of a Star Sailor{" "}
      </h1>
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">
          {" "}
          Embarking on your cosmic journey{" "}
        </h2>
        <p className="text-gray-700">
          Welcome to the Star Sailors universe, where the cosmos is your
          playground. Before you begin, let's acquaint you with the fundamentals
          that every Star Sailor needs to know.
        </p>{" "}
        <br />
      </div>
      <div className="mb-10">
        <img
          src="/assets/Onboarding/Missions/Emergence/EmergenceImage1.png"
          alt="Transit Method"
          className="w-full"
        />
      </div>{" "}
      <br />
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">
          {" "}
          Planets and Exoplanets: Your New Frontier{" "}
        </h2>
        <p className="text-gray-700">
          - Planets: Celestial bodies revolving around a star, with a nearly
          spherical shape, paving the way for your explorations in the Star
          Sailors universe. <br />- Exoplanets: Mysterious worlds orbiting stars
          in other solar systems, holding secrets and potentially groundbreaking
          discoveries.
        </p>
        <br />
        <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
          <p className="text-gray-700">
            Quick Fact: The study of exoplanets can potentially unveil other
            life-sustaining environments in the cosmos.
          </p>
        </blockquote>
      </div>
      <div className="mb-10 flex space-x-4">
        <div className="w-1/2">
          <img
            src="/assets/Onboarding/Missions/Emergence/EmergenceImage2.png"
            alt="Transit Method"
            className="w-full h-auto"
          />
        </div>
        <div className="w-1/2">
          <img
            src="/assets/Onboarding/Missions/Emergence/EmergenceImage3.png"
            alt="Another Image"
            className="w-full h-auto"
          />
        </div>
      </div>
      <br />
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">
          {" "}
          Crafting Your Star Sailor Avatar{" "}
        </h2>
        <ul className="list-disc list-inside ml-6">
          <li className="text-lg">
            Design Your Avatar: Choose from a range of cosmic-inspired outfits
            and appearances.
          </li>
          <li className="text-lg">
            Choose a Backstory: Are you a cosmic scientist or a starry warrior?
            Your choice will shape your adventures.
          </li>
          <li className="text-lg">
            Set Your Cosmic Goal: Define your mission in the universe, learn
            different citizen science disciplines along the way to help you
            better uncover new homes, habitats, desolate space rocks, and solve
            cosmic mysteries.
          </li>
        </ul>
        <br />
        <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
          <p className="text-gray-700">
            Tip: Share your avatar and backstory in the Star Sailor community
            and start connecting with fellow explorers.
          </p>
        </blockquote>
      </div>
      <div className="mb-10">
        <img
          src="/assets/Onboarding/Missions/Emergence/EmergenceImage4.png"
          alt="Transit Method"
          className="w-full"
        />
      </div>{" "}
      <br />
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">
          {" "}
          Join a Faction: Pioneering Real-World Space Science{" "}
        </h2>
        <p className="text-gray-700">
          As you venture into the Star Sailors universe, you align with factions
          deeply rooted in the core disciplines of space science. Each faction
          maintains a foundational focus on space exploration, encouraging
          learning and contributions in real-world open-source space projects:
        </p>{" "}
        <br />
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <h2 className="text-2xl font-semibold mb-4">Cartographers</h2>
            <p className="mb-2">
              Mastering the foundational skills of space exploration and data
              analysis, this faction delves a step further into the art of
              celestial mapping.
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>
                Star Mapper: Learn the basics of star identification and
                collaborate in mapping celestial bodies, a skill that lies at
                the heart of space exploration.
              </li>
              <li>
                Data Decoder: Enhance your understanding of space data, by
                learning to decode intricate patterns that help in identifying
                new celestial phenomena.
              </li>
              <li>
                Light Curve Craftsman: Specialize in light curve analysis, a
                skill central to exoplanet identification, and collaborate in
                open-source space science projects.
              </li>
              <li>
                Meteor Tracker: Branch out into meteor tracking, learning to
                identify meteor patterns and contributing to a global database
                of meteor tracks.
              </li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 p-4"> <img src="/assets/Onboarding/Missions/Emergence/cartographer.png" alt="Faction Image" className="w-full h-auto" /> </div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <h2 className="text-2xl font-semibold mb-4">Guardians</h2>
            <p className="mb-2">
                While grounded in the core skills of space exploration, this faction takes a stewardship role, focusing on the preservation and understanding of celestial environments.
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>
                Celestial Guardian: Learn to identify celestial objects while also focusing on understanding the environments of different celestial bodies.
              </li>
              <li>
                Space Habitat Designer: Engage in discussions and projects on the creation of sustainable habitats in space, building on your foundational space science skills.
              </li>
              <li>
                Astro-Ecologist: While exploring the basics of space exploration, learn to envisage and understand potential ecosystems in the cosmos.
              </li>
              <li>
                Cosmic Weather Forecaster: Build on your knowledge of space phenomena to understand and predict cosmic weather patterns, a vital skill in space exploration.
              </li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 p-4"> <img src="/assets/Onboarding/Missions/Emergence/guardian.png" alt="Faction Image" className="w-full h-auto" /> </div>
        </div>
        <div className="flex flex-wrap">
          <div className="w-full sm:w-1/2 p-4">
            <h2 className="text-2xl font-semibold mb-4">Navigators</h2>
            <p className="mb-2">
                Grounded in the central disciplines of Star Sailors, this faction navigates the fine line between technology and space science, fostering innovation in space exploration.
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>
                Tech Navigator: Learn the foundational skills of space exploration while also getting introduced to the technological marvels that facilitate space journeys.
              </li>
              <li>
                VR Astronomer: Merge technology with space science to create immersive VR experiences that allow for innovative explorations of the cosmos.
              </li>
              <li>
                3D Celestial Modeler: Use your knowledge of celestial bodies to create 3D models, aiding in a deeper understanding and visualisation of space phenomena.
              </li>
              <li>
                Open-Source Contributor: Learn the basics of contributing to open-source space projects, using your knowledge to collaborate and innovate in real-world space initiatives.
              </li>
            </ul>
          </div>
          <div className="w-full sm:w-1/2 p-4"> <img src="/assets/Onboarding/Missions/Emergence/navigator.png" alt="Faction Image" className="w-full h-auto" /> </div>
        </div><br />
        <h2 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Next: Your Star Sailor Mission Awaits</h2>
        With your avatar ready and a basic understanding of the cosmos, you stand on the verge of thrilling discoveries. Up next, a hands-on mission where you will classify your first set of planets, setting the stage for an adventure rich with learning and real-world contributions to space science.
        <div className="mb-10">
        <img
          src="/assets/Onboarding/Missions/Emergence/EmergenceImage5.png"
          alt="Transit Method"
          className="w-full"
        />
      </div>{" "}
      </div><br />
      <Card noPadding={false}>
        <FactionSelection />
      </Card>
      <Link href='/tests/onboarding/'><button className="btn glass">Complete mission</button></Link>
    </div>
  );
};

export default EmergenceComponent;