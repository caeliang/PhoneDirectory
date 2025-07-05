using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PhoneDirectory.Service.Services
{
    public class IdentityAuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public IdentityAuthService(
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<(ApplicationUser? user, string[] errors)> RegisterAsync(string username, string email, string password, string? firstName = null, string? lastName = null)
        {
            var user = new ApplicationUser
            {
                UserName = username,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            var result = await _userManager.CreateAsync(user, password);
            
            if (result.Succeeded)
            {
                return (user, Array.Empty<string>());
            }

            var errors = result.Errors.Select(e => e.Description).ToArray();
            return (null, errors);
        }

        public async Task<ApplicationUser?> LoginAsync(string username, string password)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
                return null;

            var isValidPassword = await _userManager.CheckPasswordAsync(user, password);
            
            if (isValidPassword)
            {
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

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return true;
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
    }
}
