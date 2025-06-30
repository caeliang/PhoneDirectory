export interface Contact {
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  company?: string;
  notes?: string;
  isFavorite?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  company: string;
  notes: string;
  isFavorite: boolean;
}
