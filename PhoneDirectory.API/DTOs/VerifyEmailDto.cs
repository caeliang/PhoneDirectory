using System.ComponentModel.DataAnnotations;

namespace PhoneDirectory.API.DTOs
{
    public class VerifyEmailDto
    {
        [Required(ErrorMessage = "Email zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Verification token zorunludur")]
        public string Token { get; set; } = string.Empty;
    }
}
