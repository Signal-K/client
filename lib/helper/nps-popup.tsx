'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface NPSPopupProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string | null;
};

export default function NPSPopup({ isOpen, onClose, userId }: NPSPopupProps) {
    const supabase = useSupabaseClient();

    return (
        <></>
    );
};