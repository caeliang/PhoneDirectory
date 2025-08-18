# Azure'a API Dağıtım Adımları

Bu belge, PhoneDirectory.API projesini Azure App Service'e başarıyla deploy etmek için gereken adımları içerir.

## 1. Yayınlama Hazırlığı

API projesini Azure'a yayınlamak için aşağıdaki adımları izleyin:

### 1.1. Publish Profili Oluşturma

Visual Studio'da projeyi sağ tıklayarak "Publish..." seçeneğini seçin veya aşağıdaki komutla yayın yapabilirsiniz:

```powershell
dotnet publish -c Release -o ./publish
```

### 1.2. Doğru Ortam Değişkenlerinin Ayarlanması

Azure App Service'teki "Configuration" bölümünde aşağıdaki uygulama ayarlarını eklemeniz gerekir:

- `ASPNETCORE_ENVIRONMENT`: Production
- `ConnectionStrings__DefaultConnection`: SQL Server bağlantı dizesi
- `FrontendUrl`: Frontend uygulamanızın URL'si (örn: https://phonedirectoryangular-chfgfeamgycrg4du.uaenorth-01.azurewebsites.net)
- `JwtSettings__SecretKey`: JWT token imzalama anahtarınız
- `SmtpSettings__*`: E-posta gönderimi için SMTP ayarlarınız

## 2. Azure Portal'den Deploy

### 2.1. Azure App Service Oluşturma

1. Azure Portal'da "Create a resource" > "Web App" seçin
2. Aşağıdaki bilgileri girin:
   - Resource Group: Mevcut bir kaynak grubunu seçin veya yeni oluşturun
   - Name: API uygulamanız için benzersiz bir ad (örn: phonedirectory-api)
   - Runtime stack: .NET 8 (LTS)
   - Operating System: Windows
   - Region: Tercih ettiğiniz bölge (Frontend ile aynı bölge olmalı)
3. App Service Plan'ı seçin veya yeni oluşturun
4. "Review + create" ve ardından "Create" butonuna tıklayın

### 2.2. Dağıtım Yöntemleri

Aşağıdaki yöntemlerden birini kullanarak yayınlama yapabilirsiniz:

#### Azure Portal'den ZIP Yükleme:
1. Projeyi yerel makinenizde yayınlayın: `dotnet publish -c Release`
2. Publish klasörünün içeriğini ZIP dosyası olarak sıkıştırın
3. Azure Portal'da App Service'inize gidin > Deployment Center > Zip Deploy
4. ZIP dosyanızı yükleyin

#### GitHub Actions ile Otomatik Deploy:
1. GitHub reponuza API projenizi ekleyin
2. Azure Portal'da App Service > Deployment Center > GitHub
3. GitHub hesabınızı bağlayın ve repo/branch seçin
4. Workflow dosyasını kabul ederek deploy işlemini başlatın

#### Azure DevOps Pipeline ile Deploy:
1. Azure DevOps'ta yeni bir pipeline oluşturun
2. Kaynak olarak GitHub veya Azure Repos'u seçin
3. .NET Core pipeline şablonunu kullanın
4. Azure App Service deployment görevini ekleyin

## 3. Dağıtım Sonrası Kontroller

1. App Service Logs'u kontrol edin
2. `/swagger` endpoint'ini ziyaret ederek API'nin çalışıp çalışmadığını kontrol edin
3. Frontend uygulamasından API'ye istek göndererek CORS yapılandırmasının doğru çalıştığını test edin
4. Veritabanı bağlantısını kontrol edin

## 4. Önemli Notlar

1. `web.config` dosyası publish işlemi sırasında otomatik olarak oluşturulur, ancak özel ayarlar için mevcut dosyayı düzenleyebilirsiniz
2. `appsettings.Production.json` dosyanızdaki ayarların doğru olduğundan emin olun
3. Gizli bilgileri (bağlantı dizesi, API anahtarları) Azure Key Vault'ta saklamak en iyi pratiktir
4. Azure App Service'in Managed Identity özelliğini kullanarak Key Vault'a güvenli erişim sağlayabilirsiniz

## 5. Sorun Giderme

1. **Bağlantı Hataları**: Azure Networking ayarlarında outbound IP adreslerinin SQL Server güvenlik duvarında izin verildiğinden emin olun
2. **CORS Hataları**: Program.cs'deki CORS politikasının frontend URL'sini içerdiğinden emin olun
3. **Startup Hataları**: Kuhn Log Stream özelliğini kullanarak başlangıç hatalarını izleyin
4. **500 Internal Server Error**: Application Insights ekleyerek detaylı hata ayıklama yapın
