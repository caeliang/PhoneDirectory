using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhoneDirectory.Core.Entities
{
    public class Kisi
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public required string Ad { get; set; }
        public required string Soyad { get; set; }
        public required string Telefon { get; set; }
        public required string Email { get; set; }
    }
}

