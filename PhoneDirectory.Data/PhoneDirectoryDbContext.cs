using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using PhoneDirectory.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhoneDirectory.Data
{
    public class PhoneDirectoryDbContext : IdentityDbContext<ApplicationUser>
    {
        public PhoneDirectoryDbContext(DbContextOptions<PhoneDirectoryDbContext> options)
            : base(options) { }

        public DbSet<Kisi> Kisiler { get; set; }
        
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            
            // Kisi - ApplicationUser ilişkisi
            builder.Entity<Kisi>()
                .HasOne(k => k.User)
                .WithMany(u => u.Kisiler)
                .HasForeignKey(k => k.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Identity tabloları için özel konfigürasyonlar buraya eklenebilir
        }
    }
}

