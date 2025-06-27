using Microsoft.EntityFrameworkCore;
using PhoneDirectory.Data;
using PhoneDirectory.Core.Interfaces;
using PhoneDirectory.Service.Services;
using PhoneDirectory.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);
//Uygulama için bir builder nesnesi oluşturuluyor. Konfigürasyon, servis ekleme gibi işlemler bu nesne üzerinden yapılır.

builder.Services.AddControllers();
//Controller’lar (API uç noktaları) servislere ekleniyor.

builder.Services.AddDbContext<PhoneDirectoryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
//Entity Framework Core ile SQL Server veritabanı bağlantısı kuruluyor. Bağlantı dizesi appsettings.json dosyasından alınır.

// DI Bağlantıları
builder.Services.AddScoped<IKisiRepository, KisiRepository>();
builder.Services.AddScoped<IKisiService, KisiService>();
//Bağımlılık enjeksiyonu (Dependency Injection) ile repository ve service katmanları ekleniyor.
//Her istek için yeni bir nesne oluşturulur.

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//Swagger/OpenAPI desteği ekleniyor. API dokümantasyonu ve test arayüzü sağlar.

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder =>
        {
            builder
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                //Belirtilen kökenden gelen isteklerde herhangi bir başlığa izin verilir.
                .AllowAnyMethod();
            //Belirtilen kökenden gelen isteklerde herhangi bir HTTP metoduna izin verilir.
        });
});
//CORS(Cross - Origin Resource Sharing) politikası.
//Sadece http://localhost:4200 adresinden gelen isteklere izin veriliyor.

var app = builder.Build();
//Uygulama nesnesi oluşturuluyor.

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//Geliştirme ortamında Swagger arayüzü aktif ediliyor.

app.UseHttpsRedirection();
//HTTP istekleri otomatik olarak HTTPS’e yönlendiriliyor.

app.UseCors("AllowAngularApp");
//Daha önce tanımlanan CORS politikası uygulanıyor.

app.UseAuthorization();
//Yetkilendirme (authorization) middleware’i ekleniyor.

app.MapControllers();
//Controller’lar için yönlendirme yapılıyor. API uç noktaları burada tanımlanır.

app.Run();
//Uygulama çalıştırılıyor. Bu satır, uygulamanın başlatılmasını sağlar.
