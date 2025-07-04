import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Contact, ContactFormData } from '../../models/contact.model';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="card p-4" autocomplete="off">
      <h2 class="mb-3">{{ isEditMode ? 'Kişiyi Düzenle' : 'Yeni Kişi Ekle' }}</h2>
      <div class="form-group">
        <label class="form-label">Ad</label>
        <input class="form-control" [value]="formData.firstName" (input)="updateField('firstName', $event)" name="firstName" required />
      </div>
      <div class="form-group">
        <label class="form-label">Soyad</label>
        <input class="form-control" [value]="formData.lastName" (input)="updateField('lastName', $event)" name="lastName" required />
      </div>
      <div class="form-group">
        <label class="form-label">Telefon</label>
        <input class="form-control" [value]="formData.phoneNumber" (input)="updateField('phoneNumber', $event)" name="phoneNumber" required />
      </div>
      <div class="form-group">
        <label class="form-label">E-posta</label>
        <input class="form-control" [value]="formData.email" (input)="updateField('email', $event)" name="email" type="email" />
      </div>
      <div class="form-group">
        <label class="form-label">Adres</label>
        <input class="form-control" [value]="formData.address" (input)="updateField('address', $event)" name="address" />
      </div>
      <div class="form-group">
        <label class="form-label">Şirket</label>
        <input class="form-control" [value]="formData.company" (input)="updateField('company', $event)" name="company" />
      </div>
      <div class="form-group">
        <label class="form-label">Notlar</label>
        <textarea class="form-control" [value]="formData.notes" (input)="updateField('notes', $event)" name="notes"></textarea>
      </div>
      <div class="form-group d-flex align-items-center gap-2">
        <input type="checkbox" [checked]="formData.isFavorite" (change)="updateCheckbox('isFavorite', $event)" name="isFavorite" id="isFavorite" />
        <label for="isFavorite" class="form-label mb-0">Favori</label>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-primary" type="submit">Kaydet</button>
        <button class="btn btn-secondary" type="button" (click)="onCancel.emit()">İptal</button>
      </div>
    </form>
  `
})
export class ContactFormComponent implements OnInit {
  @Input() contact: Contact | null = null;
  @Output() save = new EventEmitter<ContactFormData>();
  @Output() onCancel = new EventEmitter<void>();

  formData: ContactFormData = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    company: '',
    notes: '',
    isFavorite: false
  };

  isEditMode = false;
  private contactId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.contactId = +id;
        this.contactService.getContactById(this.contactId).subscribe(contact => {
          this.formData = {
            firstName: contact.firstName,
            lastName: contact.lastName,
            phoneNumber: contact.phoneNumber,
            email: contact.email || '',
            address: contact.address || '',
            company: contact.company || '',
            notes: contact.notes || '',
            isFavorite: !!contact.isFavorite
          };
        });
      } else if (this.contact) {
        this.isEditMode = true;
        this.formData = {
          firstName: this.contact.firstName,
          lastName: this.contact.lastName,
          phoneNumber: this.contact.phoneNumber,
          email: this.contact.email || '',
          address: this.contact.address || '',
          company: this.contact.company || '',
          notes: this.contact.notes || '',
          isFavorite: !!this.contact.isFavorite
        };
      }
    });
  }

  updateField(field: keyof ContactFormData, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    (this.formData as any)[field] = target.value;
  }

  updateCheckbox(field: keyof ContactFormData, event: Event): void {
    const target = event.target as HTMLInputElement;
    (this.formData as any)[field] = target.checked;
  }

  onSubmit(): void {
    if (this.isEditMode && this.contactId != null) {
      this.contactService.updateContact(this.contactId, this.formData).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Update failed:', error);
          alert('Kişi güncellenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        }
      });
    } else {
      this.contactService.addContact(this.formData).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Add failed:', error);
          alert('Kişi eklenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
        }
      });
    }
  }
}
