"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StarnetLayout from "@/components/Layout/Starnet";
import ProfileCardModal from "@/components/profile/form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StructureMissionGuideMobile } from "@/components/Layout/Guide";

export default function Starnet() {
    return (
        <StarnetLayout>
            <>
                <StructureMissionGuideMobile />
                <Link href='/scenes/earth/'><Button>Play older missions</Button></Link>
            </>
        </StarnetLayout>
    );
};