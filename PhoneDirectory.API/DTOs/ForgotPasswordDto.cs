using System.ComponentModel.DataAnnotations;

namespace PhoneDirectory.API.DTOs
{
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "Email zorunludur")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz")]
        public string Email { get; set; } = string.Empty;
    }
}
