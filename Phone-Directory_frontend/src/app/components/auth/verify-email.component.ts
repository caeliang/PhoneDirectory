import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, VerifyEmailRequest, ResendEmailVerificationRequest } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Email Doğrulama</h2>
        </div>
        
        <div class="verification-content">
          <div *ngIf="isVerifying" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Email adresiniz doğrulanıyor...</p>
          </div>

          <div *ngIf="verificationSuccessful" class="success-container">
            <div class="success-icon">✅</div>
            <h3>Email Başarıyla Doğrulandı!</h3>
            <p>
              Email adresiniz başarıyla doğrulandı. Artık hesabınızı kullanabilirsiniz.
            </p>
          </div>

          <div *ngIf="verificationFailed" class="error-container">
            <div class="error-icon">❌</div>
            <h3>Doğrulama Başarısız</h3>
            <p>{{ errorMessage }}</p>
            <div class="resend-section">
              <p>Yeni bir doğrulama emaili göndermek ister misiniz?</p>
              <button 
                class="btn btn-secondary"
                (click)="resendVerification()"
                [disabled]="isResending"
              >
                <span *ngIf="isResending">Gönderiliyor...</span>
                <span *ngIf="!isResending">Yeni Email Gönder</span>
              </button>
              <div class="success-message" *ngIf="resendSuccessful">
                Yeni doğrulama emaili gönderildi!
              </div>
            </div>
          </div>

          <div *ngIf="invalidLink" class="error-container">
            <div class="error-icon">⚠️</div>
            <h3>Geçersiz Bağlantı</h3>
            <p>Bu doğrulama bağlantısı geçersiz veya eksik parametreler içeriyor.</p>
          </div>
        </div>

        <div class="auth-footer">
          <p><a (click)="goToLogin()" class="link">Giriş sayfasına git</a></p>
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

    .verification-content {
      text-align: center;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--border-color);
      border-top: 4px solid var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .success-container, .error-container {
      padding: 1rem 0;
    }

    .success-icon, .error-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .success-container h3, .error-container h3 {
      color: var(--text-primary);
      margin-bottom: 1rem;
      font-size: 1.4rem;
    }

    .success-container p, .error-container p {
      color: var(--text-secondary);
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .resend-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .resend-section p {
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }

    .btn-secondary {
      background: var(--button-secondary-bg);
      color: var(--button-secondary-text);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover:not(:disabled) {
      background: var(--button-secondary-hover-bg);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .success-message {
      color: var(--success-color);
      font-size: 0.85rem;
      margin-top: 1rem;
      padding: 0.5rem;
      background-color: var(--success-bg);
      border-radius: 4px;
      border: 1px solid var(--success-border);
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
  `]
})
export class VerifyEmailComponent implements OnInit {
  isVerifying = true;
  verificationSuccessful = false;
  verificationFailed = false;
  invalidLink = false;
  isResending = false;
  resendSuccessful = false;
  errorMessage = '';
  email = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // URL parametrelerinden email ve token'ı al
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      const token = params['token'];
      
      if (!email || !token) {
        this.isVerifying = false;
        this.invalidLink = true;
        return;
      }

      this.email = email;
      this.verifyEmail(email, token);
    });
  }

  private verifyEmail(email: string, token: string): void {
    const verifyEmailRequest: VerifyEmailRequest = {
      email: email,
      token: token
    };

    this.authService.verifyEmail(verifyEmailRequest).subscribe({
      next: (response) => {
        this.isVerifying = false;
        if (response.success) {
          this.verificationSuccessful = true;
        } else {
          this.verificationFailed = true;
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isVerifying = false;
        this.verificationFailed = true;
        this.errorMessage = error.error?.message || 'Email doğrulanırken bir hata oluştu';
      }
    });
  }

  resendVerification(): void {
    if (!this.email) {
      return;
    }

    this.isResending = true;
    this.resendSuccessful = false;

    const resendRequest: ResendEmailVerificationRequest = {
      email: this.email
    };

    this.authService.resendEmailVerification(resendRequest).subscribe({
      next: (response) => {
        this.isResending = false;
        if (response.success) {
          this.resendSuccessful = true;
        }
      },
      error: (error) => {
        this.isResending = false;
        console.error('Resend verification error:', error);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
