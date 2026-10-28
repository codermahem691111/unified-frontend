import { type ChangeEvent, type FormEvent, useState } from 'react';
import { ApiError } from '../../api/apiError';
import type { Person, PersonPayload, PersonType } from '../../types/people';
import { PERSON_TYPES } from '../../types/people';
import { type PersonFormValues, validatePerson } from '../../utils/resourceValidators';
import type { FieldErrors } from '../../utils/validators';
import { Alert } from '../Alert';
import { FormActions } from '../FormActions';
import { FormField } from '../FormField';

interface PersonFormProps {
  /** The person being edited, or null when adding a new one. */
  person: Person | null;
  /** Used as the starting type when adding (for example the tab currently open). */
  defaultType: PersonType;
  onSubmit: (payload: PersonPayload) => Promise<void>;
  onCancel: () => void;
}

const toNull = (text: string): string | null => (text.trim() === '' ? null : text.trim());

export function PersonForm({ person, defaultType, onSubmit, onCancel }: PersonFormProps) {
  const [values, setValues] = useState<PersonFormValues>({
    type: person?.type ?? defaultType,
    name: person?.name ?? '',
    email: person?.email ?? '',
    phone: person?.phone ?? '',
    address: person?.address ?? '',
    details: person?.details ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors<PersonFormValues>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validatePerson(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerErrors([]);

    try {
      await onSubmit({
        type: values.type,
        name: values.name.trim(),
        email: toNull(values.email),
        phone: toNull(values.phone),
        address: toNull(values.address),
        details: toNull(values.details),
      });
    } catch (caught) {
      setServerErrors(ApiError.from(caught).messages);
      setIsSubmitting(false);
    }
  };

  const fieldProps = (name: keyof PersonFormValues, id: string) => ({
    id,
    name,
    value: values[name],
    onChange: handleChange,
    className: `input${errors[name] ? ' input--invalid' : ''}`,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${id}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="modal__body form">
        {serverErrors.length > 0 && (
          <Alert variant="error">
            {serverErrors.map((message) => (
              <div key={message}>{message}</div>
            ))}
          </Alert>
        )}

        <div className="form__row">
          <FormField label="Type" htmlFor="person-type">
            <select {...fieldProps('type', 'person-type')}>
              {PERSON_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Name" htmlFor="person-name" error={errors.name}>
            <input {...fieldProps('name', 'person-name')} type="text" autoComplete="off" />
          </FormField>
        </div>

        <div className="form__row">
          <FormField label="Email (optional)" htmlFor="person-email" error={errors.email}>
            <input {...fieldProps('email', 'person-email')} type="email" autoComplete="off" />
          </FormField>

          <FormField label="Phone (optional)" htmlFor="person-phone" error={errors.phone}>
            <input {...fieldProps('phone', 'person-phone')} type="tel" autoComplete="off" />
          </FormField>
        </div>

        <FormField label="Address (optional)" htmlFor="person-address" error={errors.address}>
          <input {...fieldProps('address', 'person-address')} type="text" autoComplete="off" />
        </FormField>

        <FormField label="Details (optional)" htmlFor="person-details" error={errors.details}>
          <textarea {...fieldProps('details', 'person-details')} rows={3} />
        </FormField>
      </div>

      <FormActions isSubmitting={isSubmitting} submitLabel={person ? 'Save changes' : 'Add person'} onCancel={onCancel} />
    </form>
  );
}
