// services/contact.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Contact } from '../app/models/contact';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
   private apiUrl = 'https://localhost:7227/api/kisiler';

  constructor(private http: HttpClient) { }

  addContact(contact: Contact) {
    return this.http.post(this.apiUrl, contact);
  }


  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }

  getContact(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`);
  }

  createContact(contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, contact);
  }

  updateContact(contact: Contact): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${contact.id}`, contact);
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
