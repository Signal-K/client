"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { usePageData, useGroupedClassifications } from "@/hooks/usePageData";
import { ClassificationTypeIcon } from "@/src/components/classification/ClassificationTypeIcon";
import { AnnotationOptionLabel } from "@/src/components/classification/AnnotationOptionLabel";

export default function UserClassificationsInventoryPage() {
  const supabase = useSupabaseClient();
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

  const grouped = useGroupedClassifications(classifications);

  return (
    <div className="relative min-h-screen w-full flex flex-col text-[#3E3440]">
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
        activityFeed={activityFeed}
        otherClassifications={otherClassifications}
      />

      <div className="max-w-3xl mx-auto w-full py-8 px-4">
        <h2 className="text-2xl font-bold mb-6">Your Classifications</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No classifications found.</div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ type, entries }) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <ClassificationTypeIcon type={type} className="w-7 h-7" />
                  <span className="text-lg font-semibold capitalize">{type}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{entries.length} entries</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entries.map((c) => (
                    <div key={c.id} className="border rounded-lg p-4 bg-card/50 shadow-sm flex flex-col gap-2">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
