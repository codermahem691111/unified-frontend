import { useState } from 'react';
import { ApiError } from '../api/apiError';
import { authApi } from '../api/authApi';
import { Alert } from './Alert';

interface CheckEmailPanelProps {
  email: string;
  onBackToSignIn: () => void;
}

type ResendState = 'idle' | 'sending' | 'sent';

export function CheckEmailPanel({ email, onBackToSignIn }: CheckEmailPanelProps) {
  const [resendState, setResendState] = useState<ResendState>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setResendState('sending');
    setError(null);
    try {
      await authApi.resendVerification(email);
      setResendState('sent');
    } catch (resendError) {
      setError(ApiError.from(resendError).message);
      setResendState('idle');
    }
  };

  return (
    <div className="check-email">
      <div className="check-email__icon" aria-hidden="true">
        ✉
      </div>
      <h2 className="auth-card__title">Check your inbox</h2>
      <p className="auth-card__subtitle">
        We sent a verification link to <strong>{email}</strong>. Open it to activate your account, then sign in.
      </p>

      {error && <Alert variant="error">{error}</Alert>}
      {resendState === 'sent' && <Alert variant="success">A new verification link has been sent.</Alert>}

      <div className="check-email__actions">
        <button type="button" className="btn btn--ghost" onClick={handleResend} disabled={resendState === 'sending'}>
          {resendState === 'sending' ? 'Sending…' : 'Resend email'}
        </button>
        <button type="button" className="btn btn--primary" onClick={onBackToSignIn}>
          Back to sign in
        </button>
      </div>
    </div>
  );
}
