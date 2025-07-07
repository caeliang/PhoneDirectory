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

        public async Task<IEnumerable<Kisi>> GetByUserIdAsync(string userId)
        {
            return await _dbSet.Where(k => k.UserId == userId).ToListAsync();
        }

        public async Task<Kisi?> GetByIdAndUserIdAsync(int id, string userId)
        {
            return await _dbSet.FirstOrDefaultAsync(k => k.Id == id && k.UserId == userId);
        }

        public async Task<PagedResult<Kisi>> GetPagedAndFilteredByUserIdAsync(int pageNumber, int pageSize, string? searchTerm, string userId)
        {
            var query = _dbSet.Where(k => k.UserId == userId);

            if (!string.IsNullOrEmpty(searchTerm))
            {
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

        private string NormalizePhoneNumber(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return string.Empty;
            // Remove spaces, dashes, parentheses, and leading +90 or 0
            var normalized = new string(phone.Where(char.IsDigit).ToArray());
            if (normalized.StartsWith("90"))
                normalized = normalized.Substring(2);
            else if (normalized.StartsWith("0"))
                normalized = normalized.Substring(1);
            return normalized;
        }

        public async Task<bool> PhoneNumberExistsAsync(string userId, string phoneNumber)
        {
            var normalizedPhone = NormalizePhoneNumber(phoneNumber);
            var userPhones = await _dbSet.Where(k => k.UserId == userId).Select(k => k.Telefon).ToListAsync();
            return userPhones.Any(tel => NormalizePhoneNumber(tel) == normalizedPhone);
        }
    }
}

