using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace PhoneDirectory.Core.Interfaces
{
    public interface IKisiService
    {
        Task<IEnumerable<Kisi>> GetAllAsync();
        Task<Kisi?> GetByIdAsync(int id);
        Task<Kisi> AddAsync(Kisi kisi);
        Task<bool> UpdateAsync(Kisi kisi);
        Task<bool> DeleteAsync(int id);
        Task<PagedResult<Kisi>> GetPagedAndFilteredAsync(int pageNumber, int pageSize, string? searchTerm);

    }
}

