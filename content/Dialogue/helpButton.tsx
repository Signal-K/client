"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronLeftSquare, ChevronRightSquare, X, PlusSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MissionPathway from "@/components/Missions/Pathway";
import Link from "next/link";
import FreeformUploadData from "@/components/Projects/(classifications)/FreeForm";

const tutorialSteps = [
    {
        title: "Welcome to Star Sailors!", content: "This game can get a bit confusing, so we've prepared a quick guide to help you get started. A lot of the game is changing as we get more feedback and growth so if things change or you get stuck, just check back in with this guide area.", image: "/assets/Backdrops/background1.jpg",
    },
    {
        title: "Your planet - Earth", content: "You've just signed up and begun your journey on Earth! You should see a similar layout to the one below - this is where you can access your structures to make classifications and discoveries. Depending on the project you chose during sign up, you may have a LIDAR (weather station), a Telescope, or a Zoodex (animal classification) module. Click on your structure to get started", image: "/assets/Docs/Guide/OnEarth.png",
    },
    {
        title: "Your first structure", content: "As you can see, I've chosen the Telescope, and there are a few options that are available to me. Depending on which mission you have, there may be one or many options available. To make your first classification, click on the top rectangular button (in my case, it's labelled 'Discover Planets'). You can then choose which data source or project you want to work with, and then the fun begins:", image: '/assets/Docs/Guide/StructureModal.png',
    },
    {
        title: "Selecting data source", content: "Once you've selected your project, you'll be given a tutorial to follow that will teach you how to make a classification and what to look out for.", image: '/assets/Docs/Guide/TutorialExample.png',
    },
    {
        title: 'Making your first classification', content: "For the starter projects, you'll have a series of images to follow and classify. You can make a quick classification by selecting some options in the screen below, and you have the optoin to add some more comments and detail in the text box. When you've done that, click Submit! button", image: '/assets/Docs/Guide/FirstClassification.png',
    },
    {
        title: "Researching next steps", content: "Now that you've made your first classification, you can keep working and discover new anomalies with your structure, as well as researching new structures to work with. If you'd like to find some new projects, click on the + button and create a Research Station", image: '/assets/Docs/Guide/EditMode.png',
    },
    {
        title: "Researching new missions", content: "If you'd like to keep working with the same structure/discipline but want some new data sources, click into your Structure and then click the 'Research' button, which allows you to choose some new projects. These new projects, once researched, can then be accessed in the same way as your first project ", image: '/assets/Docs/Guide/ResearchMissions.png',
    },
    {    
        title: "Researching new structures", content: "For every classification you make, you earn points. You can spend these points on new structures and equipments. If you've had enough of Earth and would like to explore, research and create a launchpad by first selecting it in the Research Station and then building it in the Edit Menu, accessed by clicking the + button in the center of the screen  "     , image: "/assets/Docs/Guide/ResearchModal.png",
    },
    {
        title: "Chapter 2",  content: "Chapter 2 begins when you feel ready to step off Earth and start exploring the Solar System. This unlocks new missions and new data for existing missions. Research and create a launchpad to start this process", image: '/assets/Docs/Guide/TravelInfo.png',
    },
    {
        title: "Travelling", content: "You can browse through the list of planets your ship is capable of reaching from the launchpad on Earth and what missions are available. When you're satisfied, click on 'Travel to this planet' button and then select the mission that interests you!", image: '/assets/Docs/Guide/AvailableMissions.png',
    },
    {
        title: "You're ready", content: 'If you run into any issues, please contact liam@skinetics.tech'  ,// or use the contact form image: '/assets/Backdrops/garden.png',
    },
];

export default function TutorialPopup() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button size="icon" className="fixed bottom-4 bg-red-800 right-4 rounded-full">
                        <PlusSquareIcon className="text-red-500 h-10 w-10" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <FreeformUploadData />
                </DialogContent>
            </Dialog>
        </div>
    );
};