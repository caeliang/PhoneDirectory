import { ContactFormData } from '../models/contact.model';

/**
 * Form validasyon işlemleri için utility sınıfı
 */
export class FormValidator {
  
  /**
   * Contact form verilerini validate eder
   */
  static validateContactForm(formData: ContactFormData): ValidationResult {
    const errors: string[] = [];
    
    // Zorunlu alanları kontrol et
    if (!formData.firstName?.trim()) {
      errors.push('Ad alanı zorunludur');
    }
    
    if (!formData.lastName?.trim()) {
      errors.push('Soyad alanı zorunludur');
    }
    
    if (!formData.phoneNumber?.trim()) {
      errors.push('Telefon numarası zorunludur');
    }
    
    // Telefon numarası formatını kontrol et
    if (formData.phoneNumber && !this.isValidPhoneNumber(formData.phoneNumber)) {
      errors.push('Geçerli bir telefon numarası giriniz');
    }
    
    // Email formatını kontrol et (varsa)
    if (formData.email && !this.isValidEmail(formData.email)) {
      errors.push('Geçerli bir e-posta adresi giriniz');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      isFormReady: this.isFormReady(formData)
    };
  }

  /**
   * Formun gönderilmeye hazır olup olmadığını kontrol eder
   */
  static isFormReady(formData: ContactFormData): boolean {
    return !!(
      formData.firstName?.trim() && 
      formData.lastName?.trim() && 
      formData.phoneNumber?.trim()
    );
  }

  /**
   * Telefon numarası formatını kontrol eder
   */
  private static isValidPhoneNumber(phone: string): boolean {
    // Türkiye telefon numarası formatları için basit kontrol
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  /**
   * Email formatını kontrol eder
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Form verilerini temizler ve varsayılan değerleri döner
   */
  static getDefaultFormData(): ContactFormData {
    return {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      address: '',
      company: '',
      notes: '',
      isFavorite: false
    };
  }
}

/**
 * Validasyon sonucu interface'i
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  isFormReady: boolean;
}
