import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from './contact.service';

interface Contact {
  id?: number;
  name: string;
  phone: string;
  email: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'phone-directory-frontend';
  contacts: Contact[] = [];
  contact: Contact = { name: '', phone: '', email: '' };
  loading = false;
  errorMessage = '';

  constructor(private contactService: ContactService) {
    this.loadContacts();
  }

  loadContacts() {
    this.loading = true;
    this.errorMessage = '';
    
    this.contactService.getContacts().subscribe({
      next: (data) => {
        this.contacts = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
        this.contacts = [];
      }
    });
  }

  onSubmit() {
    if (!this.contact.name || !this.contact.phone || !this.contact.email) {
      this.errorMessage = 'Lütfen tüm alanları doldurun.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    
    const newContact = { ...this.contact };
    this.contactService.addContact(newContact).subscribe({
      next: (addedContact) => {
        this.contact = { name: '', phone: '', email: '' };
        this.loadContacts(); // Listeyi yenile
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.loading = false;
      }
    });
  }
}
