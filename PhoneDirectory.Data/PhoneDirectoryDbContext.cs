using Microsoft.EntityFrameworkCore;
using PhoneDirectory.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhoneDirectory.Data
{
    // ESKİ: class PhoneDirectoryDbContext
    public class PhoneDirectoryDbContext : DbContext
    {
        public PhoneDirectoryDbContext(DbContextOptions<PhoneDirectoryDbContext> options)
            : base(options) { }


        public DbSet<Kisi> Kisiler { get; set; }
        public DbSet<User> Users { get; set; }
    }
}

