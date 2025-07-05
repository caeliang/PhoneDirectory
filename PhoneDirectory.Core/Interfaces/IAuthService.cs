using PhoneDirectory.Core.Entities;
using Microsoft.AspNetCore.Identity;

namespace PhoneDirectory.Core.Interfaces
{
    public interface IAuthService
    {
        Task<(ApplicationUser? user, string[] errors)> RegisterAsync(string username, string email, string password, string? firstName = null, string? lastName = null);
        Task<ApplicationUser?> LoginAsync(string username, string password);
        Task<string> GenerateJwtTokenAsync(ApplicationUser user);
        Task<bool> ValidateTokenAsync(string token);
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
        Task<IdentityResult> ChangePasswordAsync(ApplicationUser user, string currentPassword, string newPassword);
        Task<ApplicationUser?> GetUserByIdAsync(string userId);
        Task<ApplicationUser?> GetUserByUsernameAsync(string username);
        Task<ApplicationUser?> GetUserByEmailAsync(string email);
    }
}
