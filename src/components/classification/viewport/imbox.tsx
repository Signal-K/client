"use client"

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import Section from "@/src/components/sections/Section"
import React, { useState } from "react"
import { Inbox, Bell, Wrench, MessageSquare } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import VotesList from "@/src/components/social/votesonyours"
import AwaitingObjects from "@/src/components/deployment/allLinked"
import InterestingPosts from "@/src/components/social/activity/otherUsersPosts"

export default function ImboxViewport() {
  const supabase = useSupabaseClient()
  const session = useSession()

  const [activeTab, setActiveTab] = useState<"activity" | "objects" | "posts">("activity")

  return (
    <Section sectionId="imbox-viewport" variant="viewport" backgroundType="none" expandLink={"/imbox"} hideInfoButton={true}>
      <div className="relative w-full flex flex-col py-4 md:py-6 imbox-texture">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <Inbox className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Inbox</h2>
        </div>
 
        {/* Tabs */}
        <div className="flex gap-2 mb-4 p-1 bg-muted/50 rounded-lg">
          <Button
            size="sm"
            variant={activeTab === "activity" ? "default" : "ghost"}
            onClick={() => setActiveTab("activity")}
            className="flex-1 gap-2 flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            Activity
          </Button>
          <Button
            size="sm"
            variant={activeTab === "objects" ? "default" : "ghost"}
            onClick={() => setActiveTab("objects")}
            className="flex-1 gap-2 flex items-center justify-center"
          >
            <Wrench className="w-4 h-4" />
            Objects
          </Button>
          <Button
            size="sm"
            variant={activeTab === "posts" ? "default" : "ghost"}
            onClick={() => setActiveTab("posts")}
            className="flex-1 gap-2 flex items-center justify-center"
          >
            <MessageSquare className="w-4 h-4" />
            Posts
          </Button>
        </div>

        {/* Tab content */}
        <div className="min-h-[180px] max-h-[640px] overflow-auto">
          {activeTab === "activity" && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Activity on Your Posts</h3>
              <VotesList />
            </div>
          )}

          {activeTab === "objects" && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Objects Awaiting Discovery</h3>
              <AwaitingObjects />
            </div>
          )}

          {activeTab === "posts" && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">Posts You May Like</h3>
              <InterestingPosts />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .imbox-texture::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(120, 204, 226, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(120, 204, 226, 0.06) 0%, transparent 50%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(120, 204, 226, 0.02) 2px,
              rgba(120, 204, 226, 0.02) 4px
            );
          pointer-events: none;
          z-index: 0;
        }

        .imbox-texture::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url('/noise-2.svg');
          background-repeat: repeat;
          background-size: 200px 200px;
          opacity: 0.12;
          pointer-events: none;
          mix-blend-mode: overlay;
          z-index: 0;
        }

        .imbox-texture > * {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </Section>
  )
}