import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, switchMap, of, timeout, throwError } from 'rxjs';
import { Contact, ContactFormData } from '../models/contact.model';
import { ContactMapper, ApiResponseHandler } from '../utils';

// Add PagedResult interface
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
}


@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://phonedirectoryapi-c6eadmbehtbtbeh5.uaenorth-01.azurewebsites.net/api/Kisiler';

  constructor(private http: HttpClient) { }

  getAllContacts(): Observable<Contact[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(apiContacts => {
        if (!Array.isArray(apiContacts)) {
          console.error('Backend düzgün array döndürmedi:', apiContacts);
          return [];
        }

        const mappedContacts = apiContacts.map(apiContact => {
          return ContactMapper.mapApiContactToContact(apiContact);
        });

        return mappedContacts;
      })
    );
  }

  getContactById(id: number): Observable<Contact> {
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
    const apiContact = ContactMapper.mapContactFormDataToApiContact(contact);

    return this.http.post<any>(this.apiUrl, apiContact).pipe(
      map(apiContact => ApiResponseHandler.processApiResponse(apiContact, 'Kişi ekleme'))
    );
  }

  updateContact(id: number, updatedContact: Partial<ContactFormData>): Observable<Contact> {
    const apiContact = ContactMapper.mapPartialContactFormDataToApiContact(updatedContact, id);

    return this.http.put<any>(`${this.apiUrl}/${id}`, apiContact).pipe(
      map(apiContact => {
        // Backend boş yanıt döndürse, güncellenmiş veriyi kendimiz oluştur
        if (!apiContact) {
          return ContactMapper.createLocalContact(id, updatedContact);
        }

        return ContactMapper.mapApiContactToContact(apiContact);
      })
    );
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleFavorite(id: number, isFavorite: boolean): Observable<Contact> {
    const favoritePayload = { favori: isFavorite };

    return this.http.patch<any>(`${this.apiUrl}/${id}`, favoritePayload).pipe(
      timeout(10000),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          console.error('🔌 Sunucu bağlantısı yok veya CORS hatası');
        } else if (error.status === 400) {
          console.error('Veri formatı hatası (400 Bad Request)');
        } else if (error.status === 404) {
          console.error('Kişi bulunamadı (404 Not Found)');
        }
        return throwError(() => error);
      }),
      map(apiContact => {
        return ApiResponseHandler.processApiResponse(apiContact, 'Favori güncelleme');
      }),
      catchError((error) => {
        console.error('toggleFavorite genel hatası:', error);
        return throwError(() => error);
      })
    );
  }

  // New paginated method
  getPagedContacts(pageNumber: number = 1, pageSize: number = 20, searchTerm?: string): Observable<PagedResult<Contact>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<any>(`${this.apiUrl}/paged`, { params }).pipe(
      map(response => {
        console.log('Server response:', response);
        
        if (!response || !Array.isArray(response.items)) {
          console.error('Backend düzgün PagedResult döndürmedi:', response);
          return {
            items: [],
            totalCount: 0,
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalPages: 0
          };
        }

        const mappedContacts = response.items.map((apiContact: any) => {
          return ContactMapper.mapApiContactToContact(apiContact);
        });

        return {
          items: mappedContacts,
          totalCount: response.totalCount || 0,
          pageNumber: response.pageNumber || pageNumber,
          pageSize: response.pageSize || pageSize,
          totalPages: Math.ceil((response.totalCount || 0) / pageSize)
        };
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Paginated contacts fetch error:', error);
        return throwError(() => error);
      })
    );
  }
}
