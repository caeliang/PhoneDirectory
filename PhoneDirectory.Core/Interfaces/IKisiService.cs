using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/// <summary>
///Amaç:
///
///İş(business) katmanında kullanılır. 
///Repository’den gelen veriler üzerinde ek iş kuralları, validasyonlar veya farklı işlemler uygulanabilir.
///
///Sorumluluk:
///
///Uygulamanın iş mantığını yönetir.
///Gerekirse birden fazla repository ile çalışabilir, validasyon veya ek kontroller ekleyebilir.
///
///Kapsam:
///
///Hem veri erişimini hem de iş kurallarını kapsar.

namespace PhoneDirectory.Core.Interfaces
{
    public interface IKisiService
    {
        //Task, asenkron işlemleri başlatmak ve sonucunu yönetmek için kullanılan temel yapıdır.
        //Uygulamanın daha hızlı ve verimli çalışmasını sağlar.
        Task<IEnumerable<Kisi>> GetAllAsync();
        // Tüm kişileri asenkron olarak getirir.
        Task<Kisi?> GetByIdAsync(int id);
        // Verilen ID’ye sahip kişiyi asenkron olarak getirir. Eğer kişi bulunamazsa null döner.
        Task<Kisi> AddAsync(Kisi kisi);
        // Yeni bir kişiyi asenkron olarak ekler ve eklenen kişiyi döner.
        Task<bool> UpdateAsync(Kisi kisi);
        // Verilen kişiyi asenkron olarak günceller. Güncelleme başarılıysa true, başarısızsa false döner.
        Task<bool> DeleteAsync(int id);
        // Verilen ID’ye sahip kişiyi asenkron olarak siler. Silme başarılıysa true, başarısızsa false döner.
        Task<PagedResult<Kisi>> GetPagedAndFilteredAsync(int pageNumber, int pageSize, string? searchTerm);
        // Sayfalama ve filtreleme işlemi yapar.

    }
}

