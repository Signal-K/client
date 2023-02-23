import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Text, Textarea, Grid, Button } from '@nextui-org/react';
import { useState, useEffect } from "react";

import { withPageAuth } from "@supabase/auth-helpers-nextjs";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const EditJournalArticle: NextPage = () => {
    const supabase = useSupabaseClient();
}