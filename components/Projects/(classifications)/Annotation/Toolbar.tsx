import React from 'react';
import { Square, Pencil, Download, Share2 } from 'lucide-react';

interface ToolbarProps {
  currentTool: string;
  onToolSelect: (tool: string) => void;
  onDownload: () => void;
  onShare: () => void;
};

export default function Toolbar({ currentTool, onToolSelect, onDownload, onShare }: ToolbarProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      <button
        onClick={() => onToolSelect('rectangle')}
        className={`p-2 rounded-lg transition-colors ${
          currentTool === 'rectangle' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
      >
        <Square className="w-6 h-6" />
      </button>
      <button
        onClick={() => onToolSelect('pen')}
        className={`p-2 rounded-lg transition-colors ${
          currentTool === 'pen' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
      >
        <Pencil className="w-6 h-6" />
      </button>
      <div className="w-px h-8 bg-gray-200" />
      <button
        onClick={onDownload}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Download className="w-6 h-6" />
      </button>
      <button
        onClick={onShare}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Share2 className="w-6 h-6" />
      </button>
    </div>
  );
};