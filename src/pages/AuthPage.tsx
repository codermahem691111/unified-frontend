import { useState } from 'react';
import { CheckEmailPanel } from '../components/CheckEmailPanel';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { APP_NAME } from '../config/env';

type AuthMode = 'login' | 'register';

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in with the email and password you registered with.',
  },
  register: {
    title: 'Set up your company',
    subtitle: 'Register your business to create the admin account for your workspace.',
  },
};

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const handleBackToSignIn = () => {
    setPendingEmail(null);
    setMode('login');
  };

  return (
    <div className="auth-layout">
      <aside className="auth-brand">
        <div className="brand-mark">
          <span className="brand-mark__logo" aria-hidden="true">
            {APP_NAME.charAt(0)}
          </span>
          <span>{APP_NAME}</span>
        </div>

        <div>
          <h1 className="brand-headline">Run your whole business from one workspace.</h1>
          <p className="brand-copy">
            Register your company once, verify your email, and manage everything from your own admin panel.
          </p>
        </div>

        <ul className="brand-points">
          <li>Register with your business license and owner details</li>
          <li>Confirm your email to activate the account securely</li>
          <li>Sign in any time to reach your admin panel</li>
        </ul>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          {pendingEmail ? (
            <CheckEmailPanel email={pendingEmail} onBackToSignIn={handleBackToSignIn} />
          ) : (
            <>
              <div className="auth-tabs" role="tablist" aria-label="Sign in or register">
                {(['login', 'register'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    id={`tab-${tab}`}
                    aria-selected={mode === tab}
                    aria-controls="auth-panel"
                    className={`auth-tabs__tab${mode === tab ? ' auth-tabs__tab--active' : ''}`}
                    onClick={() => setMode(tab)}
                  >
                    {tab === 'login' ? 'Sign in' : 'Register'}
                  </button>
                ))}
              </div>

              <div id="auth-panel" role="tabpanel" aria-labelledby={`tab-${mode}`}>
                <h2 className="auth-card__title">{COPY[mode].title}</h2>
                <p className="auth-card__subtitle">{COPY[mode].subtitle}</p>

                {mode === 'login' ? <LoginForm /> : <RegisterForm onRegistered={setPendingEmail} />}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
