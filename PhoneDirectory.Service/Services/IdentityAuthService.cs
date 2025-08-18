using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PhoneDirectory.Service.Services
{
    public class IdentityAuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public IdentityAuthService(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<(ApplicationUser? user, string[] errors)> RegisterAsync(string username, string email, string password, string? firstName = null, string? lastName = null)
        {
            try
            {
                var user = new ApplicationUser
                {
                    UserName = username,
                    Email = email,
                    FirstName = firstName,
                    LastName = lastName,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsEmailVerified = false, // Email verification gerekli
                    EmailConfirmed = false, // Identity field
                    LockoutEnabled = true, // Hesap kilitli
                    LockoutEnd = DateTimeOffset.MaxValue // Email doğrulanana kadar kilitli kalacak
                };

                var result = await _userManager.CreateAsync(user, password);
                
                if (result.Succeeded)
                {
                    // Kullanıcı oluşturma başarılı olduğunda doğrulama e-postası göndermeyi dene
                    try
                    {
                        // Generate verification token işlemi RegisterAsync'in dışında yapılıyor
                        // Kontrolü burada yaparak e-posta gönderildiğinden emin olalım
                        var (verificationSuccess, _) = await GenerateEmailVerificationTokenAsync(email);
                        
                        if (!verificationSuccess)
                        {
                            // Email doğrulama token'ı oluşturulamadı veya gönderilemedi
                            // Bu durumda kullanıcı hesabı oluşturuldu ama email doğrulama yapılamayacak
                            // Log ekleme veya kullanıcıyı bilgilendirme işlemi yapılabilir
                        }
                    }
                    catch (Exception)
                    {
                        // Email doğrulama hatası oluştu, ancak kullanıcı kaydı başarılı olduğu için
                        // bu hatayı yutarak işleme devam ediyoruz
                        // İlerleyen aşamalarda kullanıcı "ResendEmailVerification" endpointi ile
                        // yeniden doğrulama emaili talep edebilir
                    }
                    
                    return (user, Array.Empty<string>());
                }

                var errors = result.Errors.Select(e => e.Description).ToArray();
                return (null, errors);
            }
            catch (Exception ex)
            {
                // Detaylı hata mesajını loglayalım (geçici olarak)
                var detailedError = $"Exception: {ex.Message}. Inner Exception: {ex.InnerException?.Message}. Stack Trace: {ex.StackTrace}";
                
                // Veritabanı bağlantı hatası için özel mesaj
                if (ex.Message.Contains("not currently available") || ex.Message.Contains("transient failure"))
                {
                    return (null, new[] { "Veritabanı geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin." });
                }
                
                // Geçici olarak detaylı hata mesajını döndür
                return (null, new[] { $"Kayıt işlemi sırasında teknik bir hata oluştu: {ex.Message}" });
            }
        }

        public async Task<ApplicationUser?> LoginAsync(string username, string password)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
                return null;

            var isValidPassword = await _userManager.CheckPasswordAsync(user, password);
            
            if (isValidPassword)
            {
                // Email doğrulama kontrolü - hem Development hem Production için zorunlu 
                if (!user.EmailConfirmed || !user.IsEmailVerified)
                {
                    // Email doğrulanmamış kullanıcı girişini reddet
                    return null; // Email doğrulanmamış - giriş reddedildi
                }
                
                // Hesap kilitli mi kontrol et
                if (await _userManager.IsLockedOutAsync(user))
                {
                    return null; // Hesap kilitli - giriş reddedildi
                }
                
                return user;
            }

            return null;
        }

        public async Task<string> GenerateJwtTokenAsync(ApplicationUser user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? "YourDefaultSecretKeyForDevelopment123456789";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName ?? ""),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim("FirstName", user.FirstName ?? ""),
                new Claim("LastName", user.LastName ?? "")
            };

            // Kullanıcının rollerini ekle
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"] ?? "PhoneDirectoryApp",
                audience: jwtSettings["Audience"] ?? "PhoneDirectoryUsers",
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = jwtSettings["SecretKey"] ?? "YourDefaultSecretKeyForDevelopment123456789";
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

                var tokenHandler = new JwtSecurityTokenHandler();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"] ?? "PhoneDirectoryApp",
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"] ?? "PhoneDirectoryUsers",
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                // Await işlemi ekleyerek metodu gerçekten asenkron yapalım
                return await Task.Run(() => {
                    var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                    return true;
                });
            }
            catch
            {
                return false;
            }
        }

        public string HashPassword(string password)
        {
            // Identity kendi password hasher'ını kullanır
            var hasher = new PasswordHasher<ApplicationUser>();
            return hasher.HashPassword(new ApplicationUser(), password);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            var hasher = new PasswordHasher<ApplicationUser>();
            var result = hasher.VerifyHashedPassword(new ApplicationUser(), hashedPassword, password);
            return result == PasswordVerificationResult.Success;
        }

        public async Task<IdentityResult> ChangePasswordAsync(ApplicationUser user, string currentPassword, string newPassword)
        {
            return await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        }

        public async Task<ApplicationUser?> GetUserByIdAsync(string userId)
        {
            return await _userManager.FindByIdAsync(userId);
        }

        public async Task<ApplicationUser?> GetUserByUsernameAsync(string username)
        {
            return await _userManager.FindByNameAsync(username);
        }

        public async Task<ApplicationUser?> GetUserByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<(bool success, string token)> GenerateEmailVerificationTokenAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return (false, string.Empty);

                // Generate verification token
                var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
                
                user.EmailVerificationToken = token;
                user.EmailVerificationTokenExpires = DateTime.UtcNow.AddHours(24);
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    // Send verification email
                    var frontendUrl = _configuration["FrontendUrl"];
                    if (string.IsNullOrEmpty(frontendUrl))
                    {
                        throw new InvalidOperationException("FrontendUrl is not configured in appsettings.json or environment variables");
                    }
                    var verificationLink = $"{frontendUrl}/verify-email?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";
                    
                    await _emailService.SendEmailVerificationAsync(email, user.UserName ?? email, verificationLink);
                    return (true, token);
                }

                return (false, string.Empty);
            }
            catch
            {
                return (false, string.Empty);
            }
        }

        public async Task<bool> VerifyEmailAsync(string email, string token)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return false;

                if (user.EmailVerificationToken != token || 
                    user.EmailVerificationTokenExpires == null ||
                    user.EmailVerificationTokenExpires < DateTime.UtcNow)
                    return false;

                // Email doğrulandı - hesabı aktifleştir
                user.IsEmailVerified = true;
                user.EmailConfirmed = true; // Identity's email confirmation field
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpires = null;
                user.LockoutEnd = null; // Hesap kilidini kaldır
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                return result.Succeeded;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ResendEmailVerificationAsync(string email)
        {
            try
            {
                var (success, token) = await GenerateEmailVerificationTokenAsync(email);
                return success;
            }
            catch
            {
                return false;
            }
        }

        public async Task<(bool success, string token)> GeneratePasswordResetTokenAsync(string email)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return (false, string.Empty);

                // Generate reset token
                var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
                
                user.PasswordResetToken = token;
                user.PasswordResetTokenExpires = DateTime.UtcNow.AddHours(1);
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    // Send reset email
                    var frontendUrl = _configuration["FrontendUrl"];
                    if (string.IsNullOrEmpty(frontendUrl))
                    {
                        throw new InvalidOperationException("FrontendUrl is not configured in appsettings.json or environment variables");
                    }
                    var resetLink = $"{frontendUrl}/reset-password?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";
                    
                    await _emailService.SendPasswordResetAsync(email, user.UserName ?? email, resetLink);
                    return (true, token);
                }

                return (false, string.Empty);
            }
            catch
            {
                return (false, string.Empty);
            }
        }

        public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                    return false;

                if (user.PasswordResetToken != token || 
                    user.PasswordResetTokenExpires == null ||
                    user.PasswordResetTokenExpires < DateTime.UtcNow)
                    return false;

                // Reset password using Identity's password reset
                var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
                var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

                if (result.Succeeded)
                {
                    user.PasswordResetToken = null;
                    user.PasswordResetTokenExpires = null;
                    user.UpdatedAt = DateTime.UtcNow;
                    await _userManager.UpdateAsync(user);
                    return true;
                }

                return false;
            }
            catch
            {
                return false;
            }
        }
    }
}
