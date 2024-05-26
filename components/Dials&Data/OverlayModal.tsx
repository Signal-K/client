import React from 'react';

interface OverlayModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    title: string;
    content: React.ReactNode;
    button1Text: string;
    button1Action: () => void;
    button2Text: string;
    button2Action: () => void;
}

export const OverlayModal: React.FC<OverlayModalProps> = ({
    isOpen,
    onClose,
    imageUrl,
    title,
    content,
    button1Text,
    button1Action,
    button2Text,
    button2Action,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-md mx-auto shadow-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button className="btn btn-square btn-outline" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="flex flex-col items-center mt-4">
                    <img src={imageUrl} alt={title} className="w-32 h-32 mb-2" />
                    {content}
                    <div className="mt-4 flex space-x-4">
                        <button className="btn btn-primary" onClick={button1Action}>
                            {button1Text}
                        </button>
                        <button className="btn btn-secondary" onClick={button2Action}>
                            {button2Text}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
