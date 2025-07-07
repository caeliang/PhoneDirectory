using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace PhoneDirectory.Core.Interfaces
{
    public interface IKisiRepository : IRepository<Kisi>
    {
        Task<PagedResult<Kisi>> GetPagedAndFilteredAsync(int pageNumber, int pageSize, string? searchTerm);
        Task<IEnumerable<Kisi>> GetByUserIdAsync(string userId);
        Task<Kisi?> GetByIdAndUserIdAsync(int id, string userId);
        Task<PagedResult<Kisi>> GetPagedAndFilteredByUserIdAsync(int pageNumber, int pageSize, string? searchTerm, string userId);
    }
}

