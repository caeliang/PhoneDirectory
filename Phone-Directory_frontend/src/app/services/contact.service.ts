import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Contact, ContactFormData } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'https://localhost:7227/api/kisiler';

  constructor(private http: HttpClient) { }

  getAllContacts(): Observable<Contact[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(apiContacts => apiContacts.map(apiContact => ({
        id: apiContact.id,
        firstName: apiContact.ad,
        lastName: apiContact.soyad,
        phoneNumber: apiContact.telefon,
        email: apiContact.email,
        address: apiContact.adres || '',
        company: apiContact.sirket || '',
        notes: apiContact.notlar || '',
        isFavorite: apiContact.favori || false,
        createdAt: apiContact.createdAt ? new Date(apiContact.createdAt) : undefined,
        updatedAt: apiContact.updatedAt ? new Date(apiContact.updatedAt) : undefined
      })))
    );
  }

  getContactById(id: number): Observable<Contact> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(apiContact => {
        if (!apiContact) {
          throw new Error('Contact not found');
        }
        return {
          id: apiContact.id,
          firstName: apiContact.ad,
          lastName: apiContact.soyad,
          phoneNumber: apiContact.telefon,
          email: apiContact.email,
          address: apiContact.adres || '',
          company: apiContact.sirket || '',
          notes: apiContact.notlar || '',
          isFavorite: apiContact.favori || false,
          createdAt: apiContact.createdAt ? new Date(apiContact.createdAt) : undefined,
          updatedAt: apiContact.updatedAt ? new Date(apiContact.updatedAt) : undefined
        };
      })
    );
  }

  addContact(contact: ContactFormData): Observable<Contact> {
    // API'ye uygun alan adları ile gönder
    const apiContact = {
      ad: contact.firstName,
      soyad: contact.lastName,
      telefon: contact.phoneNumber,
      email: contact.email,
      adres: contact.address,
      sirket: contact.company,
      notlar: contact.notes,
      favori: contact.isFavorite
    };
    return this.http.post<any>(this.apiUrl, apiContact).pipe(
      map(apiContact => {
        if (!apiContact) {
          throw new Error('No response from server');
        }
        return {
          id: apiContact.id,
          firstName: apiContact.ad,
          lastName: apiContact.soyad,
          phoneNumber: apiContact.telefon,
          email: apiContact.email,
          address: apiContact.adres || '',
          company: apiContact.sirket || '',
          notes: apiContact.notlar || '',
          isFavorite: apiContact.favori || false,
          createdAt: apiContact.createdAt ? new Date(apiContact.createdAt) : undefined,
          updatedAt: apiContact.updatedAt ? new Date(apiContact.updatedAt) : undefined
        };
      })
    );
  }

  updateContact(id: number, updatedContact: Partial<ContactFormData>): Observable<Contact> {
    const apiContact = {
      id: id,
      ad: updatedContact.firstName,
      soyad: updatedContact.lastName,
      telefon: updatedContact.phoneNumber,
      email: updatedContact.email,
      adres: updatedContact.address,
      sirket: updatedContact.company,
      notlar: updatedContact.notes,
      favori: updatedContact.isFavorite
    };
    return this.http.put<any>(`${this.apiUrl}/${id}`, apiContact).pipe(
      map(apiContact => {
        // Backend boş yanıt döndürürse, güncellenmiş veriyi kendimiz oluştur
        if (!apiContact) {
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
        return {
          id: apiContact.id,
          firstName: apiContact.ad,
          lastName: apiContact.soyad,
          phoneNumber: apiContact.telefon,
          email: apiContact.email,
          address: apiContact.adres || '',
          company: apiContact.sirket || '',
          notes: apiContact.notlar || '',
          isFavorite: apiContact.favori || false,
          createdAt: apiContact.createdAt ? new Date(apiContact.createdAt) : undefined,
          updatedAt: apiContact.updatedAt ? new Date(apiContact.updatedAt) : undefined
        };
      })
    );
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleFavorite(id: number, isFavorite: boolean): Observable<Contact> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, { favori: isFavorite }).pipe(
      map(apiContact => {
        if (!apiContact) {
          throw new Error('No response from server');
        }
        return {
          id: apiContact.id,
          firstName: apiContact.ad,
          lastName: apiContact.soyad,
          phoneNumber: apiContact.telefon,
          email: apiContact.email,
          address: apiContact.adres || '',
          company: apiContact.sirket || '',
          notes: apiContact.notlar || '',
          isFavorite: apiContact.favori || false,
          createdAt: apiContact.createdAt ? new Date(apiContact.createdAt) : undefined,
          updatedAt: apiContact.updatedAt ? new Date(apiContact.updatedAt) : undefined
        };
      })
    );
  }
}
