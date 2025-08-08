using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using PhoneDirectory.Data;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.Service.Services;
using PhoneDirectory.Data.Repositories;
using PhoneDirectory.API.Mappings;
using PhoneDirectory.Core.Entities;
using PhoneDirectory.API.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase; // camelCase kullan
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Veritabanı bağlantı dizesi
builder.Services.AddDbContext<PhoneDirectoryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity Configuration
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;

    // User settings
    options.User.AllowedUserNameCharacters =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<PhoneDirectoryDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "YourDefaultSecretKeyForDevelopment123456789";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "PhoneDirectoryApp",
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? "PhoneDirectoryUsers",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

// DI Bağlantıları
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IKisiRepository, KisiRepository>();
builder.Services.AddScoped<IKisiService, KisiService>();
builder.Services.AddScoped<IAuthService, IdentityAuthService>(); // Identity Auth Service
builder.Services.AddSingleton<ILoggingService, FileLoggingService>(); // File Logging Service

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:4200",
                    "https://phonedirectoryapi-c6eadmbehtbtbeh5.uaenorth-01.azurewebsites.net/" // Azure'da deploy edilecek Angular uygulaması
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .SetIsOriginAllowed(origin => true) // Development için
                .AllowCredentials();
        });
});
    
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTP kullandığımız için HTTPS redirect'i kaldırıyoruz
// app.UseHttpsRedirection();

    app.UseCors("AllowAngularApp");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapGet("/", () => Results.Ok("Phone Directory API is running..."));

    app.Run();

