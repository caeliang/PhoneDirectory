import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ResetPasswordRequest } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Şifre Sıfırla</h2>
          <p>Yeni şifrenizi belirleyin</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" #resetPasswordForm="ngForm" class="auth-form" *ngIf="!resetSuccessful">
          <div class="form-group">
            <label for="newPassword">Yeni Şifre</label>
            <div class="password-input-container">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="newPassword"
                name="newPassword"
                [(ngModel)]="resetPasswordData.newPassword"
                required
                minlength="6"
                class="form-control"
                [class.error]="resetPasswordForm.submitted && (!resetPasswordData.newPassword || resetPasswordData.newPassword.length < 6)"
              />
              <button
                type="button"
                class="password-toggle-btn"
                (click)="togglePasswordVisibility()"
                [attr.aria-label]="showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'"
              >
                <span class="password-toggle-icon">{{ showPassword ? '🙈' : '👁️' }}</span>
              </button>
            </div>
            <div class="error-message" *ngIf="resetPasswordForm.submitted && !resetPasswordData.newPassword">
              Yeni şifre zorunludur
            </div>
            <div class="error-message" *ngIf="resetPasswordForm.submitted && resetPasswordData.newPassword && resetPasswordData.newPassword.length < 6">
              Şifre en az 6 karakter olmalıdır
            </div>
          </div>

          <div class="form-group">
            <label for="confirmNewPassword">Yeni Şifre Tekrar</label>
            <div class="password-input-container">
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                id="confirmNewPassword"
                name="confirmNewPassword"
                [(ngModel)]="resetPasswordData.confirmNewPassword"
                required
                class="form-control"
                [class.error]="resetPasswordForm.submitted && (!resetPasswordData.confirmNewPassword || resetPasswordData.newPassword !== resetPasswordData.confirmNewPassword)"
              />
              <button
                type="button"
                class="password-toggle-btn"
                (click)="toggleConfirmPasswordVisibility()"
                [attr.aria-label]="showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'"
              >
                <span class="password-toggle-icon">{{ showConfirmPassword ? '🙈' : '👁️' }}</span>
              </button>
            </div>
            <div class="error-message" *ngIf="resetPasswordForm.submitted && !resetPasswordData.confirmNewPassword">
              Şifre tekrarı zorunludur
            </div>
            <div class="error-message" *ngIf="resetPasswordForm.submitted && resetPasswordData.confirmNewPassword && resetPasswordData.newPassword !== resetPasswordData.confirmNewPassword">
              Şifreler eşleşmiyor
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="isLoading || !isTokenValid"
          >
            <span *ngIf="isLoading">Şifre sıfırlanıyor...</span>
            <span *ngIf="!isLoading">Şifreyi Sıfırla</span>
          </button>

          <div class="warning-message" *ngIf="!isTokenValid">
            Bu bağlantının süresi dolmuş veya geçersiz. Yeni bir şifre sıfırlama talebinde bulunun.
          </div>
        </form>

        <div class="success-container" *ngIf="resetSuccessful">
          <div class="success-icon">🎉</div>
          <h3>Şifre Başarıyla Sıfırlandı!</h3>
          <p>
            Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
          </p>
        </div>

        <div class="auth-footer">
          <p><a (click)="goToLogin()" class="link">Giriş sayfasına git</a></p>
          <p *ngIf="!isTokenValid">
            <a (click)="goToForgotPassword()" class="link">Yeni şifre sıfırlama talebinde bulun</a>
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

    .warning-message {
      color: var(--warning-color);
      font-size: 0.85rem;
      margin-top: 0.25rem;
      text-align: center;
      padding: 0.75rem;
      background-color: var(--warning-bg);
      border-radius: 6px;
      border: 1px solid var(--warning-border);
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

    .password-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-toggle-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .password-toggle-btn:hover {
      background-color: var(--border-color);
    }

    .password-toggle-icon {
      font-size: 16px;
      user-select: none;
    }

    .password-input-container .form-control {
      padding-right: 40px;
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
export class ResetPasswordComponent implements OnInit {
  resetPasswordData: ResetPasswordRequest = {
    email: '',
    token: '',
    newPassword: '',
    confirmNewPassword: ''
  };
  
  isLoading = false;
  errorMessage = '';
  resetSuccessful = false;
  showPassword = false;
  showConfirmPassword = false;
  isTokenValid = true;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // URL parametrelerinden email ve token'ı al
    this.route.queryParams.subscribe(params => {
      this.resetPasswordData.email = params['email'] || '';
      this.resetPasswordData.token = params['token'] || '';
      
      // Token boşsa geçersiz say
      if (!this.resetPasswordData.token || !this.resetPasswordData.email) {
        this.isTokenValid = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (!this.isFormValid() || !this.isTokenValid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword(this.resetPasswordData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.resetSuccessful = true;
        } else {
          this.errorMessage = response.message;
          if (response.message.includes('Token geçersiz') || response.message.includes('süresi dolmuş')) {
            this.isTokenValid = false;
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Şifre sıfırlanırken bir hata oluştu';
        if (this.errorMessage.includes('Token geçersiz') || this.errorMessage.includes('süresi dolmuş')) {
          this.isTokenValid = false;
        }
      }
    });
  }

  private isFormValid(): boolean {
    return !!(
      this.resetPasswordData.newPassword &&
      this.resetPasswordData.newPassword.length >= 6 &&
      this.resetPasswordData.confirmNewPassword &&
      this.resetPasswordData.newPassword === this.resetPasswordData.confirmNewPassword
    );
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
