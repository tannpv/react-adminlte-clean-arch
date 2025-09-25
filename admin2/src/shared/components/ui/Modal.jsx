import React, { useEffect } from 'react';

const Modal = ({ isOpen, show, onClose, children, className = '', ...props }) => {
    // Support both isOpen and show props for backward compatibility
    const modalOpen = isOpen || show;

    if (!modalOpen) return null;

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        if (modalOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [modalOpen, onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative p-5 border shadow-lg rounded-md bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
