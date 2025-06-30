using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using PhoneDirectory.Data;

namespace PhoneDirectory.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<PhoneDirectoryDbContext>
    {
        public PhoneDirectoryDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<PhoneDirectoryDbContext>();

            // buraya kendi connection string'ini koy
            optionsBuilder.UseSqlServer("Server=localhost;Database=PhoneDirectoryDb;Trusted_Connection=True;TrustServerCertificate=True;");

            return new PhoneDirectoryDbContext(optionsBuilder.Options);
        }
    }
}
