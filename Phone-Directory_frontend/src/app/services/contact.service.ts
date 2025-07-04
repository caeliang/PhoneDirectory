import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, switchMap, of, timeout, throwError } from 'rxjs';
import { Contact, ContactFormData } from '../models/contact.model';
import { ContactMapper, ApiResponseHandler } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:5270/api/Kisiler';

  constructor(private http: HttpClient) { }

  getAllContacts(): Observable<Contact[]> {
    console.log('Tüm kişiler alınıyor...');
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(apiContacts => {
        console.log('Backend\'den gelen ham veri:', apiContacts);
        
        if (!Array.isArray(apiContacts)) {
          console.error('Backend düzgün array döndürmedi:', apiContacts);
          return [];
        }

        const mappedContacts = apiContacts.map(apiContact => {
          // Backend'ten gelen tüm alanları debug için listele
          console.log('👀 Ham API verisi (bir kişi):', apiContact);
          console.log('🔍 IsFavori alanı (büyük I):', apiContact.IsFavori);
          console.log('🔍 isFavori alanı (küçük i):', apiContact.isFavori);
          console.log('🔍 Object.keys:', Object.keys(apiContact));
          
          const mapped = ContactMapper.mapApiContactToContact(apiContact);
          console.log(`✨ ${mapped.firstName} ${mapped.lastName}: Mapping sonucu isFavorite=${mapped.isFavorite}`);
          return mapped;
        });

        console.log('Toplam kişi sayısı:', mappedContacts.length);
        console.log('Favori kişi sayısı:', mappedContacts.filter(c => c.isFavorite).length);
        return mappedContacts;
      })
    );
  }

  getContactById(id: number): Observable<Contact> {
    console.log(`ID ${id} ile kişi alınıyor...`);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(apiContact => {
        if (!apiContact) {
          throw new Error('Contact not found');
        }

        const mapped = ContactMapper.mapApiContactToContact(apiContact);
        console.log(`Kişi detayı ${mapped.firstName} ${mapped.lastName}: isFavorite=${mapped.isFavorite}`);
        return mapped;
      })
    );
  }

  addContact(contact: ContactFormData): Observable<Contact> {
    console.log('Yeni kişi ekleniyor:', contact);
    
    const apiContact = ContactMapper.mapContactFormDataToApiContact(contact);
    ApiResponseHandler.logApiRequest('Kişi ekleme', apiContact);

    return this.http.post<any>(this.apiUrl, apiContact).pipe(
      map(apiContact => ApiResponseHandler.processApiResponse(apiContact, 'Kişi ekleme'))
    );
  }

  updateContact(id: number, updatedContact: Partial<ContactFormData>): Observable<Contact> {
    console.log(`ID ${id} kişi güncelleniyor:`, updatedContact);
    
    const apiContact = ContactMapper.mapPartialContactFormDataToApiContact(updatedContact, id);
    ApiResponseHandler.logApiRequest('Kişi güncelleme', apiContact);

    return this.http.put<any>(`${this.apiUrl}/${id}`, apiContact).pipe(
      map(apiContact => {
        console.log('Güncelleme backend yanıtı:', apiContact);
        
        // Backend boş yanıt döndürürse, güncellenmiş veriyi kendimiz oluştur
        if (!apiContact) {
          return ContactMapper.createLocalContact(id, updatedContact);
        }

        const mapped = ContactMapper.mapApiContactToContact(apiContact);
        console.log(`Kişi güncellendi: ${mapped.firstName} ${mapped.lastName}, isFavorite=${mapped.isFavorite}`);
        return mapped;
      })
    );
  }

  deleteContact(id: number): Observable<void> {
    console.log(`ID ${id} kişi siliniyor...`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleFavorite(id: number, isFavorite: boolean): Observable<Contact> {
    console.log(`ID ${id} kişinin favori durumu değiştiriliyor: ${!isFavorite} → ${isFavorite}`);
    
    // Backend'in beklediği basit format - sadece favori durumunu gönder
    const favoritePayload = { favori: isFavorite };
    ApiResponseHandler.logApiRequest('Favori değişikliği', favoritePayload);

    return this.http.patch<any>(`${this.apiUrl}/${id}`, favoritePayload).pipe(
      timeout(10000), // 10 saniye timeout
      catchError((error: HttpErrorResponse) => {
        console.error('❌ PATCH request hatası:', error);
        if (error.status === 0) {
          console.error('🔌 Sunucu bağlantısı yok veya CORS hatası');
        } else if (error.status === 400) {
          console.error('📝 Veri formatı hatası (400 Bad Request)');
          console.error('📤 Gönderilen veri:', favoritePayload);
        } else if (error.status === 404) {
          console.error('🔍 Kişi bulunamadı (404 Not Found)');
        }
        return throwError(() => error);
      }),
      map(apiContact => {
        const mappedContact = ApiResponseHandler.processApiResponse(apiContact, 'Favori güncelleme');
        console.log(`✅ Favori durumu başarıyla güncellendi: ${mappedContact.firstName} ${mappedContact.lastName} = ${mappedContact.isFavorite}`);
        return mappedContact;
      }),
      catchError((error) => {
        console.error('❌ toggleFavorite genel hatası:', error);
        return throwError(() => error);
      })
    );
  }
}
