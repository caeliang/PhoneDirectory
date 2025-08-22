using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.API.DTOs;
using PhoneDirectory.API.Services;
using AutoMapper;
using PhoneDirectory.Core.Entities;
using System.Security.Claims;

namespace PhoneDirectory.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly ILoggingService _logger;

        public AuthController(IAuthService authService, UserManager<ApplicationUser> userManager, IMapper mapper, ILoggingService logger)
        {
            _authService = authService;
            _userManager = userManager;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                await _logger.LogInfoAsync($"Register attempt for username: {registerDto.Username}, email: {registerDto.Email}");
                
                if (!ModelState.IsValid)
                {
                    var validationErrors = ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .SelectMany(x => x.Value!.Errors.Select(e => e.ErrorMessage))
                        .ToList();
                    
                    await _logger.LogWarningAsync($"Register failed - Invalid model state for username: {registerDto.Username}. Errors: {string.Join(", ", validationErrors)}");
                    
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", validationErrors)
                    });
                }

                var (user, errors) = await _authService.RegisterAsync(
                    registerDto.Username,
                    registerDto.Email,
                    registerDto.Password,
                    registerDto.FirstName,
                    registerDto.LastName
                );

                if (user == null)
                {
                    await _logger.LogWarningAsync($"Register failed for username: {registerDto.Username}, errors: {string.Join(", ", errors)}");
                    return BadRequest(new AuthResponseDto
                    {
                        Success = false,
                        Message = errors.Length > 0 ? string.Join(", ", errors) : "Kayıt işlemi başarısız."
                    });
                }

                await _logger.LogInfoAsync($"User registered successfully: {user.UserName} (ID: {user.Id})");
                
                // Email verification token kayıt sırasında RegisterAsync içinde otomatik olarak gönderiliyor,
                // burada tekrar göndermek iki token oluşmasına ve ilk doğrulama linkinin çalışmamasına neden oluyor
                
                // Development ve Production için farklı mesajlar
                var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                var message = "Kayıt başarılı! Email adresinize gönderilen doğrulama bağlantısını kullanarak hesabınızı aktifleştirin. Email doğrulaması yapılmadan giriş yapamazsınız.";
                
                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = message
                });
            }
            catch (Exception ex)
            {
                await _logger.LogErrorAsync($"Register failed with exception for username: {registerDto.Username}. Error: {ex.Message}");
                
                // Veritabanı bağlantı hatası için özel mesaj
                if (ex.Message.Contains("not currently available") || ex.Message.Contains("transient failure"))
                {
                    return StatusCode(503, new AuthResponseDto
                    {
                        Success = false,
                        Message = "Veritabanı geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin."
                    });
                }
                
                return StatusCode(500, new AuthResponseDto
                {
                    Success = false,
                    Message = "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            await _logger.LogInfoAsync($"Login attempt for username: {loginDto.Username}");
            
            if (!ModelState.IsValid)
            {
                await _logger.LogWarningAsync($"Login failed - Invalid model state for username: {loginDto.Username}");
                return BadRequest(ModelState);
            }

            var user = await _authService.LoginAsync(loginDto.Username, loginDto.Password);

            if (user == null)
            {
                // Kullanıcıyı kontrol et - email doğrulama durumu için
                var existingUser = await _userManager.FindByNameAsync(loginDto.Username);
                if (existingUser != null)
                {
                    var isValidPassword = await _userManager.CheckPasswordAsync(existingUser, loginDto.Password);
                    
                    if (isValidPassword && (!existingUser.EmailConfirmed || !existingUser.IsEmailVerified))
                    {
                        await _logger.LogWarningAsync($"Login failed - Email not verified for username: {loginDto.Username}");
                        return Unauthorized(new AuthResponseDto
                        {
                            Success = false,
                            Message = "Email adresinizi doğrulamanız gerekiyor. Lütfen emailinizi kontrol edin ve doğrulama linkine tıklayın."
                        });
                    }
                    
                    if (isValidPassword && await _userManager.IsLockedOutAsync(existingUser))
                    {
                        await _logger.LogWarningAsync($"Login failed - Account locked for username: {loginDto.Username}");
                        return Unauthorized(new AuthResponseDto
                        {
                            Success = false,
                            Message = "Hesabınız kilitli. Email doğrulaması yaparak hesabınızı aktifleştirin."
                        });
                    }
                }
                
                await _logger.LogWarningAsync($"Login failed - Invalid credentials for username: {loginDto.Username}");
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Kullanıcı adı veya şifre hatalı."
                });
            }

            var token = await _authService.GenerateJwtTokenAsync(user);
            var userDto = _mapper.Map<UserDto>(user);

            await _logger.LogInfoAsync($"User logged in successfully: {user.UserName} (ID: {user.Id})");
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Giriş başarılı.",
                Token = token,
                User = userDto
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // Token varsa kullanıcı bilgilerini al, yoksa anonymous logout
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";
            
            await _logger.LogInfoAsync($"User logged out: {username} (ID: {userId ?? "N/A"})");
            
            // JWT ile logout işlemi client-side'da token'ı silmekle olur
            // Server-side'da token blacklist'i implement edilebilir
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Çıkış başarılı."
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            
            if (user == null)
                return NotFound();

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            await _logger.LogInfoAsync($"Forgot password request for email: {forgotPasswordDto.Email}");
            
            if (!ModelState.IsValid)
            {
                await _logger.LogWarningAsync($"Forgot password failed - Invalid model state for email: {forgotPasswordDto.Email}");
                return BadRequest(ModelState);
            }

            var (success, token) = await _authService.GeneratePasswordResetTokenAsync(forgotPasswordDto.Email);

            if (success)
            {
                await _logger.LogInfoAsync($"Password reset token generated for email: {forgotPasswordDto.Email}");
                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Şifre sıfırlama bağlantısı email adresinize gönderildi."
                });
            }

            await _logger.LogWarningAsync($"Forgot password failed for email: {forgotPasswordDto.Email}");
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = "Bu email adresi ile kayıtlı kullanıcı bulunamadı."
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            await _logger.LogInfoAsync($"Reset password attempt for email: {resetPasswordDto.Email}");
            
            if (!ModelState.IsValid)
            {
                await _logger.LogWarningAsync($"Reset password failed - Invalid model state for email: {resetPasswordDto.Email}");
                return BadRequest(ModelState);
            }

            var success = await _authService.ResetPasswordAsync(resetPasswordDto.Email, resetPasswordDto.Token, resetPasswordDto.NewPassword);

            if (success)
            {
                await _logger.LogInfoAsync($"Password reset successful for email: {resetPasswordDto.Email}");
                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Şifreniz başarıyla değiştirildi. Giriş sayfasına yönlendiriliyorsunuz."
                });
            }

            await _logger.LogWarningAsync($"Reset password failed for email: {resetPasswordDto.Email}");
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = "Şifre sıfırlama başarısız. Token geçersiz veya süresi dolmuş olabilir."
            });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
        {
            await _logger.LogInfoAsync($"Email verification attempt for email: {verifyEmailDto.Email}");
            
            if (!ModelState.IsValid)
            {
                await _logger.LogWarningAsync($"Email verification failed - Invalid model state for email: {verifyEmailDto.Email}");
                return BadRequest(ModelState);
            }

            var success = await _authService.VerifyEmailAsync(verifyEmailDto.Email, verifyEmailDto.Token);

            if (success)
            {
                await _logger.LogInfoAsync($"Email verification successful for email: {verifyEmailDto.Email}");
                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Email adresiniz başarıyla doğrulandı."
                });
            }

            await _logger.LogWarningAsync($"Email verification failed for email: {verifyEmailDto.Email}");
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = "Email doğrulama başarısız. Token geçersiz veya süresi dolmuş olabilir."
            });
        }

        [HttpPost("resend-email-verification")]
        public async Task<IActionResult> ResendEmailVerification([FromBody] ResendEmailVerificationDto resendDto)
        {
            await _logger.LogInfoAsync($"Resend email verification request for email: {resendDto.Email}");
            
            if (!ModelState.IsValid)
            {
                await _logger.LogWarningAsync($"Resend email verification failed - Invalid model state for email: {resendDto.Email}");
                return BadRequest(ModelState);
            }

            var success = await _authService.ResendEmailVerificationAsync(resendDto.Email);

            if (success)
            {
                await _logger.LogInfoAsync($"Email verification resent for email: {resendDto.Email}");
                return Ok(new AuthResponseDto
                {
                    Success = true,
                    Message = "Doğrulama emaili tekrar gönderildi."
                });
            }

            await _logger.LogWarningAsync($"Resend email verification failed for email: {resendDto.Email}");
            return BadRequest(new AuthResponseDto
            {
                Success = false,
                Message = "Email gönderme başarısız."
            });
        }

        // Development için test endpoint'i - Üretimde kaldırıldı
        // Bu endpoint, üretimde güvenlik açığı oluşturabileceği için kaldırıldı

        // Debug endpoint - Sadece geliştirme ortamında kullanılmalıdır
        [HttpGet("debug/user-status/{email}")]
        public async Task<IActionResult> GetUserDebugStatus(string email)
        {
            // Sadece development ortamında çalışsın
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development")
            {
                return NotFound();
            }
            
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return NotFound(new { message = "Kullanıcı bulunamadı" });
            }

            return Ok(new
            {
                Email = user.Email,
                Username = user.UserName,
                EmailConfirmed = user.EmailConfirmed,
                IsEmailVerified = user.IsEmailVerified,
                EmailVerificationToken = user.EmailVerificationToken != null ? "[HIDDEN]" : null,
                EmailVerificationTokenExpires = user.EmailVerificationTokenExpires,
                CreatedAt = user.CreatedAt
            });
        }
    }
}
