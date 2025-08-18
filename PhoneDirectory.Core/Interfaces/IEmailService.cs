namespace PhoneDirectory.Core.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendEmailVerificationAsync(string email, string username, string verificationLink);
        Task<bool> SendPasswordResetAsync(string email, string username, string resetLink);
    }
}
