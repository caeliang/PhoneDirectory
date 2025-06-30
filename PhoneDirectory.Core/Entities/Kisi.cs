using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneDirectory.Core.Entities
{
    public class Kisi
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string Ad { get; set; } = null!;

        [Required]
        public string Soyad { get; set; } = null!;

        [Required]
        public string Telefon { get; set; } = null!;

        [Required]
        public string Email { get; set; } = null!;

        public string? Address { get; set; } // yeni
        public string? Company { get; set; } // yeni
        public string? Notes { get; set; }   // yeni
        public bool IsFavori { get; set; } = false; // önceki
        public DateTime CreatedAt { get; set; } = DateTime.Now; // yeni
        public DateTime UpdatedAt { get; set; } = DateTime.Now; // yeni
    }
}
