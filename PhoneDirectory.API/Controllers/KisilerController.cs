using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.API.DTOs;
using PhoneDirectory.API.Services;
using AutoMapper;
using System.Threading.Tasks;
using System.Text.Json;
using System.Security.Claims;

namespace PhoneDirectory.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class KisilerController : ControllerBase
    {
        private readonly IKisiService _kisiService;
        private readonly IMapper _mapper;
        private readonly ILoggingService _logger;

        public KisilerController(IKisiService kisiService, IMapper mapper, ILoggingService logger)
        {
            _kisiService = kisiService;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                await _logger.LogWarningAsync("Unauthorized access attempt to get all contacts");
                return Unauthorized();
            }

            await _logger.LogInfoAsync($"Fetching contacts for user: {userId}");
            try
            {
                var kisiler = await _kisiService.GetByUserIdAsync(userId);
                var kisilerDto = _mapper.Map<List<KisiDto>>(kisiler);
                await _logger.LogInfoAsync($"Successfully fetched {kisilerDto.Count} contacts for user: {userId}");
                return Ok(kisilerDto);
            }
            catch (Exception ex)
            {
                await _logger.LogErrorAsync($"Error occurred while fetching contacts for user: {userId}", ex.ToString());
                return StatusCode(500, "An error occurred while fetching contacts");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateKisiDto updateKisiDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                await _logger.LogWarningAsync("Unauthorized access attempt to update contact");
                return Unauthorized();
            }

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _logger.LogInfoAsync($"Updating contact with ID: {id} for user: {userId}");
            try
            {
                var existingKisi = await _kisiService.GetByIdAndUserIdAsync(id, userId);
                if (existingKisi == null)
                {
                    await _logger.LogWarningAsync($"Contact with ID: {id} not found for user: {userId}");
                    return NotFound();
                }

                // AutoMapper ile güncelleme
                _mapper.Map(updateKisiDto, existingKisi);
                existingKisi.UpdatedAt = DateTime.Now;

                var result = await _kisiService.UpdateAsync(existingKisi);
                if (!result)
                {
                    await _logger.LogErrorAsync($"Failed to update contact with ID: {id} for user: {userId}");
                    return StatusCode(500, "Could not update the record.");
                }

                var updatedKisiDto = _mapper.Map<KisiDto>(existingKisi);
                await _logger.LogInfoAsync($"Successfully updated contact with ID: {id} for user: {userId}");
                return Ok(updatedKisiDto);
            }
            catch (Exception ex)
            {
                await _logger.LogErrorAsync($"Error occurred while updating contact with ID: {id} for user: {userId}", ex.ToString());
                return StatusCode(500, "An error occurred while updating the contact");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateKisiDto createKisiDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                await _logger.LogWarningAsync("Unauthorized access attempt to create contact");
                return Unauthorized();
            }

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Duplicate phone number check
            var phoneExists = await _kisiService.PhoneNumberExistsAsync(userId, createKisiDto.Telefon);
            if (phoneExists)
            {
                await _logger.LogWarningAsync($"Duplicate phone number attempt for user: {userId}, phone: {createKisiDto.Telefon}");
                return Conflict(new { message = "Bu telefon numarasına sahip bir kişi zaten mevcut." });
            }

            await _logger.LogInfoAsync($"Creating contact for user: {userId}");
            try
            {
                var kisi = _mapper.Map<Kisi>(createKisiDto);
                kisi.UserId = userId; // Kullanıcı ID'sini atayalım
                var createdKisi = await _kisiService.AddAsync(kisi);
                var kisiDto = _mapper.Map<KisiDto>(createdKisi);
                await _logger.LogInfoAsync($"Successfully created contact with ID: {kisiDto.Id} for user: {userId}");
                return CreatedAtAction(nameof(GetById), new { id = kisiDto.Id }, kisiDto);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
            {
                if (dbEx.InnerException != null && dbEx.InnerException.Message.Contains("IX_Kisiler_UserId_Telefon"))
                {
                    await _logger.LogWarningAsync($"DB duplicate index violation for user: {userId}, phone: {createKisiDto.Telefon}");
                    return Conflict(new { message = "Bu telefon numarasına sahip bir kişi zaten mevcut (veritabanı)." });
                }
                await _logger.LogErrorAsync($"DB error while creating contact for user: {userId}", dbEx.ToString());
                return StatusCode(500, "Veritabanı hatası oluştu.");
            }
            catch (Exception ex)
            {
                await _logger.LogErrorAsync($"Error occurred while creating contact for user: {userId}", ex.ToString());
                return StatusCode(500, "An error occurred while creating the contact");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                await _logger.LogWarningAsync("Unauthorized access attempt to delete contact");
                return Unauthorized();
            }

            await _logger.LogInfoAsync($"Deleting contact with ID: {id} for user: {userId}");
            try
            {
                var existingKisi = await _kisiService.GetByIdAndUserIdAsync(id, userId);
                if (existingKisi == null)
                {
                    await _logger.LogWarningAsync($"Contact with ID: {id} not found for user: {userId}");
                    return NotFound();
                }

                var deleted = await _kisiService.DeleteAsync(id);
                if (!deleted) 
                {
                    await _logger.LogErrorAsync($"Failed to delete contact with ID: {id} for user: {userId}");
                    return StatusCode(500, "Could not delete the record.");
                }

                await _logger.LogInfoAsync($"Successfully deleted contact with ID: {id} for user: {userId}");
                return NoContent();
            }
            catch (Exception ex)
            {
                await _logger.LogErrorAsync($"Error occurred while deleting contact with ID: {id} for user: {userId}", ex.ToString());
                return StatusCode(500, "An error occurred while deleting the contact");
            }
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                await _logger.LogWarningAsync("Unauthorized access attempt to get paged contacts");
                return Unauthorized();
            }

            await _logger.LogInfoAsync($"Fetching paged contacts for user: {userId} (Page: {pageNumber}, Size: {pageSize}, Search: {searchTerm})");
            try
            {
                var result = await _kisiService.GetPagedAndFilteredByUserIdAsync(pageNumber, pageSize, searchTerm, userId);
                
                // PagedResult içindeki Items'ı DTO'ya çevir
                var kisilerDto = _mapper.Map<List<KisiDto>>(result.Items);
                
                var pagedResultDto = new PagedResultDto<KisiDto>
                {
                    Items = kisilerDto,
                    TotalCount = result.TotalCount,
                    PageNumber = result.PageNumber,
                    PageSize = result.PageSize
                };
                
                await _logger.LogInfoAsync($"Successfully fetched {kisilerDto.Count} contacts (Page: {pageNumber}) for user: {userId}");
                return Ok(pagedResultDto);
            }
            catch (Exception ex)
            {
                await _logger.LogErrorAsync($"Error occurred while fetching paged contacts for user: {userId}", ex.ToString());
                return StatusCode(500, "An error occurred while fetching contacts");
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateFavorite(int id, [FromBody] JsonElement favoriteData)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                await _logger.LogWarningAsync("Unauthorized access attempt to update favorite status");
                return Unauthorized();
            }

            await _logger.LogInfoAsync($"Updating favorite status for contact with ID: {id} for user: {userId}");
            try
            {
                var existingKisi = await _kisiService.GetByIdAndUserIdAsync(id, userId);
                if (existingKisi == null)
                {
                    await _logger.LogWarningAsync($"Contact with ID: {id} not found for user: {userId}");
                    return NotFound();
                }

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
                {
                    await _logger.LogErrorAsync($"Failed to update favorite status for contact with ID: {id} for user: {userId}");
                    return StatusCode(500, "Could not update the record.");
                }

                var kisiDto = _mapper.Map<KisiDto>(existingKisi);
                await _logger.LogInfoAsync($"Successfully updated favorite status for contact with ID: {id} for user: {userId}");
                return Ok(kisiDto);
            }
            catch (Exception ex)
            {
                await _logger.LogErrorAsync($"Error occurred while updating favorite status for contact with ID: {id} for user: {userId}", ex.ToString());
                return StatusCode(500, "An error occurred while updating favorite status");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                await _logger.LogWarningAsync("Unauthorized access attempt to get contact by ID");
                return Unauthorized();
            }

            await _logger.LogInfoAsync($"Fetching contact with ID: {id} for user: {userId}");
            try
            {
                var kisi = await _kisiService.GetByIdAndUserIdAsync(id, userId);
                if (kisi == null) 
                {
                    await _logger.LogWarningAsync($"Contact with ID: {id} not found for user: {userId}");
                    return NotFound();
                }
                
                var kisiDto = _mapper.Map<KisiDto>(kisi);
                await _logger.LogInfoAsync($"Successfully fetched contact with ID: {id} for user: {userId}");
                return Ok(kisiDto);
            }
            catch (Exception ex)
            {
                await _logger.LogErrorAsync($"Error occurred while fetching contact with ID: {id} for user: {userId}", ex.ToString());
                return StatusCode(500, "An error occurred while fetching the contact");
            }
        }
    }
}
