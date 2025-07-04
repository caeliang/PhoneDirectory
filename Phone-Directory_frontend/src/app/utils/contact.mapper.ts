import { Contact, ContactFormData } from '../models/contact.model';

/**
 * Contact veri mapping işlemleri için utility sınıfı
 */
export class ContactMapper {
  
  /**
   * Backend'den gelen API verisini frontend Contact modeline dönüştürür
   */
  static mapApiContactToContact(apiContact: any): Contact {
    // Backend favori alanını kontrol et
    let favoriteValue = false;
    if (apiContact.hasOwnProperty('favori')) {
      favoriteValue = Boolean(apiContact.favori);
    } else if (apiContact.hasOwnProperty('isFavorite')) {
      favoriteValue = Boolean(apiContact.isFavorite);
    } else if (apiContact.hasOwnProperty('favorite')) {
      favoriteValue = Boolean(apiContact.favorite);
    }

    return {
      id: apiContact.id,
      firstName: apiContact.ad || '',
      lastName: apiContact.soyad || '',
      phoneNumber: apiContact.telefon || '',
      email: apiContact.email || '',
      address: apiContact.adres || '',
      company: apiContact.sirket || '',
      notes: apiContact.notlar || '',
      isFavorite: favoriteValue,
      createdAt: apiContact.createdAt ? new Date(apiContact.createdAt) : undefined,
      updatedAt: apiContact.updatedAt ? new Date(apiContact.updatedAt) : undefined
    };
  }

  /**
   * Frontend ContactFormData'yı backend API formatına dönüştürür
   */
  static mapContactFormDataToApiContact(contact: ContactFormData, id?: number): any {
    const apiContact: any = {
      ad: contact.firstName,
      soyad: contact.lastName,
      telefon: contact.phoneNumber,
      email: contact.email,
      adres: contact.address,
      sirket: contact.company,
      notlar: contact.notes,
      favori: contact.isFavorite  // Backend 'favori' alanını bekliyor
    };

    if (id !== undefined) {
      apiContact.id = id;
    }

    return apiContact;
  }

  /**
   * Partial ContactFormData'yı backend API formatına dönüştürür
   */
  static mapPartialContactFormDataToApiContact(contact: Partial<ContactFormData>, id: number): any {
    return {
      id: id,
      ad: contact.firstName,
      soyad: contact.lastName,
      telefon: contact.phoneNumber,
      email: contact.email,
      adres: contact.address,
      sirket: contact.company,
      notlar: contact.notes,
      favori: contact.isFavorite  // Backend 'favori' alanını bekliyor
    };
  }

  /**
   * Backend boş yanıt döndürdüğünde yerel Contact nesnesi oluşturur
   */
  static createLocalContact(id: number, updatedContact: Partial<ContactFormData>): Contact {
    console.log('⚠️ Backend boş yanıt döndürdü, lokal veri oluşturuluyor');
    return {
      id: id,
      firstName: updatedContact.firstName || '',
      lastName: updatedContact.lastName || '',
      phoneNumber: updatedContact.phoneNumber || '',
      email: updatedContact.email || '',
      address: updatedContact.address || '',
      company: updatedContact.company || '',
      notes: updatedContact.notes || '',
      isFavorite: updatedContact.isFavorite || false,
      createdAt: undefined,
      updatedAt: new Date()
    };
  }
}
