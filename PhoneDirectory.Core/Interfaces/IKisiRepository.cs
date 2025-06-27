using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/// <summary>
/// IKisiRepository arayüzü, telefon rehberi uygulamasında kişi (Kisi) verileriyle ilgili yapılabilecek işlemleri tanımlar.
/// Yani, veritabanı veya başka bir veri kaynağı üzerinde kişi kayıtlarını 
/// ekleme, silme, güncelleme, listeleme ve sayfalama gibi işlemler için bir sözleşme (contract) sunar.
/// </summary>

namespace PhoneDirectory.Core.Interfaces
{
    public interface IKisiRepository
    {
        //Task, asenkron işlemleri başlatmak ve sonucunu yönetmek için kullanılan temel yapıdır.
        Task<List<Kisi>> GetAllAsync();
        //Tüm kişileri asenkron olarak getirir.
        Task<Kisi?> GetByIdAsync(int id);
        //Verilen ID’ye sahip kişiyi asenkron olarak getirir. Eğer kişi bulunamazsa null döner.
        Task<Kisi> AddAsync(Kisi kisi);
        //Yeni bir kişiyi asenkron olarak ekler ve eklenen kişiyi döner.
        Task<bool> UpdateAsync(Kisi kisi);
        //Verilen kişiyi asenkron olarak günceller. Güncelleme başarılıysa true, başarısızsa false döner.
        Task<bool> DeleteAsync(int id);
        //Verilen ID’ye sahip kişiyi asenkron olarak siler. Silme başarılıysa true, başarısızsa false döner.
        Task<PagedResult<Kisi>> GetPagedAndFilteredAsync(int pageNumber, int pageSize, string? searchTerm);
        //Sayfalama ve filtreleme işlemi yapar.

    }
}

