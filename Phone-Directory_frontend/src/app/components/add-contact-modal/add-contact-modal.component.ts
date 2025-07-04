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
    <!-- Kişi Ekleme Modal -->
    <div class="modal fade" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'" 
         tabindex="-1" *ngIf="showModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Kişi Düzenle' : 'Yeni Kişi Ekle' }}</h5>
            <button type="button" class="btn-close" (click)="onClose()"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="onSubmit()" #contactForm="ngForm">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ad *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.firstName" 
                         name="firstName" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Soyad *</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.lastName" 
                         name="lastName" required>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Telefon *</label>
                  <input type="tel" class="form-control" [(ngModel)]="formData.phoneNumber" 
                         name="phoneNumber" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">E-posta</label>
                  <input type="email" class="form-control" [(ngModel)]="formData.email" 
                         name="email">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Adres</label>
                <input type="text" class="form-control" [(ngModel)]="formData.address" 
                       name="address">
              </div>
              <div class="mb-3">
                <label class="form-label">Şirket</label>
                <input type="text" class="form-control" [(ngModel)]="formData.company" 
                       name="company">
              </div>
              <div class="mb-3">
                <label class="form-label">Notlar</label>
                <textarea class="form-control" [(ngModel)]="formData.notes" 
                          name="notes" rows="3"></textarea>
              </div>
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" [(ngModel)]="formData.isFavorite" 
                       name="isFavorite" id="favoriteCheck">
                <label class="form-check-label" for="favoriteCheck">
                  Favorilere ekle
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onClose()">İptal</button>
            <button type="button" class="btn btn-primary" (click)="onSubmit()" 
                    [disabled]="!isFormValid()">
              Kaydet
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
