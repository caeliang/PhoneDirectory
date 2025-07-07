import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService, PagedResult } from '../../services/contact.service';
import { Contact, ContactFormData } from '../../models/contact.model';
import { ContactCardComponent } from '../contact-card/contact-card.component';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';
import { ContactFilterComponent } from '../contact-filter/contact-filter.component';
import { ContactGridComponent } from '../contact-grid/contact-grid.component';
import { ContactFilter, ApiResponseHandler, FormValidator } from '../../utils';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule, ContactCardComponent, AddContactModalComponent, ContactFilterComponent, ContactGridComponent],
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

      <!-- View Toggle Buttons -->
      <div class="view-toggle-section mb-3">
        <div class="d-flex justify-content-end gap-3">
          <button 
            type="button"
            class="btn view-toggle-btn"
            [class.btn-primary]="viewMode === 'card'"
            [class.btn-outline-primary]="viewMode !== 'card'"
            (click)="setViewMode('card')">
            <i class="fas fa-th-large"></i> Kartlar
          </button>
          
          <button 
            type="button"
            class="btn view-toggle-btn"
            [class.btn-primary]="viewMode === 'grid'"
            [class.btn-outline-primary]="viewMode !== 'grid'"
            (click)="setViewMode('grid')">
            <i class="fas fa-table"></i> Tablo
          </button>
        </div>
      </div>

      <div *ngIf="filteredContacts.length === 0" class="text-center mt-4">
        <div class="card p-4">
          <span *ngIf="!showOnlyFavorites && !searchTerm">Kayıtlı kişi bulunamadı.</span>
          <span *ngIf="showOnlyFavorites && !searchTerm">Henüz favori kişi bulunmuyor.</span>
          <span *ngIf="searchTerm">"{{ searchTerm }}" aramasına uygun kişi bulunamadı.</span>
        </div>
      </div>
      
      <!-- Card View -->
      <div *ngIf="viewMode === 'card'" class="d-flex flex-wrap gap-3">
        <app-contact-card 
          *ngFor="let contact of filteredContacts"
          [contact]="contact"
          (toggleFavorite)="onToggleFavorite(contact)"
          (editContact)="onEditContact(contact)"
          (deleteContact)="onDeleteContact(contact)">
        </app-contact-card>
      </div>

      <!-- Grid View -->
      <div *ngIf="viewMode === 'grid'">
        <app-contact-grid
          [contacts]="filteredContacts"
          [currentPage]="currentPage"
          [totalCount]="totalCount"
          [pageSize]="pageSize"
          [isLoading]="isLoading"
          (editContact)="onEditContact($event)"
          (deleteContact)="onDeleteContact($event)"
          (toggleFavorite)="onToggleFavorite($event)"
          (pageChange)="goToPage($event)">
        </app-contact-grid>
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
  viewMode: 'card' | 'grid' = 'card';

  // Pagination properties
  currentPage = 1;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;
  isLoading = false;

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

  setViewMode(mode: 'card' | 'grid'): void {
    this.viewMode = mode;
  }

  openAddModal(): void {
    this.editMode = false;
    this.editingContact = null;
    this.showModal = true;
  }

  onEditContact(contact: Contact): void {
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
      this.contactService.updateContact(this.editingContact.id!, formData).subscribe({
        next: (updatedContact) => {
          this.loadContacts();
          this.closeModal();
        },
        error: (error) => this.showError('Kişi güncellenirken', error)
      });
    } else {
      // Ekleme modu
      this.contactService.addContact(formData).subscribe({
        next: (newContact) => {
          this.loadContacts();
          this.closeModal();
        },
        error: (error) => this.showError('Kişi eklenirken', error)
      });
    }
  }

  loadContacts(): void {
    this.isLoading = true;
    const searchTerm = this.showOnlyFavorites ? undefined : this.searchTerm; // We'll handle favorites client-side for now
    
    this.contactService.getPagedContacts(this.currentPage, this.pageSize, searchTerm).subscribe({
      next: (pagedResult: PagedResult<Contact>) => {
        this.contacts = pagedResult.items;
        this.totalCount = pagedResult.totalCount;
        this.totalPages = pagedResult.totalPages || Math.ceil(this.totalCount / this.pageSize);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Kişiler yüklenirken hata:', error);
        this.isLoading = false;
      }
    });
  }

  toggleFavoriteFilter(): void {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    this.currentPage = 1; // Reset to first page when filtering
    this.loadContacts(); // Reload with server-side pagination
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.showOnlyFavorites = false;
    this.currentPage = 1; // Reset to first page
    this.loadContacts(); // Reload with server-side pagination
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadContacts();
    }
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadContacts();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadContacts();
    }
  }

  applyFilters(): void {
    // For server-side pagination, only apply client-side favorite filter
    // Search is handled on server-side
    if (this.showOnlyFavorites) {
      this.filteredContacts = this.contacts.filter(contact => contact.isFavorite);
    } else {
      this.filteredContacts = [...this.contacts];
    }
  }

  onSearchTermChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.currentPage = 1; // Reset to first page when searching
    this.loadContacts(); // Reload with server-side pagination
  }

  hasActiveFilters(): boolean {
    return ContactFilter.hasActiveFilters(this.searchTerm, this.showOnlyFavorites);
  }

  getFilterInfo(): string {
    return ContactFilter.getFilterInfo(this.searchTerm, this.showOnlyFavorites, this.filteredContacts.length);
  }

  onToggleFavorite(contact: Contact): void {
    if (contact.id == null) return;
    
    this.contactService.toggleFavorite(contact.id, !contact.isFavorite).subscribe({
      next: (updatedContact) => {
        this.loadContacts(); // Listeyi yenile
      },
      error: (error) => this.showError('Favori durumu güncellenirken', error)
    });
  }

  onDeleteContact(contact: Contact): void {
    if (contact.id == null) return;
    
    this.contactService.deleteContact(contact.id).subscribe({
      next: () => {
        this.loadContacts(); // Listeyi yenile
      },
      error: (error) => this.showError('Kişi silinirken', error)
    });
  }
}
