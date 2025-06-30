import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-contact-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
            {{ contact.isFavorite ? '⭐' : '☆' }}
          </button>
        </div>
      </div>
      
      <div class="contact-details" *ngIf="showDetails">
        <div class="detail-item" *ngIf="contact.email">
          <span class="detail-icon">📧</span>
          <span class="detail-text">{{ contact.email }}</span>
        </div>
        <div class="detail-item" *ngIf="contact.address">
          <span class="detail-icon">📍</span>
          <span class="detail-text">{{ contact.address }}</span>
        </div>
        <div class="detail-item" *ngIf="contact.notes">
          <span class="detail-icon">📝</span>
          <span class="detail-text">{{ contact.notes }}</span>
        </div>
      </div>
      
      <div class="contact-footer">
        <button class="btn btn-sm btn-secondary" (click)="toggleDetails()">
          {{ showDetails ? 'Gizle' : 'Detaylar' }}
        </button>
        <div class="footer-actions">
          <a [href]="'tel:' + contact.phoneNumber" class="action-btn call-btn" title="Ara">
            📞
          </a>
          <a [href]="'mailto:' + contact.email" class="action-btn email-btn" title="E-posta gönder" *ngIf="contact.email">
            ✉️
          </a>
          <button 
            class="action-btn edit-btn" 
            [routerLink]="['/edit-contact', contact.id]"
            title="Düzenle">
            ✏️
          </button>
          <button 
            class="action-btn delete-btn" 
            (click)="onDelete()"
            title="Sil">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      overflow: hidden;
      border: 2px solid transparent;
    }

    .contact-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }

    .contact-card.favorite {
      border-color: #ffd700;
      background: linear-gradient(145deg, #fffbf0 0%, #ffffff 100%);
    }

    .contact-header {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      gap: 1rem;
    }

    .contact-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .contact-info {
      flex: 1;
      min-width: 0;
    }

    .contact-name {
      margin: 0 0 0.25rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    .contact-phone {
      margin: 0 0 0.25rem 0;
      color: #667eea;
      font-weight: 500;
    }

    .contact-company {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .contact-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .favorite-btn {
      font-size: 1.5rem;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0.25rem;
      border-radius: 50%;
    }

    .favorite-btn:hover {
      transform: scale(1.2);
    }

    .favorite-btn.active {
      color: #ffd700;
      animation: bounce 0.6s ease;
    }

    @keyframes bounce {
      0%, 20%, 60%, 100% { transform: translateY(0) scale(1.2); }
      40% { transform: translateY(-10px) scale(1.3); }
      80% { transform: translateY(-5px) scale(1.25); }
    }

    .contact-details {
      padding: 0 1.5rem 1rem;
      border-top: 1px solid #f0f0f0;
      margin-top: 1rem;
      padding-top: 1rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-icon {
      font-size: 1.1rem;
      width: 1.5rem;
      text-align: center;
    }

    .detail-text {
      flex: 1;
      word-break: break-word;
    }

    .contact-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .footer-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      background: none;
      border: 2px solid transparent;
      padding: 0.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.5rem;
      height: 2.5rem;
    }

    .call-btn:hover {
      background: #28a745;
      color: white;
      transform: scale(1.1);
    }

    .email-btn:hover {
      background: #17a2b8;
      color: white;
      transform: scale(1.1);
    }

    .edit-btn:hover {
      background: #ffc107;
      color: white;
      transform: scale(1.1);
    }

    .delete-btn:hover {
      background: #dc3545;
      color: white;
      transform: scale(1.1);
    }

    @media (max-width: 768px) {
      .contact-header {
        padding: 1rem;
      }

      .contact-avatar {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
      }

      .contact-name {
        font-size: 1.1rem;
      }

      .contact-details {
        padding: 0 1rem 1rem;
      }

      .contact-footer {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
      }

      .footer-actions {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ContactCardComponent {
  @Input() contact!: Contact;
  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() deleteContact = new EventEmitter<number>();

  showDetails = false;

  getInitials(firstName: string | undefined, lastName: string | undefined): string {
    const f = (firstName && firstName.length > 0) ? firstName.charAt(0) : '';
    const l = (lastName && lastName.length > 0) ? lastName.charAt(0) : '';
    return (f + l).toUpperCase() || '?';
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  onToggleFavorite(): void {
    if (this.contact.id) {
      this.toggleFavorite.emit(this.contact.id);
    }
  }

  onDelete(): void {
    if (this.contact.id && confirm(`${this.contact.firstName} ${this.contact.lastName} kişisini silmek istediğinizden emin misiniz?`)) {
      this.deleteContact.emit(this.contact.id);
    }
  }
}
