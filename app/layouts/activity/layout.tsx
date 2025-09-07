"use client";

import ActivityLayout from "./activity-layout";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <ActivityLayout>{children}</ActivityLayout>;
}