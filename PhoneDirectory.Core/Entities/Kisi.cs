using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhoneDirectory.Core.Entities
{
    public class Kisi
    {
        public int Id { get; set; }
        public required string Ad { get; set; }
        public required string Soyad { get; set; }
        public required string Telefon { get; set; }
        public required string Email { get; set; }
    }
}

