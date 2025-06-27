using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
/// <summary>
///Bu sınıfın temel amaçları:
///•	Bir sayfada gösterilecek veri listesini (Items) tutmak.
///•	Toplam kayıt sayısını (TotalCount) belirtmek.
///•	Hangi sayfanın gösterildiğini (PageNumber) ve sayfa başına kaç kayıt olduğunu (PageSize) belirtmek.
 /// </summary>
namespace PhoneDirectory.Core.Helpers
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}


