"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"

type PostHogProviderProps = {
  children: React.ReactNode
  apiKey?: string
  projectId?: string
  region?: string
}

export function PostHogProvider({ children, apiKey, projectId, region }: PostHogProviderProps) {
  useEffect(() => {
    if (!apiKey || posthog.__loaded) {
      return
    }

    const normalizedRegion = (region ?? "").toLowerCase()
    const isEURegion = normalizedRegion.includes("eu")
    const uiHost = isEURegion ? "https://eu.posthog.com" : "https://us.posthog.com"

    posthog.init(apiKey, {
      api_host: "/ingest",
      ui_host: uiHost,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking
      disable_session_recording: false,
      session_recording: {
        maskAllInputs: true,
      },
      loaded: (client) => {
        if (projectId) {
          client.register({ posthog_project_id: projectId })
        }
      },
      debug: process.env.NODE_ENV === "development",
    })
  }, [apiKey, projectId, region])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
