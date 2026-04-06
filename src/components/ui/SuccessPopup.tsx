"use client";

interface SuccessPopupProps {
  title: string;
  message: string;
  onDismiss?: () => void;
}

export function SuccessPopup({ title, message, onDismiss }: SuccessPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md mx-4 text-center animate-in zoom-in-95 duration-300">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
            >
              Go to Dashboard Now
            </button>
          )}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
        </div>
      </div>
    </div>
  );
}
