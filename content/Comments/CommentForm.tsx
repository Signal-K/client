"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface CommentFormProps {
  classificationId: number;
  onCommentAdded: () => void;
};

export function CommentForm({ classificationId, onCommentAdded }: CommentFormProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [content, setContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            content,
            classification_id: classificationId,
            author: session?.user?.id,
          },
        ]);

      if (error) throw error;

      onCommentAdded();
      setContent(""); 
    } catch (error) {
      setError("There was an error submitting your comment.");
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add your comment..."
        rows={3}
        className="w-full"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Add Comment"}
      </Button>
    </form>
  );
};