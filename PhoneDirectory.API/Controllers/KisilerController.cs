using Microsoft.AspNetCore.Mvc;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.API.DTOs;
using AutoMapper;
using System.Threading.Tasks;
using System.Text.Json;

namespace PhoneDirectory.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KisilerController : ControllerBase
    {
        private readonly IKisiService _kisiService;
        private readonly IMapper _mapper;
        private readonly ILogger<KisilerController> _logger;

        public KisilerController(IKisiService kisiService, IMapper mapper, ILogger<KisilerController> logger)
        {
            _kisiService = kisiService;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            _logger.LogInformation("Fetching all contacts");
            try
            {
                var kisiler = await _kisiService.GetAllAsync();
                var kisilerDto = _mapper.Map<List<KisiDto>>(kisiler);
                _logger.LogInformation("Successfully fetched {Count} contacts", kisilerDto.Count);
                return Ok(kisilerDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching all contacts");
                return StatusCode(500, "An error occurred while fetching contacts");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateKisiDto updateKisiDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingKisi = await _kisiService.GetByIdAsync(id);
            if (existingKisi == null)
                return NotFound();

            // AutoMapper ile güncelleme
            _mapper.Map(updateKisiDto, existingKisi);
            existingKisi.UpdatedAt = DateTime.Now;

            var result = await _kisiService.UpdateAsync(existingKisi);
            if (!result)
                return StatusCode(500, "Could not update the record.");

            var updatedKisiDto = _mapper.Map<KisiDto>(existingKisi);
            return Ok(updatedKisiDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateKisiDto createKisiDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var kisi = _mapper.Map<Kisi>(createKisiDto);
            var createdKisi = await _kisiService.AddAsync(kisi);
            var kisiDto = _mapper.Map<KisiDto>(createdKisi);
            
            return CreatedAtAction(nameof(GetById), new { id = kisiDto.Id }, kisiDto);
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
            
            // PagedResult içindeki Items'ı DTO'ya çevir
            var kisilerDto = _mapper.Map<List<KisiDto>>(result.Items);
            
            var pagedResultDto = new PagedResultDto<KisiDto>
            {
                Items = kisilerDto,
                TotalCount = result.TotalCount,
                PageNumber = result.PageNumber,
                PageSize = result.PageSize
            };
            
            return Ok(pagedResultDto);
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

            var kisiDto = _mapper.Map<KisiDto>(existingKisi);
            return Ok(kisiDto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var kisi = await _kisiService.GetByIdAsync(id);
            if (kisi == null) return NotFound();
            
            var kisiDto = _mapper.Map<KisiDto>(kisi);
            return Ok(kisiDto);
        }
    }
}
