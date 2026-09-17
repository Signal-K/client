'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import {
    ToastProvider,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastViewport,
} from '@/components/ui/toast';

interface CommentFormProps {
    classificationId: number;
    parentCommentId?: number;
    onSubmit?: () => void;
};

export function CommentForm({
    classificationId,
    parentCommentId,
    onSubmit,
}: CommentFormProps) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [content, setContent] = useState<string>('');
    const [toastMessage, setToastMessage] = useState<{
        title: string;
        description: string;
        variant?: 'default' | 'destructive';
        open: boolean;
    }>({
        title: '',
        description: '',
        open: false
    });
    const [submitting, setSubmitting] = useState<boolean>(false);

    const showToast = (
        title: string,
        description: string,
        variant: 'default' | 'destructive' = 'default'
    ) => {
        setToastMessage({ title, description, variant, open: true });
        setTimeout(() => {
        setToastMessage((prev) => ({ ...prev, open: false }));
        }, 4000);
    };

    const handleSubmitComment = async () => {
        if (!content.trim()) {
            showToast('Empty comment', 'Please write something before submitting.', 'destructive');
            return;
        };

        if (!session) {
            showToast('Not signed in', 'You must be signed in to post a comment');
            return;
        };

        setSubmitting(true);

        const { error } = await supabase
            .from("comments")
            .insert({
                content,
                author: session.user.id,
                classification_id: classificationId,
                parent_comment_id: parentCommentId || null,
            });

            if (error) {
                showToast('Submission failed', 'Unable to post your comment');
                console.error(error);
            } else {
                setContent('');
                showToast('Comment posted', 'Your comment was posted')
                onSubmit?.();
            };

            setSubmitting(false);
    };

    return (
        <ToastProvider>
            <div className="w-full pt-4">
                <h3 className="text-sm font-semibold text-[#4C566A] mb-2">Leave a comment</h3>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your comment here..."
                    rows={4}
                    className="w-full border border-[#D8DEE9] rounded-lg focus:ring-2 focus:ring-[#81A1C1] transition"
                />
                <div className="flex justify-end mt-3">
                    <Button
                        onClick={handleSubmitComment}
                        disabled={submitting}
                        className="bg-[#5E81AC] hover:bg-[#4C566A] text-white transition"
                    >
                        {submitting ? 'Posting...' : 'Post comment'}
                    </Button>
                </div>
            </div>

            <Toast open={toastMessage.open} variant={toastMessage.variant}>
                <ToastTitle>{toastMessage.title}</ToastTitle>
                <ToastDescription>{toastMessage.description}</ToastDescription>
            </Toast>
            <ToastViewport />
        </ToastProvider>
    );
};