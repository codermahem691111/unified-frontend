import type { ReactNode } from 'react';

interface SubmitButtonProps {
  isLoading: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

export function SubmitButton({ isLoading, loadingLabel = 'Please wait…', children }: SubmitButtonProps) {
  return (
    <button type="submit" className="btn btn--primary btn--block" disabled={isLoading}>
      {isLoading && <span className="spinner" aria-hidden="true" />}
      {isLoading ? loadingLabel : children}
    </button>
  );
}
