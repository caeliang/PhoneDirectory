using Microsoft.EntityFrameworkCore;
using PhoneDirectory.Data;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.Service.Services;
using PhoneDirectory.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Veritabanı bağlantı dizesi (appsettings.json'a da ekleyeceğiz)
builder.Services.AddDbContext<PhoneDirectoryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// DI Bağlantıları
builder.Services.AddScoped<IKisiRepository, KisiRepository>();
builder.Services.AddScoped<IKisiService, KisiService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder =>
        {
            builder
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});
    
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");

app.UseAuthorization();
app.MapControllers();
app.Run();

