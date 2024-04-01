"use client";
import { cn } from "../../../lib/uitls";
import React from "react";
// import { BentoGrid, BentoGridItem } from "../../_Core/ui/bento-grid";
// import {
//   IconBoxAlignRightFilled,
//   IconClipboardCopy,
//   IconFileBroken,
//   IconSignature,
//   IconTableColumn,
// } from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ItemsVerticalList } from "../Inventory/UserOwnedItems";
// import { MissionList } from "../../Gameplay/mission-list";

export function BentoGridThirdDemo() {
  return (<></>
    // <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
    //   {items.map((item, i) => (
    //     <BentoGridItem
    //       key={i}
    //       title={item.title}
    //       description={item.description}
    //       header={item.header}
    //       className={cn("[&>p:text-lg]", item.className)}
    //       icon={item.icon}
    //     />
    //   ))}
    // </BentoGrid>
  );
}

export function BentoGridMobileDemo() {
    return ( <></>
        // <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem]">
        //   {mobileItems.map((item, i) => (
        //     <BentoGridItem
        //       key={i}
        //       title={item.title}
        //       description={item.description}
        //       header={item.header}
        //       className={cn("[&>p:text-lg]", item.className)}
        //       icon={item.icon}
        //     />
        //   ))}
        // </BentoGrid>
    );
}

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl   dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]  border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black"></div>
);

const SkeletonOne = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-white dark:bg-black"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 w-3/4 ml-auto bg-white dark:bg-black"
      >
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2 items-center space-x-2 bg-white dark:bg-black"
      >
        <div className="h-6 w-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex-shrink-0" />
        <div className="w-full bg-gray-100 h-4 rounded-full dark:bg-neutral-900" />
      </motion.div>
    </motion.div>
  );
};
const SkeletonTwo = () => {
  const variants = {
    initial: {
      width: 0,
    },
    animate: {
      width: "100%",
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      width: ["0%", "100%"],
      transition: {
        duration: 2,
      },
    },
  };
  const arr = new Array(6).fill(0);
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      {arr.map((_, i) => (
        <motion.div
          key={"skelenton-two" + i}
          variants={variants}
          style={{
            maxWidth: Math.random() * (100 - 40) + 40 + "%",
          }}
          className="flex flex-row rounded-full border border-neutral-100 dark:border-white/[0.2] p-2  items-center space-x-2 bg-neutral-100 dark:bg-black w-full h-4"
        ></motion.div>
      ))}
    </motion.div>
  );
};
const SkeletonThree = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] rounded-lg bg-dot-black/[0.2] flex-col space-y-2"
      style={{
        background:
          "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
      }}
    >
      <motion.div className="h-full w-full rounded-lg"></motion.div>
    </motion.div>
  );
};
const SkeletonFour = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-row space-x-2"
    >
      {/* <MissionList /> */}
    </motion.div>
  );
};
const SkeletonFive = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 2,
      rotate: 1.3,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-1 w-full h-full min-h-[6rem] dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex-col space-y-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row rounded-2xl border border-neutral-100 dark:border-white/[0.2] p-2  items-start space-x-2 bg-white dark:bg-black"
      >
        <ItemsVerticalList />
      </motion.div>
    </motion.div>
  );
};
const items = [
  {
    title: "AI Content Generation",
    description: (
      <span className="text-sm">
        Experience the power of AI in generating unique content.
      </span>
    ),
    header: <SkeletonOne />,
    className: "md:col-span-1",
    // icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Automated Proofreading",
    description: (
      <span className="text-sm">
        Let AI handle the proofreading of your documents.
      </span>
    ),
    header: <SkeletonTwo />,
    className: "md:col-span-1",
    // icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Contextual Suggestions",
    description: (
      <span className="text-sm">
        Get AI-powered suggestions based on your writing context.
      </span>
    ),
    header: <SkeletonThree />,
    className: "md:col-span-1",
    // icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "",
    description: (
        null
    ),
    header: <SkeletonFour />,
    className: "md:col-span-2",
    // icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },

  {
    title: "",
    description: (
      null
    ),
    header: <SkeletonFive />,
    className: "md:col-span-1",
    // icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
  },
];

const mobileItems = [
    {
      title: "AI Content Generation",
      description: (
        <span className="text-sm">
          Experience the power of AI in generating unique content.
        </span>
      ),
      header: <SkeletonOne />,
      className: "md:col-span-1",
    //   icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: "",
      description: (
          null
      ),
      header: <SkeletonFour />,
      className: "md:col-span-2",
    //   icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    },
  ];


/*
<div className="flex-col justify-center mt-10">
            <div className="image-container mx-3 absolute top-0 left-1/2 transform -translate-x-1/2 mt-10 mb-10">
              {/* <div className="flex justify-center items-center flex-row mt-20">
                {isDesktopOrLaptop && (
                  <>
                    <img src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png" alt="Planet 1" className="responsive-image h-12 w-12 mx-10" />
                    <img src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/Group%201000002854.png" alt="Planet 2" className="responsive-image h-12 w-12" />
                  </>
                )}
                {isTabletOrMobile && (
                  <>
                    <img src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png" alt="Planet 1" className="responsive-image h-12 w-12 mx-10" />
                    <img src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/Group%201000002854.png" alt="Planet 2" className="responsive-image h-12 w-12" />
                  </>
                )}
              </div> 
              </div>
              {isDesktopOrLaptop && (<OnboardingWindows />)}
              </div>
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 mb-20">
          <div className="flex justify-center mb-20">
            <PlanetCharacter position={characterPosition.planet} />
            <RoverCharacter position={characterPosition.rover} />
          </div>
        </div>*/