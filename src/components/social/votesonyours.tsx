"use client"

import React, { useEffect, useState } from "react"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar"
import { Card, CardContent } from "@/src/components/ui/card"

interface Vote {
    id: number;
    user_id: string;
    classification_id: number | null;
    anomaly_id: number | null;
    created_at: string;
    upload: number | null;
    vote_type: string | null;
    classification?: {
        content?: string | null;
        classificationtype?: string | null;
    } | null;
    user?: {
        username?: string | null;
    } | null;
};

interface Comment {
    id: number;
    content: string;
    author: string;
    classification_id: number | null;
    parent_comment_id?: number | null;
    created_at: string;
    user?: {
        username?: string | null;
    } | null;
}

export default function VotesList() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [votes, setVotes] = useState<Vote[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchVotes();
    }, [session]);

    const fetchVotes = async () => {
        if (!session?.user) {
            setVotes([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const userId = session.user.id;

            // 1) get classification ids authored by the current user
            const { data: classifications, error: classErr } = await supabase
                .from("classifications")
                .select("id")
                .eq("author", userId);

            if (classErr) throw classErr;

            const classificationIds = (classifications ?? [])
                .map((c: any) => (c.id !== null && c.id !== undefined ? Number(c.id) : null))
                .filter(Boolean) as number[];

            if (classificationIds.length === 0) {
                setVotes([]);
                setLoading(false);
                return;
            }

            // 2) fetch votes that point to any of those classifications from the last 2 weeks
            const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

            const { data: votesData, error: votesErr } = await supabase
                .from("votes")
                // pull in classification content & type and the voting user's username
                .select("*, classification:classification_id(content, classificationtype), user: user_id(username)")
                .in("classification_id", classificationIds)
                .gte("created_at", twoWeeksAgo)
                .order("created_at", { ascending: false });

            if (votesErr) throw votesErr;

            const mapped = (votesData ?? []).map((v: any) => ({
                id: Number(v.id),
                user_id: v.user_id,
                classification_id: v.classification_id != null ? Number(v.classification_id) : null,
                anomaly_id: v.anomaly_id != null ? Number(v.anomaly_id) : null,
                created_at: v.created_at,
                upload: v.upload != null ? Number(v.upload) : null,
                vote_type: v.vote_type ?? null,
                classification: v.classification ?? null,
                user: v.user ?? null,
            })) as Vote[];

            setVotes(mapped);

            // 3) fetch comments on those classifications (excluding the current user's own comments)
            try {
                const { data: commentsData, error: commentsErr } = await supabase
                    .from("comments")
                    .select("*, user:author(username)")
                    .in("classification_id", classificationIds)
                    .neq("author", userId)
                    .gte("created_at", twoWeeksAgo)
                    .order("created_at", { ascending: false });

                if (commentsErr) throw commentsErr;

                const mappedComments = (commentsData ?? []).map((c: any) => ({
                    id: Number(c.id),
                    content: c.content ?? "",
                    author: c.author,
                    classification_id: c.classification_id != null ? Number(c.classification_id) : null,
                    parent_comment_id: c.parent_comment_id != null ? Number(c.parent_comment_id) : null,
                    created_at: c.created_at,
                    user: c.user ?? null,
                })) as Comment[];

                setComments(mappedComments);
            } catch (err) {
                console.error("fetchComments error:", err);
                setComments([]);
            }
        } catch (err) {
            console.error("fetchVotes error:", err);
            setVotes([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading ? (
                <div>Loading votes…</div>
            ) : votes.length === 0 ? (
                <div>No votes on your classifications in the last 2 weeks.</div>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {votes.map((v) => (
                        <Card key={`vote-${v.id}`} style={{ marginBottom: 8 }}>
                            <CardContent>
                                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <div style={{ flexShrink: 0 }}>
                                        <AvatarGenerator author={v.user?.username ?? v.user_id} />
                                    </div>
                                    <div>
                                        <div>
                                            <strong>Vote ID:</strong> {v.id} — <strong>Vote:</strong> {v.vote_type ?? "n/a"}
                                        </div>
                                        <div>
                                            <strong>By:</strong> {v.user?.username ?? v.user_id}
                                        </div>
                                        <div>
                                            <strong>On classification:</strong>{" "}
                                            {v.classification_id ?? "n/a"} — <em>{v.classification?.classificationtype ?? "?"}</em>
                                        </div>
                                        <div style={{ marginTop: 6 }}>
                                            <div style={{ whiteSpace: "pre-wrap" }}>{v.classification?.content ?? "(no content)"}</div>
                                        </div>
                                        <div>
                                            <small>{new Date(v.created_at).toLocaleString()}</small>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Comments section - show heading and cards for comments; hide empty placeholder */}
            <div style={{ marginTop: 16 }}>
                {comments.length > 0 && <h3>Comments on your classifications</h3>}
                <div style={{ display: "grid", gap: 12 }}>
                    {comments.map((c) => (
                        <Card key={`comment-${c.id}`} style={{ marginBottom: 8 }}>
                            <CardContent>
                                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                    <div style={{ flexShrink: 0 }}>
                                        <AvatarGenerator author={c.user?.username ?? c.author} />
                                    </div>
                                    <div>
                                        <div>
                                            <strong>{c.user?.username ?? c.author}</strong>
                                            <span style={{ marginLeft: 8 }}>
                                                <small>{new Date(c.created_at).toLocaleString()}</small>
                                            </span>
                                        </div>
                                        <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{c.content}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};