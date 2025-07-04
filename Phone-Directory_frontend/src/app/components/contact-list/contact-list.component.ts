import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service';
import { Contact, ContactFormData } from '../../models/contact.model';
import { ContactCardComponent } from '../contact-card/contact-card.component';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { ContactFilterComponent } from '../contact-filter/contact-filter.component';
import { ContactFilter, ApiResponseHandler, FormValidator } from '../../utils';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, ContactCardComponent, AddContactModalComponent, ContactFilterComponent],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Kişiler</h2>
        <div class="d-flex gap-2 align-items-center">
          <button class="nav-style-btn primary-btn" (click)="openAddModal()">
            Kişi Ekle
          </button>
          <app-contact-filter
            [searchTerm]="searchTerm"
            [showOnlyFavorites]="showOnlyFavorites"
            [hasActiveFilters]="hasActiveFilters()"
            [filterInfo]="getFilterInfo()"
            (searchTermChange)="onSearchTermChange($event)"
            (toggleFavorites)="toggleFavoriteFilter()"
            (clearFilters)="clearFilters()">
          </app-contact-filter>
        </div>
      </div>

      <div *ngIf="filteredContacts.length === 0" class="text-center mt-4">
        <div class="card p-4">
          <span *ngIf="!showOnlyFavorites && !searchTerm">Kayıtlı kişi bulunamadı.</span>
          <span *ngIf="showOnlyFavorites && !searchTerm">Henüz favori kişi bulunmuyor.</span>
          <span *ngIf="searchTerm">"{{ searchTerm }}" aramasına uygun kişi bulunamadı.</span>
        </div>
      </div>
      
      <div class="d-flex flex-wrap gap-3">
        <app-contact-card 
          *ngFor="let contact of filteredContacts"
          [contact]="contact"
          (toggleFavorite)="onToggleFavorite(contact)"
          (editContact)="onEditContact(contact)"
          (deleteContact)="onDeleteContact(contact)">
        </app-contact-card>
      </div>
    </div>

    <app-add-contact-modal
      [showModal]="showModal"
      [editMode]="editMode"
      [editingContact]="editingContact"
      (closeModal)="closeModal()"
      (submitForm)="onSubmitForm($event)">
    </app-add-contact-modal>
  `,
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  searchTerm = '';
  showModal = false;
  showOnlyFavorites = false;
  editingContact: Contact | null = null;
  editMode = false;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  // 🔧 Helper Methods - Yardımcı Metodlar

  /**
   * Hata mesajını kullanıcıya gösterir
   */
  private showError(operation: string, error: any): void {
    const errorMessage = ApiResponseHandler.handleApiError(error, operation);
    alert(`${operation} hata oluştu: ${errorMessage}`);
  }

  // 🚀 Main Component Methods - Ana Component Metodları

  openAddModal(): void {
    this.editMode = false;
    this.editingContact = null;
    this.showModal = true;
  }

  onEditContact(contact: Contact): void {
    console.log(`Düzenleme modalı açılıyor: ${contact.firstName} ${contact.lastName}`);
    this.editMode = true;
    this.editingContact = contact;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editMode = false;
    this.editingContact = null;
  }

  onSubmitForm(formData: ContactFormData): void {
    if (!FormValidator.isFormReady(formData)) {
      return;
    }

    if (this.editMode && this.editingContact) {
      // Düzenleme modu
      console.log('Kişi güncelleniyor:', formData);
      this.contactService.updateContact(this.editingContact.id!, formData).subscribe({
        next: (updatedContact) => {
          console.log('Kişi başarıyla güncellendi:', updatedContact);
          this.loadContacts();
          this.closeModal();
        },
        error: (error) => this.showError('Kişi güncellenirken', error)
      });
    } else {
      // Ekleme modu
      console.log('Yeni kişi ekleniyor:', formData);
      this.contactService.addContact(formData).subscribe({
        next: (newContact) => {
          console.log('Kişi başarıyla eklendi:', newContact);
          this.loadContacts();
          this.closeModal();
        },
        error: (error) => this.showError('Kişi eklenirken', error)
      });
    }
  }

  loadContacts(): void {
    console.log('Kişiler yeniden yükleniyor...');
    this.contactService.getAllContacts().subscribe({
      next: (contacts) => {
        this.contacts = contacts;
        this.applyFilters();
        console.log(`${contacts.length} kişi yüklendi`);
      },
      error: (error) => {
        console.error('Kişiler yüklenirken hata:', error);
      }
    });
  }

  toggleFavoriteFilter(): void {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    console.log(`Favori filtresi: ${this.showOnlyFavorites ? 'Açık' : 'Kapalı'}`);
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.showOnlyFavorites = false;
    console.log('Tüm filtreler temizlendi');
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredContacts = ContactFilter.applyAllFilters(
      this.contacts, 
      this.searchTerm, 
      this.showOnlyFavorites
    );
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return ContactFilter.hasActiveFilters(this.searchTerm, this.showOnlyFavorites);
  }

  getFilterInfo(): string {
    return ContactFilter.getFilterInfo(this.searchTerm, this.showOnlyFavorites, this.filteredContacts.length);
  }

  onToggleFavorite(contact: Contact): void {
    if (contact.id == null) return;

    console.log(`${contact.firstName} ${contact.lastName} favori durumu değiştiriliyor: ${contact.isFavorite} → ${!contact.isFavorite}`);
    
    this.contactService.toggleFavorite(contact.id, !contact.isFavorite).subscribe({
      next: (updatedContact) => {
        console.log(`Favori durumu güncellendi:`, updatedContact);
        this.loadContacts(); // Listeyi yenile
      },
      error: (error) => this.showError('Favori durumu güncellenirken', error)
    });
  }

  onDeleteContact(contact: Contact): void {
    if (contact.id == null) return;

    console.log(`${contact.firstName} ${contact.lastName} kişisi siliniyor...`);
    
    this.contactService.deleteContact(contact.id).subscribe({
      next: () => {
        console.log(`Kişi silindi: ${contact.firstName} ${contact.lastName}`);
        this.loadContacts(); // Listeyi yenile
      },
      error: (error) => this.showError('Kişi silinirken', error)
    });
  }
}
