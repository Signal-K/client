"use client";

import Link from "next/link";
import { Zap, Telescope } from "lucide-react";
import { Classification, LinkedAnomaly } from "@/app/page";
import { useState } from "react";
import { ClassificationIcon, getAnomalyColor } from "@/lib/helper/classification-icons";

interface Props {
  linkedAnomalies: LinkedAnomaly[];
  classifications: Classification[];
}

export default function RecentDiscoveries({ linkedAnomalies, classifications }: Props) {
  const [tab, setTab] = useState<"anomalies" | "yours">("anomalies");

  return (
    <section className="rounded-2xl bg-white/80 p-6 border shadow space-y-6">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Zap className="text-purple-600" />
        Recent Discoveries
      </h3>

      <div className="flex border-b border-gray-300 mb-4">
        {["anomalies", "yours"].map((type) => (
          <button
            key={type}
            className={`py-2 px-4 -mb-px font-semibold rounded-t-lg transition-colors ${
              tab === type
                ? "border-b-4 border-purple-600 bg-gradient-to-r from-purple-200 to-purple-100 text-purple-800 shadow"
                : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
            }`}
            onClick={() => setTab(type as any)}
          >
            {type === "anomalies" ? "Anomalies" : "Your Classifications"}
          </button>
        ))}
      </div>

      {tab === "anomalies" ? (
        linkedAnomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-purple-50 border border-purple-200 rounded-xl p-6 text-center space-y-4 shadow-inner">
            <Telescope className="h-8 w-8 text-purple-500" />
            <h4 className="text-lg font-semibold text-purple-800">
              No objects of interest available
            </h4>
            <p className="text-sm text-purple-700 max-w-md">
              It looks like your telescope hasn't found any anomalies to classify. Try recalibrating and redeploying to a different region.
            </p>
            <Link
              href="/activity/deploy"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition"
            >
              Re-deploy Telescope →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2">
            {linkedAnomalies.map((a) => {
              const anomaly = a.anomaly;
              const isTESS = anomaly?.anomalytype?.toLowerCase().includes("tess");
              const color = getAnomalyColor(anomaly?.anomalytype || "");
              const link = `/structures/telescope/planet-hunters/db-${a.anomaly_id}/classify`;

              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-4 rounded-lg p-4 shadow-md border transition-colors ${
                    isTESS
                      ? "border-purple-400 bg-purple-50 hover:bg-purple-100"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <ClassificationIcon type={anomaly?.anomalytype?.toLowerCase() || null} />
                  </div>
                  <div className="flex flex-col flex-grow min-w-0">
                    <span
                      className="inline-block px-2 py-0.5 mb-1 text-xs font-semibold rounded-full"
                      style={{ backgroundColor: color, color: "white" }}
                    >
                      {anomaly?.anomalytype || "Unknown Type"}
                    </span>
                    <p className="text-sm text-gray-800 truncate" title={anomaly?.content || ""}>
                      {anomaly?.content || "No content"}
                    </p>
                    <Link
                      href={link}
                      className="mt-2 inline-block self-start bg-gradient-to-r from-purple-600 to-purple-500 text-white px-3 py-1 rounded hover:from-purple-700 hover:to-purple-600 text-sm font-medium transition"
                    >
                      Classify →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : classifications.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You haven’t made any classifications yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {classifications.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-4 rounded-lg p-4 shadow-md border border-gray-300 bg-gradient-to-br from-white to-purple-50 hover:from-purple-100 hover:to-purple-100 transition"
            >
              <div className="flex-shrink-0">
                <ClassificationIcon type={c.classificationtype?.toLowerCase() || null} />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold capitalize text-purple-700">
                  {c.classificationtype || "Unknown Type"}
                </p>
                <p className="text-xs text-gray-600 truncate" title={c.content || ""}>
                  {c.content?.slice(0, 100) || "No content"}
                </p>
              </div>
              <Link
                href={`/posts/${c.id}`}
                className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded hover:from-purple-700 hover:to-purple-600 text-sm font-medium transition"
              >
                Explore →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}