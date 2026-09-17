'use client';

import React from "react";

interface MediaUploadProps {
    onMediaAdd: ( e: React.ChangeEvent<HTMLInputElement> ) => void;
    isUploading: boolean;
    className?: string;
};

const MediaUpload: React.FC<MediaUploadProps> = ({
    onMediaAdd,
    isUploading,
    className = "",
}) => {
    return (
        <label className={`flex gap-1 items-center cursor-pointer text-[#88C0D0] hover:text-white ${className}`}>
            <input
                type="file"
                className="hidden"
                onChange={onMediaAdd}
                multiple
                accept="image/*,video/*"
            />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke='currentColor'
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-6.5 6.5"
                />
            </svg>
            <span>
                {isUploading ? "Uploading..." : "Upload Media"}
            </span>
        </label>
    );
};

export default MediaUpload;