import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactFormData, Contact } from '../../models/contact.model';
import { FormValidator } from '../../utils';

@Component({
  selector: 'app-add-contact-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Kişi Ekleme/Düzenleme Modal -->
    <div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" 
         tabindex="-1" *ngIf="showModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content contact-details-style">
          <div class="details-header">
            <h4 class="details-title">
              <svg class="details-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ editMode ? 'Kişi Düzenle' : 'Yeni Kişi Ekle' }}
            </h4>
            <button type="button" class="btn-close" (click)="onClose()"></button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="onSubmit()" #contactForm="ngForm">
              <!-- Temel Bilgiler Bölümü -->
              <div class="detail-section">
                <h5 class="section-title">Temel Bilgiler</h5>
                <div class="detail-item form-item">
                  <label class="detail-label">Ad *</label>
                  <input type="text" class="form-control detail-input" [(ngModel)]="formData.firstName" 
                         name="firstName" required>
                </div>
                <div class="detail-item form-item">
                  <label class="detail-label">Soyad *</label>
                  <input type="text" class="form-control detail-input" [(ngModel)]="formData.lastName" 
                         name="lastName" required>
                </div>
                <div class="detail-item form-item">
                  <label class="detail-label">Telefon *</label>
                  <input type="tel" class="form-control detail-input" [(ngModel)]="formData.phoneNumber" 
                         name="phoneNumber" required>
                </div>
                <div class="detail-item form-item">
                  <label class="detail-label">E-posta</label>
                  <input type="email" class="form-control detail-input" [(ngModel)]="formData.email" 
                         name="email">
                </div>
              </div>

              <!-- İletişim Bilgileri Bölümü -->
              <div class="detail-section">
                <h5 class="section-title">İletişim Bilgileri</h5>
                <div class="detail-item form-item">
                  <label class="detail-label">Şirket</label>
                  <input type="text" class="form-control detail-input" [(ngModel)]="formData.company" 
                         name="company">
                </div>
                <div class="detail-item form-item">
                  <label class="detail-label">Adres</label>
                  <input type="text" class="form-control detail-input" [(ngModel)]="formData.address" 
                         name="address">
                </div>
              </div>

              <!-- Ek Bilgiler Bölümü -->
              <div class="detail-section">
                <h5 class="section-title">Ek Bilgiler</h5>
                <div class="detail-item form-item">
                  <label class="detail-label">Notlar</label>
                  <textarea class="form-control detail-input" [(ngModel)]="formData.notes" 
                            name="notes" rows="3"></textarea>
                </div>
                <div class="detail-item form-item checkbox-item">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" [(ngModel)]="formData.isFavorite" 
                           name="isFavorite" id="favoriteCheck">
                    <label class="form-check-label detail-label" for="favoriteCheck">
                      Favorilere ekle
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="action-btn cancel-btn" (click)="onClose()">İptal</button>
            <button type="button" class="action-btn save-btn" (click)="onSubmit()" 
                    [disabled]="!isFormValid()">
              {{ editMode ? 'Güncelle' : 'Kaydet' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal backdrop -->
    <div class="modal-backdrop fade" [class.show]="showModal" *ngIf="showModal" 
         (click)="onClose()"></div>
  `,
  styleUrls: ['./add-contact-modal.component.scss']
})
export class AddContactModalComponent implements OnChanges {
  @Input() showModal = false;
  @Input() editMode = false;
  @Input() editingContact: Contact | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<ContactFormData>();

  formData: ContactFormData = FormValidator.getDefaultFormData();

  ngOnChanges(): void {
    if (this.editMode && this.editingContact) {
      // Düzenleme modunda mevcut kişi verilerini form'a yükle
      this.formData = {
        firstName: this.editingContact.firstName,
        lastName: this.editingContact.lastName,
        phoneNumber: this.editingContact.phoneNumber,
        email: this.editingContact.email || '',
        address: this.editingContact.address || '',
        company: this.editingContact.company || '',
        notes: this.editingContact.notes || '',
        isFavorite: this.editingContact.isFavorite || false
      };
    } else {
      this.resetForm();
    }
  }

  onClose(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  onSubmit(): void {
    if (this.isFormValid()) {
      this.submitForm.emit({ ...this.formData });
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.formData = FormValidator.getDefaultFormData();
  }

  isFormValid(): boolean {
    return FormValidator.isFormReady(this.formData);
  }
}
