"use client";

import { SetStateAction, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import MissionList from "../planetScene/availableMissions";
import { Button } from "antd";

const planetTypeColors: { [key: string]: string } = {
  Lush: "#4CAF50",    
  Arid: "#FF9800",      
  Hellhole: "#FF5722", 
  Frozen: "#03A9F4",     
  "GasGiant": "#9C27B0",
  Rocky: "#795548",     
  "IceGiant": "#00BCD4" 
}; 

interface Planet {
  id: number;
  name: string;
  color: string;
  stats: {
    gravity: string;
    temp: string;
  };
  anomaly: number;
  initialisationMissionId: number | null;
  planetType: string; 
}

const planets = [
  {
    id: 10,
    name: "Mercury",
    color: "bg-[#2C3A4A]",
    stats: { gravity: "3.7 m/s²", temp: "430°C" },
    anomaly: 10,
    planetType: 'Arid',
    initialisationMissionId: 100001,
    travelTime: '30 seconds',
  },
  {
    id: 20,
    name: "Venus",
    color: "bg-yellow-200",
    stats: { gravity: "8.87 m/s²", temp: "462°C" },
    anomaly: 20,
    planetType: 'Arid',
    initialisationMissionId: 200001,
    travelTime: '30 seconds',
  },
  {
    id: 69,
    name: "Earth",
    color: "bg-blue-500",
    stats: { gravity: "9.8 m/s²", temp: "15°C" },
    anomaly: 69,
    planetType: 'Lush',
    initialisationMissionId: 300001,
    travelTime: '30 seconds',
  },
  // {
  //   id: 31,
  //   name: "Moon",
  //   color: "bg-[#2C3A4A]",
  //   stats: { gravity: "1.62 m/s²", temp: "-53°C" },
  //   anomaly: 31,
  //   planetType: 'Arid',
  //   initialisationMissionId: null,
  // },
  {
    id: 40,
    name: "Mars",
    color: "bg-red-500",
    stats: { gravity: "3.71 m/s²", temp: "-63°C" },
    anomaly: 40,
    planetType: 'Arid',
    initialisationMissionId: 400001,
    travelTime: '30 seconds',
  },
  // {
  //   id: 50,
  //   name: "Jupiter",
  //   color: "bg-orange-300",
  //   stats: { gravity: "24.79 m/s²", temp: "-108°C" },
  //   anomaly: 50,
  //   planetType: 'Arid',
  //   initialisationMissionId: null,
  //   travelTime: '30 seconds',
  // },
  // {
  //   id: 55,
  //   name: "Europa",
  //   color: "bg-blue-200",
  //   stats: { gravity: "1.31 m/s²", temp: "-160°C" },
  //   anomaly: 51,
  //   planetType: 'Arid',
  //   initialisationMissionId: null,
  //   travelTime: '30 seconds',
  // },
  // {
  //   id: 52,
  //   name: "Io",
  //   color: "bg-yellow-400",
  //   stats: { gravity: "1.79 m/s²", temp: "-143°C" },
  //   anomaly: 52,
  //   planetType: 'Arid',
  //   initialisationMissionId: null,
  //   travelTime: '30 seconds',
  // },
  // {
  //   id: 51,
  //   name: "Amalthea",
  //   color: "bg-red-400",
  //   stats: { gravity: "0.026 m/s²", temp: "-113°C" },
  //   anomaly: 53,
  //   planetType: 'Arid',
  //   initialisationMissionId: null,
  //   travelTime: '30 seconds',
  // },
  // {
  //   id: 60,
  //   name: "Saturn",
  //   color: "bg-yellow-600",
  //   stats: { gravity: "10.44 m/s²", temp: "-139°C" },
  //   anomaly: 60,
  //   planetType: 'Arid',
  //   initialisationMissionId: 600001,
  //   travelTime: '30 seconds',
  // },
  // {
  //   id: 61,
  //   name: "Enceladus",
  //   color: "bg-white",
  //   stats: { gravity: "0.113 m/s²", temp: "-201°C" },
  //   anomaly: 61,
  //   planetType: 'Arid',
  //   initialisationMissionId: null,
  //   travelTime: '30 seconds',
  // },
  // {
  //   id: 70,
  //   name: "Uranus",
  //   color: "bg-cyan-300",
  //   stats: { gravity: "8.69 m/s²", temp: "-197°C" },
  //   anomaly: 70,
  //   planetType: 'Arid',
  //   initialisationMissionId: 700001,
  //   travelTime: '30 seconds',
  // },
  // {
  //   id: 80,
  //   name: "Neptune",
  //   color: "bg-blue-700",
  //   stats: { gravity: "11.15 m/s²", temp: "-214°C" },
  //   anomaly: 80,
  //   planetType: 'Arid',
  //   initialisationMissionId: 800001,
  //   travelTime: '30 seconds',
  // },
];

const usePlanetSwitcher = (initialIndex = 0) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextPlanet = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % planets.length);
  };

  const prevPlanet = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + planets.length) % planets.length);
  };

  return {
    currentPlanet: planets[currentIndex],
    nextPlanet,
    prevPlanet,
    currentIndex,
  };
};