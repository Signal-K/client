"use client"

import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect, type ReactNode } from "react"
import posthog from "posthog-js"

type PostHogProviderProps = {
  children: ReactNode
  apiKey?: string
  projectId?: string
  region?: string
}

export function PostHogProvider({ children, apiKey, projectId, region }: PostHogProviderProps) {
  useEffect(() => {
    if (!apiKey) {
      return
    }

    const normalizedRegion = (region ?? "").toLowerCase()
    const isEURegion = normalizedRegion.includes("eu")
    const uiHost = isEURegion ? "https://eu.posthog.com" : "https://us.posthog.com"

    if (!posthog.__loaded) {
      posthog.init(apiKey, {
        api_host: "/ingest",
        ui_host: uiHost,
        person_profiles: "identified_only",
        capture_pageview: true,
        capture_pageleave: true,
        capture_exceptions: true,
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: true,
        },
        loaded: (loadedClient) => {
          if (projectId) {
            loadedClient.register({ posthog_project_id: projectId })
          }
        },
        debug: process.env.NODE_ENV === "development",
      })
    } else if (projectId) {
      posthog.register({ posthog_project_id: projectId })
    }
  }, [apiKey, projectId, region])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
