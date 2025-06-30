using Microsoft.AspNetCore.Mvc;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Interfaces;
using System.Threading.Tasks;

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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var kisi = await _kisiService.GetByIdAsync(id);
            if (kisi == null) return NotFound();
            return Ok(kisi);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Kisi kisi)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _kisiService.AddAsync(kisi);
            return Ok(kisi);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Kisi kisi)
        {
            if (id != kisi.Id) return BadRequest();

            var updated = await _kisiService.UpdateAsync(kisi);
            if (!updated) return NotFound();

            return NoContent();
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

    }
}
