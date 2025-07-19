"use client";

import Link from "next/link";
import { useState } from "react";
import { Zap, Telescope } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Classification, LinkedAnomaly } from "@/app/page";
import { ClassificationIcon, getAnomalyColor } from "@/lib/helper/classification-icons";

interface Props {
  linkedAnomalies: LinkedAnomaly[];
  classifications: Classification[];
  incompletePlanet: Classification | null;
}

export default function RecentDiscoveries({
  linkedAnomalies,
  classifications,
  incompletePlanet,
}: Props) {
  const [tab, setTab] = useState<"anomalies" | "yours">("anomalies");

  return (
    <Card className="bg-card border border-chart-2/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-chart-2">
            <Zap className="w-4 h-4" />
            Recent Discoveries
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex border-b border-border text-sm font-medium">
          {["anomalies", "yours"].map((type) => (
            <button
              key={type}
              onClick={() => setTab(type as any)}
              className={`py-2 px-3 rounded-t-md transition-all ${
                tab === type
                  ? "bg-background border border-b-transparent border-border text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              {type === "anomalies" ? "Anomalies" : "Your Classifications"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "anomalies" ? (
          linkedAnomalies.length === 0 && !incompletePlanet ? (
            <div className="flex flex-col items-center justify-center bg-muted/20 border border-dashed border-border rounded-xl p-6 text-center space-y-3">
              <Telescope className="h-6 w-6 text-chart-2" />
              <h4 className="text-sm font-semibold text-chart-2">
                No objects of interest available
              </h4>
              <p className="text-xs text-muted-foreground max-w-md">
                It looks like your telescope hasn't found any anomalies to classify. Try recalibrating and redeploying to a different region.
              </p>
              <Link
                href="/activity/deploy"
                className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded-md font-medium transition"
              >
                Re-deploy Telescope →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {linkedAnomalies.map((a) => {
                const anomaly = a.anomaly;
                const type = anomaly?.anomalytype?.toLowerCase();
                const isTESS = type?.includes("tess");
                const color = getAnomalyColor(type || "");

                let link = "#";
                if (type === "planet") {
                  link = `/structures/telescope/planet-hunters/db-${a.anomaly_id}/classify`;
                } else if (type === "cloud") {
                  link = `/structures/balloon/cloudspotting/db-${a.anomaly_id}/classify`;
                }

                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 p-3 rounded-md border border-border shadow-sm transition hover:bg-muted/10 ${
                      isTESS ? "bg-purple-50/40" : "bg-background"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <ClassificationIcon type={type || null} />
                    </div>
                    <div className="flex flex-col flex-grow min-w-0">
                      <span
                        className="inline-block px-2 py-0.5 mb-1 text-[10px] font-semibold rounded-full"
                        style={{ backgroundColor: color, color: "white" }}
                      >
                        {anomaly?.anomalytype || "Unknown Type"}
                      </span>
                      <p className="text-sm text-foreground truncate" title={anomaly?.content || ""}>
                        {anomaly?.content || "No content"}
                      </p>
                      <Link
                        href={link}
                        className="mt-1 text-xs text-primary hover:underline font-medium"
                      >
                        Classify →
                      </Link>
                    </div>
                  </div>
                );
              })}
              {incompletePlanet && (
                <div className="border border-yellow-300/30 bg-yellow-50/10 p-4 rounded-md shadow-sm space-y-2 col-span-1 sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <ClassificationIcon type="planet" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">
                        Continue studying your planet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        You’ve started classifying this planet, but haven’t found its radius yet. Once complete, you’ll be able to send satellites to analyze it further.
                      </p>
                    </div>
                    <Link
                      href={`/structures/telescope/planet-hunters/${incompletePlanet.id}/survey/`}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        ) : classifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven’t made any classifications yet.
          </p>
        ) : (
          <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {classifications.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-md transition hover:bg-muted/30"
              >
                <div className="flex-shrink-0">
                  <ClassificationIcon type={c.classificationtype?.toLowerCase() || null} />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold capitalize text-chart-2">
                    {c.classificationtype || "Unknown Type"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" title={c.content || ""}>
                    {c.content?.slice(0, 100) || "No content"}
                  </p>
                </div>
                <Link
                  href={`/posts/${c.id}`}
                  className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded text-xs font-medium transition"
                >
                  Explore →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};