import React from 'react';
import { useMediaQuery } from 'react-responsive'; // Import useMediaQuery

const Slideover = ({ showSlideover, onClose }: { showSlideover: boolean, onClose: () => void }) => {

    // Detect if the device is mobile
    const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

    return (
        <>
            <div className={`fixed inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-80 ${isMobile? 'w-full' : 'right-0'} sm:right-0`} onClick={onClose} style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1660480904370-a5dcd0be395b?q=80&w=2622&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
        }}>
                {/* Slideover content */}
                <div className={`transition-transform duration-300 ease-in-out transform translate-x-full ${showSlideover? 'translate-x-0' : '-translate-x-half'}`} style={{ width: showSlideover? '50%' : '0%', height: '100vh', overflowY: 'scroll' }}>
                    <div className="relative bg-white rounded-lg shadow-xl">
                        <p>Your content here</p>
                    </div>
                    <button
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
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
        </>
    );
};

export default Slideover;