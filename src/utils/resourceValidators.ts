import type { FinanceCategory } from '../types/finance';
import type { PersonType } from '../types/people';
import type { FieldErrors } from './validators';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Returns an error message for a money field, or undefined when it is fine. */
function checkMoney(value: string, label: string, { allowZero }: { allowZero: boolean }): string | undefined {
  const text = value.trim();
  if (!text) return `${label} is required.`;
  if (!MONEY_PATTERN.test(text)) return `${label} must be a number with at most 2 decimals.`;

  const amount = Number(text);
  if (amount === 0 && !allowZero) return `${label} must be greater than zero.`;
  return undefined;
}

export interface PersonFormValues {
  type: PersonType;
  name: string;
  email: string;
  phone: string;
  address: string;
  details: string;
}

export function validatePerson(values: PersonFormValues): FieldErrors<PersonFormValues> {
  const errors: FieldErrors<PersonFormValues> = {};

  if (!values.name.trim()) errors.name = 'Name is required.';
  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (values.phone.trim().length > 40) errors.phone = 'Phone must be at most 40 characters.';
  if (values.details.trim().length > 1000) errors.details = 'Details must be at most 1000 characters.';

  return errors;
}

export interface ProductFormValues {
  name: string;
  details: string;
  sellingPrice: string;
  buyingPrice: string;
}

export function validateProduct(values: ProductFormValues): FieldErrors<ProductFormValues> {
  const errors: FieldErrors<ProductFormValues> = {};

  if (!values.name.trim()) errors.name = 'Product name is required.';
  errors.sellingPrice = checkMoney(values.sellingPrice, 'Selling price', { allowZero: true });
  errors.buyingPrice = checkMoney(values.buyingPrice, 'Buying price', { allowZero: true });
  if (values.details.trim().length > 2000) errors.details = 'Details must be at most 2000 characters.';

  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as FieldErrors<ProductFormValues>;
}

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Returns an error message for a chosen image file, or null when it is acceptable. */
export function checkImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG or WebP images are allowed.';
  if (file.size > MAX_IMAGE_BYTES) return 'The image must be 2 MB or smaller.';
  return null;
}

export interface EntryFormValues {
  category: FinanceCategory;
  amount: string;
  entryDate: string;
  description: string;
}

export function validateEntry(values: EntryFormValues): FieldErrors<EntryFormValues> {
  const errors: FieldErrors<EntryFormValues> = {};

  errors.amount = checkMoney(values.amount, 'Amount', { allowZero: false });
  if (!DATE_PATTERN.test(values.entryDate)) errors.entryDate = 'Choose a date.';
  if (values.description.trim().length > 500) errors.description = 'Description must be at most 500 characters.';

  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as FieldErrors<EntryFormValues>;
}
