import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onRequestClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50" onClick={onRequestClose}></div>
      <div className="relative bg-white p-4 rounded shadow-lg w-full max-w-lg mx-auto z-50">
        {children}
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onRequestClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;