"use client"

import { useEffect, useState } from "react"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { Telescope, Satellite, Compass, Sparkles } from "lucide-react"
import Link from "next/link"
import type { LinkedAnomaly } from "@/hooks/usePageData"
import { getAnomalyColor } from "@/src/components/ui/helpers/classification-icons"

export default function AwaitingObjects() {
    const supabase = useSupabaseClient()
    const session = useSession()
    const [linkedAnomalies, setLinkedAnomalies] = useState<LinkedAnomaly[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!session?.user?.id) return

        const fetchLinkedAnomalies = async () => {
            try {
                const { data, error } = await supabase
                    .from("linked_anomalies")
                    .select(`
                                                id,
                                                anomaly_id,
                                                date,
                                                automaton,
                                                unlocked,
                                                anomaly:anomaly_id(
                                                        id,
                                                        content,
                                                        anomalytype,
                                                        anomalySet
                                                )
                                        `)
                    .eq("author", session.user.id)
                    .eq("unlocked", false)
                    .order("date", { ascending: false })

                if (error) {
                    console.error("Error fetching linked anomalies:", error)
                } else {
                    const transformedData = (data ?? []).map((item) => ({
                        ...item,
                        anomaly: Array.isArray(item.anomaly) ? item.anomaly[0] : item.anomaly,
                    })) as unknown as LinkedAnomaly[]
                    setLinkedAnomalies(transformedData)
                }
            } catch (err) {
                console.error("Error in fetchLinkedAnomalies:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchLinkedAnomalies()
    }, [session, supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading objects...</div>
            </div>
        )
    }

    if (linkedAnomalies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/30 rounded-lg border border-dashed border-border">
                <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">No objects awaiting discovery</p>
                <p className="text-xs text-muted-foreground text-center mt-1">Deploy your automatons to find new objects</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {linkedAnomalies.slice(0, 5).map((a) => {
                const anomaly = a.anomaly
                let type = anomaly?.anomalytype?.toLowerCase() || null
                if (type?.includes("minorplanet") || type?.includes("asteroid")) {
                    type = "telescope-minorplanet"
                }
                const color = getAnomalyColor(type || "")

                let link = "#"
                if (type === "planet") {
                    link = `/structures/telescope/planet-hunters/db-${a.anomaly_id}/classify`
                } else if (type === "cloud") {
                    link = `/structures/balloon/cloudspotting/db-${a.anomaly_id}/classify`
                } else if (anomaly?.anomalytype === "telescopeMinor") {
                    if (anomaly?.anomalySet === "active-asteroids") {
                        link = `/structures/telescope/active-asteroids/db-${a.anomaly_id}/classify`
                    } else {
                        link = `/structures/telescope/daily-minor-planet/db-${a.anomaly_id}/classify`
                    }
                }

                // Icon based on automaton type
                const AutomatonIcon =
                    a.automaton === "Telescope" ? Telescope : a.automaton === "WeatherSatellite" ? Satellite : Compass

                return (
                    <Link
                        key={a.id}
                        href={link}
                        className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <AutomatonIcon className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-foreground font-medium">
                                    {anomaly?.anomalytype === "telescopeMinor"
                                        ? "Asteroid Candidate"
                                        : anomaly?.anomalytype || "Unknown Object"}
                                </p>
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                    style={{ backgroundColor: color, color: "white" }}
                                >
                                    New
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {anomaly?.content || "Awaiting classification"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">{a.automaton}</span>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}