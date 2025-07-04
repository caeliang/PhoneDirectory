import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-contact-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contact-card" [class.favorite]="contact.isFavorite">
      <div class="contact-header">
        <div class="contact-avatar">
          {{ getInitials(contact.firstName, contact.lastName) }}
        </div>
        <div class="contact-info">
          <h3 class="contact-name">{{ contact.firstName }} {{ contact.lastName }}</h3>
          <p class="contact-phone">{{ contact.phoneNumber }}</p>
          <p class="contact-company" *ngIf="contact.company">{{ contact.company }}</p>
        </div>
        <div class="contact-actions">
          <button 
            class="action-btn favorite-btn" 
            [class.active]="contact.isFavorite"
            (click)="onToggleFavorite()"
            title="{{ contact.isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle' }}">
            <svg class="bookmark-svg" width="16" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" 
                    [attr.fill]="contact.isFavorite ? 'currentColor' : 'none'" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="contact-details" *ngIf="showDetails">
        <div class="details-header">
          <h4 class="details-title">
            <svg class="details-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" stroke-width="2"/>
              <polyline points="13,2 13,9 20,9" stroke="currentColor" stroke-width="2"/>
            </svg>
            Kişi Detayları
          </h4>
        </div>
        
        <div class="detail-section">
          <h5 class="section-title">Temel Bilgiler</h5>
          <div class="detail-item">
            <span class="detail-label">Ad Soyad:</span>
            <span class="detail-text">{{ contact.firstName }} {{ contact.lastName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Telefon:</span>
            <span class="detail-text">{{ contact.phoneNumber }}</span>
          </div>
          <div class="detail-item" *ngIf="contact.email">
            <span class="detail-label">E-posta:</span>
            <span class="detail-text">{{ contact.email }}</span>
          </div>
        </div>

        <div class="detail-section" *ngIf="contact.address || contact.company">
          <h5 class="section-title">İletişim Bilgileri</h5>
          <div class="detail-item" *ngIf="contact.company">
            <span class="detail-label">Şirket:</span>
            <span class="detail-text">{{ contact.company }}</span>
          </div>
          <div class="detail-item" *ngIf="contact.address">
            <span class="detail-label">Adres:</span>
            <span class="detail-text">{{ contact.address }}</span>
          </div>
        </div>

        <div class="detail-section" *ngIf="contact.notes || contact.isFavorite">
          <h5 class="section-title">Ek Bilgiler</h5>
          <div class="detail-item">
            <span class="detail-label">Favori Durumu:</span>
            <span class="detail-text" [class.favorite-status]="contact.isFavorite">
              {{ contact.isFavorite ? 'Favorilerde' : 'Favorilerde değil' }}
            </span>
          </div>
          <div class="detail-item" *ngIf="contact.notes">
            <span class="detail-label">Notlar:</span>
            <span class="detail-text">{{ contact.notes }}</span>
          </div>
        </div>

        <div class="detail-section" *ngIf="contact.createdAt || contact.updatedAt">
          <h5 class="section-title">Zaman Bilgileri</h5>
          <div class="detail-item" *ngIf="contact.createdAt">
            <span class="detail-label">Oluşturulma:</span>
            <span class="detail-text">{{ formatDate(contact.createdAt) }}</span>
          </div>
          <div class="detail-item" *ngIf="contact.updatedAt">
            <span class="detail-label">Son Güncelleme:</span>
            <span class="detail-text">{{ formatDate(contact.updatedAt) }}</span>
          </div>
        </div>
      </div>
      
      <div class="contact-footer">
        <div class="footer-actions">
          <button class="action-btn details-btn" (click)="toggleDetails()">
            {{ showDetails ? 'Gizle' : 'Detaylar' }}
          </button>
          <a [href]="'tel:' + contact.phoneNumber" class="action-btn call-btn" title="Ara">
            Ara
          </a>
          <a [href]="'mailto:' + contact.email" class="action-btn email-btn" title="E-posta gönder" *ngIf="contact.email">
            E-posta
          </a>
          <button 
            class="action-btn edit-btn" 
            (click)="onEdit()"
            title="Düzenle">
            Düzenle
          </button>
          <button 
            class="action-btn delete-btn" 
            (click)="onDelete()"
            title="Sil">
            Sil
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./contact-card.component.scss']
})
export class ContactCardComponent {
  @Input() contact!: Contact;
  @Output() toggleFavorite = new EventEmitter<void>();
  @Output() deleteContact = new EventEmitter<void>();
  @Output() editContact = new EventEmitter<void>();

  showDetails = false;

  getInitials(firstName: string | undefined, lastName: string | undefined): string {
    const f = (firstName && firstName.length > 0) ? firstName.charAt(0) : '';
    const l = (lastName && lastName.length > 0) ? lastName.charAt(0) : '';
    return (f + l).toUpperCase() || '?';
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Belirtilmemiş';
    
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onToggleFavorite(): void {
    console.log(`Kart favori butonuna tıklandı: ${this.contact.firstName} ${this.contact.lastName} - Mevcut durum: ${this.contact.isFavorite}`);
    this.toggleFavorite.emit();
  }

  onEdit(): void {
    console.log(`Kart düzenleme butonuna tıklandı: ${this.contact.firstName} ${this.contact.lastName}`);
    this.editContact.emit();
  }

  onDelete(): void {
    if (this.contact.id && confirm(`${this.contact.firstName} ${this.contact.lastName} kişisini silmek istediğinizden emin misiniz?`)) {
      console.log(`Kart silme butonuna tıklandı: ${this.contact.firstName} ${this.contact.lastName}`);
      this.deleteContact.emit();
    }
  }
}
