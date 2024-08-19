import React from 'react';

type ContentBlockProps = {
  title: string;
  subtitle: string;
  content: string;
};

const ContentBlock: React.FC<ContentBlockProps> = ({ title, subtitle, content }) => (
  <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-4 text-primary">{title}</h2>
      <p className="text-gray-700">{subtitle}</p>
      <br />
      {content}
      
    </div>
  </div>
);

export default ContentBlock;