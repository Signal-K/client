import React from 'react';

interface AnnotationListProps {
  annotations: Array<{
    type: string;
    label: string;
  }>;
  onLabelChange: (index: number, newLabel: string) => void;
};

export default function AnnotationList({ annotations, onLabelChange }: AnnotationListProps) {
  return (
    <div className="w-64 bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Annotations</h2>
      {annotations.length === 0 ? (
        <p className="text-gray-500 text-sm">No annotations yet</p>
      ) : (
        <ul className="space-y-2">
          {annotations.map((annotation, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                annotation.type === 'rectangle' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <input
                type="text"
                value={annotation.label}
                onChange={(e) => onLabelChange(index, e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};