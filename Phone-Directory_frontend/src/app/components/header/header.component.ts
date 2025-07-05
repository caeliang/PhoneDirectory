import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

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
            <a routerLink="/contacts" routerLinkActive="active" class="nav-link" *ngIf="isLoggedIn">
              Kişiler
            </a>
            <div class="auth-buttons" *ngIf="!isLoggedIn">
              <a routerLink="/login" routerLinkActive="active" class="nav-link login-btn">
                Giriş
              </a>
              <a routerLink="/register" routerLinkActive="active" class="nav-link register-btn">
                Kayıt Ol
              </a>
            </div>
            <div class="user-menu" *ngIf="isLoggedIn">
              <span class="user-greeting">{{getTimeBasedGreeting()}}, {{currentUser?.username}}!</span>
              <button class="nav-link logout-btn" (click)="logout()">
                Çıkış
              </button>
            </div>
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

    .auth-buttons {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .user-menu {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .user-greeting {
      color: var(--accent-primary);
      font-weight: 500;
      font-size: 0.9rem;
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
      cursor: pointer;
    }

    .login-btn {
      background: rgba(212, 175, 55, 0.1);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    .register-btn {
      background: var(--accent-primary);
      color: var(--header-bg);
      border-color: var(--accent-primary);
    }

    .logout-btn {
      background: rgba(231, 76, 60, 0.1);
      border-color: #e74c3c;
      color: #e74c3c;
    }

    .nav-link:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .nav-link:not(.login-btn):not(.register-btn):not(.logout-btn):hover {
      color: var(--accent-primary);
      background: rgba(212, 175, 55, 0.1);
      border-color: rgba(212, 175, 55, 0.3);
    }

    .login-btn:hover {
      background: rgba(212, 175, 55, 0.2);
      border-color: var(--accent-secondary);
    }

    .register-btn:hover {
      background: var(--accent-secondary);
    }

    .logout-btn:hover {
      background: rgba(231, 76, 60, 0.2);
      border-color: #c0392b;
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
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        this.currentUser = user;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    // Güvenlik için önce local verileri temizle
    this.authService.clearAuthData();
    
    // Sonra backend'e logout isteği gönder (başarısız olsa bile kullanıcı zaten çıkış yapmış olacak)
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Logout error (but user is already logged out locally):', error);
      }
    });
    
    this.router.navigate(['/login']);
  }

  getTimeBasedGreeting(): string {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 6 && currentHour < 12) {
      return 'Günaydın';
    } else if (currentHour >= 12 && currentHour < 17) {
      return 'İyi günler';
    } else if (currentHour >= 17 && currentHour < 21) {
      return 'İyi akşamlar';
    } else {
      return 'İyi geceler';
    }
  }
}
