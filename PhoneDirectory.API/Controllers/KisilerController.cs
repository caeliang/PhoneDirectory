using Microsoft.AspNetCore.Mvc;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Interfaces;
using System.Threading.Tasks;
using System.Text.Json;

namespace PhoneDirectory.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KisilerController : ControllerBase
    {
        private readonly IKisiService _kisiService;

        public KisilerController(IKisiService kisiService)
        {
            _kisiService = kisiService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var kisiler = await _kisiService.GetAllAsync();
            return Ok(kisiler);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Kisi kisi)
        {
            if (id != kisi.Id)
                return BadRequest();

            var existingKisi = await _kisiService.GetByIdAsync(id);
            if (existingKisi == null)
                return NotFound();

            // Tüm alanları güncelle
            existingKisi.Ad = kisi.Ad;
            existingKisi.Soyad = kisi.Soyad;
            existingKisi.Telefon = kisi.Telefon;
            existingKisi.Email = kisi.Email;
            existingKisi.Address = kisi.Address;
            existingKisi.Company = kisi.Company;
            existingKisi.Notes = kisi.Notes;
            existingKisi.IsFavori = kisi.IsFavori; // Artık burada güncelleniyor
            existingKisi.UpdatedAt = DateTime.Now;

            var result = await _kisiService.UpdateAsync(existingKisi);
            if (!result)
                return StatusCode(500, "Could not update the record.");

            return NoContent();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Kisi kisi)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _kisiService.AddAsync(kisi);
            return Ok(kisi);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _kisiService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] string? searchTerm = null)
        {
            var result = await _kisiService.GetPagedAndFilteredAsync(pageNumber, pageSize, searchTerm);
            return Ok(result);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateFavorite(int id, [FromBody] JsonElement favoriteData)
        {
            var existingKisi = await _kisiService.GetByIdAsync(id);
            if (existingKisi == null)
                return NotFound();

            // Favori durumunu güncelle
            if (favoriteData.TryGetProperty("favori", out JsonElement favoriValue))
            {
                existingKisi.IsFavori = favoriValue.GetBoolean();
            }
            else if (favoriteData.TryGetProperty("IsFavori", out JsonElement isFavoriValue))
            {
                existingKisi.IsFavori = isFavoriValue.GetBoolean();
            }

            existingKisi.UpdatedAt = DateTime.Now;

            var result = await _kisiService.UpdateAsync(existingKisi);
            if (!result)
                return StatusCode(500, "Could not update the record.");

            return Ok(existingKisi);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var kisi = await _kisiService.GetByIdAsync(id);
            if (kisi == null) return NotFound();
            return Ok(kisi);
        }
    }
}
