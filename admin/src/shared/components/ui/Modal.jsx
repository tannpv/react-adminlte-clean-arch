import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, show, onClose, children, className = '', ...props }) => {
    // Support both isOpen and show props for backward compatibility
    const modalOpen = isOpen || show;

    // Handle escape key
    useEffect(() => {
        if (!modalOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

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

    // Use portal to render modal outside the normal DOM tree
    if (!modalOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 mt-8">
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

const ModalHeader = ({ children, onClose, className = '', ...props }) => {
    return (
        <div className={`flex items-center justify-between mb-6 pb-4 border-b border-gray-200 ${className}`} {...props}>
            <h3 className="text-xl font-semibold text-gray-900">
                {children}
            </h3>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1 transition-colors duration-200"
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
        <div className={`mb-6 ${className}`} {...props}>
            {children}
        </div>
    );
};

const ModalFooter = ({ children, className = '', ...props }) => {
    return (
        <div className={`flex justify-end space-x-3 pt-4 border-t border-gray-200 ${className}`} {...props}>
            {children}
        </div>
    );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
