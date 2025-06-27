// services/contact.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Contact } from '../app/models/contact';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
   private apiUrl = 'https://localhost:7227/api/kisiler';
   private httpOptions = {
     headers: new HttpHeaders({
       'Content-Type': 'application/json'
     })
   };

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);
    }
    return throwError('Something bad happened; please try again later.');
  }

  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getContact(id: number): Observable<Contact> {
    return this.http.get<Contact>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createContact(contact: Contact): Observable<Contact> {
    console.log('Creating contact:', contact);
    console.log('API URL:', this.apiUrl);
    
    // Backend'in beklediği format
    const contactData = { 
      ad: contact.name || contact.ad,
      soyad: contact.soyad || '', // Soyad boş olabilir
      telefon: contact.phone || contact.telefon,
      email: contact.email
    };
    console.log('Backend için gönderilen veri:', contactData);
    
    return this.http.post<Contact>(this.apiUrl, contactData, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateContact(contact: Contact): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${contact.id}`, contact).pipe(
      catchError(this.handleError)
    );
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
