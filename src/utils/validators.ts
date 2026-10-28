import type { LoginPayload, RegisterPayload } from '../types/auth';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface RegisterFormValues extends RegisterPayload {
  confirmPassword: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LICENSE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-/ ]*$/;

// These rules mirror the backend DTOs. The server is still the source of truth.
export function validateRegister(values: RegisterFormValues): FieldErrors<RegisterFormValues> {
  const errors: FieldErrors<RegisterFormValues> = {};

  if (!values.companyName.trim()) {
    errors.companyName = 'Company name is required.';
  }

  if (!values.licenseNumber.trim()) {
    errors.licenseNumber = 'License number is required.';
  } else if (!LICENSE_PATTERN.test(values.licenseNumber.trim())) {
    errors.licenseNumber = 'Use only letters, numbers, spaces, hyphens and slashes.';
  }

  if (!values.ownerName.trim()) {
    errors.ownerName = 'Owner name is required.';
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (values.businessDescription.trim().length < 10) {
    errors.businessDescription = 'Describe your business in at least 10 characters.';
  }

  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/[A-Za-z]/.test(values.password) || !/\d/.test(values.password)) {
    errors.password = 'Password must contain at least one letter and one number.';
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export function validateLogin(values: LoginPayload): FieldErrors<LoginPayload> {
  const errors: FieldErrors<LoginPayload> = {};

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}
