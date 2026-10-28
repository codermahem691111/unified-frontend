import { type ChangeEvent, type FormEvent, useState } from 'react';
import { ApiError } from '../api/apiError';
import { authApi } from '../api/authApi';
import { type FieldErrors, type RegisterFormValues, validateRegister } from '../utils/validators';
import { Alert } from './Alert';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';
import { SubmitButton } from './SubmitButton';

interface RegisterFormProps {
  onRegistered: (email: string) => void;
}

const INITIAL_VALUES: RegisterFormValues = {
  companyName: '',
  licenseNumber: '',
  ownerName: '',
  email: '',
  businessDescription: '',
  password: '',
  confirmPassword: '',
};

export function RegisterForm({ onRegistered }: RegisterFormProps) {
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<RegisterFormValues>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateRegister(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerErrors([]);

    try {
      const email = values.email.trim();
      await authApi.register({
        companyName: values.companyName.trim(),
        licenseNumber: values.licenseNumber.trim(),
        ownerName: values.ownerName.trim(),
        email,
        businessDescription: values.businessDescription.trim(),
        password: values.password,
      });
      onRegistered(email);
    } catch (error) {
      setServerErrors(ApiError.from(error).messages);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputProps = (name: keyof RegisterFormValues, id: string) => ({
    id,
    name,
    value: values[name],
    onChange: handleChange,
    className: `input${errors[name] ? ' input--invalid' : ''}`,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${id}-error` : undefined,
  });

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {serverErrors.length > 0 && (
        <Alert variant="error">
          {serverErrors.length === 1 ? (
            serverErrors[0]
          ) : (
            <ul className="alert__list">
              {serverErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      <div className="form__row">
        <FormField label="Company name" htmlFor="reg-company" error={errors.companyName}>
          <input {...inputProps('companyName', 'reg-company')} type="text" autoComplete="organization" />
        </FormField>

        <FormField label="License number" htmlFor="reg-license" error={errors.licenseNumber}>
          <input {...inputProps('licenseNumber', 'reg-license')} type="text" autoComplete="off" />
        </FormField>
      </div>

      <div className="form__row">
        <FormField label="Owner name" htmlFor="reg-owner" error={errors.ownerName}>
          <input {...inputProps('ownerName', 'reg-owner')} type="text" autoComplete="name" />
        </FormField>

        <FormField label="Email" htmlFor="reg-email" error={errors.email}>
          <input {...inputProps('email', 'reg-email')} type="email" autoComplete="email" />
        </FormField>
      </div>

      <FormField
        label="Business description"
        htmlFor="reg-description"
        error={errors.businessDescription}
        hint="What does your company do? (10–1000 characters)"
      >
        <textarea {...inputProps('businessDescription', 'reg-description')} rows={3} />
      </FormField>

      <div className="form__row">
        <FormField
          label="Password"
          htmlFor="reg-password"
          error={errors.password}
          hint="At least 8 characters, with a letter and a number."
        >
          <PasswordInput
            id="reg-password"
            name="password"
            value={values.password}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.password}
          />
        </FormField>

        <FormField label="Confirm password" htmlFor="reg-confirm" error={errors.confirmPassword}>
          <PasswordInput
            id="reg-confirm"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.confirmPassword}
          />
        </FormField>
      </div>

      <SubmitButton isLoading={isSubmitting} loadingLabel="Creating account…">
        Create company account
      </SubmitButton>
    </form>
  );
}
