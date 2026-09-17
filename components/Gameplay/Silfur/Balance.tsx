import React from "react";

interface SilfurBalanceProps {
    balance: number;
};

const SilfurBalance: React.FC<SilfurBalanceProps> = ({ balance }) => {
    return (
        <div className="py-4 flex items-center justify-center p-4 bg-white-800 rounded-t-md">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 mr-2 text-yellow-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 1919 2-9-18-9 18 9-2zm0 0v-8"
                />
            </svg>
            <div className="text-yellow-300 text-lg font-semibold">{balance} Silfur</div>
        </div>
    )
}

export default SilfurBalance;