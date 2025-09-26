import React from 'react';

const Modal = ({ isOpen, onClose, children, className = '', ...props }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ModalHeader = ({ children, onClose, className = '', ...props }) => {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
            <h3 className="text-lg font-medium text-gray-900">
                {children}
            </h3>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

const ModalBody = ({ children, className = '', ...props }) => {
    return (
        <div className={`mb-4 ${className}`} {...props}>
            {children}
        </div>
    );
};

const ModalFooter = ({ children, className = '', ...props }) => {
    return (
        <div className={`flex justify-end space-x-2 ${className}`} {...props}>
            {children}
        </div>
    );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
