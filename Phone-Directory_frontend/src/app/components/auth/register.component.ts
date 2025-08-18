import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Kayıt Ol</h2>
          <p>Yeni hesap oluşturun</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Ad</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                [(ngModel)]="userData.firstName"
                class="form-control"
              />
            </div>

            <div class="form-group">
              <label for="lastName">Soyad</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                [(ngModel)]="userData.lastName"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="username">Kullanıcı Adı *</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="userData.username"
              required
              class="form-control"
              [class.error]="registerForm.submitted && !userData.username"
            />
            <div class="error-message" *ngIf="registerForm.submitted && !userData.username">
              Kullanıcı adı zorunludur
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="userData.email"
              required
              email
              class="form-control"
              [class.error]="registerForm.submitted && (!userData.email || !isValidEmail(userData.email))"
            />
            <div class="error-message" *ngIf="registerForm.submitted && !userData.email">
              Email zorunludur
            </div>
            <div class="error-message" *ngIf="registerForm.submitted && userData.email && !isValidEmail(userData.email)">
              Geçerli bir email adresi giriniz
            </div>
          </div>

          <div class="form-group">
            <label for="password">Şifre *</label>
            <div class="password-input-container">
              <input
                [type]="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                [(ngModel)]="userData.password"
                required
                minlength="6"
                class="form-control"
                [class.error]="registerForm.submitted && (!userData.password || userData.password.length < 6)"
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
            <div class="error-message" *ngIf="registerForm.submitted && !userData.password">
              Şifre zorunludur
            </div>
            <div class="error-message" *ngIf="registerForm.submitted && userData.password && userData.password.length < 6">
              Şifre en az 6 karakter olmalıdır
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Şifre Tekrar *</label>
            <div class="password-input-container">
              <input
                [type]="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                name="confirmPassword"
                [(ngModel)]="userData.confirmPassword"
                required
                class="form-control"
                [class.error]="registerForm.submitted && (!userData.confirmPassword || userData.password !== userData.confirmPassword)"
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
            <div class="error-message" *ngIf="registerForm.submitted && !userData.confirmPassword">
              Şifre tekrarı zorunludur
            </div>
            <div class="error-message" *ngIf="registerForm.submitted && userData.confirmPassword && userData.password !== userData.confirmPassword">
              Şifreler eşleşmiyor
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="isLoading || successMessage"
          >
            <span *ngIf="isLoading">Kayıt yapılıyor...</span>
            <span *ngIf="!isLoading && !successMessage">Kayıt Ol</span>
            <span *ngIf="successMessage">Kayıt Tamamlandı</span>
          </button>
        </form>

        <div class="auth-footer">
          <p *ngIf="!successMessage">Zaten hesabınız var mı? <a (click)="goToLogin()" class="link">Giriş yap</a></p>
          <p *ngIf="successMessage">
            Email doğrulama için emailinizi kontrol edin. 
            <a (click)="goToLogin()" class="link">Giriş sayfasına git</a>
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
      max-width: 450px;
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .success-message {
      color: var(--success-color);
      background: rgba(76, 175, 80, 0.1);
      border: 1px solid var(--success-color);
      border-radius: 6px;
      padding: 0.75rem;
      font-size: 0.9rem;
      text-align: center;
      margin-top: 0.5rem;
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

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .auth-footer p {
      color: var(--text-secondary);
      margin: 0;
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
  `]
})
export class RegisterComponent {
  userData: RegisterRequest = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  };
  
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Gönderilen veri:', this.userData);

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        console.log('Başarılı yanıt:', response);
        this.isLoading = false;
        if (response.success) {
          // Backend'den gelen mesajı göster (email doğrulama bilgisi içeriyor)
          this.successMessage = response.message;
          this.errorMessage = '';
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        console.error('Hata detayı:', error);
        this.isLoading = false;
        if (error.error && error.error.errors) {
          // Model validation hatalarını göster
          const validationErrors = Object.values(error.error.errors).flat();
          this.errorMessage = validationErrors.join(', ');
        } else {
          this.errorMessage = error.error?.message || 'Kayıt olurken bir hata oluştu';
        }
      }
    });
  }

  private isFormValid(): boolean {
    return !!(
      this.userData.username &&
      this.userData.email &&
      this.isValidEmail(this.userData.email) &&
      this.userData.password &&
      this.userData.password.length >= 6 &&
      this.userData.confirmPassword &&
      this.userData.password === this.userData.confirmPassword
    );
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
