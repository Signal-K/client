---
title: "Star Sailors: A Comprehensive Guide to Citizen Science"
---

# Star Sailors: A Comprehensive Guide to Citizen Science

This document provides a comprehensive overview of the citizen science projects within the Star Sailors application. It details each project, its connection to the core game mechanics, and the user flow from deployment to discovery.

## 1. Core Concepts

Star Sailors is a gamified platform where users engage in real scientific research by classifying astronomical and planetary data. The core loop involves:

-   **Deployment**: Users deploy virtual structures like Telescopes, Satellites, and Rovers to gather data.
-   **Classification**: Users analyze the collected data, contributing to various research projects.
-   **Progression**: By classifying data, users earn **Stardust**, the primary in-game currency, which is used to research upgrades for their equipment.
-   **Discovery**: Classifications can lead to the discovery of in-game resources like **Mineral Deposits**.
-   **Community**: The platform includes social features like voting and commenting on classifications, fostering a collaborative environment.

## 2. The Deployment Structures

Users interact with the citizen science projects through three main types of deployable structures:

-   **Telescope**: Used for observing celestial objects like exoplanets, asteroids, and sunspots.
-   **Satellite**: Deployed to orbit planets, gathering data on weather patterns, atmospheric composition, and surface features.
-   **Rover**: Deployed on planetary surfaces to analyze terrain and search for minerals.

Each structure has a weekly deployment cycle and can be upgraded through the research system to enhance its capabilities.

## 3. Telescope-Based Citizen Science Projects

The Telescope is the gateway to several deep-space observation projects.

### 3.1. Planet Hunters (TESS and NGTS)

-   **Objective**: Identify exoplanet candidates by analyzing stellar light curves.
-   **User Task**: Users examine graphs of star brightness over time, looking for the characteristic dips that indicate a planet is transiting in front of its star.
-   **Mechanics**:
    -   **TESS**: The introductory level, available to all users.
    -   **NGTS**: A more advanced project with higher-quality data, unlocked via the **NGTS Access** research upgrade (cost: 2 Stardust).
-   **Interconnections**:
    -   Successful planet classifications are the prerequisite for deploying a **Weather Satellite** to that planet.
    -   Planet classifications can be further analyzed to determine planetary statistics like mass, radius, and density, which is a requirement for mineral discovery.

### 3.2. Daily Minor Planet

-   **Objective**: Discover and track asteroids.
-   **User Task**: Users compare a series of images of the same patch of sky, looking for objects that move between frames. This is a classic "blink comparator" task.
-   **Interconnections**: Classifying asteroids can unlock the "Active Asteroids" anomaly set, adding more variety to Telescope deployments.

### 3.3. Sunspot Classification

-   **Objective**: Monitor the activity of a G-type star to provide early warnings of solar flares.
-   **User Task**: Users count and describe the shape of sunspots on images of the star's surface.
-   **Mechanics**: This is a continuous, community-wide effort. There's a 5-minute cooldown between classifications for each user. The total number of community classifications determines the number of sunspots rendered on a 3D model of the star.

### 3.4. Disk Detective

-   **Objective**: Find stars surrounded by circumstellar disks, which are indicators of planetary system formation.
-   **User Task**: Users examine multi-wavelength infrared images to identify stars with extended emission, a sign of a surrounding disk.

## 4. Satellite-Based Citizen Science Projects

Once a user has discovered a planet, they can deploy a satellite to it, unlocking a new suite of atmospheric and surface science projects. Satellite anomalies unlock on a daily schedule unless the user has the "Fast Deploy" gift for new users.

### 4.1. Cloudspotting on Mars

-   **Objective**: Identify and classify cloud formations in the Martian atmosphere.
-   **User Task**: Users draw boundaries around clouds in satellite images and classify them as water ice, CO2, or dust.
-   **Interconnections**:
    -   This is a primary trigger for the **Mineral Deposit System**. A successful cloud classification has a 1-in-3 chance of creating a water-ice or CO2-ice deposit, provided the user has the necessary research unlocked.

### 4.2. Jovian Vortex Hunters (JVH)

-   **Objective**: Study the atmospheric dynamics of gas giants.
-   **User Task**: Users identify and mark cyclonic and anticyclonic vortices (storms) in images of Jupiter-like planets.
-   **Interconnections**: Triggers the discovery of atmospheric minerals like metallic-hydrogen and methane.

### 4.3. Planet Four (P4)

-   **Objective**: Track seasonal changes on the surface of Mars, caused by the sublimation of ice.
-   **User Task**: Users identify and mark "fans" and "blotches," which are dark streaks and patches that appear as ice turns directly into gas.
-   **Interconnections**: Can lead to the discovery of surface deposits like dust, soil, and water-vapor. Requires the `p4Minerals` research to be unlocked.

## 5. Rover-Based Citizen Science Projects

Rovers are deployed to planetary surfaces, allowing for ground-truth analysis.

### 5.1. AI for Mars (AI4M)

-   **Objective**: Train machine learning models for autonomous rover navigation.
-   **User Task**: Users classify terrain features in images taken by a rover, identifying areas of sand, bedrock, soil, and different types of rock.
-   **Interconnections**:
    -   Requires the `findMinerals` research to be unlocked.
    -   Successful terrain classification can trigger the discovery of terrestrial minerals like iron ore, copper, and cultivable soil.
    -   The `roverwaypoints` research upgrade increases the number of waypoints a rover can have, leading to more classification opportunities.

## 6. Other Citizen Science Projects

### 6.1. Zoodex: Burrowing Owls

-   **Objective**: Monitor the behavior of burrowing owls.
-   **User Task**: Users classify images of owls, identifying adults and babies. This project seems to be part of a "Biodome" structure.

## 7. Interconnected Systems

The citizen science projects are deeply integrated with the game's core progression and economy.

### 7.1. The Economy: Stardust

-   Every classification, regardless of the project, earns the user **1 Stardust**.
-   Stardust is spent on the **Research & Upgrade System**.

### 7.2. Research & Upgrades

-   Users spend Stardust to unlock new capabilities and improve their equipment.
-   **Quantity Upgrades** (10 Stardust each): Increase the number of anomalies per deployment (e.g., `probereceptors` for the Telescope).
-   **Data/Measurement Upgrades** (2 Stardust each): Unlock new projects (`ngtsAccess`) or new data within existing projects (`spectroscopy`).
-   **Extraction Upgrades** (2 Stardust each): Enable the extraction of discovered minerals (`roverExtraction`, `satelliteExtraction`).

### 7.3. Mineral Deposit & Extraction System

-   This system is a direct reward for classification.
-   **Trigger**: Completing classifications in projects like Cloudspotting, JVH, P4, and AI4M.
-   **Probability**: There is a 1-in-3 chance of creating a deposit upon a successful, eligible classification.
-   **Requirements**: The user must have the appropriate mineral-finding research unlocked, and the target planet must be "compatible" (i.e., have its physical stats calculated from a satellite survey).
-   **Extraction**: To collect the resources from a deposit, the user must have the corresponding extraction research unlocked.

### 7.4. Social & Community Features

-   **Activity Feed**: Shows recent classifications, comments, and votes from the community.
-   **Voting and Commenting**: Users can provide feedback on each other's classifications. This peer-review system helps validate data.
-   **Rewards for Engagement**: Users are rewarded for social interaction. For example, making 3 votes or 1 comment on others' classifications can earn a user an extra Telescope deployment for the week.
-   **Leaderboards**: Rank users based on their contributions, fostering friendly competition.

## 8. Example User Flow: From First Planet to First Mineral

1.  A new user starts the game and gets the **Fast Deploy** gift.
2.  They deploy their **Telescope** and immediately get access to several anomalies.
3.  They classify a light curve from the **Planet Hunters** project and identify an exoplanet. They earn 1 Stardust. Their Fast Deploy is now used up for future deployments.
4.  Having discovered a planet, they can now deploy a **Satellite** to it. They choose the "Weather Analysis" mission.
5.  The satellite's cloud anomalies unlock over the next few days.
6.  The user classifies a cloud formation in the **Cloudspotting on Mars** project. They earn another Stardust.
7.  Because the user has 2 Stardust, they go to the `/research` page and purchase the `satelliteExtraction` upgrade.
8.  On their next cloud classification, the 1-in-3 probability roll is successful. A **water-ice mineral deposit** is created and linked to their account.
9.  The user navigates to their `/inventory`, sees the new deposit, and because they have the `satelliteExtraction` upgrade, they can perform the extraction minigame to collect the resources.
