import React from "react";

interface SectionProps {
  title?: string;
  label?: string;
  children?: any;
}

const Section: React.FC<SectionProps> = ({ title, label, children }) => {
  return (
    <section aria-label={label || title}>
      {title && (
        <h2 className="text-3xl font-semibold mb-8">
          {title}
        </h2>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
};

export default Section;