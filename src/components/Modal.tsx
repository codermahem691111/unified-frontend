import { type ReactNode, useEffect, useId, useRef } from 'react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A dialog built on the browser's native <dialog>, which already handles focus trapping,
 * the Escape key and the dimmed background. Children are only rendered while it is open,
 * so every form inside starts fresh each time.
 */
export function Modal({ title, isOpen, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the dimmed area outside the panel lands on the <dialog> itself.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {isOpen && (
        <div className="modal__panel">
          <div className="modal__header">
            <h2 className="modal__title" id={titleId}>
              {title}
            </h2>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
