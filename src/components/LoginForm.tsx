import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, ApiErrorCode } from '../api/apiError';
import { authApi } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import type { LoginPayload } from '../types/auth';
import { type FieldErrors, validateLogin } from '../utils/validators';
import { Alert } from './Alert';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';
import { SubmitButton } from './SubmitButton';

type ResendState = 'idle' | 'sending' | 'sent';

export function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [values, setValues] = useState<LoginPayload>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<LoginPayload>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<ResendState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError(null);
    setNeedsVerification(false);
    setResendState('idle');

    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      const apiError = ApiError.from(error);
      setServerError(apiError.message);
      setNeedsVerification(apiError.code === ApiErrorCode.EmailNotVerified);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendState('sending');
    try {
      await authApi.resendVerification(values.email.trim());
      setResendState('sent');
    } catch (error) {
      setServerError(ApiError.from(error).message);
      setResendState('idle');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {serverError && <Alert variant="error">{serverError}</Alert>}

      {needsVerification && (
        <div className="verify-hint">
          {resendState === 'sent' ? (
            <Alert variant="success">A new verification link is on its way. Check your inbox.</Alert>
          ) : (
            <button
              type="button"
              className="btn btn--ghost btn--block"
              onClick={handleResend}
              disabled={resendState === 'sending'}
            >
              {resendState === 'sending' ? 'Sending…' : 'Resend verification email'}
            </button>
          )}
        </div>
      )}

      <FormField label="Email" htmlFor="login-email" error={errors.email}>
        <input
          id="login-email"
          name="email"
          type="email"
          className={`input${errors.email ? ' input--invalid' : ''}`}
          value={values.email}
          onChange={handleChange}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'login-email-error' : undefined}
        />
      </FormField>

      <FormField label="Password" htmlFor="login-password" error={errors.password}>
        <PasswordInput
          id="login-password"
          name="password"
          value={values.password}
          onChange={handleChange}
          autoComplete="current-password"
          error={errors.password}
        />
      </FormField>

      <SubmitButton isLoading={isSubmitting} loadingLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
