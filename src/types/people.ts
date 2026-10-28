export type PersonType = 'customer' | 'staff' | 'supplier';

export const PERSON_TYPES: ReadonlyArray<{ value: PersonType; label: string; plural: string }> = [
  { value: 'customer', label: 'Customer', plural: 'Customers' },
  { value: 'staff', label: 'Staff', plural: 'Staff' },
  { value: 'supplier', label: 'Supplier', plural: 'Suppliers' },
];

export interface Person {
  id: string;
  type: PersonType;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  details: string | null;
  createdAt: string;
  updatedAt: string;
}

/** What the form sends. Empty optional fields are `null`. */
export interface PersonPayload {
  type: PersonType;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  details: string | null;
}
