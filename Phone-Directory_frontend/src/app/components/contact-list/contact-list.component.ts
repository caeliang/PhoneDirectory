import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../models/contact.model';
import { ContactCardComponent } from '../contact-card/contact-card.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ContactCardComponent],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Kişiler</h2>
        <input 
          type="text" 
          class="form-control search-input" 
          placeholder="Kişi, telefon, şirket..." 
          [(ngModel)]="searchTerm"
          (input)="onSearch()"
          style="max-width: 300px;" />
      </div>
      <div *ngIf="filteredContacts.length === 0" class="text-center mt-4">
        <div class="card p-4">
          <p>Kayıtlı kişi bulunamadı.</p>
        </div>
      </div>
      <div class="d-flex flex-wrap gap-3">
        <app-contact-card 
          *ngFor="let contact of filteredContacts"
          [contact]="contact"
          (toggleFavorite)="onToggleFavorite(contact)"
          (deleteContact)="onDeleteContact(contact)"></app-contact-card>
      </div>
    </div>
  `
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  searchTerm = '';

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.contactService.getAllContacts().subscribe(contacts => {
      this.contacts = contacts;
      this.filteredContacts = contacts;
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredContacts = this.contacts;
      return;
    }
    this.filteredContacts = this.contacts.filter(contact =>
      contact.firstName.toLowerCase().includes(term) ||
      contact.lastName.toLowerCase().includes(term) ||
      contact.phoneNumber.includes(term) ||
      (contact.email && contact.email.toLowerCase().includes(term)) ||
      (contact.company && contact.company.toLowerCase().includes(term))
    );
  }

  onToggleFavorite(contact: Contact): void {
    if (contact.id != null) {
      this.contactService.toggleFavorite(contact.id, !contact.isFavorite).subscribe(() => {
        this.loadContacts();
      });
    }
  }

  onDeleteContact(contact: Contact): void {
    if (contact.id != null) {
      this.contactService.deleteContact(contact.id).subscribe(() => {
        this.loadContacts();
      });
    }
  }
}
