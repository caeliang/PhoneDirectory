// models/contact.model.ts
export interface Contact {
  id?: number;
  ad?: string;    // Backend'de 'ad' field'ı var
  soyad?: string; // Backend'de 'soyad' field'ı var
  name?: string;  // Frontend için
  telefon?: string; // Backend'de 'telefon' field'ı var
  phone?: string;   // Frontend için
  email: string;
}

