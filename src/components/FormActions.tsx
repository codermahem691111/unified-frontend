interface FormActionsProps {
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}

/** Cancel + submit buttons at the bottom of a form inside a modal. */
export function FormActions({ isSubmitting, submitLabel, onCancel }: FormActionsProps) {
  return (
    <div className="modal__footer">
      <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </button>
      <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
        {isSubmitting && <span className="spinner" aria-hidden="true" />}
        {isSubmitting ? 'Saving…' : submitLabel}
      </button>
    </div>
  );
}
