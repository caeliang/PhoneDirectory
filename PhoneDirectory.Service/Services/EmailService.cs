using Microsoft.Extensions.Configuration;
using PhoneDirectory.Core.Interfaces;
using System.Net;
using System.Net.Mail;

namespace PhoneDirectory.Service.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendEmailVerificationAsync(string email, string username, string verificationLink)
        {
            try
            {
                var subject = "Email Doğrulama - Telefon Rehberi";
                var body = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                            <h2 style='color: #333;'>Merhaba {username}!</h2>
                            <p>Telefon Rehberi uygulamasına kayıt olduğunuz için teşekkür ederiz.</p>
                            <p>Email adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{verificationLink}' 
                                   style='background-color: #007bff; color: white; padding: 12px 30px; 
                                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                                    Email Adresimi Doğrula
                                </a>
                            </div>
                            <p style='color: #666; font-size: 14px;'>
                                Bu bağlantı 24 saat geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.
                            </p>
                            <hr style='margin: 30px 0; border: 1px solid #eee;'>
                            <p style='color: #999; font-size: 12px;'>
                                Bu otomatik bir emaildir, lütfen yanıtlamayın.
                            </p>
                        </div>
                    </body>
                    </html>";

                return await SendEmailAsync(email, subject, body);
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> SendPasswordResetAsync(string email, string username, string resetLink)
        {
            try
            {
                var subject = "Şifre Sıfırlama - Telefon Rehberi";
                var body = $@"
                    <html>
                    <body style='font-family: Arial, sans-serif;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                            <h2 style='color: #333;'>Merhaba {username}!</h2>
                            <p>Şifre sıfırlama talebinizi aldık.</p>
                            <p>Yeni şifre belirlemek için aşağıdaki bağlantıya tıklayın:</p>
                            <div style='text-align: center; margin: 30px 0;'>
                                <a href='{resetLink}' 
                                   style='background-color: #dc3545; color: white; padding: 12px 30px; 
                                          text-decoration: none; border-radius: 5px; display: inline-block;'>
                                    Şifremi Sıfırla
                                </a>
                            </div>
                            <p style='color: #666; font-size: 14px;'>
                                Bu bağlantı 1 saat geçerlidir. Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.
                            </p>
                            <hr style='margin: 30px 0; border: 1px solid #eee;'>
                            <p style='color: #999; font-size: 12px;'>
                                Bu otomatik bir emaildir, lütfen yanıtlamayın.
                            </p>
                        </div>
                    </body>
                    </html>";

                return await SendEmailAsync(email, subject, body);
            }
            catch
            {
                return false;
            }
        }

        private async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var host = smtpSettings["Host"] ?? "smtp.gmail.com";
                var port = int.Parse(smtpSettings["Port"] ?? "587");
                var username = smtpSettings["Username"] ?? "";
                var password = smtpSettings["Password"] ?? "";
                var fromEmail = smtpSettings["FromEmail"] ?? username;
                var fromName = smtpSettings["FromName"] ?? "Telefon Rehberi";

                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                {
                    var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                    
                    // Development ortamında simülasyon yap
                    if (environment == "Development")
                    {
                        Console.WriteLine($"=== EMAIL SIMÜLASYONU (DEVELOPMENT) ===");
                        Console.WriteLine($"To: {toEmail}");
                        Console.WriteLine($"Subject: {subject}");
                        Console.WriteLine($"SMTP ayarları eksik - Development'da simülasyon yapılıyor");
                        Console.WriteLine($"Production'da gerçek email gönderilecek");
                        Console.WriteLine($"==========================================");
                        return true;
                    }
                    else
                    {
                        // Production'da SMTP ayarları zorunlu
                        Console.WriteLine($"HATA: Production ortamında SMTP ayarları eksik! Email gönderilemedi: {toEmail}");
                        return false;
                    }
                }

                using var client = new SmtpClient(host, port);
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(username, password);

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                Console.WriteLine($"Email başarıyla gönderildi: {toEmail}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email gönderme hatası: {ex.Message}");
                return false;
            }
        }
    }
}
