import React, { useState, useEffect, Fragment } from "react";
import { Transition } from "@headlessui/react";
import CoreNavigation from "./Navigation";
import CoreSidebar, { GameplaySidebar } from './Sidebar';
import Footer from "./Footer";

export default function CoreLayout ( { children } ) {
    // Handling responsive UI
    const [showNav, setShowNav] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    function handleResize () {
        if (innerWidth <= 640) {
            setShowNav(false);
            setIsMobile(true);
        } else {
            setShowNav(true)
            setIsMobile(false);
        }
    }

    useEffect(() => {
        if (typeof window != undefined) {
            addEventListener("resize", handleResize);
        }

        return () => {
            removeEventListener("resize", handleResize);
        }
    }, []);

    return (
        <>
            <CoreNavigation setShowNav={setShowNav} showNav={showNav} />
            <Transition
                as={Fragment}
                show={showNav}
                enter="transform transition duration-[400ms]"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform duration-[400ms] transition ease-in-out"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
            >
                <CoreSidebar showNav={showNav} />
            </Transition>
            <main
                className={`pt-16 transition-all duration-[400ms] ${
                    showNav && !isMobile ? "pl-56" : ""
                }`}
            >
                <div className="px-4 md:px-16">{children}</div>
            </main>
        </>
    );
};

export function GameplayLayout ( { children } ) {
    // Handling responsive UI
    const [showNav, setShowNav] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    function handleResize () {
        if (innerWidth <= 640) {
            setShowNav(false);
            setIsMobile(true);
        } else {
            setShowNav(true)
            setIsMobile(false);
        }
    }

    useEffect(() => {
        if (typeof window != undefined) {
            addEventListener("resize", handleResize);
        }

        return () => {
            removeEventListener("resize", handleResize);
        }
    }, []);

    return (
        <>
            <CoreNavigation setShowNav={setShowNav} showNav={showNav} />
            <Transition
                as={Fragment}
                show={showNav}
                enter="transform transition duration-[400ms]"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform duration-[400ms] transition ease-in-out"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
            >
                <GameplaySidebar showNav={showNav} />
            </Transition>
            <main
                className={`pt-16 transition-all duration-[400ms] ${
                    showNav && !isMobile ? "pl-56" : ""
                }`}
            >
                <div className="px-4 md:px-16">{children}</div>
            </main>
            {/* <Footer /> */}
        </>
    );
};