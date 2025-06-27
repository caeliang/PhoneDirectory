// components/contact-form/contact-form.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../app/models/contact';
import { ContactService } from '../../services/contact';

@Component({
  standalone: true,
  selector: 'app-contact-form',
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.scss'],
  imports: [CommonModule, FormsModule]
})
export class ContactFormComponent {
  contact: Contact = { name: '', phone: '', email: '', soyad: '' };
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private contactService: ContactService) {}

  onSubmit(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.contact.id || this.contact.id === 0) {
      console.log('Gönderilen kişi verisi:', this.contact);
      this.contactService.createContact(this.contact).subscribe({
        next: (response) => {
          console.log('Backend yanıtı:', response);
          this.successMessage = 'Kişi başarıyla eklendi!';
          this.isLoading = false;
          this.resetForm();
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          console.error('Kişi ekleme hatası - Full error object:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error body:', error.error);
          
          if (error.status === 400) {
            this.errorMessage = 'Geçersiz veri! Lütfen tüm alanları doğru doldurun.';
          } else if (error.status === 0) {
            this.errorMessage = 'Sunucuya bağlanılamıyor! Backend çalışıyor mu?';
          } else if (error.status === 500) {
            this.errorMessage = 'Sunucu hatası! Lütfen daha sonra tekrar deneyin.';
          } else {
            this.errorMessage = `Kişi eklenirken hata oluştu! (${error.status}: ${error.message})`;
          }
          this.isLoading = false;
        }
      });
    } else {
      this.contactService.updateContact(this.contact).subscribe({
        next: () => {
          this.successMessage = 'Kişi başarıyla güncellendi!';
          this.isLoading = false;
          this.resetForm();
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          this.errorMessage = 'Kişi güncellenirken hata oluştu!';
          this.isLoading = false;
          console.error('Update error:', error);
        }
      });
    }
  }

  clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  resetForm(): void {
    this.contact = { name: '', phone: '', email: '', soyad: '' };
  }
}
