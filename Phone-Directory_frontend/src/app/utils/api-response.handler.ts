import { Contact } from '../models/contact.model';
import { ContactMapper } from './contact.mapper';

/**
 * API yanıt işlemleri için utility sınıfı
 */
export class ApiResponseHandler {
  
  /**
   * API yanıtını loglar ve Contact nesnesine dönüştürür
   */
  static processApiResponse(apiContact: any, operationType: string, contactName?: string): Contact {
    console.log(`📥 ${operationType} backend yanıtı:`, apiContact);
    
    if (!apiContact) {
      console.log('⚠️ Backend boş yanıt döndürdü');
      throw new Error('No response from server');
    }

    const mapped = ContactMapper.mapApiContactToContact(apiContact);
    const name = contactName || `${mapped.firstName} ${mapped.lastName}`;
    console.log(`✅ ${operationType} tamamlandı: ${name}, isFavorite=${mapped.isFavorite}`);
    
    return mapped;
  }

  /**
   * API isteği öncesi loglama yapar
   */
  static logApiRequest(operation: string, data?: any): void {
    console.log(`📤 ${operation} için API'ye gönderilen veri:`, data);
  }

  /**
   * API hatalarını işler ve kullanıcı dostu mesajlar döner
   */
  static handleApiError(error: any, operation: string): string {
    console.error(`❌ ${operation} hatası:`, error);
    
    if (error.status === 404) {
      return 'Kaynak bulunamadı';
    } else if (error.status === 405) {
      return 'Bu işlem desteklenmiyor';
    } else if (error.status === 500) {
      return 'Sunucu hatası oluştu';
    } else if (error.status === 0) {
      return 'Sunucuya bağlanılamıyor';
    }
    
    return error.message || 'Bilinmeyen hata oluştu';
  }
}
