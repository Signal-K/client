import React, { useEffect, useState } from 'react';

type Chapter = {
  id: number;
  title: string;
  icon: string;
};

type SidebarProps = {
  currentPage: number;
  credits: number;
};

const ProgressSidebar: React.FC<SidebarProps> = ({ currentPage, credits }) => {
  const chapterData: Chapter[] = [
    { id: 1, title: 'Planet Hunters Introduction', icon: 'book' },
    { id: 2, title: 'What is Lightkurve?', icon: 'graph' },
    { id: 3, title: 'How do we look at the data from these telescopes?', icon: 'telescope' },
    { id: 4, title: 'How do we play?', icon: 'telescope' },
    // ... Add data for remaining pages here
  ];

  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 800);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!showSidebar) {
    return null;
  }

  return (
    <aside className="fixed right-0 top-0 bottom-0 z-10 bg-white w-64 shadow-lg overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Table of Contents</h2>
        {chapterData.map((chapter) => (
          <a
            key={chapter.id}
            href={`/tests/onboarding/planetHunters/${chapter.id}`}
            className={`flex items-center py-2 px-4 rounded-lg mb-2 ${
              chapter.id === currentPage ? 'bg-green-100' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <svg
              className="w-6 h-6 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Render the appropriate icon based on chapter.id */}
              {chapter.icon === 'book' && (
                <path
                  fill="currentColor"
                  d="M19 2H5C3.89543 2 3 2.89543 3 4V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V4C21 2.89543 20.1046 2 19 2ZM5 19V4H19V19H5ZM10 15V14H14V15H10ZM10 12V11H14V12H10ZM10 9V8H14V9H10Z"
                />
              )}
              {/* Render other icons as needed */}
            </svg>
            <span className="flex-grow">{chapter.title}</span>
          </a>
        ))}
      </div><br /><br /><br /><br /><br /><br /><br /><br /><br />
      <div className="flex justify-center py-2 object-bottom">
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
           fill="currentColor"
            d="M19 5H5C3.89543 5 3 5.89543 3 7V21L9 17H19C20.1046 17 21 16.1046 21 15V7C21 5.89543 20.1046 5 19 5ZM19 15H9L5 18.382V7H19V15Z"
          />
        </svg>
        <span className="text-gray-600 text-sm">{credits} Credits</span>
      </div>
    </aside>
  );
};

export default ProgressSidebar;