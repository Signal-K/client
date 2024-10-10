"use client";

import React, { ReactNode } from "react";
import BottomMenuLayout from "./BottomMenu";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <BottomMenuLayout>
      {children}
    </BottomMenuLayout>
  );
};