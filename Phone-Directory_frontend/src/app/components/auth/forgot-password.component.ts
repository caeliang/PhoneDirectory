import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ForgotPasswordRequest } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Şifremi Unuttum</h2>
          <p>Email adresinizi girin, şifre sıfırlama bağlantısı gönderelim</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" #forgotPasswordForm="ngForm" class="auth-form" *ngIf="!submitted">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="forgotPasswordData.email"
              required
              email
              class="form-control"
              [class.error]="forgotPasswordForm.submitted && (!forgotPasswordData.email || !isValidEmail(forgotPasswordData.email))"
            />
            <div class="error-message" *ngIf="forgotPasswordForm.submitted && !forgotPasswordData.email">
              Email zorunludur
            </div>
            <div class="error-message" *ngIf="forgotPasswordForm.submitted && forgotPasswordData.email && !isValidEmail(forgotPasswordData.email)">
              Geçerli bir email adresi giriniz
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="isLoading"
          >
            <span *ngIf="isLoading">Gönderiliyor...</span>
            <span *ngIf="!isLoading">Şifre Sıfırlama Bağlantısı Gönder</span>
          </button>
        </form>

        <div class="success-container" *ngIf="submitted">
          <div class="success-icon">✉️</div>
          <h3>Email Gönderildi!</h3>
          <p>
            Eğer <strong>{{ forgotPasswordData.email }}</strong> adresi kayıtlı ise, 
            şifre sıfırlama bağlantısı içeren bir email gönderildi.
          </p>
          <p class="info-text">
            Email gelmedi mi? Spam klasörünü kontrol edin veya birkaç dakika bekleyin.
          </p>
        </div>

        <div class="auth-footer">
          <p><a (click)="goToLogin()" class="link">Giriş sayfasına dön</a></p>
          <p *ngIf="submitted">
            <a (click)="tryAgain()" class="link">Tekrar dene</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 80px);
      padding: 2rem;
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
    }

    .auth-card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: var(--shadow-card);
      width: 100%;
      max-width: 400px;
      border: 1px solid var(--border-color);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h2 {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .auth-header p {
      color: var(--text-secondary);
      margin: 0;
      font-size: 0.9rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.9rem;
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 1rem;
      background: var(--input-bg);
      color: var(--text-primary);
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--accent-primary);
    }

    .form-control.error {
      border-color: var(--error-color);
    }

    .error-message {
      color: var(--error-color);
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px var(--shadow-color);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success-container {
      text-align: center;
      padding: 1rem 0;
    }

    .success-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .success-container h3 {
      color: var(--text-primary);
      margin-bottom: 1rem;
      font-size: 1.4rem;
    }

    .success-container p {
      color: var(--text-secondary);
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .info-text {
      font-size: 0.85rem;
      color: var(--text-tertiary);
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .auth-footer p {
      color: var(--text-secondary);
      margin: 0.5rem 0;
    }

    .link {
      color: var(--accent-primary);
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordData: ForgotPasswordRequest = {
    email: ''
  };
  
  isLoading = false;
  errorMessage = '';
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.forgotPasswordData.email || !this.isValidEmail(this.forgotPasswordData.email)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.forgotPasswordData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.submitted = true;
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Bir hata oluştu';
      }
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  tryAgain(): void {
    this.submitted = false;
    this.forgotPasswordData.email = '';
    this.errorMessage = '';
  }
}
