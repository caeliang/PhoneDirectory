using Microsoft.EntityFrameworkCore;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks;

/// <summary>
/// KisiRepository sınıfı, telefon rehberi uygulamasında kişi (Kisi) verileriyle ilgili veritabanı işlemlerini gerçekleştiren 
/// bir sınıftır. Bu sınıf, IKisiRepository arayüzünü (interface) uygular ve
/// arayüzde tanımlanan metotların gerçek (somut) halini içerir. Yani, veritabanı ile doğrudan iletişimi sağlar.
/// </summary>

namespace PhoneDirectory.Data.Repositories
{
    public class KisiRepository : IKisiRepository
    //IkisiRepository arayüzünü uygulayan KisiRepository sınıfı, o sınıfı miras alır.
    {
        private readonly PhoneDirectoryDbContext _context;
        //PhoneDirectoryDbContext, Entity Framework Core ile veritabanı bağlantısını yöneten DbContext sınıfıdır.

        public async Task<PagedResult<Kisi>> GetPagedAndFilteredAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            var query = _context.Kisiler.AsQueryable();
            // Kisiler tablosundan sorgu oluşturuluyor. AsQueryable, sorgunun IQueryable tipinde olmasını sağlar.

            if (!string.IsNullOrEmpty(searchTerm))
            {
                // Burada isim ve soyisim üzerinde arama yapılıyor
                query = query.Where(k => k.Ad.Contains(searchTerm) || k.Soyad.Contains(searchTerm));
            }

            var totalCount = await query.CountAsync();
            // Toplam kayıt sayısı asenkron olarak alınıyor.

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
        public KisiRepository(PhoneDirectoryDbContext context)
        {
            _context = context;
        }

        public async Task<List<Kisi>> GetAllAsync() => await _context.Kisiler.ToListAsync();
        public async Task<Kisi?> GetByIdAsync(int id) => await _context.Kisiler.FindAsync(id);

        public async Task<Kisi> AddAsync(Kisi kisi)
        {
            await _context.Kisiler.AddAsync(kisi);
            await _context.SaveChangesAsync();
            return kisi;
        }

        public async Task<bool> UpdateAsync(Kisi kisi)
        {
            _context.Kisiler.Update(kisi);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var kisi = await _context.Kisiler.FindAsync(id);
            if (kisi == null) return false;
            _context.Kisiler.Remove(kisi);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}

