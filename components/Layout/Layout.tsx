"use client";

import React, { ReactNode } from "react";
import BottomMenuLayout from "./BottomMenu";
import { useSession } from "@supabase/auth-helpers-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const session = useSession();

  if (!session) {
    return (
      <>
        {children}
      </>
    );
  };

  return (
    <BottomMenuLayout>
      {children}
    </BottomMenuLayout>
  );
};