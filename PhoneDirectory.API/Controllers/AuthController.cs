using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.API.DTOs;
using AutoMapper;
using PhoneDirectory.Core.Entities;

namespace PhoneDirectory.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IMapper _mapper;

        public AuthController(IAuthService authService, IMapper mapper)
        {
            _authService = authService;
            _mapper = mapper;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _authService.RegisterAsync(
                registerDto.Username,
                registerDto.Email,
                registerDto.Password,
                registerDto.FirstName,
                registerDto.LastName
            );

            if (user == null)
                return BadRequest(new AuthResponseDto
                {
                    Success = false,
                    Message = "Kullanıcı adı veya email zaten kullanımda."
                });

            return Ok(new AuthResponseDto
            {
                Success = true,
                Message = "Kayıt başarılı. Giriş sayfasına yönlendiriliyorsunuz."
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _authService.LoginAsync(loginDto.Username, loginDto.Password);

            if (user == null)
                return Unauthorized(new AuthResponseDto
                {
                    Success = false,
                    Message = "Kullanıcı adı veya şifre hatalı."
                });

            var token = await _authService.GenerateJwtTokenAsync(user);
            var userDto = _mapper.Map<UserDto>(user);

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
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var username = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var firstName = User.FindFirst("FirstName")?.Value;
            var lastName = User.FindFirst("LastName")?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userDto = new UserDto
            {
                Id = int.Parse(userId),
                Username = username ?? "",
                Email = email ?? "",
                FirstName = firstName,
                LastName = lastName,
                IsActive = true
            };

            return Ok(userDto);
        }
    }
}
