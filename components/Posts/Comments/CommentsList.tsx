import React from "react";
import { Comment } from "../../../types";
 
interface CommentProps {
  comments: Comment[]; // Pass the array of comments as prop
}
 
const CommentItem: React.FC<CommentProps> = ({ comments }) => {
  const renderComments = (comments: Comment[]) => {
    return comments.map((comment) => (
      <div key={comment.id} className="ml-4 mt-4">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-gray-300"></div>
          <div className="font-medium text-gray-700">{comment.author}</div>
        </div>
        <div className="ml-8 mt-2 text-gray-800">{comment.content}</div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-4">
            {renderComments(comment.replies)} {/* Recursively render replies */}
          </div>
        )}
      </div>
    ));
  };
 
  return <div>{renderComments(comments)}</div>;
};
 
export default CommentItem;