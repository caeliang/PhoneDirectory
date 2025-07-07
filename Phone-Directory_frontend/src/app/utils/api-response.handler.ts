import { Contact } from '../models/contact.model';
import { ContactMapper } from './contact.mapper';

/**
 * API yanıt işlemleri için utility sınıfı
 */
export class ApiResponseHandler {
  
  /**
   * API yanıtını Contact nesnesine dönüştürür
   */
  static processApiResponse(apiContact: any, operationType: string, contactName?: string): Contact {
    if (!apiContact) {
      throw new Error('No response from server');
    }

    return ContactMapper.mapApiContactToContact(apiContact);
  }

  /**
   * API hatalarını işler ve kullanıcı dostu mesajlar döner
   */
  static handleApiError(error: any, operation: string): string {
    
    if (error.status === 404) {
      return 'Kaynak bulunamadı';
    } else if (error.status === 405) {
      return 'Bu işlem desteklenmiyor';
    } else if (error.status === 500) {
      return 'Sunucu hatası oluştu';
    } else if (error.status === 0) {
      return 'Sunucuya bağlanılamıyor';
    } else if (error.status === 409) {
      // Backend'den gelen duplicate telefon mesajını göster
      if (error.error && error.error.message) {
        return error.error.message;
      }
      return 'Bu telefon numarasına sahip bir kişi zaten mevcut.';
    }
    
    return error.message || 'Bilinmeyen hata oluştu';
  }
}
