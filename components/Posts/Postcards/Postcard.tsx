import React from "react";
import { Database } from "../../../utils/database.types";

interface PostCardProps {
    planetImage: string; // Import this from database types
    time: string;
    user: string;
    planet: string;
    comment: string;
}

const PostCard: React.FC<PostCardProps> = ({
    planetImage,
    time,
    user,
    planet,
    comment
}) => {
    return (
        <div className="flex flex-col max-w-md mx-auto overflow-hidden bg-white rounded-lg shadow-lg">
            <div className="relative">
                <img className="object-cover w-full h-48" src={planetImage} alt="Planet's image" />
                <div className="absolute inset-0 flex items-end justify-between p-4">
                    <div>
                        <p className="text-sm font-medium text-white">{time}</p>
                        <p className="text-sm font-medium text-white">{user}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{planet}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-between flex-1 p-4">
                <p className="text-sm">{comment}</p>
                <div className="flex items-center justify-between mt-4">
                    <button className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-lg">
                        Share {/* Add some additional actions here */}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;