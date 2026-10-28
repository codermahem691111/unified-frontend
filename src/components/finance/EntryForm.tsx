import { type ChangeEvent, type FormEvent, useState } from 'react';
import { ApiError } from '../../api/apiError';
import type { FinanceCategory, FinanceEntry, FinanceEntryPayload, FinanceType } from '../../types/finance';
import { EXPENSE_CATEGORIES } from '../../types/finance';
import { todayLocal } from '../../utils/format';
import { type EntryFormValues, validateEntry } from '../../utils/resourceValidators';
import type { FieldErrors } from '../../utils/validators';
import { Alert } from '../Alert';
import { FormActions } from '../FormActions';
import { FormField } from '../FormField';

interface EntryFormProps {
  /** Income entries are always product sales; expenses choose one of three categories. */
  kind: FinanceType;
  /** The entry being edited, or null when adding a new one. */
  entry: FinanceEntry | null;
  onSubmit: (payload: FinanceEntryPayload) => Promise<void>;
  onCancel: () => void;
}

export function EntryForm({ kind, entry, onSubmit, onCancel }: EntryFormProps) {
  const [values, setValues] = useState<EntryFormValues>({
    category: entry?.category ?? (kind === 'income' ? 'product_sale' : 'staff_salary'),
    amount: entry ? String(entry.amount) : '',
    entryDate: entry?.entryDate ?? todayLocal(),
    description: entry?.description ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors<EntryFormValues>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateEntry(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setServerErrors([]);

    try {
      await onSubmit({
        category: values.category as FinanceCategory,
        amount: Number(values.amount),
        entryDate: values.entryDate,
        description: values.description.trim() === '' ? null : values.description.trim(),
      });
    } catch (caught) {
      setServerErrors(ApiError.from(caught).messages);
      setIsSubmitting(false);
    }
  };

  const fieldProps = (name: keyof EntryFormValues, id: string) => ({
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

        <FormField label="Category" htmlFor="entry-category">
          {kind === 'income' ? (
            <input id="entry-category" className="input" value="Product sale" readOnly />
          ) : (
            <select {...fieldProps('category', 'entry-category')}>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          )}
        </FormField>

        <div className="form__row">
          <FormField label="Amount" htmlFor="entry-amount" error={errors.amount}>
            <input {...fieldProps('amount', 'entry-amount')} type="number" inputMode="decimal" min="0" step="0.01" />
          </FormField>

          <FormField label="Date" htmlFor="entry-date" error={errors.entryDate}>
            <input {...fieldProps('entryDate', 'entry-date')} type="date" />
          </FormField>
        </div>

        <FormField
          label="Description (optional)"
          htmlFor="entry-description"
          error={errors.description}
          hint={kind === 'income' ? 'For example: which products were sold.' : 'For example: who was paid, or what was bought.'}
        >
          <textarea {...fieldProps('description', 'entry-description')} rows={3} />
        </FormField>
      </div>

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={entry ? 'Save changes' : kind === 'income' ? 'Add income' : 'Add expense'}
        onCancel={onCancel}
      />
    </form>
  );
}
