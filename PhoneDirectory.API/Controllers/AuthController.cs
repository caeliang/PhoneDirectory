using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.API.DTOs;
using PhoneDirectory.API.Services;
using AutoMapper;
using PhoneDirectory.Core.Entities;
using System.Security.Claims;

namespace PhoneDirectory.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly ILoggingService _logger;

        public AuthController(IAuthService authService, UserManager<ApplicationUser> userManager, IMapper mapper, ILoggingService logger)
        {
            _authService = authService;
            _userManager = userManager;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            await _logger.LogInfoAsync($"Register attempt for username: {registerDto.Username}, email: {registerDto.Email}");
            
            if (!ModelState.IsValid)
            {
                await _logger.LogWarningAsync($"Register failed - Invalid model state for username: {registerDto.Username}");
                return BadRequest(ModelState);
            }

            var (user, errors) = await _authService.RegisterAsync(
                registerDto.Username,
                registerDto.Email,
                registerDto.Password,
                registerDto.FirstName,
                registerDto.LastName
            );

            if (user == null)
            {
                await _logger.LogWarningAsync($"Register failed for username: {registerDto.Username}, errors: {string.Join(", ", errors)}");
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = errors.Length > 0 ? string.Join(", ", errors) : "Kayıt işlemi başarısız."
                });
            }

            await _logger.LogInfoAsync($"User registered successfully: {user.UserName} (ID: {user.Id})");
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Kayıt başarılı. Giriş sayfasına yönlendiriliyorsunuz."
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            await _logger.LogInfoAsync($"Login attempt for username: {loginDto.Username}");
            
            if (!ModelState.IsValid)
            {
                await _logger.LogWarningAsync($"Login failed - Invalid model state for username: {loginDto.Username}");
                return BadRequest(ModelState);
            }

            var user = await _authService.LoginAsync(loginDto.Username, loginDto.Password);

            if (user == null)
            {
                await _logger.LogWarningAsync($"Login failed - Invalid credentials for username: {loginDto.Username}");
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Kullanıcı adı veya şifre hatalı."
                });
            }

            var token = await _authService.GenerateJwtTokenAsync(user);
            var userDto = _mapper.Map<UserDto>(user);

            await _logger.LogInfoAsync($"User logged in successfully: {user.UserName} (ID: {user.Id})");
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Giriş başarılı.",
                Token = token,
                User = userDto
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // Token varsa kullanıcı bilgilerini al, yoksa anonymous logout
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value ?? "Anonymous";
            
            await _logger.LogInfoAsync($"User logged out: {username} (ID: {userId ?? "N/A"})");
            
            // JWT ile logout işlemi client-side'da token'ı silmekle olur
            // Server-side'da token blacklist'i implement edilebilir
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Çıkış başarılı."
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            
            if (user == null)
                return NotFound();

            var userDto = _mapper.Map<UserDto>(user);
            return Ok(userDto);
        }
    }
}
