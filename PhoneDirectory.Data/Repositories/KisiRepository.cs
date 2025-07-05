using Microsoft.EntityFrameworkCore;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PhoneDirectory.Data.Repositories
{
    public class KisiRepository : Repository<Kisi>, IKisiRepository
    {
        public KisiRepository(PhoneDirectoryDbContext context) : base(context)
        {
        }

        public async Task<PagedResult<Kisi>> GetPagedAndFilteredAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                // Burada isim ve soyisim üzerinde arama yapılıyor
                query = query.Where(k => k.Ad.Contains(searchTerm) || k.Soyad.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Kisi>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }
    }
}

