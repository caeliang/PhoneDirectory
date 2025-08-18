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
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), 
        sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorNumbersToAdd: null);
            sqlOptions.CommandTimeout(60);
        }));

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
builder.Services.AddScoped<IEmailService, EmailService>(); // Email Service
builder.Services.AddSingleton<ILoggingService, FileLoggingService>(); // File Logging Service

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            // FrontendUrl yapılandırmasını kullan
            var frontendUrl = builder.Configuration["FrontendUrl"];
            if (!string.IsNullOrEmpty(frontendUrl))
            {
                policy
                    .WithOrigins(
                        "http://localhost:4200",
                        "https://phonedirectoryangular-chfgfeamgycrg4du.uaenorth-01.azurewebsites.net", // Angular uygulamasının doğru URL'si
                        frontendUrl // Yapılandırmadaki URL'yi de ekle
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
            else
            {
                policy
                    .WithOrigins(
                        "http://localhost:4200",
                        "https://phonedirectoryangular-chfgfeamgycrg4du.uaenorth-01.azurewebsites.net" // Angular uygulamasının doğru URL'si
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            }
        });
});
    
var app = builder.Build();

// Veritabanını oluştur ve migration'ları uygula
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PhoneDirectoryDbContext>();
    try
    {
        // Azure SQL için migration kullan
        context.Database.Migrate();
        Console.WriteLine("Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration error: {ex.Message}");
        // Azure SQL connection issues için retry
        try
        {
            await Task.Delay(5000); // 5 saniye bekle
            context.Database.Migrate();
            Console.WriteLine("Database migrations applied on retry.");
        }
        catch (Exception retryEx)
        {
            Console.WriteLine($"Migration retry failed: {retryEx.Message}");
        }
    }
}

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

