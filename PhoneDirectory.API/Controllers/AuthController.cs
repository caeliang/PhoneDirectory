using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.API.DTOs;
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
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, UserManager<ApplicationUser> userManager, IMapper mapper, ILogger<AuthController> logger)
        {
            _authService = authService;
            _userManager = userManager;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            _logger.LogInformation("Register attempt for username: {Username}, email: {Email}", registerDto.Username, registerDto.Email);
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Register failed - Invalid model state for username: {Username}", registerDto.Username);
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
                _logger.LogWarning("Register failed for username: {Username}, errors: {Errors}", registerDto.Username, string.Join(", ", errors));
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = errors.Length > 0 ? string.Join(", ", errors) : "Kayıt işlemi başarısız."
                });
            }

            _logger.LogInformation("User registered successfully: {Username} (ID: {UserId})", user.UserName, user.Id);
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Kayıt başarılı. Giriş sayfasına yönlendiriliyorsunuz."
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            _logger.LogInformation("Login attempt for username: {Username}", loginDto.Username);
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Login failed - Invalid model state for username: {Username}", loginDto.Username);
                return BadRequest(ModelState);
            }

            var user = await _authService.LoginAsync(loginDto.Username, loginDto.Password);

            if (user == null)
            {
                _logger.LogWarning("Login failed - Invalid credentials for username: {Username}", loginDto.Username);
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Kullanıcı adı veya şifre hatalı."
                });
            }

            var token = await _authService.GenerateJwtTokenAsync(user);
            var userDto = _mapper.Map<UserDto>(user);

            _logger.LogInformation("User logged in successfully: {Username} (ID: {UserId})", user.UserName, user.Id);
            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Giriş başarılı.",
                Token = token,
                User = userDto
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            
            _logger.LogInformation("User logged out: {Username} (ID: {UserId})", username, userId);
            
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
