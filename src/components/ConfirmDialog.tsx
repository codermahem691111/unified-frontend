import { useState } from 'react';
import { ApiError } from '../api/apiError';
import { Alert } from './Alert';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  /** Do the deletion. Throwing keeps the dialog open and shows the error. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Delete', onConfirm, onClose }: ConfirmDialogProps) {
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsWorking(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (caught) {
      setError(ApiError.from(caught).message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal title={title} isOpen={isOpen} onClose={handleClose}>
      <div className="modal__body">
        {error && <Alert variant="error">{error}</Alert>}
        <p className="modal__message">{message}</p>
      </div>
      <div className="modal__footer">
        <button type="button" className="btn btn--ghost" onClick={handleClose} disabled={isWorking}>
          Cancel
        </button>
        <button type="button" className="btn btn--danger" onClick={handleConfirm} disabled={isWorking}>
          {isWorking ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
