import { Contact } from '../models/contact.model';

/**
 * Contact filtreleme işlemleri için utility sınıfı
 */
export class ContactFilter {
  
  /**
   * Favori filtresi uygular
   */
  static applyFavoriteFilter(contacts: Contact[], showOnlyFavorites: boolean): Contact[] {
    if (!showOnlyFavorites) {
      return contacts;
    }
    
    const filtered = contacts.filter(contact => contact.isFavorite === true);
    console.log(`⭐ Favori filtresi uygulandı: ${filtered.length} favori kişi`);
    return filtered;
  }

  /**
   * Arama filtresi uygular
   */
  static applySearchFilter(contacts: Contact[], searchTerm: string): Contact[] {
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();
    if (!trimmedSearchTerm) {
      return contacts;
    }

    const filtered = contacts.filter(contact =>
      contact.firstName.toLowerCase().includes(trimmedSearchTerm) ||
      contact.lastName.toLowerCase().includes(trimmedSearchTerm) ||
      contact.phoneNumber.includes(trimmedSearchTerm) ||
      (contact.email && contact.email.toLowerCase().includes(trimmedSearchTerm)) ||
      (contact.company && contact.company.toLowerCase().includes(trimmedSearchTerm))
    );
    
    console.log(`🔍 Arama filtresi uygulandı: "${trimmedSearchTerm}" için ${filtered.length} sonuç`);
    return filtered;
  }

  /**
   * Tüm filtreleri uygular
   */
  static applyAllFilters(
    contacts: Contact[], 
    searchTerm: string, 
    showOnlyFavorites: boolean
  ): Contact[] {
    let filtered = [...contacts];
    filtered = this.applyFavoriteFilter(filtered, showOnlyFavorites);
    filtered = this.applySearchFilter(filtered, searchTerm);
    return filtered;
  }

  /**
   * Filtrelerin aktif olup olmadığını kontrol eder
   */
  static hasActiveFilters(searchTerm: string, showOnlyFavorites: boolean): boolean {
    return !!(searchTerm.trim() || showOnlyFavorites);
  }

  /**
   * Filtre durumu bilgisini döner
   */
  static getFilterInfo(searchTerm: string, showOnlyFavorites: boolean, resultCount: number): string {
    const parts: string[] = [];
    
    if (showOnlyFavorites) {
      parts.push('⭐ Sadece favoriler gösteriliyor');
    }
    
    if (searchTerm.trim()) {
      parts.push(`🔍 "${searchTerm}" araması`);
    }
    
    parts.push(`${resultCount} kişi bulundu`);
    
    return parts.join(' • ');
  }
}
