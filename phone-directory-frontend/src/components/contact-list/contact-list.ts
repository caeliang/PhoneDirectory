// components/contact-list/contact-list.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact';
import { Contact } from '../../app/models/contact';

@Component({
  standalone: true,
  selector: 'app-contact-list',
  templateUrl: './contact-list.html',
  styleUrls: ['./contact-list.scss'],
  imports: [CommonModule],
  styles: [`
    .list-container {
      max-width: 900px;
      margin: 40px auto;
      position: relative;
    }
    
    .list-header {
      text-align: center;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 30px;
      color: white;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .status-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      margin: 20px 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .loading-card {
      background: linear-gradient(135deg, #74b9ff, #0984e3);
      color: white;
    }
    
    .error-card {
      background: linear-gradient(135deg, #ff7675, #d63031);
      color: white;
    }
    
    .empty-card {
      background: linear-gradient(135deg, #fd79a8, #e84393);
      color: white;
    }
    
    .contacts-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .contacts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }
    
    .contact-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }
    
    .contact-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }
    
    .contact-avatar {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .avatar-text {
      font-size: 20px;
      color: white;
      font-weight: bold;
    }
    
    .contact-info {
      flex: 1;
    }
    
    .contact-name {
      font-size: 18px;
      font-weight: 700;
      color: #2d3436;
      margin: 0 0 10px 0;
    }
    
    .contact-details {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .contact-detail {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #636e72;
    }
    
    .detail-label {
      font-size: 12px;
      font-weight: bold;
      color: #74b9ff;
      min-width: 40px;
    }
    
    .detail-text {
      font-weight: 500;
    }
    
    .contact-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .action-btn {
      width: 80px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .edit-btn {
      background: linear-gradient(135deg, #fdcb6e, #e17055);
      color: white;
      box-shadow: 0 4px 15px rgba(253, 203, 110, 0.3);
    }
    
    .edit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(253, 203, 110, 0.4);
    }
    
    .delete-btn {
      background: linear-gradient(135deg, #ff7675, #d63031);
      color: white;
      box-shadow: 0 4px 15px rgba(255, 118, 117, 0.3);
    }
    
    .delete-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 118, 117, 0.4);
    }
    
    .contacts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    }
    
    .contact-count {
      font-size: 18px;
      color: #667eea;
      font-weight: 600;
    }
    
    .refresh-btn-small {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    
    .refresh-btn-small:hover {
      transform: translateY(-2px) rotate(180deg);
    }
    
    .status-btn {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .status-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-2px);
    }
    
    .loading-bar {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 20px;
    }
    
    .loading-progress {
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 2px;
      animation: loading 2s ease-in-out infinite;
    }
    
    @keyframes loading {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0%); }
      100% { transform: translateX(100%); }
    }
  `]
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

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
}
