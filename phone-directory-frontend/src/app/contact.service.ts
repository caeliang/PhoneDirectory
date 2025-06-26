import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface Contact {
  id?: number;
  name: string;    // Frontend'de birleştirilen ad
  phone: string;   // Frontend'de phone
  email: string;
  // Backend için ayrı alanlar
  ad?: string;     // Backend'de ad
  soyad?: string;  // Backend'de soyad
  telefon?: string; // Backend'de telefon
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = '/api/kisiler'; // Proxy kullanarak backend'e erişim

  constructor(private http: HttpClient) {}

  getContacts(): Observable<Contact[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((backendContacts: any[]) => {
        // Backend'den gelen veriyi frontend formatına dönüştür
        return backendContacts.map(contact => ({
          id: contact.id,
          name: `${contact.ad || ''} ${contact.soyad || ''}`.trim(), // ad + soyad = name
          phone: contact.telefon || '',
          email: contact.email || ''
        }));
      }),
      catchError(this.handleError)
    );
  }

  addContact(contact: Contact): Observable<Contact> {
    console.log('Gönderilen contact verisi:', contact);
    
    // Frontend'deki name'i ad ve soyad olarak ayır
    const nameParts = contact.name.trim().split(' ');
    const ad = nameParts[0] || '';
    const soyad = nameParts.slice(1).join(' ') || '';
    
    // Backend'in beklediği formata dönüştür
    const backendContact = {
      ad: ad,
      soyad: soyad,
      telefon: contact.phone,
      email: contact.email
    };
    
    console.log('Backend için dönüştürülen veri:', backendContact);
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    return this.http.post<any>(this.apiUrl, backendContact, { headers }).pipe(
      map((response: any) => ({
        id: response.id,
        name: `${response.ad || ''} ${response.soyad || ''}`.trim(),
        phone: response.telefon || '',
        email: response.email || ''
      })),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Bilinmeyen bir hata oluştu!';
    
    console.error('Full error object:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Hata: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Backend sunucusuna bağlanılamıyor. Sunucunun çalıştığından emin olun.';
          break;
        case 400:
          let detailMessage = '';
          if (error.error && typeof error.error === 'object') {
            if (error.error.errors) {
              // ASP.NET Core model validation errors
              const validationErrors = Object.values(error.error.errors).flat();
              detailMessage = validationErrors.join(', ');
            } else if (error.error.message) {
              detailMessage = error.error.message;
            } else if (error.error.title) {
              detailMessage = error.error.title;
            }
          }
          errorMessage = `Geçersiz veri: ${detailMessage || 'Gönderilen veriler backend tarafından kabul edilmedi.'}`;
          break;
        case 404:
          errorMessage = 'API endpoint bulunamadı.';
          break;
        case 500:
          errorMessage = 'Sunucu hatası oluştu.';
          break;
        default:
          errorMessage = `Sunucu hatası: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('ContactService Hatası:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
