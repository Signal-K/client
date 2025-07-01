'use client'

import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { AvatarGenerator } from "@/components/Account/Avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Comment {
    id: string;
    classification_id: string;
    user_id: string;
    author: string;
    content: string;
    created_at: string;
};

interface CommentsListProps {
    classificationId: string;
};

export default function CommentsList({
    classificationId
}: CommentsListProps) {
    const supabase = useSupabaseClient();

    const [comments, setComments] = useState<Comment[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchComments();
    }, [classificationId]);

    const fetchComments = async () => {
        setLoading(true);

        const {
            data,
            error
        } = await supabase
            .from("comments")
            .select('*')
            .eq('classification_id', classificationId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Failed to fetch comments: ", error.message);
        } else {
            setComments(data);
        };

        setLoading(false);
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold text-[#2E3440] mb-4">Comments</h3>
            {loading ? (
                <p className="text-[#4C566A]">Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="text-[#4C566A]">No comments yet</p>                
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <Card key={comment.id} className="border border-[#D8DEE9] bg-white rounded-lg shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <AvatarGenerator author={comment.author} />
                                    <div>
                                        <p className="text-sm font-medium text-[#2E3440]">{comment.author}</p>
                                        <p className="text-sm text-[#4C566A] whitespace-pre-line">{comment.content}</p>
                                        <p className="text-xs text-[#A3BE8C] mt-1">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};