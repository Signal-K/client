import ProfilePage from "../profiles";
import React from "react";
import { useRouter } from "next/router";

export default function ProfileID () {
    const router = useRouter();
    const { id } = router.query;

    if (!id) {
        return null;
    }

    return <ProfilePage />
}