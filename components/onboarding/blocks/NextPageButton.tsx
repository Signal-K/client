import React from 'react';

type NextPageButtonProps = {
  onClick: () => void;
};

const NextPageButton: React.FC<NextPageButtonProps> = ({ onClick }) => (
  <div className="float-right">
    <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10" onClick={onClick}>
      Next
    </button>
  </div>
);

export default NextPageButton;