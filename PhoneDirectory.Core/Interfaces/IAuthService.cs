using PhoneDirectory.Core.Entities;

namespace PhoneDirectory.Core.Interfaces
{
    public interface IAuthService
    {
        Task<User?> RegisterAsync(string username, string email, string password, string? firstName = null, string? lastName = null);
        Task<User?> LoginAsync(string username, string password);
        Task<string> GenerateJwtTokenAsync(User user);
        Task<bool> ValidateTokenAsync(string token);
        string HashPassword(string password);
        bool VerifyPassword(string password, string hashedPassword);
    }
}
