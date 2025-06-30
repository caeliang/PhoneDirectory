import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <h1 class="logo-text">
              <span class="logo-icon">📞</span>
              Telefon Rehberi
            </h1>
          </div>
          <nav class="nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
              <span class="nav-icon">🏠</span>
              Ana Sayfa
            </a>
            <a routerLink="/contacts" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">👥</span>
              Kişiler
            </a>
            <a routerLink="/favorites" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">⭐</span>
              Favoriler
            </a>
            <a routerLink="/add-contact" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">➕</span>
              Kişi Ekle
            </a>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
    }

    .logo-text {
      color: #667eea;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      font-size: 2rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .nav {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      text-decoration: none;
      color: #666;
      font-weight: 500;
      border-radius: 25px;
      transition: all 0.3s ease;
      background: transparent;
      border: 2px solid transparent;
    }

    .nav-link:hover {
      color: #667eea;
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .nav-link.active {
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
      }

      .nav {
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
      }

      .nav-link {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
      }

      .logo-text {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .nav {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        width: 100%;
      }

      .nav-link {
        justify-content: center;
        text-align: center;
      }
    }
  `]
})
export class HeaderComponent { }
