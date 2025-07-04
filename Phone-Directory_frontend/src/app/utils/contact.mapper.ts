import { Contact, ContactFormData } from '../models/contact.model';

/**
 * Contact veri mapping işlemleri için utility sınıfı
 */
export class ContactMapper {
  
  /**
   * Backend'den gelen API verisini frontend Contact modeline dönüştürür
   */
  static mapApiContactToContact(apiContact: any): Contact {
    // Backend C# modelinde IsFavori kullanılıyor
    console.log('🎯 ContactMapper: Backend verisi', apiContact);
    
    let favoriteValue = false;
    
    // Tüm olası favori alan isimlerini kontrol et
    const favoriteKeys = ['IsFavori', 'isFavori', 'isFavorite', 'favori', 'favorite'];
    for (const key of favoriteKeys) {
      if (apiContact.hasOwnProperty(key) && apiContact[key] !== undefined && apiContact[key] !== null) {
        favoriteValue = Boolean(apiContact[key]);
        console.log(`🎯 Favori değeri bulundu: ${key} = ${apiContact[key]} → ${favoriteValue}`);
        break;
      }
    }
    
    console.log('🎯 Final favori değeri:', favoriteValue);

    return {
      id: apiContact.Id || apiContact.id,
      firstName: apiContact.Ad || apiContact.ad || '',
      lastName: apiContact.Soyad || apiContact.soyad || '',
      phoneNumber: apiContact.Telefon || apiContact.telefon || '',
      email: apiContact.Email || apiContact.email || '',
      address: apiContact.Address || apiContact.adres || '',
      company: apiContact.Company || apiContact.sirket || '',
      notes: apiContact.Notes || apiContact.notlar || '',
      isFavorite: favoriteValue,
      createdAt: apiContact.CreatedAt || apiContact.createdAt ? new Date(apiContact.CreatedAt || apiContact.createdAt) : undefined,
      updatedAt: apiContact.UpdatedAt || apiContact.updatedAt ? new Date(apiContact.UpdatedAt || apiContact.updatedAt) : undefined
    };
  }

  /**
   * Frontend ContactFormData'yı backend API formatına dönüştürür
   */
  static mapContactFormDataToApiContact(contact: ContactFormData, id?: number): any {
    const apiContact: any = {
      Ad: contact.firstName,
      Soyad: contact.lastName,
      Telefon: contact.phoneNumber,
      Email: contact.email,
      Address: contact.address || null,
      Company: contact.company || null,
      Notes: contact.notes || null,
      IsFavori: contact.isFavorite,  // Backend C# modelinde IsFavori
      UpdatedAt: new Date().toISOString()
    };

    if (id !== undefined) {
      apiContact.Id = id;
    }

    return apiContact;
  }

  /**
   * Partial ContactFormData'yı backend API formatına dönüştürür
   */
  static mapPartialContactFormDataToApiContact(contact: Partial<ContactFormData>, id: number): any {
    return {
      Id: id,
      Ad: contact.firstName,
      Soyad: contact.lastName,
      Telefon: contact.phoneNumber,
      Email: contact.email,
      Address: contact.address || null,
      Company: contact.company || null,
      Notes: contact.notes || null,
      IsFavori: contact.isFavorite,  // Backend C# modelinde IsFavori
      UpdatedAt: new Date().toISOString()
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
