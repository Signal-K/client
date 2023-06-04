import React, { ReactNode } from "react";

interface LayoutTestProps {
  children: ReactNode;
}

const LayoutTest: React.FC<LayoutTestProps> = ({ children }) => {
  return <div className="bg-gray-100">{children}</div>;
};

export default LayoutTest;