"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { usePageData, useGroupedClassifications } from "@/hooks/usePageData";
import { ClassificationTypeIcon } from "@/src/components/classification/ClassificationTypeIcon";
import { AnnotationOptionLabel } from "@/src/components/classification/AnnotationOptionLabel";
import ActivityHeaderSection from "@/src/components/social/activity/ActivityHeaderSection";
import Login from "@/app/auth/page";

export default function UserClassificationsInventoryPage() {
  const session = useSession();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [landmarksExpanded, setLandmarksExpanded] = useState(false);
  const [showTipsPanel, setShowTipsPanel] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { isDark, toggleDarkMode } = UseDarkMode();

  const {
    linkedAnomalies,
    activityFeed,
    profile,
    classifications,
    otherClassifications,
    incompletePlanet,
    planetTargets,
    visibleStructures,
    loading,
  } = usePageData();

  // Debug: log all classificationConfiguration objects
  useEffect(() => {
    if (classifications && classifications.length > 0) {
      console.log("classificationConfigurations:", classifications.map(c => c.classificationConfiguration));
    }
  }, [classifications]);

  // Debug: log all classificationConfiguration objects
  useEffect(() => {
    if (classifications && classifications.length > 0) {
      console.log("classificationConfigurations:", classifications.map(c => c.classificationConfiguration));
    }
  }, [classifications]);

  // Patch: ensure annotationOptions are extracted from classificationConfiguration
  const patchedClassifications = classifications.map((c) => {
    let annotationOptions: string[] = [];
    if (c.classificationConfiguration && typeof c.classificationConfiguration === "object") {
      if (Array.isArray(c.classificationConfiguration.annotationOptions)) {
        annotationOptions = c.classificationConfiguration.annotationOptions as string[];
      }
    }
    return { ...c, annotationOptions };
  });
  const grouped = useGroupedClassifications(patchedClassifications);

  if (!session) {
    return (
      <Login />
    );
  };

  return (
    <div className={`min-h-screen w-full relative flex justify-center ${isDark ? "text-[#E5EEF4]" : "text-[#232a36]"}`}>
      {/* Telescope Background - Full screen behind everything */}
      <div className="fixed inset-0 -z-10">
        {/* You can use a similar background as research, or a themed one for inventory */}
        <div className={isDark ? "bg-gradient-to-br from-[#232a36] via-[#1e293b] to-[#0f172a] w-full h-full" : "bg-gradient-to-br from-[#E5EEF4] via-[#D8E5EC] to-[#BFD7EA] w-full h-full"} />
      </div>
      {/* Main Header */}
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
        activityFeed={activityFeed}
        otherClassifications={otherClassifications}
      />
      {/* Main content with more space from sidebar and reduced width */}
      <div className="w-full flex justify-center pt-24 relative z-10">
        <div className="w-full max-w-3xl px-6 md:px-8 lg:px-12 xl:px-0">
          {/* Activity Header from main page */}
          <div className="mb-10">
            {/* Use the same ActivityHeaderSection as research page */}
            {/* You may need to import ActivityHeaderSection if not already */}
            <ActivityHeaderSection
              classificationsCount={classifications.length}
              landmarksExpanded={landmarksExpanded}
              onToggleLandmarks={() => setLandmarksExpanded((prev) => !prev)}
            />
          </div>
          <main className="w-full flex flex-col gap-0">
            <div className="w-full flex flex-col gap-0">
              <h2 className="text-2xl font-bold mb-6 text-[#81A1C1]">Your Classifications</h2>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : grouped.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No classifications found.</div>
              ) : (
                <div className="space-y-8">
                  {grouped.map(({ type, entries }) => (
                    <div key={type} className="rounded-3xl shadow-xl py-8 px-6 mb-6" style={{background: isDark ? "rgba(35,42,54,0.85)" : "rgba(229,238,244,0.85)"}}>
                      <div className="flex items-center gap-2 mb-4">
                        <ClassificationTypeIcon type={type} className="w-7 h-7" />
                        <span className="text-lg font-semibold capitalize text-[#81A1C1]">{type}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{entries.length} entries</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {entries.map((c) => (
                          <div key={c.id} className="rounded-xl p-5 bg-white/80 dark:bg-[#2E3440]/80 shadow flex flex-col gap-2 border border-[#5E81AC]/30">
                            <div className="flex items-center gap-2">
                              <ClassificationTypeIcon type={type} className="w-5 h-5" />
                              <span className="font-mono text-sm text-primary">ID: {c.id}</span>
                              <span className="text-xs text-muted-foreground ml-auto">{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-foreground mb-1">{c.content || <span className="italic text-muted-foreground">No content</span>}</div>
                            <div className="flex flex-wrap gap-1">
                              {c.annotationOptions && c.annotationOptions.length > 0 ? (
                                c.annotationOptions.map((opt, i) => (
                                  <AnnotationOptionLabel key={i} option={opt} />
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">No annotation options</span>
                              )}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <a
                                href={`/posts/${c.id}`}
                                className="px-3 py-1 rounded bg-primary text-white text-xs font-mono hover:bg-primary/80 transition"
                              >
                                View
                              </a>
                              <button
                                className="px-3 py-1 rounded bg-muted text-foreground text-xs font-mono border border-border hover:bg-muted/80 transition"
                                type="button"
                              >
                                Inspect
                              </button>
                              {type === "planet" && (
                                <a
                                  href={`/planets/paint/${c.id}`}
                                  className="px-3 py-1 rounded bg-[#81A1C1] text-white text-xs font-mono hover:bg-[#5E81AC] transition"
                                >
                                  Paint
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
