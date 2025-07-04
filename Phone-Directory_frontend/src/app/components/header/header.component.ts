import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <h1 class="logo-text">
              Telefon Rehberi
            </h1>
          </div>
          <nav class="nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
              Ana Sayfa
            </a>
            <a routerLink="/contacts" routerLinkActive="active" class="nav-link">
              Kişiler
            </a>
            <app-theme-toggle></app-theme-toggle>
          </nav>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, var(--header-bg) 0%, #34495e 100%);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 25px var(--shadow-color);
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 2px solid var(--accent-primary);
      transition: all 0.3s ease;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
    }

    .logo-text {
      color: var(--accent-primary);
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      font-family: 'Georgia', 'Times New Roman', serif;
      letter-spacing: 1px;
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
      color: var(--nav-text);
      font-weight: 500;
      border-radius: 6px;
      transition: all 0.3s ease;
      background: transparent;
      border: 1px solid transparent;
      font-family: 'Georgia', 'Times New Roman', serif;
      letter-spacing: 0.5px;
    }

    .nav-link:hover {
      color: var(--accent-primary);
      background: rgba(212, 175, 55, 0.1);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      border-color: rgba(212, 175, 55, 0.3);
    }

    .nav-link.active {
      color: var(--header-bg);
      background: var(--accent-primary);
      box-shadow: 0 3px 12px rgba(212, 175, 55, 0.4);
      border-color: var(--accent-secondary);
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
        grid-template-columns: 1fr 1fr 1fr;
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
