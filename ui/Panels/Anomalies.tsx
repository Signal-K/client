import React from 'react';

const Slideover = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-80" style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1451186242394-2b461812025b?q=80&w=2372&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        }}>
            <div className="w-full max-w-screen-lg mx-auto">
                <div className="relative bg-white rounded-lg shadow-xl">
                    <div
                        className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
                        style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1451186242394-2b461812025b?q=80&w=2372&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                        }}
                    />
                    <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg" />
                    <div className="relative z-10 p-8">{/* Your content here */}</div>
                </div>
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                >
                    {/* Close button */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Slideover;