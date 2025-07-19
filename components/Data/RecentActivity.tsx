"use client";

import { MessageCircle, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";

interface CommentVote {
  type: "comment" | "vote";
  created_at: string;
  content?: string;
  vote_type?: string;
  classification_id: number;
}

interface OtherClassification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  author: string;
  created_at: string;
}

interface RecentActivityProps {
  activityFeed: CommentVote[];
  otherClassifications: OtherClassification[];
  isInsidePanel?: boolean;
}

export default function RecentActivity({
  activityFeed,
  otherClassifications,
  isInsidePanel = false,
}: RecentActivityProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "others">("comments");

  const ClassificationIcon = ({ type }: { type: string | null }) => {
    switch (type) {
      case "planet":
        return (
          <svg className="w-10 h-10 animate-pulse" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="20" fill="#3B82F6" />
            <circle
              cx="32"
              cy="32"
              r="24"
              stroke="#3B82F6"
              strokeOpacity="0.3"
              strokeWidth="4"
            />
            <circle cx="20" cy="24" r="4" fill="white" fillOpacity="0.6" />
          </svg>
        );
      case "cloud":
        return (
          <svg className="w-10 h-10 animate-float" viewBox="0 0 64 64">
            <ellipse cx="32" cy="38" rx="20" ry="12" fill="#60A5FA" />
            <ellipse cx="24" cy="30" rx="12" ry="10" fill="#93C5FD" />
            <ellipse cx="40" cy="30" rx="12" ry="10" fill="#93C5FD" />
          </svg>
        );
      case "telescope-minorPlanet":
        return (
          <svg className="w-10 h-10 animate-spin-slow" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="16" stroke="#FBBF24" strokeWidth="4" />
            <circle cx="32" cy="32" r="8" fill="#F59E0B" />
            <circle cx="44" cy="20" r="4" fill="#FCD34D" />
          </svg>
        );
      case "sunspot":
        return (
          <svg className="w-10 h-10 animate-pulse" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="20" fill="#F59E0B" />
            <path
              d="M32 12v8M32 44v8M12 32h8M44 32h8M20 20l6 6M38 38l6 6M20 44l6-6M38 26l6-6"
              stroke="#B45309"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
            ?
          </div>
        );
    }
  };

  return (
    <section
      className={`rounded-2xl ${
        isInsidePanel ? "bg-card" : "bg-white/80"
      } p-4 border ${
        isInsidePanel ? "border-border" : "border"
      } shadow space-y-4 max-h-[480px] overflow-auto`}
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-2">
        <button
          className={`py-2 px-4 -mb-px font-semibold rounded-t-lg transition-colors ${
            activeTab === "comments"
              ? "border-b-4 border-sky-600 bg-gradient-to-r from-sky-200 to-sky-100 text-sky-800 shadow"
              : "text-gray-600 hover:text-sky-600 hover:bg-sky-50"
          }`}
          onClick={() => setActiveTab("comments")}
        >
          Comments & Votes
        </button>
        <button
          className={`py-2 px-4 -mb-px font-semibold rounded-t-lg transition-colors ${
            activeTab === "others"
              ? "border-b-4 border-indigo-600 bg-gradient-to-r from-indigo-200 to-indigo-100 text-indigo-800 shadow"
              : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
          }`}
          onClick={() => setActiveTab("others")}
        >
          Other Classifications
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "comments" ? (
        <>
          {activityFeed.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No comments or votes in the last 7 days.
            </p>
          ) : (
            <ul className="space-y-2">
              {activityFeed.map((item, idx) => (
                <li
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg p-3 ${
                    isInsidePanel ? "bg-popover" : "bg-slate-100"
                  }`}
                >
                  <div className="pt-1">
                    {item.type === "comment" ? (
                      <MessageCircle
                        className={`${
                          isInsidePanel ? "text-sky-500" : "text-sky-500"
                        }`}
                      />
                    ) : (
                      <Star
                        className={`${
                          isInsidePanel ? "text-yellow-400" : "text-yellow-400"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">
                      {item.type === "comment"
                        ? `Someone commented: "${item.content}"`
                        : `Received a ${
                            item.vote_type === "up" ? "👍 upvote" : "👎 downvote"
                          }`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNowStrict(new Date(item.created_at), {
                        addSuffix: true,
                      })}
                      {" • "}
                      <Link
                        href={`/posts/${item.classification_id}`}
                        className="text-primary hover:underline"
                      >
                        View Post
                      </Link>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          {otherClassifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No recent classifications from other users.
            </p>
          ) : (
            <ul className="space-y-3 pr-2">
              {otherClassifications.map((c) => (
                <li
                  key={c.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border shadow-sm ${
                    isInsidePanel
                      ? "bg-popover border-border"
                      : "bg-slate-50 border-gray-200"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <ClassificationIcon type={c.classificationtype} />
                  </div>
                  <div className="flex-grow">
                    <p
                      className={`text-sm font-semibold capitalize ${
                        isInsidePanel ? "text-indigo-400" : "text-indigo-700"
                      }`}
                    >
                      {c.classificationtype || "Unknown Type"}
                    </p>
                    <p
                      className={`text-xs truncate ${
                        isInsidePanel ? "text-muted-foreground" : "text-gray-600"
                      }`}
                    >
                      {c.content?.slice(0, 100) || "No content"}
                    </p>
                  </div>
                  <Link
                    href={`/posts/${c.id}`}
                    className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-3 py-1 rounded hover:from-indigo-700 hover:to-indigo-600 text-sm font-medium transition"
                  >
                    Explore →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}