'use client'

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import {
    ToastProvider,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastViewport,
} from '@/src/components/ui/toast';

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
    const router = useRouter();

    const [content, setContent] = useState<string>('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
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
                setShowSuccessPopup(true);
                onSubmit?.();
                setContent('');
                setShowSuccessPopup(true);
                onSubmit?.();
                
                // Show popup and redirect after 3 seconds
                const redirectTimeout = setTimeout(() => {
                    try {
                        router.push('/');
                    } catch (error) {
                        console.error('CommentForm: Router.push error:', error);
                        // Fallback to window.location
                        window.location.href = '/';
                    }
                }, 3000);
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

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
                        <div className="mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Comment Submitted!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Your insight has been entered into the research database. Redirecting you to the dashboard...
                            </p>
                            <button 
                                onClick={() => {
                                    console.log('Manual redirect button clicked');
                                    try {
                                        router.push('/');
                                    } catch (error) {
                                        console.error('Manual redirect error:', error);
                                        window.location.href = '/';
                                    }
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
                            >
                                Go to Dashboard Now
                            </button>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                        </div>
                    </div>
                </div>
            )}

            <Toast open={toastMessage.open} variant={toastMessage.variant}>
                <ToastTitle>{toastMessage.title}</ToastTitle>
                <ToastDescription>{toastMessage.description}</ToastDescription>
            </Toast>
            <ToastViewport />
        </ToastProvider>
    );
};