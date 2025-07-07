using Microsoft.EntityFrameworkCore;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Helpers;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.Data;
using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks;

namespace PhoneDirectory.Service.Services
{
    public class KisiService : IKisiService
    {
        private readonly IKisiRepository _kisiRepository;

        public KisiService(IKisiRepository kisiRepository)
        {
            _kisiRepository = kisiRepository;
        }

        public async Task<IEnumerable<Kisi>> GetAllAsync()
        {
            return await _kisiRepository.GetAllAsync();
        }

        public async Task<Kisi?> GetByIdAsync(int id)
        {
            return await _kisiRepository.GetByIdAsync(id);
        }

        public async Task<Kisi> AddAsync(Kisi kisi)
        {
            return await _kisiRepository.AddAsync(kisi);
        }

        public async Task<bool> UpdateAsync(Kisi kisi)
        {
            return await _kisiRepository.UpdateAsync(kisi);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _kisiRepository.DeleteAsync(id);
        }
        public async Task<PagedResult<Kisi>> GetPagedAndFilteredAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            return await _kisiRepository.GetPagedAndFilteredAsync(pageNumber, pageSize, searchTerm);
        }

        // User-specific methods
        public async Task<IEnumerable<Kisi>> GetByUserIdAsync(string userId)
        {
            return await _kisiRepository.GetByUserIdAsync(userId);
        }

        public async Task<Kisi?> GetByIdAndUserIdAsync(int id, string userId)
        {
            return await _kisiRepository.GetByIdAndUserIdAsync(id, userId);
        }

        public async Task<bool> DeleteByIdAndUserIdAsync(int id, string userId)
        {
            var kisi = await _kisiRepository.GetByIdAndUserIdAsync(id, userId);
            if (kisi == null)
                return false;

            return await _kisiRepository.DeleteAsync(id);
        }

        public async Task<PagedResult<Kisi>> GetPagedAndFilteredByUserIdAsync(int pageNumber, int pageSize, string? searchTerm, string userId)
        {
            return await _kisiRepository.GetPagedAndFilteredByUserIdAsync(pageNumber, pageSize, searchTerm, userId);
        }

    }
}
