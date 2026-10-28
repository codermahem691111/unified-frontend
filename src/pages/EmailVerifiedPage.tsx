import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Outcome = { status: 'success' } | { status: 'error'; message: string } | { status: 'empty' };

/**
 * After the person clicks the link in the verification email, Supabase confirms the
 * address and redirects here with the result in the part of the URL after the "#".
 */
function readOutcome(hash: string): Outcome {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const errorDescription = params.get('error_description');

  if (params.get('error') || params.get('error_code') || errorDescription) {
    return {
      status: 'error',
      message: errorDescription ?? 'This verification link is invalid or has expired.',
    };
  }

  if (params.get('type') === 'signup' || params.get('access_token')) {
    return { status: 'success' };
  }

  return { status: 'empty' };
}

export function EmailVerifiedPage() {
  const [outcome] = useState<Outcome>(() => readOutcome(window.location.hash));

  // Supabase puts session tokens in the URL. We sign in through our own form instead,
  // so remove them from the address bar and the browser history.
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  return (
    <div className="status-page">
      <div className="status-card">
        {outcome.status === 'success' && (
          <>
            <div className="status-card__icon status-card__icon--success" aria-hidden="true">
              ✓
            </div>
            <h1 className="status-card__title">Email verified</h1>
            <p className="status-card__text">Your email address is confirmed. You can now sign in.</p>
            <Link to="/auth" className="btn btn--primary">
              Continue to sign in
            </Link>
          </>
        )}

        {outcome.status === 'error' && (
          <>
            <div className="status-card__icon status-card__icon--error" aria-hidden="true">
              !
            </div>
            <h1 className="status-card__title">We couldn’t verify your email</h1>
            <p className="status-card__text">{outcome.message}</p>
            <p className="status-card__text">
              If you already clicked the link once, your email may already be verified, so try signing in. If not,
              sign in and choose “Resend verification email” to get a fresh link.
            </p>
            <Link to="/auth" className="btn btn--primary">
              Go to sign in
            </Link>
          </>
        )}

        {outcome.status === 'empty' && (
          <>
            <div className="status-card__icon status-card__icon--info" aria-hidden="true">
              ✉
            </div>
            <h1 className="status-card__title">Check your email</h1>
            <p className="status-card__text">
              Open the verification link we emailed you to confirm your address.
            </p>
            <Link to="/auth" className="btn btn--primary">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
