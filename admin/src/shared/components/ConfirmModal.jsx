import React from 'react'
import Button from './ui/Button'
import Modal from './ui/Modal'

export function ConfirmModal({ show, title = 'Confirm', message, confirmText = 'Delete', cancelText = 'Cancel', onConfirm, onCancel }) {
  return (
    <Modal isOpen={show} onClose={onCancel} className="max-w-md">
      <Modal.Header onClose={onCancel}>
        <div className="flex items-center">
          <i className="fas fa-exclamation-triangle mr-3 text-yellow-600"></i>
          {title}
        </div>
      </Modal.Header>

      <Modal.Body>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>
          </div>
          <p className="text-gray-700">{message}</p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="flex justify-end space-x-2 w-full">
          <Button
            variant="secondary"
            outline
            onClick={onCancel}
          >
            <i className="fas fa-times mr-1"></i>
            {cancelText}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
          >
            <i className="fas fa-check mr-1"></i>
            {confirmText}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  )
}