// components/contact-list/contact-list.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact';
import { Contact } from '../../app/models/contact';

@Component({
  standalone: true,
  selector: 'app-contact-list',
  templateUrl: './contact-list.html',
  styleUrls: ['./contact-list.scss'],
  imports: [CommonModule, FormsModule]
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Modal properties
  showEditModal: boolean = false;
  editingContact: any = {};
  isUpdating: boolean = false;
  updateSuccessMessage: string = '';
  updateErrorMessage: string = '';

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    console.log('ContactListComponent ngOnInit - API\'den veri çekiliyor...');
    this.loadContacts();
  }

  loadContacts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.contactService.getContacts().subscribe({
      next: (data) => {
        console.log('API\'den başarıyla veri alındı:', data);
        console.log('İlk kişi detay:', data[0] ? data[0] : 'Veri yok');
        
        // Gelen verinin yapısını kontrol et
        if (data && data.length > 0) {
          const firstContact = data[0];
          console.log('İlk kişinin özellikleri:', Object.keys(firstContact));
          console.log('Name alanı:', firstContact.name);
          console.log('Phone alanı:', firstContact.phone);
          console.log('Email alanı:', firstContact.email);
          console.log('ID alanı:', firstContact.id);
        }
        
        this.contacts = data || [];
        this.isLoading = false;
        
        if (this.contacts.length === 0) {
          console.log('API\'den boş liste döndü');
        }
      },
      error: (error) => {
        console.error('API Hatası:', error);
        this.isLoading = false;
        this.errorMessage = `Backend API'ye bağlanılamıyor: ${error.message || error}`;
        
        // Detaylı hata bilgisi
        if (error.status === 0) {
          this.errorMessage = 'Backend sunucusu çalışmıyor veya CORS hatası var';
        } else if (error.status === 404) {
          this.errorMessage = 'API endpoint bulunamadı (404)';
        } else if (error.status >= 500) {
          this.errorMessage = 'Backend sunucu hatası';
        }
      }
    });
  }

  deleteContact(id: number | undefined): void {
    if (!id) {
      console.error('Geçersiz ID');
      return;
    }
    
    if (confirm('Bu kişiyi silmek istediğinize emin misiniz?')) {
      this.contactService.deleteContact(id).subscribe({
        next: () => {
          // Silme işlemi başarılı olduğunda listeyi güncelle
          this.contacts = this.contacts.filter(contact => contact.id !== id);
          console.log('Kişi başarıyla silindi');
        },
        error: (error) => {
          console.error('Kişi silinirken hata oluştu:', error);
          alert('Kişi silinirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      });
    }
  }

  trackByContactId(index: number, contact: Contact): number {
    return contact.id || index;
  }

  getContactName(contact: any): string {
    // Ad ve soyad'ı birleştir
    if (contact.ad || contact.soyad) {
      const ad = contact.ad || '';
      const soyad = contact.soyad || '';
      return `${ad} ${soyad}`.trim();
    }
    return contact.name || contact.Ad || contact.isim || contact.Isim || 'İsim Bulunamadı';
  }

  getContactPhone(contact: any): string {
    return contact.phone || contact.telefon || contact.Telefon || contact.phoneNumber || contact.TelefonNumarasi || 'Telefon Bulunamadı';
  }

  getContactEmail(contact: any): string {
    return contact.email || contact.Email || contact.emailAddress || contact.EmailAdres || 'Email Bulunamadı';
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  // Modal metodları
  openEditModal(contact: any): void {
    console.log('Düzenlenecek kişi:', contact);
    // Backend'den gelen field adlarını kullan
    this.editingContact = { 
      id: contact.id,
      ad: contact.ad || contact.name,
      soyad: contact.soyad || '',
      telefon: contact.telefon || contact.phone,
      email: contact.email
    };
    this.showEditModal = true;
    this.updateSuccessMessage = '';
    this.updateErrorMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingContact = {};
    this.updateSuccessMessage = '';
    this.updateErrorMessage = '';
  }

  updateContact(): void {
    if (!this.editingContact.id) {
      this.updateErrorMessage = 'Geçersiz kişi ID\'si';
      return;
    }

    this.isUpdating = true;
    this.updateSuccessMessage = '';
    this.updateErrorMessage = '';

    console.log('Güncellenen kişi verisi:', this.editingContact);

    this.contactService.updateContact(this.editingContact).subscribe({
      next: () => {
        console.log('Kişi başarıyla güncellendi');
        this.updateSuccessMessage = 'Kişi başarıyla güncellendi!';
        this.isUpdating = false;
        
        // Listeyi güncelle
        const index = this.contacts.findIndex(c => c.id === this.editingContact.id);
        if (index !== -1) {
          this.contacts[index] = { ...this.editingContact };
        }
        
        // Modal'ı kapat
        setTimeout(() => {
          this.closeEditModal();
        }, 1500);
      },
      error: (error) => {
        console.error('Kişi güncellenirken hata oluştu:', error);
        this.updateErrorMessage = 'Kişi güncellenirken hata oluştu!';
        this.isUpdating = false;
      }
    });
  }
}
