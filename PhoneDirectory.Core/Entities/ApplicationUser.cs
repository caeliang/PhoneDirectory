using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace PhoneDirectory.Core.Entities
{
    public class ApplicationUser : IdentityUser
    {
        [StringLength(50)]
        public string? FirstName { get; set; }
        
        [StringLength(50)]
        public string? LastName { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Email verification properties
        public bool IsEmailVerified { get; set; } = false;
        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationTokenExpires { get; set; }

        // Password reset properties
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpires { get; set; }

        // Navigation property
        public virtual ICollection<Kisi> Kisiler { get; set; } = new List<Kisi>();
    }
}
