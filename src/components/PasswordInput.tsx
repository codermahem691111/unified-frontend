import { type ChangeEvent, useState } from 'react';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  autoComplete: 'current-password' | 'new-password';
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function PasswordInput({ id, name, value, autoComplete, onChange, error }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-input">
      <input
        id={id}
        name={name}
        type={isVisible ? 'text' : 'password'}
        className={`input${error ? ' input--invalid' : ''}`}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
      >
        {isVisible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
